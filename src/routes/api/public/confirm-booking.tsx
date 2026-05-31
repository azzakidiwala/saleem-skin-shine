import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendBookingConfirmedEmail } from "@/lib/booking-confirmation-email.server";

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

  await sendBookingConfirmedEmail(booking);

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
