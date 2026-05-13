import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export type AdminAbandonedCheckoutView = {
  id: string;
  customerEmail: string;
  customerName?: string;
  totalAmount: number;
  currency: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  recoveryUrl: string;
  completed: boolean;
  manualReminderSent: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getAbandonedCheckouts(): Promise<AdminAbandonedCheckoutView[]> {
  const checkouts = await prisma.abandonedCheckout.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return checkouts.map(c => ({
    id: c.id,
    customerEmail: c.customerEmail,
    customerName: c.customerName || undefined,
    totalAmount: Number(c.totalAmount),
    currency: c.currency,
    items: c.items as any,
    recoveryUrl: c.recoveryUrl,
    completed: c.completed,
    manualReminderSent: c.manualReminderSent,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function markAbandonedCheckoutReminderSent(id: string) {
  await prisma.abandonedCheckout.update({
    where: { id },
    data: { manualReminderSent: true }
  });
}

export type AdminOrderView = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  trackingNumber?: string;
  trackingUrl?: string;
  shopifyOrderId?: string;
  shippingAddress?: any;
  confirmationEmailSent: boolean;
  shippingUpdateEmailSent: boolean;
  createdAt: string;
};

export type AdminConversationView = {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: string;
  messages: Array<{ id: string; sender: 'customer' | 'admin'; content: string; createdAt: string }>;
  unread: boolean;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminOrders(): Promise<AdminOrderView[]> {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : 'Guest',
    customerEmail: order.customer?.email || 'unknown@example.com',
    status: order.status,
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    items: (order.items as any) || [],
    trackingNumber: order.trackingNumber || undefined,
    trackingUrl: order.trackingUrl || undefined,
    shopifyOrderId: order.shopifyOrderId || undefined,
    shippingAddress: order.shippingAddress,
    confirmationEmailSent: order.confirmationEmailSent,
    shippingUpdateEmailSent: order.shippingUpdateEmailSent,
    createdAt: order.createdAt.toISOString(),
  }));
}

export async function getAdminOrder(id: string): Promise<AdminOrderView | undefined> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });

  if (!order) return undefined;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : 'Guest',
    customerEmail: order.customer?.email || 'unknown@example.com',
    status: order.status,
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    items: (order.items as any) || [],
    trackingNumber: order.trackingNumber || undefined,
    trackingUrl: order.trackingUrl || undefined,
    shopifyOrderId: order.shopifyOrderId || undefined,
    shippingAddress: order.shippingAddress,
    confirmationEmailSent: order.confirmationEmailSent,
    shippingUpdateEmailSent: order.shippingUpdateEmailSent,
    createdAt: order.createdAt.toISOString(),
  };
}

export async function updateAdminOrder(id: string, updates: { status?: any; trackingNumber?: string }) {
  await prisma.order.update({
    where: { id },
    data: {
      status: updates.status,
      trackingNumber: updates.trackingNumber,
    },
  });
}

export async function getAdminConversations(): Promise<AdminConversationView[]> {
  const convos = await prisma.supportConversation.findMany({
    include: {
      customer: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return convos.map(conv => ({
    id: conv.id,
    customerName: conv.customer ? `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() : 'Guest',
    customerEmail: conv.customer?.email || 'unknown@example.com',
    subject: conv.subject,
    status: conv.status,
    unread: conv.messages.some(m => m.sender === 'customer' && !m.read),
    orderId: conv.orderId || undefined,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    messages: conv.messages.map(m => ({
      id: m.id,
      sender: m.sender as 'customer' | 'admin',
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  }));
}

export async function getAdminConversation(id: string): Promise<AdminConversationView | undefined> {
  const conv = await prisma.supportConversation.findUnique({
    where: { id },
    include: {
      customer: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conv) return undefined;

  return {
    id: conv.id,
    customerName: conv.customer ? `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() : 'Guest',
    customerEmail: conv.customer?.email || 'unknown@example.com',
    subject: conv.subject,
    status: conv.status,
    unread: conv.messages.some(m => m.sender === 'customer' && !m.read),
    orderId: conv.orderId || undefined,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    messages: conv.messages.map(m => ({
      id: m.id,
      sender: m.sender as 'customer' | 'admin',
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function updateAdminConversationStatus(id: string, status: any) {
  await prisma.supportConversation.update({
    where: { id },
    data: { status },
  });
}

export async function markConversationRead(id: string) {
  await prisma.supportMessage.updateMany({
    where: {
      conversationId: id,
      sender: 'customer',
      read: false,
    },
    data: { read: true },
  });
}

export async function addConversationReply(conversationId: string, content: string, status?: any) {
  await prisma.supportMessage.create({
    data: {
      conversationId,
      sender: 'admin',
      content,
    },
  });

  if (status) {
    await prisma.supportConversation.update({
      where: { id: conversationId },
      data: { status },
    });
  } else {
    // Touch updatedAt
    await prisma.supportConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }
}
