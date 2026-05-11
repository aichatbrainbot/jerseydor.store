import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { ADMIN_PENDING_2FA_COOKIE, isAdminTotpSetupEnabled, verifyAdminPending2faToken } from '@/lib/admin-auth';
import { getAdminTotpSetup } from '@/lib/admin-totp';

export const metadata: Metadata = {
  title: 'Set Up Admin 2FA',
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

export default async function AdminSetup2faPage({ searchParams }: Props) {
  if (!isAdminTotpSetupEnabled()) {
    redirect('/admin/verify');
  }

  const cookieStore = await cookies();
  const hasPendingTwoFactorSession = await verifyAdminPending2faToken(
    cookieStore.get(ADMIN_PENDING_2FA_COOKIE)?.value
  );

  if (!hasPendingTwoFactorSession) {
    redirect('/admin/login');
  }

  const resolvedSearchParams = await searchParams;
  const setup = await getAdminTotpSetup();

  return (
    <div className="brand-container flex min-h-[70vh] items-center justify-center py-16">
      <div className="brand-panel w-full max-w-lg p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full border border-primary/30 bg-primary/10">
            <QrCode className="size-5 text-primary" />
          </div>
          <div>
            <p className="brand-eyebrow">Google Authenticator</p>
            <h1 className="font-heading text-2xl font-black">Set up 2FA</h1>
          </div>
        </div>

        {resolvedSearchParams.error && (
          <p className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Two-factor setup is not complete. Check the secret configuration and try again.
          </p>
        )}

        {!setup ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Add a Base32 secret to <code className="font-mono text-foreground">ADMIN_TOTP_SECRET</code>, redeploy,
              then sign in again to scan the setup code.
            </p>
            <p>
              Full admin access remains locked until the password step and a valid authenticator code both pass.
            </p>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="h-11 rounded-full bg-primary px-5 font-display text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Return to login
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-md border border-border/70 bg-white p-4">
              <div
                className="mx-auto w-fit"
                aria-label="Google Authenticator QR code"
                dangerouslySetInnerHTML={{ __html: setup.qrSvg }}
              />
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Scan this QR code in Google Authenticator for{' '}
                <span className="font-semibold text-foreground">{setup.accountName}</span>.
              </p>
              <div className="rounded-md border border-border/70 bg-background/70 p-3">
                <p className="font-display text-xs font-semibold uppercase text-muted-foreground">Manual key</p>
                <p className="mt-1 break-all font-mono text-sm text-foreground">{setup.manualSecret}</p>
              </div>
            </div>

            <form action="/api/admin/verify" method="post" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="font-display text-xs font-semibold uppercase text-muted-foreground">
                  First code
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
                Verify and open admin
              </button>
            </form>

            <Link href="/admin/verify" className="block text-center text-sm font-semibold text-foreground underline-offset-4 hover:underline">
              I already have it set up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
