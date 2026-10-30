export type Role = 'admin' | 'manager' | 'waiter' | 'kitchen' | 'cashier' | 'driver';

export type Language = 'en' | 'am';

export interface BilingualText {
  en: string;
  am: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  phone?: string;
  username?: string;
  active?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: BilingualText;
  slug: string;
  icon: string;
  order?: number;
  items?: MenuItem[];
}

export interface MenuItem {
  _id: string;
  name: BilingualText;
  description: BilingualText;
  price: number;
  category: string | Category;
  imageUrl?: string;
  isAvailable: boolean;
  spiceLevel: 'None' | 'Mild' | 'Medium' | 'Spicy';
  isFasting: boolean;
  allergens?: string[];
  prepTimeMinutes?: number;
}

export interface OrderItem {
  menuItem?: string;
  name: BilingualText;
  price: number;
  qty: number;
  notes?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served';
}

export type PaymentMethod = 'telebirr' | 'cbe_transfer' | 'awash_transfer' | 'cash';

export interface SplitPayment {
  guestName: string;
  method: PaymentMethod;
  amount: number;
  referenceCode?: string;
  status: 'pending' | 'verified';
}

export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'out_for_delivery'
  | 'delivered'
  | 'settled'
  | 'cancelled';

export interface Order {
  _id: string;
  orderNumber: number;
  type: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: number | null;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  payment: {
    method: PaymentMethod | 'split' | 'unpaid';
    referenceCode?: string;
    screenshotUrl?: string;
    status: 'pending' | 'verified' | 'refunded';
    splits?: SplitPayment[];
    verifiedAt?: string;
  };
  driverLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  timeline?: {
    createdAt?: string;
    approvedAt?: string;
    preparingAt?: string;
    readyAt?: string;
    servedAt?: string;
    deliveredAt?: string;
    settledAt?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Table {
  _id: string;
  tableNumber: number;
  zone: 'Indoor' | 'Terrace' | 'VIP' | 'Balcony';
  capacity: number;
  status: 'available' | 'occupied' | 'call_waiter' | 'bill_requested';
  lastCallAt?: string | null;
  lastBillRequestAt?: string | null;
  orders?: Order[];
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface RestaurantSetting {
  _id?: string;
  name: BilingualText;
  intro: BilingualText;
  wifiName: string;
  wifiPass: string;
  banks: BankAccount[];
  telebirrMerchantCode: string;
  telebirrMerchantName: string;
  tablesCount: number;
  directKitchenRouting: boolean;
}

export interface CartLine {
  item: MenuItem;
  qty: number;
  notes: string;
}

export interface DishForm {
  nameEn: string;
  nameAm: string;
  descEn: string;
  descAm: string;
  price: string;
  categoryId: string;
  spiceLevel: MenuItem['spiceLevel'];
  isFasting: boolean;
  imageUrl: string;
  prepTimeMinutes: string;
  isAvailable: boolean;
}
