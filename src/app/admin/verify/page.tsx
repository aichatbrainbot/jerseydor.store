import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { isAdminTotpSetupEnabled } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Verify Admin Login',
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
  if (error === 'rate_limited') return 'Too many verification attempts. Wait a moment, then try again.';
  if (error) return 'Verification failed. Enter the current 6-digit code from Google Authenticator.';

  return undefined;
}

export default async function AdminVerifyPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams.error);
  const canSetUpTwoFactor = isAdminTotpSetupEnabled();

  return (
    <div className="brand-container flex min-h-[70vh] items-center justify-center py-16">
      <div className="brand-panel w-full max-w-md p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full border border-primary/30 bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <p className="brand-eyebrow">Two-factor</p>
            <h1 className="font-heading text-2xl font-black">Verify login</h1>
          </div>
        </div>

        {errorMessage && (
          <p className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <form action="/api/admin/verify" method="post" className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="font-display text-xs font-semibold uppercase text-muted-foreground">
              Authenticator code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              required
              className="h-12 w-full rounded-md border border-border/70 bg-background/70 px-3 text-center font-display text-lg font-bold tracking-[0.25em] outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-full bg-primary px-5 font-display text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Verify and continue
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          {canSetUpTwoFactor ? (
            <Link href="/admin/setup-2fa" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Set up authenticator
            </Link>
          ) : (
            <span>Authenticator setup is locked</span>
          )}
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
