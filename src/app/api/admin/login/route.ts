import { NextResponse } from 'next/server';
import {
  createAdminPending2faToken,
  getAdminPending2faSetCookie,
  getAdminSessionClearCookie,
  isAdminAuthConfigured,
  isAdminTotpConfigured,
  validateAdminCredentials,
} from '@/lib/admin-auth';
import { consumeRateLimit, getRateLimitKey } from '@/lib/admin-rate-limit';

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(getRateLimitKey(request, 'admin-login'), 5, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.redirect(new URL('/admin/login?error=rate_limited', request.url), 303);
  }

  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!isAdminAuthConfigured() || !(await validateAdminCredentials(email, password))) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
  }

  const token = await createAdminPending2faToken(email);

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
  }

  const nextPath = isAdminTotpConfigured() ? '/admin/verify' : '/admin/setup-2fa';
  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);
  response.headers.append('Set-Cookie', getAdminPending2faSetCookie(token));
  response.headers.append('Set-Cookie', getAdminSessionClearCookie());

  return response;
}
