import { createCheckoutSession, type CheckoutCartLineInput } from '@/lib/checkout';

export const dynamic = 'force-dynamic';

type CheckoutRequestBody = {
  items?: CheckoutCartLineInput[];
};

export async function POST(request: Request) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return Response.json({ error: 'Invalid checkout request body.' }, { status: 400 });
  }

  const result = await createCheckoutSession(request, body.items ?? []);

  if (!result.ok) {
    return Response.json(
      {
        provider: result.provider,
        error: result.error,
      },
      { status: result.statusCode ?? 400 }
    );
  }

  return Response.json({
    provider: result.provider,
    checkoutUrl: result.checkoutUrl,
  });
}
