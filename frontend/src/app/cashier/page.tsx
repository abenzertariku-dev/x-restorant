'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  RefreshCw,
  BellRing,
  Banknote,
  ReceiptText,
  Wallet,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { PortalHeader } from '@/components/shared/PortalHeader';
import { BillList } from '@/components/cashier/BillList';
import { SettlementDrawer } from '@/components/cashier/SettlementDrawer';
import { ReceiptModal } from '@/components/cashier/ReceiptModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, playSoundAlert } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { formatETB } from '@/lib/format';
import type {
  Order,
  PaymentMethod,
  RestaurantSetting,
  SplitPayment,
  Table,
} from '@/types';

export default function CashierPage() {
  return (
    <AuthGuard roles={['cashier', 'manager', 'admin']}>
      <CashierTerminal />
    </AuthGuard>
  );
}

function CashierTerminal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    const res = await api<{ success: boolean; orders: Order[] }>('/orders?limit=100');
    if (res.success) setOrders(res.orders);
  }, []);

  const loadTables = useCallback(async () => {
    const res = await api<{ success: boolean; tables: Table[] }>('/tables');
    if (res.success) setTables(res.tables);
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await api<{ success: boolean; setting: RestaurantSetting }>('/settings');
    if (res.success) setSettings(res.setting);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadOrders(), loadTables()]);
  }, [loadOrders, loadTables]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadOrders(), loadTables(), loadSettings()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cashier data.');
    } finally {
      setLoading(false);
    }
  }, [loadOrders, loadTables, loadSettings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    joinRoom('cashier');

    const reload = () => refresh();
    socket.on('alert:bill_requested', () => {
      playSoundAlert('chime');
      reload();
    });
    socket.on('order:settled', reload);
    socket.on('order:created', reload);
    socket.on('order:updated', reload);
    socket.on('table:status', reload);

    return () => {
      socket.off('alert:bill_requested');
      socket.off('order:settled', reload);
      socket.off('order:created', reload);
      socket.off('order:updated', reload);
      socket.off('table:status', reload);
    };
  }, [refresh]);

  const unsettled = useMemo(
    () => orders.filter((order) => order.status !== 'settled' && order.status !== 'cancelled'),
    [orders]
  );

  const selectedOrder = useMemo(
    () => unsettled.find((order) => order._id === selectedId) || null,
    [unsettled, selectedId]
  );

  const billRequestedTables = useMemo(
    () =>
      tables
        .filter((table) => table.status === 'bill_requested')
        .map((table) => table.tableNumber),
    [tables]
  );

  const stats = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const settledToday = orders.filter(
      (order) => order.status === 'settled' && new Date(order.createdAt) >= start
    );
    return {
      openValue: unsettled.reduce((sum, order) => sum + order.totalAmount, 0),
      alerts: billRequestedTables.length,
      settledToday: settledToday.length,
      collectedToday: settledToday.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  }, [orders, unsettled, billRequestedTables]);

  const settle = async (payload: {
    method: PaymentMethod | 'split';
    referenceCode?: string;
    splits?: SplitPayment[];
  }) => {
    if (!selectedOrder) return;
    setBusy(true);
    setError('');
    try {
      const res = await api<{ success: boolean; order: Order }>(
        `/orders/${selectedOrder._id}/settle`,
        {
          method: 'POST',
          body: {
            method: payload.method,
            referenceCode: payload.referenceCode || '',
            splits: payload.splits || [],
          },
        }
      );
      setReceipt(res.order);
      setSelectedId(null);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Settlement failed.';
      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      <div className="mx-auto w-full max-w-[1500px] p-4 pb-24 sm:p-6 lg:p-8">
        <PortalHeader
          title="Cashier POS Terminal"
          subtitle={`Payment verification & fiscal settlement · ${unsettled.length} active bills`}
          icon={CreditCard}
          roleLabel="Cashier"
          showLanguage
        >
          <Button variant="outline" size="sm" onClick={refresh} title="Refresh bills">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </PortalHeader>

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

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Open Bills',
              value: String(unsettled.length),
              icon: ReceiptText,
              tone: 'text-[#F59E0B]',
            },
            {
              label: 'Open Value',
              value: formatETB(stats.openValue),
              icon: Wallet,
              tone: 'text-violet-400',
            },
            {
              label: 'Bill Alerts',
              value: String(stats.alerts),
              icon: BellRing,
              tone: 'text-rose-400',
            },
            {
              label: 'Collected Today',
              value: formatETB(stats.collectedToday),
              icon: Banknote,
              tone: 'text-emerald-400',
            },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                    {stat.label}
                  </p>
                  <p className="mt-1 truncate text-lg font-black text-[#F8FAFC]">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 shrink-0 ${stat.tone}`} />
              </div>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-[#94A3B8]">
            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading bills…</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            <BillList
              orders={unsettled}
              selectedOrder={selectedOrder}
              onSelectOrder={(order) => setSelectedId(order._id)}
              loading={loading}
              billRequestedTables={billRequestedTables}
            />

            <div className="lg:col-span-5">
              <SettlementDrawer
                selectedOrder={selectedOrder}
                busy={busy}
                onSettle={settle}
                onCancelSelection={() => setSelectedId(null)}
              />
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-[10px] text-[#64748B]">
          {stats.settledToday} bills settled today · strict reference verification enforced for
          Telebirr, CBE and Awash payments
        </div>
      </div>

      <ReceiptModal order={receipt} settings={settings} onClose={() => setReceipt(null)} />
    </div>
  );
}
