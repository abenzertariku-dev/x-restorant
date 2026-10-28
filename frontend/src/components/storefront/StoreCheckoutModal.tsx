'use client';

import React, { useState } from 'react';
import { RestaurantSetting } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface StoreCheckoutModalProps {
  isOpen: boolean;
  totalPrice: number;
  settings: RestaurantSetting | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: 'telebirr' | 'cbe_transfer' | 'cash';
    refCode: string;
  }) => Promise<void>;
}

export function StoreCheckoutModal({
  isOpen,
  totalPrice,
  settings,
  busy,
  onClose,
  onSubmit,
}: StoreCheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_transfer' | 'cash'>('telebirr');
  const [refCode, setRefCode] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !address) {
      alert('Please provide phone number and delivery address');
      return;
    }
    onSubmit({
      customerName: customerName || 'Guest',
      phone,
      address,
      paymentMethod,
      refCode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171821] p-6 sm:p-7 shadow-2xl text-[#CBD5E1]"
      >
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-xl font-black text-[#F8FAFC]">Delivery Order</h3>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Total payable:{' '}
            <b className="font-mono text-[#F59E0B]">{totalPrice.toLocaleString()} ETB</b>
          </p>
        </div>

        <div className="my-5 space-y-3.5 text-xs">
          <div>
            <label className="mb-1 block font-bold uppercase text-[10px] tracking-wider text-[#94A3B8]">
              Your Full Name
            </label>
            <Input
              required
              placeholder="e.g. Almaz Tadesse"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border-white/10 bg-[#14151D] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold uppercase text-[10px] tracking-wider text-[#94A3B8]">
              Phone Number (Required) *
            </label>
            <Input
              required
              type="tel"
              placeholder="+251 9..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-white/10 bg-[#14151D] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold uppercase text-[10px] tracking-wider text-[#94A3B8]">
              Delivery Address *
            </label>
            <Textarea
              required
              placeholder="Street, Landmark, House / Office Number in Addis Ababa"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="border-white/10 bg-[#14151D] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="mb-1.5 block font-bold uppercase text-[10px] tracking-wider text-[#94A3B8]">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'telebirr', label: 'Telebirr', icon: '📱' },
                { id: 'cbe_transfer', label: 'CBE Bank', icon: '🏦' },
                { id: 'cash', label: 'Cash on Deliv.', icon: '💵' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center text-[10px] font-bold transition ${
                    paymentMethod === m.id
                      ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                      : 'border-white/5 bg-[#14151D] text-[#94A3B8] hover:border-white/10'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="mt-1">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Telebirr Details */}
          {paymentMethod === 'telebirr' && settings?.telebirrMerchantCode && (
            <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                Telebirr Merchant Code:
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-sm font-black text-[#F8FAFC]">
                  {settings.telebirrMerchantCode}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(settings.telebirrMerchantCode)}
                  className="rounded-md bg-[#14151D] px-2.5 py-1 text-[10px] font-bold text-[#F59E0B] border-white/10 h-7"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  {copiedBank ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          {/* CBE Bank Details */}
          {paymentMethod === 'cbe_transfer' && settings?.banks?.[0] && (
            <div className="rounded-xl border border-white/5 bg-[#14151D] p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {settings.banks[0].bankName} Transfer:
              </span>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="font-mono font-black text-[#F8FAFC]">
                    {settings.banks[0].accountNumber}
                  </p>
                  <p className="text-[10px] text-[#94A3B8]">{settings.banks[0].accountName}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(settings.banks[0].accountNumber)}
                  className="rounded-md bg-[#171821] px-2.5 py-1 text-[10px] font-bold text-[#CBD5E1] border-white/10 h-7"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  {copiedBank ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          {paymentMethod !== 'cash' && (
            <div>
              <label className="mb-1 block font-bold uppercase text-[10px] tracking-wider text-[#94A3B8]">
                Transaction Ref Number *
              </label>
              <Input
                required
                placeholder="e.g. TLB8394829"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="border-white/10 bg-[#14151D] font-mono text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2.5 pt-2">
          <Button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-full bg-[#F59E0B] py-3.5 text-xs font-black uppercase tracking-wider text-[#0F1015] shadow-lg shadow-amber-500/20 hover:bg-[#FBBF24] disabled:opacity-50"
          >
            {busy ? 'Sending Order…' : 'CONFIRM & ORDER'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
