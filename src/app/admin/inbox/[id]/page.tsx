import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Send, ShieldCheck, User } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getAdminConversation, updateAdminConversationStatus, markConversationRead, addConversationReply } from '@/lib/admin-db';
import { getEmailProvider } from '@/lib/email-provider';
import { ContactFormEmail } from '@/emails/ContactFormEmail';
import { headers } from 'next/headers';
import { consumeRateLimit } from '@/lib/admin-rate-limit';

export const metadata: Metadata = {
  title: 'Conversation | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const conversationId = resolvedParams.id;
  const storageMode = getAdminProductOverrideStorageMode();
  const conversation = await getAdminConversation(conversationId);

  if (!conversation) {
    notFound();
  }

  // Mark as read when viewed
  if (conversation.unread) {
    await markConversationRead(conversationId);
  }

  async function sendReply(formData: FormData) {
    'use server';
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || 'local';
    const limit = consumeRateLimit(`send-reply:${conversationId}:${ip}`, 10, 60000);
    
    if (!limit.allowed) {
      redirect(`/admin/inbox/${conversationId}?error=rate_limit`);
    }

    const content = formData.get('content') as string;
    const markResolved = formData.get('markResolved') === 'on';

    if (!content || content.trim() === '') return;

    // Send email to customer
    await getEmailProvider().send({
      to: conversation!.customerEmail,
      subject: `Re: ${conversation!.subject}`,
      react: <ContactFormEmail message={{
        name: conversation!.customerName,
        email: conversation!.customerEmail,
        subject: `Re: ${conversation!.subject}`,
        message: content,
      }} />
    });

    const statusToUpdate = markResolved ? 'resolved' : undefined;
    await addConversationReply(conversationId, content, statusToUpdate);

    redirect(`/admin/inbox/${conversationId}`);
  }

  async function toggleStatus(formData: FormData) {
    'use server';
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || 'local';
    const limit = consumeRateLimit(`toggle-conv:${conversationId}:${ip}`, 20, 60000);
    
    if (!limit.allowed) {
      redirect(`/admin/inbox/${conversationId}?error=rate_limit`);
    }

    const status = formData.get('status') as any;
    await updateAdminConversationStatus(conversationId, status);
    redirect(`/admin/inbox/${conversationId}`);
  }

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-6 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <Link href="/admin/inbox" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary">
              <ArrowLeft className="size-3.5" /> Back to inbox
            </Link>
            <h1 className="font-heading text-xl font-black md:text-2xl">{conversation.subject}</h1>
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              From {conversation.customerName} ({conversation.customerEmail})
            </p>
          </div>
          <form action={toggleStatus} className="flex gap-2">
            {conversation.status === 'open' ? (
              <button name="status" value="resolved" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 font-display text-xs font-bold text-white transition hover:bg-emerald-600">
                <CheckCircle2 className="size-3.5" /> Mark Resolved
              </button>
            ) : (
              <button name="status" value="open" className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border/70 bg-card px-4 font-display text-xs font-bold text-foreground transition hover:border-primary hover:text-primary">
                Reopen
              </button>
            )}
          </form>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {conversation.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'admin' ? 'self-end flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 grid size-8 place-items-center rounded-full ${msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {msg.sender === 'admin' ? <ShieldCheck className="size-4" /> : <User className="size-4" />}
                </div>
                <div className={`flex flex-col gap-1 ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-muted-foreground font-display uppercase font-bold">
                    {msg.sender === 'admin' ? 'JerseyDor Support' : conversation.customerName} • {new Date(msg.createdAt).toLocaleString()}
                  </span>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${msg.sender === 'admin' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 rounded-tl-sm'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <section className="mt-4 rounded-xl border border-border/70 bg-card/40 overflow-hidden">
            <div className="border-b border-border/70 bg-card/70 px-4 py-3">
              <h2 className="font-heading text-base font-bold">Reply</h2>
            </div>
            <form action={sendReply} className="p-4">
              <textarea 
                name="content" 
                rows={5} 
                required
                placeholder="Type your reply here..." 
                className="w-full resize-none rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input name="markResolved" type="checkbox" className="size-4 rounded border-border/70 bg-background/70" />
                  Mark as resolved after sending
                </label>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 font-display text-xs font-bold text-primary-foreground transition hover:bg-primary/90">
                  <Send className="size-4" /> Send Reply
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden">
            <div className="border-b border-border/70 bg-card/70 px-4 py-3">
              <h2 className="font-heading text-lg font-bold">Customer Details</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-bold">{conversation.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <a href={`mailto:${conversation.customerEmail}`} className="text-sm text-primary hover:underline">{conversation.customerEmail}</a>
              </div>
              {conversation.orderId && (
                <div className="border-t border-border/50 pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Related Order</p>
                  <Link href={`/admin/orders/${conversation.orderId}`} className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 font-display text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">
                    View Order
                  </Link>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </AdminDashboardLayout>
  );
}
