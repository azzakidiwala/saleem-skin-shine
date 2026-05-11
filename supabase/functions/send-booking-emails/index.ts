// Sends booking confirmation emails: one to client, one to clinic.
// Uses Lovable Email API via LOVABLE_API_KEY.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BookingPayload {
  firstName: string;
  surname: string;
  email: string;
  mobile: string;
  treatmentName: string;
  treatmentPrice: string;
  appointmentDate: string; // e.g. "Friday, 12 June 2026"
  appointmentTime: string; // e.g. "10:30"
}

const FROM = "Saleem Skin <bookings@notify.dunamismanagement.co.uk>";
const CLINIC_INBOX = "info@techwala.co.uk";

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Email send failed (${res.status}): ${text}`);
  }
  return res.json();
}

function clientHtml(b: BookingPayload) {
  return `
    <div style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:560px; margin:0 auto; padding:24px;">
      <h1 style="font-size:22px; margin:0 0 16px;">Your appointment is booked</h1>
      <p>Hi ${b.firstName},</p>
      <p>Thank you for booking with Saleem Skin. We will see you on:</p>
      <p style="font-size:18px; font-weight:bold; margin:16px 0;">
        ${b.appointmentDate} at ${b.appointmentTime}
      </p>
      <table style="border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Treatment</td><td style="padding:6px 0;"><strong>${b.treatmentName}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Price</td><td style="padding:6px 0;">${b.treatmentPrice}</td></tr>
      </table>
      <p>If you need to reschedule, please call us on 07503 959285.</p>
      <p style="margin-top:24px;">Warm regards,<br/>The Saleem Skin Team</p>
    </div>`;
}

function clinicHtml(b: BookingPayload) {
  return `
    <div style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:560px; margin:0 auto; padding:24px;">
      <h1 style="font-size:20px; margin:0 0 16px;">New booking received</h1>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Name</td><td><strong>${b.firstName} ${b.surname}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Email</td><td>${b.email}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Mobile</td><td>${b.mobile}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Treatment</td><td>${b.treatmentName}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Price</td><td>${b.treatmentPrice}</td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Date</td><td><strong>${b.appointmentDate}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Time</td><td><strong>${b.appointmentTime}</strong></td></tr>
      </table>
    </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const b = (await req.json()) as BookingPayload;

    if (!b.firstName || !b.surname || !b.email || !b.mobile || !b.treatmentName) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.allSettled([
      sendEmail({
        to: b.email,
        subject: `Your Saleem Skin appointment — ${b.appointmentDate} at ${b.appointmentTime}`,
        html: clientHtml(b),
      }),
      sendEmail({
        to: CLINIC_INBOX,
        subject: `New booking: ${b.firstName} ${b.surname} — ${b.treatmentName}`,
        html: clinicHtml(b),
      }),
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
