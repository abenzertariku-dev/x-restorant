'use client';

import React, { useMemo, useState } from 'react';
import { RestaurantSetting, PaymentMethod } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Bike, ShoppingBag, X, Landmark } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatETB } from '@/lib/format';

export interface CheckoutLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface CheckoutPayload {
  type: 'delivery' | 'takeaway';
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
  refCode: string;
}

interface StoreCheckoutModalProps {
  isOpen: boolean;
  lines: CheckoutLine[];
  totalPrice: number;
  settings: RestaurantSetting | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutPayload) => Promise<void>;
}

const methods: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'telebirr', label: 'Telebirr', icon: '📱' },
  { id: 'cbe_transfer', label: 'CBE Bank', icon: '🏦' },
  { id: 'awash_transfer', label: 'Awash Bank', icon: '🏛️' },
  { id: 'cash', label: 'Cash', icon: '💵' },
];

export function StoreCheckoutModal({
  isOpen,
  lines,
  totalPrice,
  settings,
  busy,
  onClose,
  onSubmit,
}: StoreCheckoutModalProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<'delivery' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [refCode, setRefCode] = useState('');
  const [copied, setCopied] = useState(false);

  const bank = useMemo(() => {
    if (!settings?.banks?.length) return undefined;
    const pattern = paymentMethod === 'cbe_transfer' ? /cbe|commercial/i : /awash/i;
    return settings.banks.find((entry) => pattern.test(entry.bankName)) || settings.banks[0];
  }, [paymentMethod, settings]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert('Please provide a phone number');
      return;
    }
    if (type === 'delivery' && !address.trim()) {
      alert('Please provide a delivery address');
      return;
    }
    if (paymentMethod !== 'cash' && !/^[A-Za-z0-9-]{6,}$/.test(refCode.trim())) {
      alert('Please enter a valid transaction reference (at least 6 characters)');
      return;
    }
    onSubmit({
      type,
      customerName: customerName.trim() || 'Guest',
      phone: phone.trim(),
      address: type === 'delivery' ? address.trim() : '',
      notes: notes.trim(),
      paymentMethod,
      refCode: refCode.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-3xl border border-white/10 bg-[#171821] p-6 text-[#CBD5E1] shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-xl font-black text-[#F8FAFC]">{t('checkout')}</h3>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {t('total')}:{' '}
              <b className="font-mono text-[#F59E0B]">{formatETB(totalPrice)}</b>
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="my-5 space-y-4 text-xs">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {t('orderType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('delivery')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  type === 'delivery'
                    ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'border-white/5 bg-[#14151D] text-[#94A3B8] hover:border-white/10'
                }`}
              >
                <Bike className="h-4 w-4" /> {t('delivery')}
              </button>
              <button
                type="button"
                onClick={() => setType('takeaway')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  type === 'takeaway'
                    ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'border-white/5 bg-[#14151D] text-[#94A3B8] hover:border-white/10'
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> {t('takeaway')}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {t('fullName')}
              </label>
              <Input
                placeholder="e.g. Almaz Tadesse"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border-white/10 bg-[#14151D] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {t('phone')} *
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
          </div>

          {type === 'delivery' && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {t('deliveryAddress')} *
              </label>
              <Textarea
                required
                placeholder="Street, landmark, house / office number in Addis Ababa"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="border-white/10 bg-[#14151D] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {t('notes')} ({t('optional')})
            </label>
            <Input
              placeholder={t('specialInstructions')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-white/10 bg-[#14151D] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {t('payment')}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
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

          {paymentMethod === 'telebirr' && settings?.telebirrMerchantCode && (
            <PaymentDetails
              title={t('merchantCode')}
              primary={settings.telebirrMerchantCode}
              secondary={settings.telebirrMerchantName}
              copied={copied}
              onCopy={() => copyToClipboard(settings.telebirrMerchantCode)}
              accent
            />
          )}

          {(paymentMethod === 'cbe_transfer' || paymentMethod === 'awash_transfer') && bank && (
            <PaymentDetails
              title={`${bank.bankName} · ${t('bankTransfer')}`}
              primary={bank.accountNumber}
              secondary={bank.accountName}
              copied={copied}
              onCopy={() => copyToClipboard(bank.accountNumber)}
            />
          )}

          {paymentMethod === 'cash' && (
            <p className="rounded-xl border border-white/5 bg-[#14151D] p-3 text-[10px] text-[#94A3B8]">
              Pay {type === 'delivery' ? 'the courier on delivery' : 'at the counter when you pick up'}.
              Please have the exact amount ready where possible.
            </p>
          )}

          {paymentMethod !== 'cash' && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {t('referenceCode')} *
              </label>
              <Input
                required
                placeholder="e.g. TLB8394829"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="border-white/10 bg-[#14151D] font-mono text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F59E0B]"
              />
              <p className="mt-1 text-[10px] text-[#64748B]">
                The cashier verifies this reference before the order is settled.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/5 bg-[#14151D] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              <Landmark className="h-3 w-3 text-[#F59E0B]" /> {t('subtotal')}
            </p>
            <div className="max-h-32 space-y-1.5 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={line.id} className="flex justify-between text-[11px]">
                  <span className="text-[#CBD5E1]">
                    {line.qty} × {line.name}
                  </span>
                  <span className="font-mono text-[#94A3B8]">
                    {formatETB(line.price * line.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-white/5 pt-2 text-xs font-black text-[#F8FAFC]">
              <span>{t('total')}</span>
              <span className="text-[#F59E0B]">{formatETB(totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 pt-1">
          <Button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-full bg-[#F59E0B] py-3.5 text-xs font-black uppercase tracking-wider text-[#0F1015] shadow-lg shadow-amber-500/20 hover:bg-[#FBBF24] disabled:opacity-50"
          >
            {busy ? 'Sending order…' : 'Confirm & order'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3.5 text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            {t('cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PaymentDetails({
  title,
  primary,
  secondary,
  copied,
  onCopy,
  accent,
}: {
  title: string;
  primary: string;
  secondary?: string;
  copied: boolean;
  onCopy: () => void;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        accent ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5' : 'border-white/5 bg-[#14151D]'
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {title}
      </span>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-black text-[#F8FAFC]">{primary}</p>
          {secondary && <p className="truncate text-[10px] text-[#94A3B8]">{secondary}</p>}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCopy}
          className="h-7 shrink-0 rounded-md border-white/10 bg-[#1A1B24] px-2.5 py-1 text-[10px] font-bold text-[#F59E0B]"
        >
          <Copy className="mr-1 h-3 w-3" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}
