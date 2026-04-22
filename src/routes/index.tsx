import { createFileRoute } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Constants } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Camera, Goal, Sparkles } from "lucide-react";

const pageTitle = "Bergkamp25 — Recreate the most beautiful goal ever scored";
const pageDescription =
  "A tribute to Dennis Bergkamp's pirouette goal. Join the Bergkamp25 waitlist and help bring the moment to a new generation.";
const targetDate = "2027-03-02T00:00:00.000Z";

const audienceOptions = Constants.public.Enums.waitlist_audience;

const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Keep it under 100 characters"),
  email: z.string().trim().email("Enter a valid email").max(255, "Keep it under 255 characters"),
  country: z.string().trim().min(2, "Country is required").max(100, "Keep it under 100 characters"),
  audience: z.enum(audienceOptions),
});

const joinWaitlist = createServerFn({ method: "POST" })
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: pageTitle },
      { name: "description", content: pageDescription },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: pageDescription },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://placehold.co/1200x630/0A0A0A/F5F0E8?text=Bergkamp25" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: pageDescription },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://placehold.co/1200x630/0A0A0A/F5F0E8?text=Bergkamp25" },
    ],
    links: [{ rel: "canonical", href: "https://id-preview--bf1946be-09a6-492b-a189-f9d7013ca200.lovable.app/" }],
  }),
  component: IndexPage,
});

type WaitlistAudience = (typeof audienceOptions)[number];

type WaitlistFormState = {
  name: string;
  email: string;
  country: string;
  audience: WaitlistAudience;
};

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
};

function getCountdownParts(): CountdownParts {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const distance = Math.max(target - now, 0);

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isLive: distance === 0,
  };
}

function IndexPage() {
  const submitWaitlist = useServerFn(joinWaitlist);
  const [countdown, setCountdown] = useState<CountdownParts>(() => getCountdownParts());
  const [form, setForm] = useState<WaitlistFormState>({
    name: "",
    email: "",
    country: "",
    audience: "kid",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownParts());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const countdownItems = useMemo(
    () => [
      { label: "Days", value: countdown.days },
      { label: "Hours", value: countdown.hours },
      { label: "Minutes", value: countdown.minutes },
      { label: "Seconds", value: countdown.seconds },
    ],
    [countdown.days, countdown.hours, countdown.minutes, countdown.seconds],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = waitlistSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitWaitlist({ data: parsed.data });
      setSuccess("You are on the list.");
      setForm({
        name: "",
        email: "",
        country: "",
        audience: "kid",
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="hero-grain relative isolate min-h-screen overflow-hidden border-b border-line-subtle">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,oklch(0.09_0.004_20/.72)_100%)]" aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.95_0.016_70/.5),transparent)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-12">
          <header className="flex items-center justify-between py-4">
            <div className="font-display text-lg tracking-[0.24em] text-foreground/92 uppercase">Bergkamp25</div>
            <a href="#waitlist" className="text-xs uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground">
              Waitlist
            </a>
          </header>

          <div className="flex flex-1 flex-col justify-between gap-12 pb-4 pt-12 md:pt-16 lg:pt-20">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_22rem] lg:items-end">
              <div className="max-w-4xl">
                <p className="mb-6 text-xs uppercase tracking-[0.3em] text-primary/88">02 March 2027</p>
                <h1 className="text-balance max-w-5xl font-display text-[3rem] leading-[0.92] text-foreground sm:text-[4.4rem] md:text-[5.6rem] lg:text-[7rem]">
                  2027. Twenty-five years since the pirouette.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
                  Recreate the most beautiful goal ever scored. Anywhere. On your phone.
                </p>
                <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <Button asChild variant="hero" size="hero">
                    <a href="#waitlist">Join the waitlist</a>
                  </Button>
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Tribute project for a singular football moment
                  </div>
                </div>
              </div>

              <div className="bg-surface-soft shadow-panel border border-line-subtle p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Countdown to the anniversary</p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {countdownItems.map((item) => (
                    <div key={item.label} className="border border-line-subtle bg-background/70 px-2 py-3 text-center">
                      <div className="font-display text-2xl leading-none text-foreground sm:text-3xl">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-foreground/72">
                  {countdown.isLive
                    ? "The anniversary is here."
                    : "A measured build toward a moment football still argues about."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-t border-line-subtle pt-6 text-sm text-foreground/74 sm:grid-cols-3 sm:gap-6 sm:pt-8">
              <FeaturePill icon={Goal} title="A goal remembered as art" />
              <FeaturePill icon={Camera} title="Captured with a phone and a ball" />
              <FeaturePill icon={Sparkles} title="Scored against Dennis by motion" />
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="border-t border-line-subtle bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,28rem)] lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/88">Waitlist</p>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-4xl leading-tight text-foreground sm:text-5xl">
              For kids, parents, coaches and the people who still stop when that goal comes on.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-foreground/78">
              Phase one is simple. Gather the people who want to see the pirouette passed on properly.
            </p>
          </div>

          <div className="bg-surface-strong shadow-cinematic border border-line-subtle p-5 sm:p-7">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 border-line-subtle bg-background/70 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-11 border-line-subtle bg-background/70 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Country
                </Label>
                <Input
                  id="country"
                  type="text"
                  autoComplete="country-name"
                  placeholder="Country"
                  value={form.country}
                  onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                  className="h-11 border-line-subtle bg-background/70 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  I'm a
                </Label>
                <Select
                  value={form.audience}
                  onValueChange={(value) => setForm((current) => ({ ...current, audience: value as WaitlistAudience }))}
                >
                  <SelectTrigger
                    id="audience"
                    className="h-11 border-line-subtle bg-background/70 text-left text-foreground data-[placeholder]:text-muted-foreground"
                  >
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent className="border-line-subtle bg-popover text-popover-foreground">
                    {audienceOptions.map((option) => (
                      <SelectItem key={option} value={option} className="capitalize">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-1">
                <Button type="submit" variant="hero" size="hero" className="w-full justify-center" disabled={isSubmitting}>
                  {isSubmitting ? "Saving your place" : "I want in"}
                </Button>
                <p
                  className={cn(
                    "min-h-5 text-sm",
                    error ? "text-destructive" : success ? "text-foreground/82" : "text-muted-foreground",
                  )}
                  aria-live="polite"
                >
                  {error ?? success ?? "We’ll only write when there is something worth sending."}
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeaturePill({
  icon: Icon,
  title,
}: {
  icon: typeof Goal;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center border border-line-subtle bg-surface-soft text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="max-w-[16rem] text-sm leading-6 text-foreground/72">{title}</p>
    </div>
  );
}
