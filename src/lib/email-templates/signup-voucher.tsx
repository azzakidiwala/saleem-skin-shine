import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Saleem Skin'

interface SignupVoucherProps {
  firstName?: string
  code?: string
  discountPennies?: number
  expiresAt?: string
}

const SignupVoucherEmail = ({
  firstName,
  code = 'SS-XXXXXX',
  discountPennies = 1000,
  expiresAt,
}: SignupVoucherProps) => {
  const pounds = (discountPennies / 100).toFixed(2).replace(/\.00$/, '')
  const expiryText = expiresAt
    ? new Date(expiresAt).toLocaleString('en-GB', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : null

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your £{pounds} {SITE_NAME} voucher is here</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {firstName ? `Thank you, ${firstName}!` : 'Thank you!'}
          </Heading>
          <Text style={text}>
            Here's your exclusive £{pounds} off voucher to use on your first booking with {SITE_NAME}.
          </Text>
          <Section style={codeBox}>
            <Text style={codeLabel}>Your voucher code</Text>
            <Text style={codeValue}>{code}</Text>
          </Section>
          <Text style={text}>
            Enter this code at checkout when booking online.
          </Text>
          {expiryText && (
            <Text style={smallText}>
              Valid until {expiryText}. One use per customer.
            </Text>
          )}
          <Text style={footer}>— The {SITE_NAME} Team</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: SignupVoucherEmail,
  subject: (data: Record<string, any>) => {
    const pennies = typeof data?.discountPennies === 'number' ? data.discountPennies : 1000
    const pounds = (pennies / 100).toFixed(2).replace(/\.00$/, '')
    return `Your £${pounds} ${SITE_NAME} voucher is inside`
  },
  displayName: 'Signup voucher',
  previewData: {
    firstName: 'Jane',
    code: 'SS-AB12CD',
    discountPennies: 1000,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '26px', fontWeight: 'normal' as const, color: '#1f3b2d', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 18px' }
const smallText = { fontSize: '12px', color: '#7a7a7a', lineHeight: '1.5', margin: '0 0 18px' }
const codeBox = {
  border: '2px dashed #c5a572',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '20px 0',
  backgroundColor: '#faf7f0',
}
const codeLabel = {
  fontSize: '10px',
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  color: '#c5a572',
  margin: '0 0 8px',
}
const codeValue = {
  fontSize: '24px',
  letterSpacing: '0.3em',
  fontFamily: 'monospace',
  color: '#1f3b2d',
  margin: 0,
  fontWeight: 'bold' as const,
}
const footer = { fontSize: '13px', color: '#7a7a7a', margin: '30px 0 0' }
