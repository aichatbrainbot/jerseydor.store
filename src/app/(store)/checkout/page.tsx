import { Check, LockKeyhole } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Checkout | JerseyDor',
  },
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  searchParams: Promise<{
    status?: string;
    provider?: string;
  }>;
};

function getCheckoutCopy(status: string | undefined, provider: string | undefined) {
  if (status === 'mock') {
    return {
      eyebrow: 'Checkout infrastructure',
      title: 'Mock checkout is wired and ready for provider credentials.',
      copy: 'The cart reached the provider-driven checkout adapter successfully. Add Stripe or Shopify environment variables to enable a hosted payment flow.',
      note: 'No live order or payment was created.',
    };
  }

  if (status === 'success') {
    return {
      eyebrow: 'Checkout',
      title: 'Checkout returned successfully.',
      copy: `The ${provider ?? 'configured'} checkout provider returned to the storefront. Order storage and confirmation emails still need production wiring.`,
      note: 'Use this page as the future order confirmation entry point.',
    };
  }

  return {
    eyebrow: 'Checkout',
    title: 'Payment flow reserved for launch.',
    copy: 'Your product bag is working in this browser. Online payment, inventory sync, and fulfillment will connect through the configured checkout provider.',
    note: 'Payment, inventory, and fulfillment will connect in the production build.',
  };
}

export default async function CheckoutPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const checkoutCopy = getCheckoutCopy(resolvedSearchParams.status, resolvedSearchParams.provider);

  return (
    <div className="brand-container flex min-h-[70vh] items-center justify-center py-16">
      <div className="brand-panel max-w-2xl p-6 text-center md:p-10">
        <div className="mx-auto mb-8 grid size-20 place-items-center rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_36px_rgba(73,186,255,0.16)]">
          <Check className="size-9 text-primary" />
        </div>

        <p className="brand-eyebrow mb-4">{checkoutCopy.eyebrow}</p>
        <h1 className="font-heading text-4xl font-black leading-tight md:text-5xl">{checkoutCopy.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          {checkoutCopy.copy}
        </p>

        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-full border border-border/70 bg-background/50 px-4 py-3 text-sm text-muted-foreground">
          <LockKeyhole className="size-4 text-primary" />
          {checkoutCopy.note}
        </div>

        <Link
          href="/"
          className={cn(buttonVariants({ size: 'lg' }), 'mt-8 w-full sm:w-auto')}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
