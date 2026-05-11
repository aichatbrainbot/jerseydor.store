import { DetailTable, EmailShell, Heading, Text } from '@/emails/components';
import type { ContactEmailInput } from '@/lib/email';

export function ContactFormEmail({ message }: { message: ContactEmailInput }) {
  return (
    <EmailShell preview={`New contact message from ${message.email}`}>
      <Heading>New contact message</Heading>
      <DetailTable
        rows={[
          { label: 'Name', value: message.name },
          { label: 'Email', value: message.email },
          { label: 'Subject', value: message.subject },
        ]}
      />
      <Text>{message.message}</Text>
    </EmailShell>
  );
}
