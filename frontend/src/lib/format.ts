import type { OrderStatus, PaymentMethod } from '@/types';

export const formatETB = (value: number | null | undefined): string =>
  `${Number(value || 0).toLocaleString('en-US')} ETB`;

export const formatClock = (date: string | Date): string =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export const formatDateTime = (date: string | Date): string =>
  new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const elapsedMinutes = (date: string | Date, now = Date.now()): number =>
  Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000));

export const statusTranslationKey = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    pending: 'pending',
    approved: 'approved',
    preparing: 'preparing',
    ready: 'ready',
    served: 'served',
    out_for_delivery: 'outForDelivery',
    delivered: 'delivered',
    settled: 'settled',
    cancelled: 'cancelled',
  };
  return map[status] || status;
};

export const statusVariant = (
  status: OrderStatus
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
  switch (status) {
    case 'settled':
    case 'delivered':
    case 'ready':
      return 'success';
    case 'preparing':
    case 'approved':
      return 'warning';
    case 'out_for_delivery':
    case 'served':
      return 'info';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const paymentLabel = (method: PaymentMethod | 'split' | 'unpaid' | undefined): string => {
  switch (method) {
    case 'telebirr':
      return 'Telebirr';
    case 'cbe_transfer':
      return 'CBE Transfer';
    case 'awash_transfer':
      return 'Awash Transfer';
    case 'cash':
      return 'Cash';
    case 'split':
      return 'Split Bill';
    default:
      return 'Unpaid';
  }
};

export const deliverySteps: { key: OrderStatus; labelKey: string }[] = [
  { key: 'pending', labelKey: 'pending' },
  { key: 'preparing', labelKey: 'preparing' },
  { key: 'ready', labelKey: 'ready' },
  { key: 'out_for_delivery', labelKey: 'outForDelivery' },
  { key: 'delivered', labelKey: 'delivered' },
];

export const deliveryProgress = (status: OrderStatus): number => {
  switch (status) {
    case 'pending':
    case 'approved':
      return 0;
    case 'preparing':
      return 1;
    case 'ready':
    case 'served':
      return 2;
    case 'out_for_delivery':
      return 3;
    case 'delivered':
    case 'settled':
      return 4;
    default:
      return 0;
  }
};
