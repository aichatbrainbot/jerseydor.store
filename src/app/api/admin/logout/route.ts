import { NextResponse } from 'next/server';
import { getAdminPending2faClearCookie, getAdminSessionClearCookie } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.headers.append('Set-Cookie', getAdminSessionClearCookie());
  response.headers.append('Set-Cookie', getAdminPending2faClearCookie());

  return response;
}
