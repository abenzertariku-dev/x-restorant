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
  const [formError, setFormError] = useState('');

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
    setFormError('');
    if (!phone.trim()) {
      setFormError('Please provide a phone number.');
      return;
    }
    if (type === 'delivery' && !address.trim()) {
      setFormError('Please provide a delivery address.');
      return;
    }
    if (paymentMethod !== 'cash' && !/^[A-Za-z0-9-]{6,}$/.test(refCode.trim())) {
      setFormError('Please enter a valid transaction reference (at least 6 characters).');
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('checkout')}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-[#FFFFFF] p-5 text-[#334155] shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-7"
      >
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-black text-[#0F172A]">{t('checkout')}</h3>
            <p className="mt-1 text-xs text-[#64748B]">
              {t('total')}:{' '}
              <b className="font-mono text-[#B45309]">{formatETB(totalPrice)}</b>
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="my-5 space-y-4 text-xs">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              {t('orderType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('delivery')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  type === 'delivery'
                    ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#B45309]'
                    : 'border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:border-slate-200'
                }`}
              >
                <Bike className="h-4 w-4" /> {t('delivery')}
              </button>
              <button
                type="button"
                onClick={() => setType('takeaway')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                  type === 'takeaway'
                    ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#B45309]'
                    : 'border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:border-slate-200'
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> {t('takeaway')}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {t('fullName')}
              </label>
              <Input
                placeholder="e.g. Almaz Tadesse"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border-slate-200 bg-[#FFFFFF] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {t('phone')} *
              </label>
              <Input
                required
                type="tel"
                placeholder="+251 9..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-slate-200 bg-[#FFFFFF] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B]"
              />
            </div>
          </div>

          {type === 'delivery' && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {t('deliveryAddress')} *
              </label>
              <Textarea
                required
                placeholder="Street, landmark, house / office number in Addis Ababa"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="border-slate-200 bg-[#FFFFFF] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B]"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              {t('notes')} ({t('optional')})
            </label>
            <Input
              placeholder={t('specialInstructions')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-slate-200 bg-[#FFFFFF] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
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
                      ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#B45309]'
                      : 'border-slate-200 bg-[#FFFFFF] text-[#64748B] hover:border-slate-200'
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
            <p className="rounded-xl border border-slate-200 bg-[#FFFFFF] p-3 text-[10px] text-[#64748B]">
              Pay {type === 'delivery' ? 'the courier on delivery' : 'at the counter when you pick up'}.
              Please have the exact amount ready where possible.
            </p>
          )}

          {paymentMethod !== 'cash' && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {t('referenceCode')} *
              </label>
              <Input
                required
                placeholder="e.g. TLB8394829"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="border-slate-200 bg-[#FFFFFF] font-mono text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#F59E0B]"
              />
              <p className="mt-1 text-[10px] text-[#94A3B8]">
                The cashier verifies this reference before the order is settled.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-[#FFFFFF] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              <Landmark className="h-3 w-3 text-[#B45309]" /> {t('subtotal')}
            </p>
            <div className="max-h-32 space-y-1.5 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={line.id} className="flex justify-between text-[11px]">
                  <span className="text-[#334155]">
                    {line.qty} × {line.name}
                  </span>
                  <span className="font-mono text-[#64748B]">
                    {formatETB(line.price * line.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-xs font-black text-[#0F172A]">
              <span>{t('total')}</span>
              <span className="text-[#B45309]">{formatETB(totalPrice)}</span>
            </div>
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[11px] font-semibold text-rose-600"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row">
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
            className="rounded-full border border-slate-200 bg-slate-100 px-5 py-3.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
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
        accent ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5' : 'border-slate-200 bg-[#FFFFFF]'
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
        {title}
      </span>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-black text-[#0F172A]">{primary}</p>
          {secondary && <p className="truncate text-[10px] text-[#64748B]">{secondary}</p>}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCopy}
          className="h-7 shrink-0 rounded-md border-slate-200 bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-[#B45309]"
        >
          <Copy className="mr-1 h-3 w-3" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}
