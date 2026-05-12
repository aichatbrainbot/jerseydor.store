import { sendContactFormEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Spam Protection: Honeypot field
    // If the hidden 'website' field is filled out, it's a bot
    if (body.website) {
      // Return a fake 200 to trick the bot
      return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
    }

    const { name, email, subject, message, captchaAnswer, expectedCaptcha } = body;

    // CAPTCHA validation
    if (!captchaAnswer || parseInt(captchaAnswer, 10) !== expectedCaptcha) {
      return NextResponse.json(
        { success: false, message: 'Security question failed. Are you a bot?' },
        { status: 400 }
      );
    }

    // Basic Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Message length validation
    if (message.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Message is too short.' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Message is too long (max 2000 characters).' },
        { status: 400 }
      );
    }

    // Send the email using existing email provider infrastructure
    const result = await sendContactFormEmail({
      name,
      email,
      subject,
      message,
    });

    if (!result.ok && !result.skipped) {
      console.error('Failed to send contact email:', result.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form API error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
