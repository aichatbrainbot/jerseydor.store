import { DetailTable, EmailShell, Heading, SectionTitle, Text } from '@/emails/components';
import type { TransactionalOrder } from '@/lib/email';

function formatPrice(value: number) {
  return `$${value.toFixed(2)} USD`;
}

export function AdminNewOrderEmail({ order }: { order: TransactionalOrder }) {
  return (
    <EmailShell preview={`New order ${order.orderNumber}`}>
      <Heading>New order received</Heading>
      <Text>A new JerseyDor order needs review in the order system.</Text>
      <DetailTable
        rows={[
          { label: 'Order', value: order.orderNumber },
          { label: 'Customer', value: order.customerEmail },
          { label: 'Total', value: formatPrice(order.total) },
        ]}
      />
      <SectionTitle>Items</SectionTitle>
      {order.items.map((item) => (
        <Text key={`${item.slug}-${item.size}`}>
          {item.quantity} x {item.title}
          {item.size ? ` / Size ${item.size.toUpperCase()}` : ''}
          {item.customName ? ` / Name ${item.customName}` : ''}
          {item.customNumber ? ` / Number ${item.customNumber}` : ''}
        </Text>
      ))}
    </EmailShell>
  );
}
