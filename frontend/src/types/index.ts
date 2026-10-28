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
}

export interface Category {
  _id: string;
  name: BilingualText;
  slug: string;
  icon: string;
  order: number;
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

export interface SplitPayment {
  guestName: string;
  method: 'telebirr' | 'cbe_transfer' | 'awash_transfer' | 'cash';
  amount: number;
  referenceCode?: string;
  status: 'pending' | 'verified';
}

export interface Order {
  _id: string;
  orderNumber: number;
  type: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: number;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status:
    | 'pending'
    | 'approved'
    | 'preparing'
    | 'ready'
    | 'served'
    | 'out_for_delivery'
    | 'delivered'
    | 'settled'
    | 'cancelled';
  payment: {
    method: 'telebirr' | 'cbe_transfer' | 'awash_transfer' | 'cash' | 'split' | 'unpaid';
    referenceCode?: string;
    screenshotUrl?: string;
    status: 'pending' | 'verified' | 'refunded';
    splits?: SplitPayment[];
  };
  driverLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  createdAt: string;
}

export interface Table {
  _id: string;
  tableNumber: number;
  zone: 'Indoor' | 'Terrace' | 'VIP' | 'Balcony';
  capacity: number;
  status: 'available' | 'occupied' | 'call_waiter' | 'bill_requested';
  lastCallAt?: string;
  lastBillRequestAt?: string;
  orders?: Order[];
}

export interface RestaurantSetting {
  name: BilingualText;
  intro: BilingualText;
  wifiName: string;
  wifiPass: string;
  banks: Array<{
    bankName: string;
    accountName: string;
    accountNumber: string;
  }>;
  telebirrMerchantCode: string;
  telebirrMerchantName: string;
  tablesCount: number;
  directKitchenRouting: boolean;
}
