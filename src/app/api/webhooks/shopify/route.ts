import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification, sendShippingUpdateEmail } from '@/lib/email';
import type { TransactionalOrder, TransactionalOrderItem, ShippingUpdateEmailInput } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    const topic = request.headers.get('x-shopify-topic');

    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('Missing SHOPIFY_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (!hmacHeader || !topic) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const generatedHash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    if (generatedHash !== hmacHeader) {
      console.error('Invalid Shopify HMAC signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (topic === 'orders/create' || topic === 'orders/updated') {
      await handleOrderWebhook(payload);
    } else if (topic === 'checkouts/update') {
      await handleCheckoutWebhook(payload);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleOrderWebhook(payload: any) {
  const shopifyOrderId = payload.id.toString();
  const orderNumber = payload.name; // e.g. "#1001"
  const email = payload.email || payload.customer?.email;
  const totalAmount = payload.total_price;
  const currency = payload.currency;
  
  // Map line items for both Prisma and Email schemas
  const items = payload.line_items.map((item: any) => ({
    title: item.title,
    quantity: item.quantity,
    price: parseFloat(item.price),
    variantId: item.variant_id?.toString(),
    sku: item.sku,
    slug: item.sku || 'product', // fallback slug
  }));

  // Handle tracking and fulfillment status
  let status = 'pending';
  let trackingNumber = undefined;
  let trackingUrl = undefined;
  let carrier = undefined;

  if (payload.financial_status === 'paid') {
    status = 'paid';
  }

  if (payload.fulfillment_status === 'fulfilled' || payload.fulfillment_status === 'partial') {
    status = payload.fulfillment_status === 'fulfilled' ? 'shipped' : 'processing';
    
    if (payload.fulfillments && payload.fulfillments.length > 0) {
      const latestFulfillment = payload.fulfillments[payload.fulfillments.length - 1];
      trackingNumber = latestFulfillment.tracking_number;
      trackingUrl = latestFulfillment.tracking_url;
      carrier = latestFulfillment.tracking_company;
    }
  }

  if (payload.cancelled_at) {
    status = 'cancelled';
  }

  // Handle Customer Upsert
  let customerId = undefined;
  if (email) {
    const firstName = payload.customer?.first_name || '';
    const lastName = payload.customer?.last_name || '';
    const phone = payload.customer?.phone || '';

    const customer = await prisma.customer.upsert({
      where: { email },
      update: { firstName, lastName, phone },
      create: { email, firstName, lastName, phone },
    });
    customerId = customer.id;
  }

  // 1. Fetch existing order to check idempotency state
  const existingOrder = await prisma.order.findUnique({
    where: { shopifyOrderId }
  });

  // 2. Handle Order Upsert (Sync data first)
  const order = await prisma.order.upsert({
    where: { shopifyOrderId },
    update: {
      status: status as any,
      customerId,
      totalAmount,
      currency,
      items,
      trackingNumber,
      trackingUrl,
      shippingAddress: payload.shipping_address || null,
      billingAddress: payload.billing_address || null,
    },
    create: {
      shopifyOrderId,
      orderNumber,
      status: status as any,
      customerId,
      totalAmount,
      currency,
      items,
      trackingNumber,
      trackingUrl,
      shippingAddress: payload.shipping_address || null,
      billingAddress: payload.billing_address || null,
    },
  });

  // 3. Process Automated Emails Gracefully
  if (email) {
    const transactionalOrder: TransactionalOrder = {
      orderNumber,
      customerEmail: email,
      items: items as TransactionalOrderItem[],
      subtotal: parseFloat(payload.subtotal_price || totalAmount),
      shippingTotal: parseFloat(payload.total_shipping_price_set?.shop_money?.amount || '0'),
      total: parseFloat(totalAmount),
      statusUrl: payload.order_status_url,
    };

    // A. Order Confirmation & Admin Notification
    if (!order.confirmationEmailSent) {
      try {
        console.log(`[Webhook] Attempting to send Order Confirmation to ${email} for ${orderNumber}`);
        await sendOrderConfirmationEmail(transactionalOrder);
        await sendAdminNewOrderNotification(transactionalOrder);
        
        await prisma.order.update({
          where: { id: order.id },
          data: { confirmationEmailSent: true }
        });
        console.log(`[Webhook] Order Confirmation emails sent successfully for ${orderNumber}`);
      } catch (err) {
        console.error(`[Webhook] Failed to send Order Confirmation email for ${orderNumber}:`, err);
        // Do not throw, allow webhook to succeed so data sync completes.
      }
    }

    // B. Shipping Update (Tracking)
    if (trackingNumber && !order.shippingUpdateEmailSent) {
      try {
        console.log(`[Webhook] Attempting to send Shipping Update to ${email} for ${orderNumber}`);
        const shippingInput: ShippingUpdateEmailInput = {
          orderNumber,
          customerEmail: email,
          status: 'Shipped',
          carrier,
          trackingNumber,
          trackingUrl,
        };
        await sendShippingUpdateEmail(shippingInput);

        await prisma.order.update({
          where: { id: order.id },
          data: { shippingUpdateEmailSent: true }
        });
        console.log(`[Webhook] Shipping Update email sent successfully for ${orderNumber}`);
      } catch (err) {
        console.error(`[Webhook] Failed to send Shipping Update email for ${orderNumber}:`, err);
        // Do not throw
      }
    }
  }
}

async function handleCheckoutWebhook(payload: any) {
  try {
    const checkoutId = payload.id?.toString();
    const email = payload.email;
    const completedAt = payload.completed_at;
    
    // If there is no email yet, we can't track it meaningfully
    if (!checkoutId || !email) {
      return;
    }

    if (completedAt) {
      // If completed, update status to true
      await prisma.abandonedCheckout.updateMany({
        where: { id: checkoutId },
        data: { completed: true },
      });
      return;
    }

    const items = payload.line_items?.map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(item.price),
      variantId: item.variant_id?.toString(),
    })) || [];

    const recoveryUrl = payload.abandoned_checkout_url;
    const totalAmount = parseFloat(payload.total_price);
    const currency = payload.currency;
    const customerName = payload.customer?.first_name 
      ? `${payload.customer.first_name} ${payload.customer.last_name || ''}`.trim() 
      : undefined;

    await prisma.abandonedCheckout.upsert({
      where: { id: checkoutId },
      update: {
        customerEmail: email,
        customerName,
        totalAmount,
        currency,
        items,
        recoveryUrl,
        updatedAt: new Date(),
      },
      create: {
        id: checkoutId,
        customerEmail: email,
        customerName,
        totalAmount,
        currency,
        items,
        recoveryUrl,
      },
    });

    console.log(`Abandoned checkout ${checkoutId} synced to Supabase.`);
  } catch (error) {
    console.error('Failed to process Shopify checkout webhook:', error);
  }
}
