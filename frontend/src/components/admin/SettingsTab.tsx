'use client';

import React, { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Building2, Smartphone, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BankAccount, RestaurantSetting } from '@/types';

interface SettingsTabProps {
  settings: RestaurantSetting | null;
  onSave: (payload: Partial<RestaurantSetting>) => Promise<void>;
}

const emptySettings: RestaurantSetting = {
  name: { en: '', am: '' },
  intro: { en: '', am: '' },
  wifiName: '',
  wifiPass: '',
  banks: [
    { bankName: 'Commercial Bank of Ethiopia (CBE)', accountName: '', accountNumber: '' },
    { bankName: 'Awash Bank', accountName: '', accountNumber: '' },
  ],
  telebirrMerchantCode: '',
  telebirrMerchantName: '',
  tablesCount: 16,
  directKitchenRouting: false,
};

export function SettingsTab({ settings, onSave }: SettingsTabProps) {
  const [form, setForm] = useState<RestaurantSetting>(emptySettings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        ...emptySettings,
        ...settings,
        name: { ...emptySettings.name, ...settings.name },
        intro: { ...emptySettings.intro, ...settings.intro },
        banks: settings.banks?.length ? settings.banks : emptySettings.banks,
      });
    }
  }, [settings]);

  const updateBank = (index: number, patch: Partial<BankAccount>) => {
    setForm((prev) => ({
      ...prev,
      banks: prev.banks.map((bank, i) => (i === index ? { ...bank, ...patch } : bank)),
    }));
  };

  const removeBank = (index: number) => {
    setForm((prev) => ({ ...prev, banks: prev.banks.filter((_, i) => i !== index) }));
  };

  const addBank = () => {
    setForm((prev) => ({
      ...prev,
      banks: [...prev.banks, { bankName: '', accountName: '', accountNumber: '' }],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await onSave({
        name: form.name,
        intro: form.intro,
        wifiName: form.wifiName,
        wifiPass: form.wifiPass,
        banks: form.banks.filter((b) => b.bankName.trim() && b.accountNumber.trim()),
        telebirrMerchantCode: form.telebirrMerchantCode,
        telebirrMerchantName: form.telebirrMerchantName,
        tablesCount: Number(form.tablesCount) || 16,
        directKitchenRouting: form.directKitchenRouting,
      });
      setMessage('Restaurant settings saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#F59E0B]" />
          <div>
            <h3 className="text-base font-extrabold text-[#F8FAFC]">Restaurant Profile</h3>
            <p className="text-xs text-[#94A3B8]">Bilingual brand content shown across the menu.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Restaurant Name (English)
            </label>
            <Input
              value={form.name.en}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: { ...p.name, en: e.target.value } }))
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Restaurant Name (አማርኛ)
            </label>
            <Input
              value={form.name.am}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: { ...p.name, am: e.target.value } }))
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Intro (English)
            </label>
            <Textarea
              rows={2}
              value={form.intro.en}
              onChange={(e) =>
                setForm((p) => ({ ...p, intro: { ...p.intro, en: e.target.value } }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Intro (አማርኛ)
            </label>
            <Textarea
              rows={2}
              value={form.intro.am}
              onChange={(e) =>
                setForm((p) => ({ ...p, intro: { ...p.intro, am: e.target.value } }))
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Wifi className="h-5 w-5 text-[#F59E0B]" />
          <div>
            <h3 className="text-base font-extrabold text-[#F8FAFC]">Guest WiFi</h3>
            <p className="text-xs text-[#94A3B8]">Shown on every QR table page.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Network Name
            </label>
            <Input
              value={form.wifiName}
              onChange={(e) => setForm((p) => ({ ...p, wifiName: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Password
            </label>
            <Input
              value={form.wifiPass}
              onChange={(e) => setForm((p) => ({ ...p, wifiPass: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Tables Count
            </label>
            <Input
              type="number"
              min={1}
              value={form.tablesCount}
              onChange={(e) =>
                setForm((p) => ({ ...p, tablesCount: Number(e.target.value) }))
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-[#F59E0B]" />
          <div>
            <h3 className="text-base font-extrabold text-[#F8FAFC]">Telebirr & Bank Payments</h3>
            <p className="text-xs text-[#94A3B8]">
              Customer-facing payment channels used during checkout and cashier verification.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Telebirr Merchant Code
            </label>
            <Input
              value={form.telebirrMerchantCode}
              onChange={(e) =>
                setForm((p) => ({ ...p, telebirrMerchantCode: e.target.value }))
              }
              placeholder="e.g. 887766"
              className="font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Telebirr Merchant Name
            </label>
            <Input
              value={form.telebirrMerchantName}
              onChange={(e) =>
                setForm((p) => ({ ...p, telebirrMerchantName: e.target.value }))
              }
              placeholder="ABYSSINIA RESTAURANT"
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {form.banks.map((bank, index) => (
            <div
              key={`${index}-${bank.bankName}`}
              className="grid gap-3 rounded-2xl border border-white/5 bg-[#14151D] p-4 md:grid-cols-[1.1fr_1fr_1fr_auto]"
            >
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Bank Name
                </label>
                <Input
                  value={bank.bankName}
                  onChange={(e) => updateBank(index, { bankName: e.target.value })}
                  placeholder="Commercial Bank of Ethiopia"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Account Name
                </label>
                <Input
                  value={bank.accountName}
                  onChange={(e) => updateBank(index, { accountName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Account Number
                </label>
                <Input
                  value={bank.accountNumber}
                  onChange={(e) => updateBank(index, { accountNumber: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeBank(index)}
                  title="Remove bank"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addBank}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Bank Account
          </Button>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-[#14151D] p-4">
          <input
            type="checkbox"
            checked={form.directKitchenRouting}
            onChange={(e) =>
              setForm((p) => ({ ...p, directKitchenRouting: e.target.checked }))
            }
            className="mt-0.5 h-4 w-4 cursor-pointer accent-[#F59E0B]"
          />
          <span>
            <span className="block text-xs font-bold text-[#F8FAFC]">
              Direct kitchen routing for QR orders
            </span>
            <span className="text-[11px] text-[#94A3B8]">
              When enabled, customer QR orders skip waiter approval and go straight to the KDS.
            </span>
          </span>
        </label>
      </Card>

      {message && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={busy}>
          <Save className="mr-2 h-4 w-4" /> {busy ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
