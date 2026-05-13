import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  CircleOff,
  Clock,
  DollarSign,
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getCatalogSource } from '@/lib/catalog-source';
import { getAdminOrders } from '@/lib/admin-db';

export const metadata: Metadata = {
  title: 'Dashboard | JerseyDor Admin',
  robots: {
    index: false,
    follow: false,
  },
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
    <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 font-display text-[10px] uppercase ${toneClass}`}>
      {status}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const storageMode = getAdminProductOverrideStorageMode();
  const catalogStats = getCatalogSource().getOperationalStats();
  const orders = await getAdminOrders();
  
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-6 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <LayoutDashboard className="size-4" />
              Operations Center
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Overview of your store performance, recent orders, and catalog status.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border/70 bg-card/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-display text-xs font-semibold uppercase text-muted-foreground">Total Revenue</p>
            <DollarSign className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-heading text-3xl font-black">${totalRevenue.toFixed(2)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
            <TrendingUp className="size-3" /> +12% from last month
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-display text-xs font-semibold uppercase text-muted-foreground">Total Orders</p>
            <ShoppingBag className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-heading text-3xl font-black">{totalOrders}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            Lifetime orders
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-display text-xs font-semibold uppercase text-muted-foreground">Pending Orders</p>
            <Clock className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-heading text-3xl font-black">{pendingOrders}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            Awaiting fulfillment
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-display text-xs font-semibold uppercase text-muted-foreground">Published Products</p>
            <Package className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-heading text-3xl font-black">{catalogStats.published}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            Out of {catalogStats.total} total products
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/70 bg-card/70 px-4 py-3">
            <h2 className="font-heading text-lg font-bold">Latest Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 font-display text-[10px] font-bold uppercase text-primary transition hover:underline">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/20 font-display text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-muted/10">
                      <td className="px-4 py-3 font-medium text-primary">
                        <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td className="px-4 py-3">{order.customerName}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-display font-bold">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <CircleOff className="mx-auto mb-2 size-8 opacity-20" />
              <p>No recent orders found.</p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden h-fit">
          <div className="border-b border-border/70 bg-card/70 px-4 py-3">
            <h2 className="font-heading text-lg font-bold">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                <Activity className="size-3" />
              </div>
              <div>
                <p className="text-sm font-medium">New order #1002 received</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                <Package className="size-3" />
              </div>
              <div>
                <p className="text-sm font-medium">Product catalog updated</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                <Activity className="size-3" />
              </div>
              <div>
                <p className="text-sm font-medium">New order #1001 received</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
