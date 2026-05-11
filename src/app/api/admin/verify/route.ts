import { NextResponse } from 'next/server';
import {
  ADMIN_PENDING_2FA_COOKIE,
  createAdminSessionToken,
  getAdminPending2faClearCookie,
  getAdminSessionSetCookie,
  verifyAdminPending2faToken,
} from '@/lib/admin-auth';
import { consumeRateLimit, getRateLimitKey } from '@/lib/admin-rate-limit';
import { hasAdminTotpSecret, verifyAdminTotpCode } from '@/lib/admin-totp';

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(getRateLimitKey(request, 'admin-totp'), 8, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.redirect(new URL('/admin/verify?error=rate_limited', request.url), 303);
  }

  const pendingToken = request.headers
    .get('cookie')
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${ADMIN_PENDING_2FA_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  const hasPendingSession = await verifyAdminPending2faToken(pendingToken);

  if (!hasPendingSession) {
    return NextResponse.redirect(new URL('/admin/login?error=session', request.url), 303);
  }

  if (!hasAdminTotpSecret()) {
    return NextResponse.redirect(new URL('/admin/setup-2fa?error=missing_secret', request.url), 303);
  }

  const formData = await request.formData();
  const code = String(formData.get('code') ?? '');

  if (!(await verifyAdminTotpCode(code))) {
    return NextResponse.redirect(new URL('/admin/verify?error=1', request.url), 303);
  }

  const token = await createAdminSessionToken(process.env.ADMIN_EMAIL ?? '');

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
  }

  const response = NextResponse.redirect(new URL('/admin', request.url), 303);
  response.headers.append('Set-Cookie', getAdminSessionSetCookie(token));
  response.headers.append('Set-Cookie', getAdminPending2faClearCookie());

  return response;
}
