import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { ArrowLeft, Box, CheckCircle2, Clock, Mail, MailWarning, MapPin, Package, ShoppingBag, Truck } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getAdminOrder, updateAdminOrder } from '@/lib/admin-db';
import { sendOrderConfirmationEmail, sendShippingUpdateEmail } from '@/lib/email';
import Link from 'next/link';
import { headers } from 'next/headers';
import { consumeRateLimit } from '@/lib/admin-rate-limit';

export const metadata: Metadata = {
  title: 'Order Details | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function StatusPill({ status }: { status: string }) {
  const toneClass = {
    pending: 'border-gold-400/25 bg-gold-400/10 text-gold-500',
    paid: 'border-blue-400/25 bg-blue-400/10 text-blue-500',
    processing: 'border-purple-400/25 bg-purple-400/10 text-purple-500',
    shipped: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-500',
    delivered: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-500',
    cancelled: 'border-destructive/35 bg-destructive/10 text-destructive',
  }[status] || 'border-border/70 bg-muted/35 text-muted-foreground';

  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-3 font-display text-[10px] font-bold uppercase ${toneClass}`}>
      {status}
    </span>
  );
}

export default async function AdminOrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; emailed?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const orderId = resolvedParams.id;
  const storageMode = getAdminProductOverrideStorageMode();
  const order = await getAdminOrder(orderId);

  if (!order) {
    notFound();
  }

  async function updateStatus(formData: FormData) {
    'use server';
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || 'local';
    const limit = consumeRateLimit(`update-order:${orderId}:${ip}`, 10, 60000);
    
    if (!limit.allowed) {
      redirect(`/admin/orders/${orderId}?error=rate_limit`);
    }

    const status = formData.get('status') as any;
    const trackingNumber = formData.get('trackingNumber') as string;
    const sendEmail = formData.get('sendEmail') === 'on';

    await updateAdminOrder(orderId, { 
      status, 
      trackingNumber: trackingNumber || undefined 
    });

    if (sendEmail && (status === 'shipped' || status === 'delivered')) {
      await sendShippingUpdateEmail({
        orderNumber: order!.orderNumber,
        customerEmail: order!.customerEmail,
        status: status,
        trackingNumber: trackingNumber || undefined,
      });
      redirect(`/admin/orders/${orderId}?updated=1&emailed=1`);
    }

    redirect(`/admin/orders/${orderId}?updated=1`);
  }

  async function resendConfirmation() {
    'use server';
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || 'local';
    const limit = consumeRateLimit(`resend-conf:${orderId}:${ip}`, 3, 60000);
    
    if (!limit.allowed) {
      redirect(`/admin/orders/${orderId}?error=rate_limit`);
    }

    await sendOrderConfirmationEmail({
      orderNumber: order!.orderNumber,
      customerEmail: order!.customerEmail,
      items: order!.items.map(item => ({ ...item, slug: 'unknown' })),
      subtotal: order!.totalAmount,
      shippingTotal: 0,
      total: order!.totalAmount,
    });
    redirect(`/admin/orders/${orderId}?emailed=confirmation`);
  }

  const fieldClass = 'h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-6 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary">
              <ArrowLeft className="size-3.5" /> Back to orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-black md:text-3xl">Order {order.orderNumber}</h1>
              <StatusPill status={order.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-4">
              <span className="flex items-center gap-1"><Clock className="size-3.5" /> {new Date(order.createdAt).toLocaleString()}</span>
              {order.shopifyOrderId && (
                <span className="flex items-center gap-1 border-l border-border/50 pl-4"><ShoppingBag className="size-3.5" /> Shopify ID: {order.shopifyOrderId}</span>
              )}
            </p>
          </div>
        </div>
      </header>

      {resolvedSearch.updated && (
        <div className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary flex items-center gap-2">
          <CheckCircle2 className="size-4" /> Order updated successfully.
        </div>
      )}
      
      {resolvedSearch.emailed && (
        <div className="mb-6 rounded-md border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm text-blue-500 flex items-center gap-2">
          <Mail className="size-4" /> Email notification sent to {order.customerEmail}.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden">
            <div className="border-b border-border/70 bg-card/70 px-4 py-3 flex items-center gap-2">
              <Package className="size-4 text-primary" />
              <h2 className="font-heading text-lg font-bold">Items</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded bg-muted/30">
                        <ShoppingBag className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-display font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-border/50 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-display text-lg font-black text-primary">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden">
            <div className="border-b border-border/70 bg-card/70 px-4 py-3 flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              <h2 className="font-heading text-lg font-bold">Update Status</h2>
            </div>
            <form action={updateStatus} className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Status</label>
                  <select name="status" defaultValue={order.status} className={`${fieldClass} w-full`}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Tracking Number</label>
                  <input name="trackingNumber" defaultValue={order.trackingNumber || ''} placeholder="e.g. TRK123456" className={`${fieldClass} w-full`} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input name="sendEmail" type="checkbox" className="size-4 rounded border-border/70 bg-background/70" />
                Send shipping notification email to customer
              </label>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 font-display text-xs font-bold text-primary-foreground transition hover:bg-primary/90">
                <CheckCircle2 className="size-4" /> Save changes
              </button>
            </form>
          </section>
          
          {/* Placeholder for Timeline / Events */}
          <section className="rounded-xl border border-border/70 border-dashed bg-card/20 overflow-hidden opacity-70">
            <div className="border-b border-border/70 border-dashed px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Timeline & Events</h2>
            </div>
            <div className="p-8 text-center text-sm text-muted-foreground">
              <p>Event timeline integration coming soon.</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden h-fit">
            <div className="border-b border-border/70 bg-card/70 px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Customer</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="font-bold">{order.customerName}</p>
                <a href={`mailto:${order.customerEmail}`} className="text-sm text-primary hover:underline">{order.customerEmail}</a>
              </div>
              <div className="border-t border-border/50 pt-4">
                <p className="mb-2 font-display text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" /> Shipping Address
                </p>
                {order.shippingAddress ? (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{order.shippingAddress.first_name} {order.shippingAddress.last_name}</p>
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}</p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && <p className="pt-1 text-xs">{order.shippingAddress.phone}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No shipping address provided.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden h-fit">
            <div className="border-b border-border/70 bg-card/70 px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Communication Status</h2>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confirmation Email</span>
                {order.confirmationEmailSent ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium"><CheckCircle2 className="size-3.5" /> Sent</span>
                ) : (
                  <span className="text-muted-foreground">Not Sent</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping Update</span>
                {order.shippingUpdateEmailSent ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium"><CheckCircle2 className="size-3.5" /> Sent</span>
                ) : (
                  <span className="text-muted-foreground">Not Sent</span>
                )}
              </div>
              {order.trackingUrl && (
                <div className="pt-3 border-t border-border/50">
                  <p className="font-display text-[10px] font-semibold uppercase text-muted-foreground mb-1">Tracking Link</p>
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all text-xs">
                    {order.trackingUrl}
                  </a>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden h-fit">
            <div className="border-b border-border/70 bg-card/70 px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <form action={resendConfirmation}>
                <button className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-card/50 px-4 font-display text-xs font-bold uppercase text-foreground transition hover:border-primary hover:text-primary">
                  <MailWarning className="size-4" /> Resend Confirmation
                </button>
              </form>
            </div>
          </section>
          <section className="rounded-xl border border-border/70 border-dashed bg-card/20 overflow-hidden opacity-70">
            <div className="border-b border-border/70 border-dashed px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Admin Notes</h2>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p className="mb-3">Internal staff notes coming soon.</p>
              <button disabled className="inline-flex h-8 items-center justify-center rounded bg-muted/50 px-3 text-xs">
                Add Note
              </button>
            </div>
          </section>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
