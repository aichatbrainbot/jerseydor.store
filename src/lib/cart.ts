export const CART_STORAGE_KEY = 'jerseydor-cart';
export const LEGACY_CART_STORAGE_KEY = 'jersey-rail-cart';
export const CART_UPDATED_EVENT = 'jerseydor-cart-updated';
export const LEGACY_CART_UPDATED_EVENT = 'jersey-rail-cart-updated';

export type CartProduct = {
  slug: string;
  title: string;
  price: number;
  image: string;
  isCustomizable: boolean;
};

export type CartSelectedOptions = {
  size?: string;
};

export type CartCustomAttributes = {
  name?: string;
  number?: string;
};

export type CartItem = CartProduct & {
  id: string;
  quantity: number;
  variantKey: string;
  selectedOptions: CartSelectedOptions;
  customAttributes: CartCustomAttributes;
  size: string;
  customName?: string;
  customNumber?: string;
};

export type AddCartItemInput = {
  product: CartProduct;
  quantity?: number;
  size: string;
  customName?: string;
  customNumber?: string;
};

function hasWindow() {
  return typeof window !== 'undefined';
}

function normalizeSize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCustomText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized.toUpperCase() : undefined;
}

function normalizeQuantity(value: number | undefined) {
  return Number.isInteger(value) && value && value > 0 ? value : 1;
}

export function getCartItemId({
  product,
  size,
  customName,
  customNumber,
}: Pick<AddCartItemInput, 'product' | 'size' | 'customName' | 'customNumber'>) {
  return [product.slug, normalizeSize(size), normalizeCustomText(customName), customNumber?.trim()]
    .filter(Boolean)
    .join(':');
}

export function createCartItem(input: AddCartItemInput): CartItem {
  const size = normalizeSize(input.size);
  const customName = normalizeCustomText(input.customName);
  const customNumber = input.customNumber?.trim() || undefined;

  return {
    ...input.product,
    id: getCartItemId({
      product: input.product,
      size,
      customName,
      customNumber,
    }),
    quantity: normalizeQuantity(input.quantity),
    variantKey: `size:${size}`,
    selectedOptions: {
      size,
    },
    customAttributes: {
      name: customName,
      number: customNumber,
    },
    size,
    customName,
    customNumber,
  };
}

export function normalizeCartItem(item: CartItem): CartItem {
  const size = normalizeSize(item.selectedOptions?.size ?? item.size ?? '');
  const customName = normalizeCustomText(item.customAttributes?.name ?? item.customName);
  const customNumber = item.customAttributes?.number ?? item.customNumber;

  return {
    ...item,
    quantity: normalizeQuantity(item.quantity),
    variantKey: item.variantKey || `size:${size}`,
    selectedOptions: {
      ...item.selectedOptions,
      size,
    },
    customAttributes: {
      ...item.customAttributes,
      name: customName,
      number: customNumber,
    },
    size,
    customName,
    customNumber,
  };
}

export function upsertCartItem(items: CartItem[], nextItem: CartItem) {
  const existingItem = items.find((item) => item.id === nextItem.id);

  if (!existingItem) {
    return [...items, nextItem];
  }

  return items.map((item) =>
    item.id === nextItem.id
      ? {
          ...normalizeCartItem(item),
          quantity: item.quantity + nextItem.quantity,
        }
      : normalizeCartItem(item)
  );
}

export function updateCartItemQuantity(items: CartItem[], id: string, quantity: number) {
  if (quantity < 1) {
    return removeCartItem(items, id);
  }

  return items.map((item) => (item.id === id ? { ...normalizeCartItem(item), quantity } : normalizeCartItem(item)));
}

export function removeCartItem(items: CartItem[], id: string) {
  return items.filter((item) => item.id !== id).map(normalizeCartItem);
}

export function calculateCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function readStoredCartItems() {
  if (!hasWindow()) return [];

  const raw =
    window.localStorage.getItem(CART_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_CART_STORAGE_KEY) ??
    '[]';

  try {
    return (JSON.parse(raw) as CartItem[]).map(normalizeCartItem);
  } catch {
    return [];
  }
}

export function saveStoredCartItems(items: CartItem[]) {
  if (!hasWindow()) return;

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.map(normalizeCartItem)));
  window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  window.dispatchEvent(new Event(LEGACY_CART_UPDATED_EVENT));
}

export function subscribeToCart(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(CART_UPDATED_EVENT, callback);
  window.addEventListener(LEGACY_CART_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CART_UPDATED_EVENT, callback);
    window.removeEventListener(LEGACY_CART_UPDATED_EVENT, callback);
  };
}

export function getCartItemCount(items: Pick<CartItem, 'quantity'>[]) {
  return items.reduce((total, item) => total + normalizeQuantity(item.quantity), 0);
}
