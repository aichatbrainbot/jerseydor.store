import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleOff, Mail, MessageSquare } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getAdminConversations } from '@/lib/admin-db';

export const metadata: Metadata = {
  title: 'Inbox | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function StatusPill({ status }: { status: string }) {
  const toneClass = {
    open: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-500',
    resolved: 'border-blue-400/25 bg-blue-400/10 text-blue-500',
    closed: 'border-border/70 bg-muted/35 text-muted-foreground',
  }[status] || 'border-border/70 bg-muted/35 text-muted-foreground';

  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 font-display text-[10px] uppercase ${toneClass}`}>
      {status}
    </span>
  );
}

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const storageMode = getAdminProductOverrideStorageMode();
  let conversations = await getAdminConversations();

  if (resolvedParams.status && resolvedParams.status !== 'all') {
    conversations = conversations.filter(c => c.status === resolvedParams.status);
  }

  conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const fieldClass = 'h-9 rounded-md border border-border/70 bg-background/70 px-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-4 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <MessageSquare className="size-4" />
              Support Center
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">Inbox</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage customer inquiries, order issues, and reply directly via email.
            </p>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 mb-3 rounded-lg border border-border/70 bg-background/95 p-3 shadow-md backdrop-blur-xl">
        <form className="flex gap-2">
          <select name="status" defaultValue={resolvedParams.status ?? 'all'} className={fieldClass}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 font-display text-xs font-bold text-primary-foreground">
            Filter
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden">
        {conversations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/70 font-display text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {conversations.map((conv) => (
                  <tr key={conv.id} className="transition hover:bg-muted/10">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold flex items-center gap-2">
                          {conv.customerName}
                          {conv.unread && (
                            <span className="inline-block size-2 rounded-full bg-primary" title="Unread"></span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{conv.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {conv.subject}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={conv.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        href={`/admin/inbox/${conv.id}`}
                        className="inline-flex h-7 items-center justify-center gap-1 rounded-full border border-primary/35 px-3 font-display text-[10px] font-bold uppercase text-primary transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <Mail className="size-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-[300px] place-items-center p-8 text-center">
            <div>
              <CircleOff className="mx-auto mb-3 size-10 opacity-20" />
              <h2 className="font-heading text-xl font-black">Inbox empty</h2>
              <p className="mt-2 text-sm text-muted-foreground">No conversations found.</p>
            </div>
          </div>
        )}
      </section>
    </AdminDashboardLayout>
  );
}
