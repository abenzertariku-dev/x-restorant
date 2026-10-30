'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  BellRing,
  ClipboardCheck,
  ReceiptText,
  Utensils,
  Settings as SettingsIcon,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User as UserIcon,
  MapPin,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { FloorBoard } from '@/components/manager/FloorBoard';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { MenuCatalogTab } from '@/components/admin/MenuCatalogTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { AddDishModal } from '@/components/admin/AddDishModal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, playSoundAlert } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { formatETB, formatClock, elapsedMinutes } from '@/lib/format';
import type {
  Category,
  DishForm,
  MenuItem,
  Order,
  OrderStatus,
  RestaurantSetting,
  Table,
} from '@/types';

type ManagerTab = 'floor' | 'approvals' | 'orders' | 'menu' | 'settings';
type CategoryWithItems = Category & { items: MenuItem[] };

const emptyDish: DishForm = {
  nameEn: '',
  nameAm: '',
  descEn: '',
  descAm: '',
  price: '',
  categoryId: '',
  spiceLevel: 'None',
  isFasting: false,
  imageUrl: '',
  prepTimeMinutes: '15',
  isAvailable: true,
};

function categoryIdOf(item: MenuItem): string {
  return typeof item.category === 'string' ? item.category : item.category?._id || '';
}

export default function ManagerPage() {
  return (
    <AuthGuard roles={['manager', 'admin']}>
      <ManagerDashboard />
    </AuthGuard>
  );
}

