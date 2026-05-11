import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import { getEmailConfig, type EmailConfig } from '@/lib/email-config';

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export type SendEmailResult = {
  ok: boolean;
  provider: EmailConfig['provider'];
  skipped?: boolean;
  id?: string;
  error?: string;
};

export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}

class DisabledEmailProvider implements EmailProvider {
  async send(): Promise<SendEmailResult> {
    return {
      ok: true,
      provider: 'disabled',
      skipped: true,
    };
  }
}

class ResendEmailProvider implements EmailProvider {
  constructor(private readonly config: EmailConfig) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    if (!this.config.resendApiKey || !this.config.from) {
      return {
        ok: false,
        provider: 'resend',
        error: 'Resend email is selected but RESEND_API_KEY or STORE_EMAIL_FROM is missing.',
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.from,
        to: input.to,
        subject: input.subject,
        html: `<!doctype html>${renderToStaticMarkup(input.react)}`,
        reply_to: input.replyTo,
      }),
    });
    const payload = (await response.json()) as { id?: string; message?: string; error?: string };

    if (!response.ok) {
      return {
        ok: false,
        provider: 'resend',
        error: payload.message ?? payload.error ?? 'Resend email request failed.',
      };
    }

    return {
      ok: true,
      provider: 'resend',
      id: payload.id,
    };
  }
}

export function getEmailProvider(): EmailProvider {
  const config = getEmailConfig();

  if (config.provider === 'resend') {
    return new ResendEmailProvider(config);
  }

  return new DisabledEmailProvider();
}
