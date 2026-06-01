import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

function generateCode(prefix = "SS") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

const requestSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  surname: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  mobile: z.string().trim().min(5).max(30),
});

export const requestSignupVoucher = createServerFn({ method: "POST" })
  .inputValidator((data) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    // Read settings
    const { data: settings } = await supabaseAdmin
      .from("discount_settings")
      .select("signup_enabled, signup_discount_pennies, signup_expiry_hours")
      .eq("id", 1)
      .single();

    if (!settings?.signup_enabled) {
      return { status: "disabled" as const, message: "Signup vouchers are currently unavailable." };
    }

    const emailLower = data.email.toLowerCase();
    const mobileDigits = data.mobile.replace(/[^0-9]/g, "");

    // Block: same email already claimed
    const { data: existingByEmail } = await supabaseAdmin
      .from("voucher_codes")
      .select("id")
      .eq("kind", "signup")
      .ilike("email", emailLower)
      .maybeSingle();
    if (existingByEmail) {
      return {
        status: "already_claimed" as const,
        message: "You've already claimed a voucher with this email address.",
      };
    }

    // Block: same name + mobile already claimed under a different email
    if (mobileDigits.length >= 5) {
      const { data: matches } = await supabaseAdmin
        .from("voucher_codes")
        .select("id, first_name, surname, mobile")
        .eq("kind", "signup")
        .ilike("first_name", data.first_name)
        .ilike("surname", data.surname);
      const dup = (matches ?? []).some(
        (m) => (m.mobile ?? "").replace(/[^0-9]/g, "") === mobileDigits,
      );
      if (dup) {
        return {
          status: "identity_match" as const,
          message:
            "It looks like you've already used the welcome voucher under a different email. Please get in touch if you think this is a mistake.",
        };
      }
    }

    // Create
    const expiresAt = new Date(
      Date.now() + settings.signup_expiry_hours * 60 * 60 * 1000,
    ).toISOString();

    // Retry on rare collision
    let attempt = 0;
    let code = generateCode();
    while (attempt < 5) {
      const { data: inserted, error } = await supabaseAdmin
        .from("voucher_codes")
        .insert({
          code,
          kind: "signup",
          discount_pennies: settings.signup_discount_pennies,
          email: data.email,
          first_name: data.first_name,
          surname: data.surname,
          mobile: data.mobile,
          expires_at: expiresAt,
          max_uses: 1,
          is_active: true,
        })
        .select("code, discount_pennies, expires_at")
        .single();
      if (!error && inserted) {
        return {
          status: "issued" as const,
          code: inserted.code,
          discount_pennies: inserted.discount_pennies,
          expires_at: inserted.expires_at,
        };
      }
      if (error && !error.message.toLowerCase().includes("duplicate")) {
        throw new Error(error.message);
      }
      attempt++;
      code = generateCode();
    }
    throw new Error("Could not generate a voucher code, please try again.");
  });

export const validateVoucher = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      code: z.string().trim().min(1).max(64),
      email: z.string().trim().email().max(255).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("voucher_codes")
      .select("code, kind, discount_pennies, email, expires_at, max_uses, used_count, is_active")
      .ilike("code", data.code)
      .maybeSingle();
    if (!row) return { valid: false as const, reason: "Voucher not found." };
    if (!row.is_active) return { valid: false as const, reason: "Voucher is not active." };
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return { valid: false as const, reason: "Voucher has expired." };
    }
    if (row.used_count >= row.max_uses) {
      return { valid: false as const, reason: "Voucher has already been used." };
    }
    if (
      row.kind === "signup" && row.email && data.email &&
      row.email.toLowerCase() !== data.email.toLowerCase()
    ) {
      return { valid: false as const, reason: "Voucher belongs to a different email address." };
    }
    return {
      valid: true as const,
      code: row.code,
      discount_pennies: row.discount_pennies,
    };
  });

export const redeemVoucherForBooking = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      code: z.string().trim().min(1).max(64),
      booking_id: z.string().uuid(),
      email: z.string().trim().email().max(255).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { data: result, error } = await supabaseAdmin.rpc("redeem_voucher", {
      p_code: data.code,
      p_email: data.email ?? null,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(result) && result.length > 0 ? result[0] : null;
    if (!row) throw new Error("Voucher could not be redeemed.");

    const { error: updErr } = await supabaseAdmin
      .from("bookings")
      .update({
        voucher_code: row.code,
        discount_pennies: row.discount_pennies,
      })
      .eq("id", data.booking_id);
    if (updErr) throw new Error(updErr.message);

    return { success: true, discount_pennies: row.discount_pennies };
  });
