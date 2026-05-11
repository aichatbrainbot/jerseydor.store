import QRCode from 'qrcode';

const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function getTotpSecret() {
  return process.env.ADMIN_TOTP_SECRET?.trim().replaceAll(' ', '').toUpperCase();
}

function getTotpIssuer() {
  return process.env.ADMIN_TOTP_ISSUER?.trim() || 'JerseyDor';
}

function getAdminAccountName() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'admin';
}

function timingSafeEqual(first: string, second: string) {
  if (first.length !== second.length) return false;

  let result = 0;

  for (let index = 0; index < first.length; index += 1) {
    result |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return result === 0;
}

function decodeBase32(value: string) {
  const sanitized = value.replaceAll('=', '').toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let bitLength = 0;

  for (const character of sanitized) {
    const alphabetIndex = BASE32_ALPHABET.indexOf(character);

    if (alphabetIndex === -1) {
      throw new Error('Invalid TOTP secret.');
    }

    bits = (bits << 5) | alphabetIndex;
    bitLength += 5;

    if (bitLength >= 8) {
      bytes.push((bits >>> (bitLength - 8)) & 255);
      bitLength -= 8;
    }
  }

  return new Uint8Array(bytes);
}

function counterToBytes(counter: number) {
  const bytes = new Uint8Array(8);
  let value = counter;

  for (let index = 7; index >= 0; index -= 1) {
    bytes[index] = value & 255;
    value = Math.floor(value / 256);
  }

  return bytes;
}

async function generateTotpCode(secret: string, counter: number) {
  const key = await crypto.subtle.importKey(
    'raw',
    decodeBase32(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterToBytes(counter)));
  const offset = signature[signature.length - 1] & 15;
  const binary =
    ((signature[offset] & 127) << 24) |
    ((signature[offset + 1] & 255) << 16) |
    ((signature[offset + 2] & 255) << 8) |
    (signature[offset + 3] & 255);

  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, '0');
}

export function hasAdminTotpSecret() {
  return Boolean(getTotpSecret());
}

export async function verifyAdminTotpCode(input: string) {
  const secret = getTotpSecret();
  const code = input.replace(/\D/g, '');

  if (!secret || code.length !== TOTP_DIGITS) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS);

  try {
    for (let offset = -1; offset <= 1; offset += 1) {
      const expectedCode = await generateTotpCode(secret, currentCounter + offset);

      if (timingSafeEqual(code, expectedCode)) return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function getAdminTotpSetup() {
  const secret = getTotpSecret();

  if (!secret) return undefined;

  const issuer = getTotpIssuer();
  const accountName = getAdminAccountName();
  const label = `${issuer}:${accountName}`;
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${encodeURIComponent(
    secret
  )}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD_SECONDS}`;
  const qrSvg = await QRCode.toString(otpauthUrl, {
    type: 'svg',
    margin: 1,
    width: 224,
    color: {
      dark: '#0B0B0F',
      light: '#FFFFFF',
    },
  });

  return {
    accountName,
    issuer,
    manualSecret: secret,
    otpauthUrl,
    qrSvg,
  };
}