function ManagerDashboard() {
  const [tab, setTab] = useState<ManagerTab>('floor');
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const [selectedCatId, setSelectedCatId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemModal, setItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<DishForm>(emptyDish);
  const [savingItem, setSavingItem] = useState(false);

  const loadTables = useCallback(async () => {
    const res = await api<{ success: boolean; tables: Table[] }>('/tables');
    if (res.success) setTables(res.tables);
  }, []);

  const loadOrders = useCallback(async () => {
    const res = await api<{ success: boolean; orders: Order[] }>('/orders?limit=100');
    if (res.success) setOrders(res.orders);
  }, []);

  const loadMenu = useCallback(async () => {
    const res = await api<{ success: boolean; categories: CategoryWithItems[] }>('/menu');
    if (res.success) setCategories(res.categories);
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await api<{ success: boolean; setting: RestaurantSetting }>('/settings');
    if (res.success) setSettings(res.setting);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadTables(), loadOrders()]);
  }, [loadTables, loadOrders]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadTables(), loadOrders(), loadMenu(), loadSettings()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load floor data.');
    } finally {
      setLoading(false);
    }
  }, [loadTables, loadOrders, loadMenu, loadSettings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const socket = getSocket();
    joinRoom('waiter');
    joinRoom('admin');
    joinRoom('cashier');

    const onOrders = () => {
      loadOrders();
      loadTables();
    };
    const onAlert = () => {
      playSoundAlert('chime');
      loadTables();
    };

    const orderEvents = [
      'order:pending_approval',
      'order:created',
      'order:settled',
      'order:updated',
    ];
    orderEvents.forEach((event) => socket.on(event, onOrders));
    socket.on('table:status', onOrders);
    socket.on('alert:call_waiter', onAlert);
    socket.on('alert:bill_requested', onAlert);
    socket.on('menu:updated', loadMenu);

    return () => {
      orderEvents.forEach((event) => socket.off(event, onOrders));
      socket.off('table:status', onOrders);
      socket.off('alert:call_waiter', onAlert);
      socket.off('alert:bill_requested', onAlert);
      socket.off('menu:updated', loadMenu);
    };
  }, [loadOrders, loadTables, loadMenu]);

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'pending'),
    [orders]
  );
  const alerts = useMemo(
    () => tables.filter((table) => table.status === 'call_waiter' || table.status === 'bill_requested'),
    [tables]
  );

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await api(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
    await refresh();
  };

  const clearTable = async (tableNumber: number) => {
    await api(`/tables/${tableNumber}/clear`, { method: 'POST' });
    await refresh();
  };

  const action = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusyId('');
    }
  };

  const openAdd = (categoryId = '') => {
    setEditingItem(null);
    setItemForm({ ...emptyDish, categoryId: categoryId || categories[0]?._id || '' });
    setItemModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      nameEn: item.name.en,
      nameAm: item.name.am,
      descEn: item.description?.en || '',
      descAm: item.description?.am || '',
      price: String(item.price),
      categoryId: categoryIdOf(item),
      spiceLevel: item.spiceLevel || 'None',
      isFasting: !!item.isFasting,
      imageUrl: item.imageUrl || '',
      prepTimeMinutes: String(item.prepTimeMinutes || 15),
      isAvailable: item.isAvailable !== false,
    });
    setItemModal(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    setError('');
    try {
      const body = {
        name: { en: itemForm.nameEn.trim(), am: itemForm.nameAm.trim() },
        description: { en: itemForm.descEn.trim(), am: itemForm.descAm.trim() },
        price: Number(itemForm.price) || 0,
        category: itemForm.categoryId || categories[0]?._id,
        spiceLevel: itemForm.spiceLevel,
        isFasting: itemForm.isFasting,
        isAvailable: itemForm.isAvailable,
        imageUrl: itemForm.imageUrl.trim(),
        prepTimeMinutes: Number(itemForm.prepTimeMinutes) || 15,
      };
      if (editingItem) {
        await api(`/menu/items/${editingItem._id}`, { method: 'PUT', body });
      } else {
        await api('/menu/items', { method: 'POST', body });
      }
      setItemModal(false);
      setEditingItem(null);
      setItemForm(emptyDish);
      await loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dish.');
    } finally {
      setSavingItem(false);
    }
  };

  const toggleStock = async (itemId: string) => {
    await api(`/menu/items/${itemId}/toggle`, { method: 'PATCH' });
    await loadMenu();
  };

  const saveSettings = async (payload: Partial<RestaurantSetting>) => {
    await api('/settings', { method: 'PUT', body: payload });
    await loadSettings();
  };

  const navItems: { key: ManagerTab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { key: 'floor', label: 'Floor Plan', icon: LayoutDashboard },
    { key: 'approvals', label: 'Approvals', icon: ClipboardCheck, badge: pendingOrders.length },
    { key: 'orders', label: 'Orders & Bills', icon: ReceiptText },
    { key: 'menu', label: 'Menu Availability', icon: Utensils },
    { key: 'settings', label: 'Service Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <PortalHeader
          title="Manager Floor Control"
          subtitle={`${tables.length} tables · ${pendingOrders.length} orders awaiting approval`}
          icon={LayoutDashboard}
          roleLabel="Manager"
          showLanguage
        >
          {alerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <BellRing className="mr-1 h-3.5 w-3.5" /> {alerts.length} guest alert
              {alerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </PortalHeader>

        <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                tab === item.key
                  ? 'bg-[#F59E0B] text-[#0F1015] shadow-md shadow-amber-500/20'
                  : 'border border-white/5 bg-[#14151D] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {!!item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    tab === item.key ? 'bg-[#0F1015] text-[#F59E0B]' : 'bg-[#F59E0B] text-[#0F1015]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="cursor-pointer text-rose-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 text-[#94A3B8]">
            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading floor state…</p>
          </div>
        ) : (
          <>
            {tab === 'floor' && (
              <div className="space-y-5">
                {alerts.length > 0 && (
                  <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/[0.05] p-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#F59E0B]">
                      <BellRing className="h-4 w-4 animate-pulse" /> Live guest alerts
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {alerts.map((table) => (
                        <span
                          key={table._id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#14151D] px-2.5 py-1.5 text-[11px] font-bold text-[#CBD5E1]"
                        >
                          <MapPin className="h-3 w-3 text-[#F59E0B]" />
                          Table {table.tableNumber}
                          <span className="text-[#64748B]">
                            {table.status === 'call_waiter' ? 'called waiter' : 'wants bill'}
                          </span>
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                <FloorBoard
                  tables={tables}
                  onClearTable={clearTable}
                  onUpdateOrderStatus={updateOrderStatus}
                />
              </div>
            )}

            {tab === 'approvals' && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-[#F8FAFC]">Awaiting Approval</h3>
                      <p className="text-xs text-[#94A3B8]">
                        QR orders held until a manager releases them to the kitchen.
                      </p>
                    </div>
                    <Badge variant="warning">{pendingOrders.length}</Badge>
                  </div>

                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div
                        key={order._id}
                        className="rounded-2xl border border-white/5 bg-[#14151D] p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-mono text-sm font-black text-[#F59E0B]">
                              #{order.orderNumber}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-[#64748B]">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {elapsedMinutes(order.createdAt)} min ago
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <UserIcon className="h-3 w-3" />
                                {order.customer?.name || 'Walk-in guest'}
                              </span>
                              <span className="capitalize">{order.type.replace('_', ' ')}</span>
                              {order.tableNumber && <span>Table {order.tableNumber}</span>}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-black text-[#F8FAFC]">
                            {formatETB(order.totalAmount)}
                          </span>
                        </div>

                        <div className="mt-2.5 space-y-1 border-t border-white/5 pt-2.5 text-[11px]">
                          {order.items.map((item, i) => (
                            <div key={`${item.menuItem}-${i}`} className="flex justify-between text-[#94A3B8]">
                              <span>
                                {item.qty}× {item.name.en}
                                {item.notes ? ` · ${item.notes}` : ''}
                              </span>
                              <span className="font-mono">{formatETB(item.qty * item.price)}</span>
                            </div>
                          ))}
                          {order.customer?.notes && (
                            <p className="rounded-lg bg-[#F59E0B]/10 px-2 py-1 text-[#F59E0B]">
                              Note: {order.customer.notes}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={busyId === order._id}
                            onClick={() =>
                              action(order._id, () =>
                                updateOrderStatus(order._id, 'approved')
                              )
                            }
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve to Kitchen
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === order._id}
                            onClick={() => {
                              if (!window.confirm(`Reject order #${order.orderNumber}?`)) return;
                              action(order._id, () =>
                                updateOrderStatus(order._id, 'cancelled')
                              );
                            }}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingOrders.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 py-12 text-center">
                        <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-400" />
                        <p className="text-xs font-bold text-emerald-400">
                          All QR orders are approved. Queue is clear.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-[#F8FAFC]">Guest Requests</h3>
                      <p className="text-xs text-[#94A3B8]">
                        Tables calling a waiter or requesting the bill.
                      </p>
                    </div>
                    <Badge variant="destructive">{alerts.length}</Badge>
                  </div>
                  <div className="space-y-2.5">
                    {alerts.map((table) => (
                      <div
                        key={table._id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#14151D] p-3.5"
                      >
                        <div>
                          <p className="text-sm font-extrabold text-[#F8FAFC]">
                            Table {table.tableNumber}
                          </p>
                          <p className="text-[10px] text-[#94A3B8]">
                            {table.zone} · {table.capacity} seats ·{' '}
                            {table.status === 'call_waiter' ? 'Waiter requested' : 'Bill requested'}{' '}
                            {table.status === 'call_waiter' && table.lastCallAt
                              ? `at ${formatClock(table.lastCallAt)}`
                              : table.lastBillRequestAt
                                ? `at ${formatClock(table.lastBillRequestAt)}`
                                : ''}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === `clear-${table.tableNumber}`}
                          onClick={() =>
                            action(`clear-${table.tableNumber}`, () =>
                              clearTable(table.tableNumber)
                            )
                          }
                        >
                          Clear
                        </Button>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <p className="rounded-xl border border-dashed border-white/10 py-10 text-center text-xs text-[#94A3B8]">
                        No live guest requests right now.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {tab === 'orders' && (
              <OrdersTab
                orders={orders}
                onVoid={(id) => action(id, () => updateOrderStatus(id, 'cancelled'))}
              />
            )}

            {tab === 'menu' && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button onClick={() => openAdd()}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add Dish
                  </Button>
                </div>
                <MenuCatalogTab
                  categories={categories}
                  selectedCatId={selectedCatId}
                  setSelectedCatId={setSelectedCatId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onToggleStock={(id) => action(id, () => toggleStock(id))}
                  onEdit={openEdit}
                  onOpenAddModalForCategory={(catId) => openAdd(catId)}
                />
              </div>
            )}

            {tab === 'settings' && <SettingsTab settings={settings} onSave={saveSettings} />}
          </>
        )}
      </div>

      <AddDishModal
        open={itemModal}
        onOpenChange={(open) => {
          setItemModal(open);
          if (!open) setEditingItem(null);
        }}
        categories={categories}
        itemForm={itemForm}
        setItemForm={setItemForm}
        onSubmit={saveItem}
        editing={!!editingItem}
        busy={savingItem}
      />
    </div>
  );
}
