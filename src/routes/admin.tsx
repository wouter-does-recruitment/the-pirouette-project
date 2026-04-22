import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const adminCredentialsSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

const verifyAdminAccess = createServerFn({ method: "POST" })
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

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Bergkamp25 Admin" },
      { name: "description", content: "Private Bergkamp25 waitlist view." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  country: string;
  audience: string;
  created_at: string;
};

function AdminPage() {
  const verifyAccess = useServerFn(verifyAdminAccess);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [entries, setEntries] = useState<WaitlistEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = adminCredentialsSchema.safeParse({ username, password });
    if (!parsed.success) {
      setError("Enter both username and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await verifyAccess({ data: parsed.data });
      setEntries(response.entries);
    } catch (submissionError) {
      setEntries(null);
      setError(submissionError instanceof Error ? submissionError.message : "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3 border-b border-line-subtle pb-6">
          <p className="text-xs uppercase tracking-[0.28em] text-primary/88">Private view</p>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">Bergkamp25 waitlist</h1>
          <p className="max-w-xl text-sm leading-6 text-foreground/72">
            Simple access for now. Use project secrets for the credentials so nothing is hardcoded in the app.
          </p>
        </div>

        {!entries ? (
          <div className="bg-surface-strong shadow-panel max-w-md border border-line-subtle p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="admin-username" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Username
                </Label>
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-11 border-line-subtle bg-background/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 border-line-subtle bg-background/70"
                />
              </div>

              <Button type="submit" variant="hero" size="hero" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Checking" : "Enter"}
              </Button>
              <p className="min-h-5 text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            </form>
          </div>
        ) : (
          <div className="overflow-hidden border border-line-subtle bg-surface-strong shadow-panel">
            <Table>
              <TableHeader>
                <TableRow className="border-line-subtle">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="border-line-subtle">
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.country}</TableCell>
                    <TableCell className="capitalize">{entry.audience}</TableCell>
                    <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}
