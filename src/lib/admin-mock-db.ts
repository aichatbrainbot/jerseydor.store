import fs from 'node:fs';
import path from 'node:path';

export type MockOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  currency: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  trackingNumber?: string;
  createdAt: string;
};

export type MockConversation = {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'open' | 'resolved' | 'closed';
  messages: Array<{ id: string; sender: 'customer' | 'admin'; content: string; createdAt: string }>;
  unread: boolean;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), 'DATA');
const ORDERS_PATH = path.join(DATA_DIR, 'admin-orders.json');
const INBOX_PATH = path.join(DATA_DIR, 'admin-inbox.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ORDERS_PATH)) {
    const initialOrders: MockOrder[] = [
      {
        id: 'ord_1',
        orderNumber: '#1001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        status: 'pending',
        totalAmount: 129.99,
        currency: 'USD',
        items: [{ title: 'Retro Jersey 1998', quantity: 1, price: 129.99 }],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ord_2',
        orderNumber: '#1002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        status: 'shipped',
        totalAmount: 89.99,
        currency: 'USD',
        items: [{ title: 'Modern Away Kit', quantity: 1, price: 89.99 }],
        trackingNumber: 'TRK123456789',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(initialOrders, null, 2));
  }

  if (!fs.existsSync(INBOX_PATH)) {
    const initialConversations: MockConversation[] = [
      {
        id: 'conv_1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        subject: 'Where is my order?',
        status: 'open',
        unread: true,
        orderId: 'ord_1',
        messages: [
          {
            id: 'msg_1',
            sender: 'customer',
            content: 'Hi, I ordered yesterday and was wondering when it will ship.',
            createdAt: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    fs.writeFileSync(INBOX_PATH, JSON.stringify(initialConversations, null, 2));
  }
}

export function getMockOrders(): MockOrder[] {
  ensureDataFiles();
  try {
    return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

export function getMockOrder(id: string): MockOrder | undefined {
  return getMockOrders().find(o => o.id === id);
}

export function updateMockOrder(id: string, updates: Partial<MockOrder>) {
  const orders = getMockOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
    return orders[index];
  }
  return undefined;
}

export function getMockConversations(): MockConversation[] {
  ensureDataFiles();
  try {
    return JSON.parse(fs.readFileSync(INBOX_PATH, 'utf8'));
  } catch {
    return [];
  }
}

export function getMockConversation(id: string): MockConversation | undefined {
  return getMockConversations().find(c => c.id === id);
}

export function updateMockConversation(id: string, updates: Partial<MockConversation>) {
  const convos = getMockConversations();
  const index = convos.findIndex(c => c.id === id);
  if (index !== -1) {
    convos[index] = { ...convos[index], ...updates, updatedAt: new Date().toISOString() };
    fs.writeFileSync(INBOX_PATH, JSON.stringify(convos, null, 2));
    return convos[index];
  }
  return undefined;
}
