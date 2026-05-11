import { AdminNewOrderEmail } from '@/emails/AdminNewOrderEmail';
import { ContactFormEmail } from '@/emails/ContactFormEmail';
import { OrderConfirmationEmail } from '@/emails/OrderConfirmationEmail';
import { ShippingUpdateEmail } from '@/emails/ShippingUpdateEmail';
import { getEmailConfig } from '@/lib/email-config';
import { getEmailProvider } from '@/lib/email-provider';

export type TransactionalOrderItem = {
  slug: string;
  title: string;
  quantity: number;
  price: number;
  size?: string;
  customName?: string;
  customNumber?: string;
};

export type TransactionalOrder = {
  orderNumber: string;
  customerEmail: string;
  items: TransactionalOrderItem[];
  subtotal: number;
  shippingTotal: number;
  total: number;
  statusUrl?: string;
};

export type ContactEmailInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ShippingUpdateEmailInput = {
  orderNumber: string;
  customerEmail: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

function getSupportEmail() {
  return getEmailConfig().supportEmail;
}

export async function sendOrderConfirmationEmail(order: TransactionalOrder) {
  return getEmailProvider().send({
    to: order.customerEmail,
    subject: `JerseyDor order ${order.orderNumber} confirmed`,
    react: <OrderConfirmationEmail order={order} />,
  });
}

export async function sendAdminNewOrderNotification(order: TransactionalOrder) {
  const supportEmail = getSupportEmail();

  if (!supportEmail) {
    return {
      ok: true,
      provider: 'disabled' as const,
      skipped: true,
    };
  }

  return getEmailProvider().send({
    to: supportEmail,
    subject: `New JerseyDor order ${order.orderNumber}`,
    react: <AdminNewOrderEmail order={order} />,
  });
}

export async function sendContactFormEmail(message: ContactEmailInput) {
  const supportEmail = getSupportEmail();

  if (!supportEmail) {
    return {
      ok: true,
      provider: 'disabled' as const,
      skipped: true,
    };
  }

  return getEmailProvider().send({
    to: supportEmail,
    subject: `JerseyDor contact: ${message.subject}`,
    replyTo: message.email,
    react: <ContactFormEmail message={message} />,
  });
}

export async function sendShippingUpdateEmail(update: ShippingUpdateEmailInput) {
  return getEmailProvider().send({
    to: update.customerEmail,
    subject: `Shipping update for JerseyDor order ${update.orderNumber}`,
    react: <ShippingUpdateEmail update={update} />,
  });
}
