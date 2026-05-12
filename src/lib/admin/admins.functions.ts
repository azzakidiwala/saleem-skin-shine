import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ensureAdmin } from "@/lib/admin/admins.server";
import { z } from "zod";

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, created_at")
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    const out: { user_id: string; email: string | null; created_at: string }[] = [];
    for (const r of roles ?? []) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
      out.push({ user_id: r.user_id, email: u?.user?.email ?? null, created_at: r.created_at });
    }
    return out;
  });

export const inviteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);

    let userId: string | null = null;
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createErr) {
      // If already exists, look them up
      const msg = createErr.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listErr) throw new Error(listErr.message);
        const existing = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
        if (!existing) throw new Error(createErr.message);
        userId = existing.id;
      } else {
        throw new Error(createErr.message);
      }
    } else {
      userId = created.user.id;
    }

    if (!userId) throw new Error("Could not resolve user");

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleErr) throw new Error(roleErr.message);

    return { success: true };
  });

export const updateAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    user_id: z.string().uuid(),
    password: z.string().min(8).max(72),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ user_id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    if (data.user_id === context.userId) throw new Error("You cannot remove your own admin role.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { success: true };
  });
