import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SENDER_DOMAIN = "notify.saleemskin.co.uk";
const FROM = "Saleem Skin <bookings@notify.saleemskin.co.uk>";
const SITE_URL = "https://saleemskin.co.uk";

const BRAND = {
  primary: "#0a0a0a",
  gold: "#b8924d",
  bg: "#f7f4ef",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  border: "#e7e2d8",
};

export type BookingConfirmationRow = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  treatment_name: string;
  treatment_price: string | null;
  appointment_date: string;
  appointment_time: string;
};

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateLong(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function layout(inner: string, preheader: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Saleem Skin</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
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
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:6px;margin:22px 0;">
    ${rows.map(([k, v], i) => `
      <tr>
        <td style="padding:12px 16px;color:${BRAND.muted};font-size:13px;width:40%;${i ? `border-top:1px solid ${BRAND.border};` : ""}">${escapeHtml(k)}</td>
        <td style="padding:12px 16px;color:${BRAND.text};font-size:14px;font-weight:600;${i ? `border-top:1px solid ${BRAND.border};` : ""}">${escapeHtml(v)}</td>
      </tr>`).join("")}
  </table>`;
}

function customerConfirmedHtml(b: BookingConfirmationRow) {
  const date = formatDateLong(b.appointment_date);
  const inner = `
    <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${BRAND.gold};margin-bottom:8px;">Booking confirmed</div>
    <h1 style="font-size:24px;font-weight:600;margin:0 0 8px;color:${BRAND.text};">Your appointment is confirmed</h1>
    <p style="font-size:15px;line-height:1.6;color:${BRAND.muted};margin:0 0 24px;">Dear ${escapeHtml(b.first_name)}, your appointment with Saleem Skin has now been reviewed and confirmed by our team.</p>
    ${detailsTable([
      ["Treatment", b.treatment_name],
      ["Date", date],
      ["Time", b.appointment_time],
      ["Price", b.treatment_price ?? "To be confirmed"],
    ])}
    <p style="font-size:14px;line-height:1.6;color:${BRAND.text};margin:24px 0 0;">If you need to reschedule or cancel, please call us on <strong>07503 959285</strong> as soon as possible.</p>
    <p style="font-size:14px;line-height:1.6;color:${BRAND.text};margin:24px 0 0;">Warm regards,<br/><strong>The Saleem Skin Team</strong></p>`;
  return layout(inner, `Your Saleem Skin booking is confirmed for ${date}`);
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
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

async function getUnsubscribeToken(email: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", email)
    .maybeSingle();
  if (existing?.token) return existing.token;

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const { error } = await supabaseAdmin.from("email_unsubscribe_tokens").insert({ email, token });
  if (!error) return token;

  const { data: raced } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", email)
    .maybeSingle();
  if (raced?.token) return raced.token;
  throw new Error(`Could not create unsubscribe token: ${error.message}`);
}

export async function sendBookingConfirmedEmail(booking: BookingConfirmationRow) {
  const messageId = `booking-confirmed-${booking.id}`;
  const { data: latest } = await supabaseAdmin
    .from("email_send_log")
    .select("status")
    .eq("message_id", messageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest?.status === "sent" || latest?.status === "pending") {
    return { queued: false, skipped: true, messageId };
  }

  const html = customerConfirmedHtml(booking);
  const unsubscribeToken = await getUnsubscribeToken(booking.email);
  const payload = {
    to: booking.email,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject: "Your Saleem Skin booking is confirmed",
    html,
    text: htmlToText(html),
    purpose: "transactional",
    label: "booking-confirmed",
    idempotency_key: messageId,
    unsubscribe_token: unsubscribeToken,
    message_id: messageId,
    queued_at: new Date().toISOString(),
  };

  const { error } = await (supabaseAdmin.rpc as any)("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  });
  if (error) throw new Error(`Confirmation email could not be queued: ${error.message}`);

  const { error: logError } = await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: "booking-confirmed",
    recipient_email: booking.email,
    status: "pending",
  });
  if (logError) console.error("Could not write booking confirmation email log", logError);

  return { queued: true, skipped: false, messageId };
}