import { ButtonLink, DetailTable, EmailShell, Heading, Text } from '@/emails/components';
import type { ShippingUpdateEmailInput } from '@/lib/email';

export function ShippingUpdateEmail({ update }: { update: ShippingUpdateEmailInput }) {
  return (
    <EmailShell preview={`Shipping update for ${update.orderNumber}`}>
      <Heading>Shipping update</Heading>
      <Text>Your JerseyDor order has a shipping update.</Text>
      <DetailTable
        rows={[
          { label: 'Order', value: update.orderNumber },
          { label: 'Status', value: update.status },
          { label: 'Carrier', value: update.carrier ?? 'Pending' },
          { label: 'Tracking', value: update.trackingNumber ?? 'Pending' },
        ]}
      />
      {update.trackingUrl && <ButtonLink href={update.trackingUrl}>Track shipment</ButtonLink>}
    </EmailShell>
  );
}
