'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { MenuItem, Table, Order, RestaurantSetting } from '@/types';
import {
  Bell,
  Receipt,
  Wifi,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableMenuCard } from '@/components/table/TableMenuCard';
import { TableWifiView } from '@/components/table/TableWifiView';
import { TableOrdersList } from '@/components/table/TableOrdersList';
import { TableBottomCart } from '@/components/table/TableBottomCart';

export default function TableQRPage() {
  const params = useParams();
  const tableNumber = params.tableId as string;

  const [table, setTable] = useState<Table | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);

  // Modals & Active Tab
  const [activeView, setActiveView] = useState<'menu' | 'wifi' | 'status'>('menu');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const { getText } = useLanguage();

  const loadTableInfo = async () => {
    try {
      const [tblRes, menuRes, setRes] = await Promise.all([
        api<{ success: boolean; table: Table; activeOrders: Order[] }>(`/tables/${tableNumber}`),
        api<{ success: boolean; categories: any }>('/menu'),
        api<{ success: boolean; setting: RestaurantSetting }>('/settings'),
      ]);

      if (tblRes.success) {
        setTable(tblRes.table);
        setActiveOrders(tblRes.activeOrders || []);
      }
      if (menuRes.success && menuRes.categories) {
        const flat: MenuItem[] = [];
        menuRes.categories.forEach((c: any) => {
          if (c.items) flat.push(...c.items);
        });
        setItems(flat);
      }
      if (setRes.success) setSettings(setRes.setting);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTableInfo();
  }, [tableNumber]);

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
    const it = items.find((i) => i._id === id);
    return sum + (it ? it.price * qty : 0);
  }, 0);

  const handleCallWaiter = async () => {
    setBusy(true);
    try {
      await api(`/tables/${tableNumber}/call`, { method: 'POST' });
      setFeedbackMsg('🔔 Waiter notified! A server will attend your table shortly.');
    } catch (err: any) {
      alert(err.message || 'Call failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestBill = async () => {
    setBusy(true);
    try {
      await api(`/tables/${tableNumber}/bill`, { method: 'POST' });
      setFeedbackMsg('🧾 Bill requested! A staff member is bringing your receipt.');
    } catch (err: any) {
      alert(err.message || 'Bill request failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSendOrder = async () => {
    if (totalCount === 0) return;
    setBusy(true);
    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const it = items.find((i) => i._id === id);
        return {
          menuItemId: id,
          qty,
          name: it?.name,
          price: it?.price,
        };
      });

      const res = await api<{ success: boolean; order: Order }>('/orders', {
        method: 'POST',
        body: {
          type: 'dine_in',
          tableNumber: parseInt(tableNumber),
          items: orderItems,
        },
      });

      if (res.success) {
        setCart({});
        setFeedbackMsg('🎉 Order confirmed and sent to kitchen!');
        loadTableInfo();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1015] pb-32 text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* Table Welcome Header */}
      <header className="relative border-b border-white/5 bg-[#14151D] p-6 text-[#F8FAFC] shadow-sm">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F59E0B] text-[#0F1015] shadow-sm">
            <UtensilsCrossed className="h-6 w-6 stroke-[2.2]" />
          </div>

          <Badge variant="warning" className="border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#F59E0B] px-3.5 py-0.5 text-xs font-black uppercase tracking-wider">
            Table #{tableNumber} · {table?.zone || 'Dine-In Area'}
          </Badge>
          <h1 className="mt-2 text-2xl font-black text-[#F8FAFC] sm:text-3xl">
            {getText(settings?.name) || 'ABYSSINIA'}
          </h1>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Order food, request table service, or connect to guest WiFi
          </p>
        </div>
      </header>

      {/* Quick Action Hub Tiles */}
      <div className="mx-auto -mt-5 max-w-xl px-4">
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/5 bg-[#171821] p-2.5 shadow-xl">
          <Button
            variant="ghost"
            onClick={() => setActiveView('menu')}
            className={`flex flex-col h-auto py-2.5 items-center rounded-xl transition ${
              activeView === 'menu'
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/50'
                : 'text-[#94A3B8] hover:bg-[#1E202B] hover:text-[#F8FAFC]'
            }`}
          >
            <Utensils className="h-5 w-5" />
            <span className="mt-1 text-[11px] font-bold">Menu</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleCallWaiter}
            disabled={busy}
            className="flex flex-col h-auto py-2.5 items-center rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="mt-1 text-[11px] font-bold">Call Staff</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleRequestBill}
            disabled={busy}
            className="flex flex-col h-auto py-2.5 items-center rounded-xl text-[#F59E0B] hover:bg-[#F59E0B]/10 hover:text-[#FBBF24]"
          >
            <Receipt className="h-5 w-5" />
            <span className="mt-1 text-[11px] font-bold">Bill</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveView('wifi')}
            className={`flex flex-col h-auto py-2.5 items-center rounded-xl transition ${
              activeView === 'wifi'
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/50'
                : 'text-[#94A3B8] hover:bg-[#1E202B] hover:text-[#F8FAFC]'
            }`}
          >
            <Wifi className="h-5 w-5" />
            <span className="mt-1 text-[11px] font-bold">WiFi</span>
          </Button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div className="mx-auto my-4 max-w-xl px-4">
          <div className="flex items-center justify-between rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-3.5 text-xs font-bold text-[#F59E0B] shadow-sm">
            <span>{feedbackMsg}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFeedbackMsg('')}
              className="h-6 w-6 text-[#F59E0B] hover:text-[#F8FAFC]"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Active Table Orders */}
      <section className="mx-auto my-4 max-w-xl px-4">
        <TableOrdersList
          tableNumber={tableNumber}
          activeOrders={activeOrders}
          getText={getText}
        />
      </section>

      {/* Content View: WiFi Details */}
      {activeView === 'wifi' && (
        <main className="mx-auto max-w-xl p-4">
          <TableWifiView
            settings={settings}
            onBackToMenu={() => setActiveView('menu')}
          />
        </main>
      )}

      {/* Content View: Food Menu */}
      {activeView === 'menu' && (
        <main className="mx-auto max-w-xl p-4">
          <h2 className="mb-3 text-base font-black text-[#F8FAFC]">Table Menu & Shared Basket</h2>
          <div className="space-y-3">
            {items.map((it) => (
              <TableMenuCard
                key={it._id}
                item={it}
                quantity={cart[it._id] || 0}
                onUpdateQuantity={(delta) => updateCart(it._id, delta)}
                getText={getText}
              />
            ))}
          </div>
        </main>
      )}

      {/* Floating Bottom Bar for Table Cart */}
      {activeView === 'menu' && (
        <TableBottomCart
          tableNumber={tableNumber}
          totalCount={totalCount}
          totalPrice={totalPrice}
          busy={busy}
          onSendOrder={handleSendOrder}
        />
      )}
    </div>
  );
}
