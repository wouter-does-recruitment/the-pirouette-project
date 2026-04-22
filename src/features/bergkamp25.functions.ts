import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { adminCredentialsSchema, waitlistSchema } from "./bergkamp25.schemas";

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator(waitlistSchema)
  .handler(async ({ data }) => {
    const payload = waitlistSchema.parse(data);

    const { error } = await supabaseAdmin.from("waitlist_entries").insert(payload);

    if (error) {
      if (error.code === "23505") {
        throw new Error("That email is already on the list.");
      }

      throw new Error("Unable to save your place right now.");
    }

    return { success: true };
  });

export const verifyAdminAccess = createServerFn({ method: "POST" })
  .inputValidator(adminCredentialsSchema)
  .handler(async ({ data }) => {
    const ADMIN_USERNAME = process.env.BERGKAMP25_ADMIN_USERNAME;
    if (!ADMIN_USERNAME) {
      throw new Error("Missing BERGKAMP25_ADMIN_USERNAME secret.");
    }

    const ADMIN_PASSWORD = process.env.BERGKAMP25_ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
      throw new Error("Missing BERGKAMP25_ADMIN_PASSWORD secret.");
    }

    if (data.username !== ADMIN_USERNAME || data.password !== ADMIN_PASSWORD) {
      throw new Error("Incorrect credentials.");
    }

    const { data: entries, error } = await supabaseAdmin
      .from("waitlist_entries")
      .select("id, name, email, country, audience, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Unable to load waitlist entries.");
    }

    return { entries };
  });
