export const ADMIN_SESSION_COOKIE = 'jerseydor_admin_session';
export const ADMIN_PENDING_2FA_COOKIE = 'jerseydor_admin_2fa_pending';

const SESSION_TTL_SECONDS = 60 * 60 * 8;
const PENDING_2FA_TTL_SECONDS = 60 * 5;

function base64UrlEncode(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase();
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim();
}

function getAdminPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH?.trim();
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim();
}

async function signPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));

  return base64UrlEncode(new Uint8Array(signature));
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminEmail() && (getAdminPasswordHash() || getAdminPassword()) && getAdminSessionSecret());
}

export function isAdminTotpConfigured() {
  return Boolean(process.env.ADMIN_TOTP_SECRET?.trim());
}

export function isAdminTotpSetupEnabled() {
  return process.env.ADMIN_TOTP_SETUP_ENABLED === 'true';
}

function timingSafeEqual(first: string, second: string) {
  if (first.length !== second.length) return false;

  let result = 0;

  for (let index = 0; index < first.length; index += 1) {
    result |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return result === 0;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));

  return toHex(new Uint8Array(digest));
}

async function verifyPasswordHash(password: string, hash: string) {
  if (hash.startsWith('sha256:')) {
    return timingSafeEqual(await sha256Hex(password), hash.replace('sha256:', ''));
  }

  return false;
}

export async function validateAdminCredentials(email: string, password: string) {
  const adminEmail = getAdminEmail();
  const adminPasswordHash = getAdminPasswordHash();
  const adminPassword = getAdminPassword();

  if (!adminEmail || email.trim().toLowerCase() !== adminEmail) return false;

  if (adminPasswordHash) {
    return verifyPasswordHash(password, adminPasswordHash);
  }

  return Boolean(adminPassword && timingSafeEqual(password, adminPassword));
}

async function createSignedToken(payloadData: Record<string, unknown>, ttlSeconds: number) {
  const secret = getAdminSessionSecret();

  if (!secret) return undefined;

  const payload = base64UrlEncode(
    new TextEncoder().encode(
      JSON.stringify({
        ...payloadData,
        exp: Math.floor(Date.now() / 1000) + ttlSeconds,
      })
    )
  );
  const signature = await signPayload(payload, secret);

  return `${payload}.${signature}`;
}

async function verifySignedToken(token: string | undefined) {
  const secret = getAdminSessionSecret();

  if (!token || !secret) return undefined;

  const [payload, signature] = token.split('.');

  if (!payload || !signature) return undefined;

  const expectedSignature = await signPayload(payload, secret);

  if (expectedSignature !== signature) return undefined;

  try {
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as Record<string, unknown>;

    if (typeof session.exp !== 'number' || session.exp <= Math.floor(Date.now() / 1000)) {
      return undefined;
    }

    return session;
  } catch {
    return undefined;
  }
}

export async function createAdminPending2faToken(email: string) {
  return createSignedToken(
    {
      email: email.trim().toLowerCase(),
      stage: 'totp_pending',
    },
    PENDING_2FA_TTL_SECONDS
  );
}

export async function createAdminSessionToken(email: string) {
  return createSignedToken(
    {
      email: email.trim().toLowerCase(),
      stage: 'admin',
      mfa: true,
    },
    SESSION_TTL_SECONDS
  );
}

export async function verifyAdminPending2faToken(token: string | undefined) {
  const adminEmail = getAdminEmail();
  const session = await verifySignedToken(token);

  return Boolean(
    adminEmail &&
      session?.email === adminEmail &&
      session?.stage === 'totp_pending'
  );
}

export async function verifyAdminSessionToken(token: string | undefined) {
  const adminEmail = getAdminEmail();
  const session = await verifySignedToken(token);

  return Boolean(
    adminEmail &&
      session?.email === adminEmail &&
      session?.stage === 'admin' &&
      session?.mfa === true
  );
}

function getSecureCookieSuffix() {
  return process.env.NODE_ENV === 'production' ? '; Secure' : '';
}

export function getAdminSessionSetCookie(token: string) {
  const secure = getSecureCookieSuffix();
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function getAdminSessionClearCookie() {
  const secure = getSecureCookieSuffix();
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function getAdminPending2faSetCookie(token: string) {
  const secure = getSecureCookieSuffix();
  return `${ADMIN_PENDING_2FA_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PENDING_2FA_TTL_SECONDS}${secure}`;
}

export function getAdminPending2faClearCookie() {
  const secure = getSecureCookieSuffix();
  return `${ADMIN_PENDING_2FA_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
