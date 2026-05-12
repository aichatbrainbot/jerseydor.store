'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });

  useEffect(() => {
    generateCaptcha();
  }, []);

  function generateCaptcha() {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Client-side CAPTCHA validation
    const answer = parseInt(data.captchaAnswer as string, 10);
    if (answer !== captcha.num1 + captcha.num2) {
      setStatus('error');
      setErrorMessage('Incorrect math question answer. Are you a bot?');
      generateCaptcha();
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, expectedCaptcha: captcha.num1 + captcha.num2 }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      setStatus('success');
      (event.target as HTMLFormElement).reset();
      generateCaptcha();
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="brand-panel flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-6 grid size-16 place-items-center rounded-full bg-primary/20 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="font-heading text-2xl font-black">Message Sent</h3>
        <p className="mt-3 text-muted-foreground">
          Thank you for reaching out. Our support team will get back to you as soon as possible.
        </p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => setStatus('idle')}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="brand-card grid gap-6 p-6 md:p-8">
      {status === 'error' && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-500">
          <AlertCircle className="size-5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Honeypot field for basic spam protection */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="name" className="font-display text-xs font-semibold uppercase text-muted-foreground">
            Full Name
          </label>
          <Input id="name" name="name" required placeholder="John Doe" className="bg-background/50" />
        </div>
        <div className="grid gap-2">
          <label htmlFor="email" className="font-display text-xs font-semibold uppercase text-muted-foreground">
            Email Address
          </label>
          <Input id="email" name="email" type="email" required placeholder="john@example.com" className="bg-background/50" />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="subject" className="font-display text-xs font-semibold uppercase text-muted-foreground">
          Subject
        </label>
        <Input id="subject" name="subject" required placeholder="Order Issue, Returns, Sizing..." className="bg-background/50" />
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="font-display text-xs font-semibold uppercase text-muted-foreground">
          Message
        </label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="How can we help you?"
          className="min-h-[160px] resize-y bg-background/50"
          minLength={10}
          maxLength={2000}
        />
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label htmlFor="captchaAnswer" className="font-display text-xs font-semibold uppercase text-muted-foreground">
          Security Question: What is {captcha.num1} + {captcha.num2}?
        </label>
        <Input id="captchaAnswer" name="captchaAnswer" type="number" required placeholder="Answer" className="bg-background/50" />
      </div>

      <Button type="submit" size="lg" disabled={status === 'loading'} className={cn("w-full sm:w-auto sm:place-self-end", status === 'loading' && "opacity-70")}>
        {status === 'loading' ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
}
