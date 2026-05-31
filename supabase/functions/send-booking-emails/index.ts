// Sends booking emails via Lovable email queue.
// - Customer: booking received, awaiting confirmation
// - Clinic (info@saleemskin.co.uk): booking details + Accept + Admin links
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BookingPayload {
  bookingId: string;
  firstName: string;
  surname: string;
  email: string;
  mobile: string;
  treatmentName: string;
  treatmentPrice: string;
  appointmentDate: string;
  appointmentTime: string;
}

const SENDER_DOMAIN = "notify.saleemskin.co.uk";
const FROM = "Saleem Skin <bookings@notify.saleemskin.co.uk>";
const FALLBACK_CLINIC_INBOX = "info@saleemskin.co.uk";
const SITE_URL = "https://saleemskin.co.uk";
const ADMIN_URL = `${SITE_URL}/admin/bookings`;

// Brand palette
const BRAND = {
  primary: "#0a0a0a",
  gold: "#b8924d",
  bg: "#f7f4ef",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  border: "#e7e2d8",
};

function layout(inner: string, preheader: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Saleem Skin</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND.primary};padding:28px 32px;text-align:center;">
                <div style="color:#ffffff;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;margin-bottom:8px;">Saleem Skin</div>
                <div style="color:${BRAND.gold};font-size:11px;letter-spacing:0.25em;text-transform:uppercase;">Aesthetic &amp; Skin Clinic</div>
              </td>
            </tr>
            <tr><td style="padding:36px 32px;">${inner}</td></tr>
            <tr>
              <td style="background:${BRAND.bg};padding:24px 32px;border-top:1px solid ${BRAND.border};text-align:center;color:${BRAND.muted};font-size:12px;line-height:1.6;">
                Saleem Skin Clinic &middot; 07503 959285<br/>
                <a href="${SITE_URL}" style="color:${BRAND.muted};text-decoration:underline;">saleemskin.co.uk</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailsTable(rows: Array<[string, string]>) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:6px;margin:20px 0;">
    ${rows.map(([k, v], i) => `
      <tr>
        <td style="padding:12px 16px;color:${BRAND.muted};font-size:13px;width:40%;${i ? `border-top:1px solid ${BRAND.border};` : ""}">${k}</td>
        <td style="padding:12px 16px;color:${BRAND.text};font-size:14px;font-weight:600;${i ? `border-top:1px solid ${BRAND.border};` : ""}">${v}</td>
      </tr>`).join("")}
  </table>`;
}

function button(href: string, label: string, variant: "primary" | "secondary" = "primary") {
  const bg = variant === "primary" ? BRAND.primary : "#ffffff";
  const color = variant === "primary" ? "#ffffff" : BRAND.primary;
  const border = variant === "primary" ? BRAND.primary : BRAND.primary;
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${color};border:1px solid ${border};text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;border-radius:4px;margin:4px;">${label}</a>`;
}

function customerHtml(b: BookingPayload) {
  const inner = `
    <h1 style="font-size:24px;font-weight:600;margin:0 0 8px;color:${BRAND.text};">Thank you, ${b.firstName}</h1>
    <p style="font-size:15px;line-height:1.6;color:${BRAND.muted};margin:0 0 24px;">We've received your booking request. Please wait for a confirmation from Saleem Skin to approve your appointment — you'll receive a separate email as soon as it's confirmed.</p>
    ${detailsTable([
      ["Treatment", b.treatmentName],
      ["Date", b.appointmentDate],
      ["Time", b.appointmentTime],
      ["Price", b.treatmentPrice],
    ])}
    <p style="font-size:14px;line-height:1.6;color:${BRAND.text};margin:24px 0 0;">If you need to change or cancel your appointment, please call us on <strong>07503 959285</strong>.</p>
    <p style="font-size:14px;line-height:1.6;color:${BRAND.text};margin:24px 0 0;">Warm regards,<br/><strong>The Saleem Skin Team</strong></p>`;
  return layout(inner, "We've received your booking — awaiting confirmation");
}

