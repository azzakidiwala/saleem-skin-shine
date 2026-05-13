// Sends booking emails via Lovable email queue.
// - Customer: booking received, awaiting confirmation
// - Clinic (info@techwala.co.uk): booking details + Accept link
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
const CLINIC_INBOX = "info@techwala.co.uk";
const SITE_URL = "https://saleemskin.co.uk";

function customerHtml(b: BookingPayload) {
  return `
    <div style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:560px; margin:0 auto; padding:24px;">
      <h1 style="font-size:22px; margin:0 0 16px;">We've received your booking</h1>
      <p>Hi ${b.firstName},</p>
      <p>Thank you for booking with Saleem Skin. Your request has been received and will be reviewed by our team. Once it has been confirmed, you will receive a confirmation email.</p>
      <p style="font-size:18px; font-weight:bold; margin:16px 0;">
        ${b.appointmentDate} at ${b.appointmentTime}
      </p>
      <table style="border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Treatment</td><td style="padding:6px 0;"><strong>${b.treatmentName}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Price</td><td style="padding:6px 0;">${b.treatmentPrice}</td></tr>
      </table>
      <p>If you need to make any changes, please call us on 07503 959285.</p>
      <p style="margin-top:24px;">Warm regards,<br/>The Saleem Skin Team</p>
    </div>`;
}

function clinicHtml(b: BookingPayload, acceptUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:560px; margin:0 auto; padding:24px;">
      <h1 style="font-size:20px; margin:0 0 16px;">New booking — review required</h1>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Name</td><td><strong>${b.firstName} ${b.surname}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Email</td><td>${b.email}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Mobile</td><td>${b.mobile}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Treatment</td><td>${b.treatmentName}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Price</td><td>${b.treatmentPrice}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Date</td><td><strong>${b.appointmentDate}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Time</td><td><strong>${b.appointmentTime}</strong></td></tr>
      </table>
      <div style="margin:28px 0;">
        <a href="${acceptUrl}" style="display:inline-block; background:#0a0a0a; color:#fff; text-decoration:none; padding:14px 24px; font-size:13px; letter-spacing:0.15em; text-transform:uppercase; border-radius:4px;">Accept booking</a>
      </div>
      <p style="font-size:12px; color:#888;">Clicking Accept will mark this booking as confirmed in the admin panel and send the customer their confirmation email.</p>
    </div>`;
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
  const payload = {
    to,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject,
    html,
    purpose: "transactional",
    label,
    idempotency_key: idempotencyKey,
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

    const results = await Promise.allSettled([
      enqueue(
        supabase,
        b.email,
        `We've received your booking — Saleem Skin`,
        customerHtml(b),
        "booking-received",
        `booking-received-${b.bookingId}`,
      ),
      enqueue(
        supabase,
        CLINIC_INBOX,
        `New booking: ${b.firstName} ${b.surname} — ${b.treatmentName}`,
        clinicHtml(b, acceptUrl),
        "booking-clinic-notification",
        `booking-clinic-${b.bookingId}`,
      ),
    ]);

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
