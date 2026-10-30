'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { formatETB } from '@/lib/format';
import type { Category, MenuItem, Order, RestaurantSetting, Table } from '@/types';
import {
  Bell,
  Receipt,
  Wifi,
  Utensils,
  UtensilsCrossed,
  Globe,
  Search,
  Radio,
  ClipboardList,
  Gamepad2,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableMenuCard } from '@/components/table/TableMenuCard';
import { TableWifiView } from '@/components/table/TableWifiView';
import { TableOrdersList } from '@/components/table/TableOrdersList';
import { TableBottomCart } from '@/components/table/TableBottomCart';
import { TableSendModal, type TableOrderLine } from '@/components/table/TableSendModal';
import { TableGameView } from '@/components/table/TableGameView';

type View = 'menu' | 'orders' | 'wifi' | 'games';

export default function TableQRPage() {
  const params = useParams();
  const tableNumber = String(params.tableId);

  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [cartLoaded, setCartLoaded] = useState(false);
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);

  const [activeView, setActiveView] = useState<View>('menu');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  const { language, toggleLanguage, getText, t } = useLanguage();

  const cartKey = `xr_table_cart_${tableNumber}`;

  const loadTable = useCallback(async () => {
    try {
      const res = await api<{ success: boolean; table: Table; activeOrders: Order[] }>(
        `/tables/${tableNumber}`
      );
      if (res.success) {
        setTable(res.table);
        setActiveOrders(res.activeOrders || []);
        setNotFound(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (/not found/i.test(message)) setNotFound(true);
    }
  }, [tableNumber]);

  const loadMenu = useCallback(async () => {
    const res = await api<{ success: boolean; categories: Array<Category & { items?: MenuItem[] }> }>(
      '/menu'
    );
    if (res.success) {
      const flat: MenuItem[] = [];
      const cats: Category[] = [];
      res.categories.forEach((category) => {
        cats.push({
          _id: category._id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          order: category.order,
        });
        if (category.items) flat.push(...category.items);
      });
      setCategories(cats);
      setItems(flat);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await api<{ success: boolean; setting: RestaurantSetting }>('/settings');
    if (res.success) setSettings(res.setting);
  }, []);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([loadTable(), loadMenu(), loadSettings()])
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadTable, loadMenu, loadSettings]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(cartKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCart(JSON.parse(raw) as { [id: string]: number });
    } catch {
      window.localStorage.removeItem(cartKey);
    } finally {
      setCartLoaded(true);
    }
  }, [cartKey]);

  useEffect(() => {
    if (cartLoaded) window.localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey, cartLoaded]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadTable();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [loadTable]);

  useEffect(() => {
    const socket = getSocket();
    const leaveTable = joinRoom(`table:${tableNumber}`);

    const onTableStatus = (payload: { tableNumber: number; status: Table['status'] }) => {
      if (String(payload.tableNumber) === tableNumber) {
        setTable((prev) => (prev ? { ...prev, status: payload.status } : prev));
      }
    };
    const onMenuUpdated = (payload: { itemId: string; isAvailable: boolean }) => {
      setItems((prev) =>
        prev.map((item) =>
          item._id === payload.itemId ? { ...item, isAvailable: payload.isAvailable } : item
        )
      );
    };

    socket.on('table:status', onTableStatus);
    socket.on('menu:updated', onMenuUpdated);
    socket.on('order:pending_approval', loadTable);
    socket.on('order:created', loadTable);
    socket.on('order:settled', loadTable);

    return () => {
      socket.off('table:status', onTableStatus);
      socket.off('menu:updated', onMenuUpdated);
      socket.off('order:pending_approval', loadTable);
      socket.off('order:created', loadTable);
      socket.off('order:settled', loadTable);
      leaveTable();
    };
  }, [tableNumber, loadTable]);

  const orderIds = useMemo(() => activeOrders.map((order) => order._id).join(','), [activeOrders]);

  useEffect(() => {
    if (!orderIds) return;
    const socket = getSocket();
    const events = orderIds.split(',').map((id) => `order:${id}`);
    const refresh = () => loadTable();
    events.forEach((event) => socket.on(event, refresh));
    return () => {
      events.forEach((event) => socket.off(event, refresh));
    };
  }, [orderIds, loadTable]);

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = Math.max(0, (prev[id] || 0) + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: updated };
    });
  };

  const totalCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find((entry) => entry._id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const cartLines: TableOrderLine[] = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find((entry) => entry._id === id);
      if (!item) return null;
      return { id, name: getText(item.name), price: item.price, qty };
    })
    .filter((line): line is TableOrderLine => !!line);

  const filteredItems = items.filter((item) => {
    const categoryId =
      typeof item.category === 'string' ? item.category : (item.category as { _id?: string })?._id;
    if (activeCategory !== 'all' && categoryId !== activeCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.en?.toLowerCase().includes(query) ||
        item.name.am?.includes(searchQuery) ||
        item.description.en?.toLowerCase().includes(query) ||
        item.description.am?.includes(searchQuery)
      );
    }
    return true;
  });

  const flash = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 4500);
  };

  const handleCallWaiter = async () => {
    setBusy(true);
    try {
      await api(`/tables/${tableNumber}/call`, { method: 'POST' });
      setTable((prev) => (prev ? { ...prev, status: 'call_waiter' } : prev));
      flash('🔔 Waiter notified — someone will be at your table shortly.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Call failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestBill = async () => {
    setBusy(true);
    try {
      await api(`/tables/${tableNumber}/bill`, { method: 'POST' });
      setTable((prev) => (prev ? { ...prev, status: 'bill_requested' } : prev));
      flash('🧾 Bill requested — your receipt is on the way.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bill request failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitOrder = async (data: { guestName: string; notes: string }) => {
    if (totalCount === 0) return;
    setBusy(true);
    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => ({
        menuItemId: id,
        qty,
      }));

      const res = await api<{ success: boolean; order: Order }>('/orders', {
        method: 'POST',
        body: {
          type: 'dine_in',
          tableNumber: Number(tableNumber),
          customer: {
            name: data.guestName || `Table ${tableNumber} guest`,
            notes: data.notes,
          },
          items: orderItems,
        },
      });

      if (res.success && res.order) {
        setCart({});
        setSendOpen(false);
        setActiveOrders((prev) => [res.order, ...prev]);
        setActiveView('orders');
        flash(
          res.order.status === 'pending'
            ? '🎉 Order sent! Waiting for waiter confirmation.'
            : '🎉 Order confirmed and sent to the kitchen!'
        );
        loadTable();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F1015] p-6 text-center text-[#CBD5E1]">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <UtensilsCrossed className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-black text-[#F8FAFC]">Table not found</h1>
        <p className="mt-1 max-w-xs text-sm text-[#94A3B8]">
          This QR code may be outdated. Please ask a staff member for help.
        </p>
        <Link href="/" className="mt-5">
          <Button variant="outline" className="border-white/10">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to store
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1015] pb-32 text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      <header className="relative border-b border-white/5 bg-[#14151D] px-5 pb-6 pt-5 text-[#F8FAFC] shadow-sm">
        <div className="mx-auto max-w-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F59E0B] text-[#0F1015] shadow-sm">
                <UtensilsCrossed className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-lg font-black leading-tight text-[#F8FAFC] sm:text-xl">
                  {getText(settings?.name) || 'X-RESTORANT'}
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  {table?.zone || 'Dine-in'} · Table #{tableNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="border-white/10 bg-[#1A1B24] text-[10px] font-bold text-[#CBD5E1]"
              >
                <Globe className="mr-1 h-3 w-3 text-[#F59E0B]" />
                {language === 'en' ? 'አማርኛ' : 'EN'}
              </Button>
              <Badge variant="warning" className="hidden sm:inline-flex">
                #{tableNumber}
              </Badge>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={handleCallWaiter}
              disabled={busy}
              variant="outline"
              className="h-auto rounded-xl border-rose-500/20 bg-rose-500/10 py-3 text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
            >
              <Bell className="mr-1.5 h-4 w-4" /> {t('callWaiter')}
            </Button>
            <Button
              type="button"
              onClick={handleRequestBill}
              disabled={busy}
              variant="outline"
              className="h-auto rounded-xl border-[#F59E0B]/30 bg-[#F59E0B]/10 py-3 text-[#F59E0B] hover:bg-[#F59E0B]/15"
            >
              <Receipt className="mr-1.5 h-4 w-4" /> {t('requestBill')}
            </Button>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 border-b border-white/5 bg-[#0F1015]/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1.5 px-4 py-2.5">
          {[
            { id: 'menu' as View, label: t('menu'), icon: Utensils },
            {
              id: 'orders' as View,
              label: t('orders'),
              icon: ClipboardList,
              badge: activeOrders.length,
            },
            { id: 'wifi' as View, label: t('wifiInfo'), icon: Wifi },
            { id: 'games' as View, label: t('playGames'), icon: Gamepad2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const selected = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition ${
                  selected
                    ? 'bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/40'
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{tab.label}</span>
                {!!tab.badge && (
                  <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[9px] font-black text-[#0F1015]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {feedback && (
        <div className="mx-auto mt-3 max-w-xl px-4">
          <div className="flex items-center justify-between rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3.5 py-3 text-xs font-bold text-[#F59E0B]">
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback('')}
              className="ml-2 text-[#F59E0B] hover:text-[#F8FAFC]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto mt-3 max-w-xl px-4">
        {activeView === 'orders' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3 w-3 animate-pulse text-emerald-400" /> Live table status
              </span>
              <span>
                {table?.status === 'bill_requested'
                  ? t('billRequested')
                  : table?.status === 'call_waiter'
                    ? t('callWaiterStatus')
                    : t('occupied')}
              </span>
            </div>
            <TableOrdersList activeOrders={activeOrders} />
          </div>
        )}

        {activeView === 'wifi' && (
          <TableWifiView settings={settings} onBackToMenu={() => setActiveView('menu')} />
        )}

        {activeView === 'games' && <TableGameView />}

        {activeView === 'menu' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  placeholder={`${t('search')}…`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border-white/10 bg-[#171821] pl-9 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <FilterPill
                active={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                label={t('all')}
              />
              {categories.map((category) => (
                <FilterPill
                  key={category._id}
                  active={activeCategory === category._id}
                  onClick={() => setActiveCategory(category._id)}
                  label={`${category.icon || ''} ${getText(category.name)}`.trim()}
                />
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl border border-white/5 bg-[#171821]"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-[#171821] p-10 text-center">
                <span className="text-4xl">🍽️</span>
                <p className="mt-3 text-sm font-bold text-[#F8FAFC]">Nothing matches your filter</p>
                <Button
                  variant="outline"
                  className="mt-3 border-white/10"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  {t('all')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredItems.map((item) => (
                  <TableMenuCard
                    key={item._id}
                    item={item}
                    quantity={cart[item._id] || 0}
                    onUpdateQuantity={(delta) => updateCart(item._id, delta)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mx-auto mt-8 max-w-xl px-4 text-center text-[10px] text-[#475569]">
        <p>
          {getText(settings?.intro) ||
            'Scan. Order. Enjoy. Your basket is saved on this device.'}
        </p>
        <p className="mt-1">Total {formatETB(totalPrice)} · {totalCount} items in basket</p>
      </footer>

      {activeView === 'menu' && (
        <TableBottomCart
          tableNumber={tableNumber}
          totalCount={totalCount}
          totalPrice={totalPrice}
          busy={busy}
          onSendOrder={() => setSendOpen(true)}
        />
      )}

      <TableSendModal
        isOpen={sendOpen}
        tableNumber={tableNumber}
        lines={cartLines}
        totalPrice={totalPrice}
        busy={busy}
        onClose={() => setSendOpen(false)}
        onSubmit={handleSubmitOrder}
      />
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition ${
        active
          ? 'bg-[#F59E0B] text-[#0F1015]'
          : 'border border-white/5 bg-[#171821] text-[#94A3B8] hover:text-[#F8FAFC]'
      }`}
    >
      {label}
    </button>
  );
}
