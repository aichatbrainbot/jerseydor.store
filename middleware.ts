import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_PENDING_2FA_COOKIE,
  ADMIN_SESSION_COOKIE,
  isAdminTotpSetupEnabled,
  verifyAdminPending2faToken,
  verifyAdminSessionToken,
} from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login' || pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  const isSetupTwoFactorRoute = pathname === '/admin/setup-2fa';
  const isPendingTwoFactorRoute = pathname === '/admin/verify' || isSetupTwoFactorRoute || pathname === '/api/admin/verify';

  if (isSetupTwoFactorRoute && !isAdminTotpSetupEnabled()) {
    return NextResponse.redirect(new URL('/admin/verify', request.url));
  }

  const isAuthorized = await verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (isAuthorized && !isSetupTwoFactorRoute) {
    return NextResponse.next();
  }

  if (isPendingTwoFactorRoute) {
    const hasPendingTwoFactorSession = await verifyAdminPending2faToken(
      request.cookies.get(ADMIN_PENDING_2FA_COOKIE)?.value
    );

    if (hasPendingTwoFactorSession) {
      return NextResponse.next();
    }
  }

  if (isAdminApi) {
    return Response.json({ error: 'Unauthorized admin request.' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
