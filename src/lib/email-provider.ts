import 'server-only';
import { Resend } from 'resend';
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
  private resend: Resend;

  constructor(private readonly config: EmailConfig) {
    this.resend = new Resend(config.resendApiKey);
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    if (!this.config.resendApiKey || !this.config.from) {
      return {
        ok: false,
        provider: 'resend',
        error: 'Resend email is selected but RESEND_API_KEY or STORE_EMAIL_FROM is missing.',
      };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.config.from,
        to: input.to,
        subject: input.subject,
        react: input.react,
        replyTo: input.replyTo,
      });

      if (error) {
        return {
          ok: false,
          provider: 'resend',
          error: error.message ?? 'Resend email request failed.',
        };
      }

      return {
        ok: true,
        provider: 'resend',
        id: data?.id,
      };
    } catch (e) {
      return {
        ok: false,
        provider: 'resend',
        error: e instanceof Error ? e.message : 'Unknown error during email sending.',
      };
    }
  }
}

export function getEmailProvider(): EmailProvider {
  const config = getEmailConfig();

  if (config.provider === 'resend') {
    return new ResendEmailProvider(config);
  }

  return new DisabledEmailProvider();
}
