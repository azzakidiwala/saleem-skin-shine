import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SENDER_DOMAIN = "notify.saleemskin.co.uk";
const FROM = "Saleem Skin <bookings@notify.saleemskin.co.uk>";

function htmlPage(title: string, body: string, color = "#0a0a0a") {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="font-family:-apple-system,Segoe UI,Arial,sans-serif;background:#f7f6f2;color:#1a1a1a;margin:0;padding:48px 16px;text-align:center;">
    <div style="max-width:520px;margin:0 auto;background:#fff;padding:48px 32px;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <h1 style="font-size:24px;margin:0 0 16px;color:${color};">${title}</h1>
      <div style="color:#555;line-height:1.6;">${body}</div>
    </div>
  </body></html>`;
}

function formatDateLong(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function customerConfirmedHtml(b: any) {
  return `
    <div style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:560px; margin:0 auto; padding:24px;">
      <h1 style="font-size:22px; margin:0 0 16px;">Your booking is confirmed</h1>
      <p>Hi ${b.first_name},</p>
      <p>Great news — your appointment with Saleem Skin has been confirmed by our team.</p>
      <p style="font-size:18px; font-weight:bold; margin:16px 0;">
        ${formatDateLong(b.appointment_date)} at ${b.appointment_time}
      </p>
      <table style="border-collapse:collapse; margin:16px 0;">
        <tr><td style="padding:6px 12px 6px 0; color:#666;">Treatment</td><td style="padding:6px 0;"><strong>${b.treatment_name}</strong></td></tr>
        ${b.treatment_price ? `<tr><td style="padding:6px 12px 6px 0; color:#666;">Price</td><td style="padding:6px 0;">${b.treatment_price}</td></tr>` : ""}
      </table>
      <p>If you need to reschedule, please call us on 07503 959285.</p>
      <p style="margin-top:24px;">Warm regards,<br/>The Saleem Skin Team</p>
    </div>`;
}

async function handle(id: string | null, token: string | null) {
  if (!id || !token) {
    return new Response(htmlPage("Invalid link", "This confirmation link is missing required information."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !booking) {
    return new Response(htmlPage("Booking not found", "We couldn't find a booking matching this link."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!booking.confirmation_token || booking.confirmation_token !== token) {
    return new Response(htmlPage("Invalid link", "This confirmation link is no longer valid."), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (booking.status === "confirmed" && booking.confirmed_at) {
    const when = new Date(booking.confirmed_at).toLocaleString("en-GB");
    return new Response(
      htmlPage(
        "Already confirmed",
        `This booking was already confirmed on <strong>${when}</strong>.`,
        "#1a1a1a",
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const confirmedAt = new Date().toISOString();
  const { error: updErr } = await supabaseAdmin
    .from("bookings")
    .update({ status: "confirmed", confirmed_at: confirmedAt })
    .eq("id", id);
  if (updErr) {
    return new Response(htmlPage("Error", `Could not update booking: ${updErr.message}`, "#b00020"), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Enqueue confirmation email to customer
  const messageId = crypto.randomUUID();
  const payload = {
    to: booking.email,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject: "Your Saleem Skin booking is confirmed",
    html: customerConfirmedHtml(booking),
    purpose: "transactional",
    label: "booking-confirmed",
    idempotency_key: `booking-confirmed-${id}`,
    message_id: messageId,
    queued_at: new Date().toISOString(),
  };
  await supabaseAdmin.rpc("enqueue_email" as any, {
    queue_name: "transactional_emails",
    payload,
  });
  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: "booking-confirmed",
    recipient_email: booking.email,
    status: "pending",
  });

  const when = new Date(confirmedAt).toLocaleString("en-GB");
  return new Response(
    htmlPage(
      "Booking confirmed",
      `Thank you. The booking for <strong>${booking.first_name} ${booking.surname}</strong> on <strong>${formatDateLong(booking.appointment_date)} at ${booking.appointment_time}</strong> has been marked as confirmed (${when}). The customer has been notified by email.`,
      "#0a7d2c",
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/public/confirm-booking")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return handle(url.searchParams.get("id"), url.searchParams.get("token"));
      },
    },
  },
});
