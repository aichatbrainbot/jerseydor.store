import { ButtonLink, DetailTable, EmailShell, Heading, SectionTitle, Text } from '@/emails/components';
import type { TransactionalOrder } from '@/lib/email';

function formatPrice(value: number) {
  return `$${value.toFixed(2)} USD`;
}

export function OrderConfirmationEmail({ order }: { order: TransactionalOrder }) {
  return (
    <EmailShell preview={`Order ${order.orderNumber} confirmed`}>
      <Heading>Order confirmed</Heading>
      <Text>Thanks for your order. We received your JerseyDor purchase and will send updates as fulfillment progresses.</Text>
      <DetailTable
        rows={[
          { label: 'Order', value: order.orderNumber },
          { label: 'Subtotal', value: formatPrice(order.subtotal) },
          { label: 'Shipping', value: formatPrice(order.shippingTotal) },
          { label: 'Total', value: formatPrice(order.total) },
        ]}
      />
      <SectionTitle>Items</SectionTitle>
      {order.items.map((item) => (
        <Text key={`${item.slug}-${item.size}`}>
          {item.quantity} x {item.title}
          {item.size ? ` / Size ${item.size.toUpperCase()}` : ''}
        </Text>
      ))}
      {order.statusUrl && <ButtonLink href={order.statusUrl}>View order status</ButtonLink>}
    </EmailShell>
  );
}
