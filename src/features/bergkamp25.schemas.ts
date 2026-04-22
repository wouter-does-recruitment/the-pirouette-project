import { z } from "zod";
import { Constants } from "@/integrations/supabase/types";

export const audienceOptions = Constants.public.Enums.waitlist_audience;

export const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Keep it under 100 characters"),
  email: z.string().trim().email("Enter a valid email").max(255, "Keep it under 255 characters"),
  country: z.string().trim().min(2, "Country is required").max(100, "Keep it under 100 characters"),
  audience: z.enum(audienceOptions),
});

export const adminCredentialsSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export type WaitlistAudience = (typeof audienceOptions)[number];
