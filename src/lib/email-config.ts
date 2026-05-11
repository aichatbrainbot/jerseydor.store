export type EmailProviderName = 'resend' | 'disabled';

export type EmailConfig = {
  provider: EmailProviderName;
  resendApiKey?: string;
  from?: string;
  supportEmail?: string;
};

function optionalEnv(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getEmailConfig(): EmailConfig {
  const resendApiKey = optionalEnv(process.env.RESEND_API_KEY);
  const from = optionalEnv(process.env.STORE_EMAIL_FROM);
  const supportEmail = optionalEnv(process.env.STORE_SUPPORT_EMAIL);

  return {
    provider: resendApiKey && from ? 'resend' : 'disabled',
    resendApiKey,
    from,
    supportEmail,
  };
}
