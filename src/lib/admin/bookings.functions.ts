import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ensureAdmin } from "@/lib/admin/admins.server";
import { sendBookingConfirmedEmail } from "@/lib/booking-confirmation-email.server";
import { z } from "zod";

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);

    const { data: existing, error: readError } = await supabaseAdmin
      .from("bookings")
      .select("id, first_name, surname, email, treatment_name, treatment_price, appointment_date, appointment_time, status")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!existing) throw new Error("Booking not found.");

    const patch = data.status === "confirmed"
      ? { status: data.status, confirmed_at: new Date().toISOString() }
      : { status: data.status };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update(patch)
      .eq("id", data.id)
      .select("id, first_name, surname, email, treatment_name, treatment_price, appointment_date, appointment_time")
      .single();
    if (updateError) throw new Error(updateError.message);

    let emailQueued = false;
    if (data.status === "confirmed" && existing.status !== "confirmed") {
      const result = await sendBookingConfirmedEmail(updated);
      emailQueued = result.queued || result.skipped;
    }

    return { success: true, emailQueued };
  });