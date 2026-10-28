'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/lib/socket';
import { api, playSoundAlert } from '@/lib/api';
import { Order } from '@/types';
import {
  CreditCard,
  LogOut,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BillList } from '@/components/cashier/BillList';
import { SettlementDrawer } from '@/components/cashier/SettlementDrawer';
import { ReceiptModal } from '@/components/cashier/ReceiptModal';

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_transfer' | 'cash'>('telebirr');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [receiptModal, setReceiptModal] = useState<Order | null>(null);
  const { user, logout } = useAuth();

  const loadUnsettledOrders = async () => {
    try {
      const res = await api<{ success: boolean; orders: Order[] }>('/orders');
      if (res.success) {
        const unsettled = res.orders.filter((o) => o.status !== 'settled' && o.status !== 'cancelled');
        setOrders(unsettled);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnsettledOrders();
    const socket = getSocket();

    socket.emit('join:room', 'room:cashier');

    socket.on('alert:bill_requested', () => {
      playSoundAlert('chime');
      loadUnsettledOrders();
    });

    socket.on('order:settled', () => {
      loadUnsettledOrders();
    });

    return () => {
      socket.emit('leave:room', 'room:cashier');
      socket.off('alert:bill_requested');
      socket.off('order:settled');
    };
  }, []);

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (paymentMethod !== 'cash' && !refCode.trim()) {
      alert('Please enter the customer Telebirr / Bank transaction reference code for verification.');
      return;
    }

    setBusy(true);
    try {
      const res = await api<{ success: boolean; order: Order }>(`/orders/${selectedOrder._id}/settle`, {
        method: 'POST',
        body: {
          method: paymentMethod,
          referenceCode: refCode,
        },
      });

      if (res.success) {
        setReceiptModal(res.order);
        setSelectedOrder(null);
        setRefCode('');
        loadUnsettledOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Settlement failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1015] p-4 sm:p-6 pb-24 text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* Cashier Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#14151D] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015] shadow-sm">
            <CreditCard className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#F8FAFC]">CASHIER POS TERMINAL</h1>
            <p className="text-xs text-[#94A3B8]">
              Payment Verification & Fiscal Settlement · Cashier:{' '}
              <span className="font-bold text-[#F59E0B]">{user?.name || 'Cashier'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5 text-[#F59E0B]" /> Admin
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={loadUnsettledOrders}
            title="Refresh Orders"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit
          </Button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Unsettled Orders List (7 cols) */}
        <BillList
          orders={orders}
          selectedOrder={selectedOrder}
          onSelectOrder={setSelectedOrder}
          loading={loading}
        />

        {/* Right: Settlement Drawer (5 cols) */}
        <div className="lg:col-span-5">
          <SettlementDrawer
            selectedOrder={selectedOrder}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            refCode={refCode}
            setRefCode={setRefCode}
            busy={busy}
            onSettle={handleSettle}
            onCancelSelection={() => setSelectedOrder(null)}
          />
        </div>
      </div>

      {/* Itemized Fiscal Receipt Modal */}
      <ReceiptModal
        order={receiptModal}
        onClose={() => setReceiptModal(null)}
      />
    </div>
  );
}