function clinicHtml(b: BookingPayload, acceptUrl: string) {
  const inner = `
    <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${BRAND.gold};margin-bottom:8px;">New booking request</div>
    <h1 style="font-size:22px;font-weight:600;margin:0 0 8px;color:${BRAND.text};">${b.firstName} ${b.surname}</h1>
    <p style="font-size:14px;color:${BRAND.muted};margin:0 0 24px;">Review the details below and confirm to notify the customer.</p>
    ${detailsTable([
      ["Treatment", b.treatmentName],
      ["Price", b.treatmentPrice],
      ["Date", b.appointmentDate],
      ["Time", b.appointmentTime],
      ["Email", `<a href="mailto:${b.email}" style="color:${BRAND.text};">${b.email}</a>`],
      ["Mobile", `<a href="tel:${b.mobile}" style="color:${BRAND.text};">${b.mobile}</a>`],
    ])}
    <div style="text-align:center;margin:32px 0 8px;">
      ${button(acceptUrl, "Accept booking", "primary")}
      ${button(ADMIN_URL, "Open admin", "secondary")}
    </div>
    <p style="font-size:12px;color:${BRAND.muted};text-align:center;margin:16px 0 0;line-height:1.6;">Accepting will mark this booking as confirmed and send the customer their confirmation email.</p>`;
  return layout(inner, `New booking — ${b.firstName} ${b.surname}`);
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&middot;/g, "·")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

async function getUnsubscribeToken(supabase: any, email: string): Promise<string> {
  const { data: existing } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", email)
    .maybeSingle();
  if (existing?.token) return existing.token;
  const token = crypto.randomUUID().replace(/-/g, "") +
    crypto.randomUUID().replace(/-/g, "");
  await supabase
    .from("email_unsubscribe_tokens")
    .insert({ email, token });
  return token;
}

async function enqueue(
  supabase: any,
  to: string,
  subject: string,
  html: string,
  label: string,
  idempotencyKey: string,
) {
  const messageId = crypto.randomUUID();
  const unsubscribeToken = await getUnsubscribeToken(supabase, to);
  const payload = {
    to,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject,
    html,
    text: htmlToText(html),
    purpose: "transactional",
    label,
    idempotency_key: idempotencyKey,
    unsubscribe_token: unsubscribeToken,
    message_id: messageId,
    queued_at: new Date().toISOString(),
  };
  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  });
  if (error) throw new Error(`Enqueue failed: ${error.message}`);
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: label,
    recipient_email: to,
    status: "pending",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const b = (await req.json()) as BookingPayload;

    if (!b.bookingId || !b.firstName || !b.email || !b.treatmentName) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Generate and store confirmation token for the booking
    const token = crypto.randomUUID().replace(/-/g, "") +
      crypto.randomUUID().replace(/-/g, "");
    const { error: updErr } = await supabase
      .from("bookings")
      .update({ confirmation_token: token })
      .eq("id", b.bookingId);
    if (updErr) throw new Error(`Token store failed: ${updErr.message}`);

    const acceptUrl = `${SITE_URL}/api/public/confirm-booking?id=${b.bookingId}&token=${token}`;

    // Resolve clinic recipients from the admin-managed list
    const { data: recipients } = await supabase
      .from("booking_notification_recipients")
      .select("email")
      .eq("enabled", true);
    const clinicEmails = (recipients ?? []).map((r: { email: string }) => r.email);
    if (clinicEmails.length === 0) clinicEmails.push(FALLBACK_CLINIC_INBOX);

    const tasks: Promise<unknown>[] = [
      enqueue(
        supabase,
        b.email,
        `We've received your booking — Saleem Skin`,
        customerHtml(b),
        "booking-received",
        `booking-received-${b.bookingId}`,
      ),
    ];
    for (const to of clinicEmails) {
      tasks.push(
        enqueue(
          supabase,
          to,
          `New booking: ${b.firstName} ${b.surname} — ${b.treatmentName}`,
          clinicHtml(b, acceptUrl),
          "booking-clinic-notification",
          `booking-clinic-${b.bookingId}-${to}`,
        ),
      );
    }

    const results = await Promise.allSettled(tasks);

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message ?? "unknown");

    return new Response(
      JSON.stringify({ success: errors.length === 0, errors }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("send-booking-emails error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
