import type { Metadata } from 'next';
import { LockKeyhole } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error: string | undefined) {
  if (error === 'rate_limited') return 'Too many login attempts. Wait a moment, then try again.';
  if (error === 'session') return 'Your verification session expired. Sign in again to continue.';
  if (error) return 'Admin login failed. Check credentials and environment configuration.';

  return undefined;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams.error);

  return (
    <div className="brand-container flex min-h-[70vh] items-center justify-center py-16">
      <div className="brand-panel w-full max-w-md p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full border border-primary/30 bg-primary/10">
            <LockKeyhole className="size-5 text-primary" />
          </div>
          <div>
            <p className="brand-eyebrow">Private</p>
            <h1 className="font-heading text-2xl font-black">Admin login</h1>
          </div>
        </div>

        {errorMessage && (
          <p className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <form action="/api/admin/login" method="post" className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="font-display text-xs font-semibold uppercase text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="h-11 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="font-display text-xs font-semibold uppercase text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-full bg-primary px-5 font-display text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Continue
          </button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          Password verification is followed by a Google Authenticator code.
        </p>
      </div>
    </div>
  );
}
