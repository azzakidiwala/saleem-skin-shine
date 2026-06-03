import * as React from 'react'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Saleem Skin'
const SENDER_DOMAIN = 'notify.saleemskin.co.uk'
const FROM_DOMAIN = 'saleemskin.co.uk'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export interface SendInternalParams {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
}

export async function sendTransactionalEmailInternal(params: SendInternalParams) {
  const { templateName, recipientEmail, templateData = {}, idempotencyKey } = params
  const template = TEMPLATES[templateName]
  if (!template) throw new Error(`Unknown email template: ${templateName}`)

  const recipient = (template.to || recipientEmail).toLowerCase()
  const messageId = crypto.randomUUID()
  const idKey = idempotencyKey || messageId

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from('suppressed_emails')
    .select('id')
    .eq('email', recipient)
    .maybeSingle()
  if (suppressed) {
    return { success: false as const, reason: 'email_suppressed' as const }
  }

  // Unsubscribe token (one per email)
  let unsubscribeToken: string
  const { data: existingToken } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', recipient)
    .maybeSingle()

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token
  } else if (!existingToken) {
    const newToken = generateToken()
    await supabaseAdmin
      .from('email_unsubscribe_tokens')
      .upsert({ token: newToken, email: recipient }, { onConflict: 'email', ignoreDuplicates: true })
    const { data: stored } = await supabaseAdmin
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', recipient)
      .maybeSingle()
    unsubscribeToken = stored?.token ?? newToken
  } else {
    return { success: false as const, reason: 'email_suppressed' as const }
  }

  // Render
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const plainText = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: recipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: plainText,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  } as never)

  if (enqueueError) {
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: recipient,
      status: 'failed',
      error_message: enqueueError.message,
    })
    throw new Error(`Failed to enqueue email: ${enqueueError.message}`)
  }

  return { success: true as const, messageId }
}
