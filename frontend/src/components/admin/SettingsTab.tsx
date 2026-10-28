'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RestaurantSetting } from '@/types';

interface SettingsTabProps {
  settings: RestaurantSetting | null;
}

export function SettingsTab({ settings }: SettingsTabProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-[#F8FAFC]">
          Restaurant Setup & Payment Channels
        </h3>
        <p className="text-xs text-[#94A3B8]">
          Operational parameters across dine-in table bills and digital menu ordering
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Brand */}
        <div className="rounded-2xl border border-white/5 bg-[#1D1E2A] p-5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Restaurant Brand
          </span>
          <p className="mt-1 text-base font-extrabold text-[#F8FAFC]">
            {settings?.name?.en} ({settings?.name?.am})
          </p>
        </div>

        {/* Guest WiFi */}
        <div className="rounded-2xl border border-white/5 bg-[#1D1E2A] p-5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Guest WiFi
          </span>
          <p className="mt-1 text-sm font-bold text-[#F8FAFC]">
            SSID: <span className="font-mono font-black">{settings?.wifiName}</span>
          </p>
          <p className="text-xs text-[#94A3B8]">
            Pass: <span className="font-mono">{settings?.wifiPass}</span>
          </p>
        </div>

        {/* Telebirr */}
        <div className="rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F59E0B]">
            Telebirr Merchant Code
          </span>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-mono text-xl font-black text-[#F59E0B]">
              {settings?.telebirrMerchantCode || 'Not Set'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyText('telebirr', settings?.telebirrMerchantCode || '')
              }
            >
              {copiedKey === 'telebirr' ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </div>

        {/* CBE */}
        <div className="rounded-2xl border border-white/5 bg-[#1D1E2A] p-5 shadow-sm sm:col-span-2 lg:col-span-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Commercial Bank of Ethiopia (CBE)
          </span>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="font-mono text-base font-black text-[#F8FAFC]">
                {settings?.banks?.[0]?.accountNumber || '1000123456789'}
              </p>
              <p className="text-xs text-[#94A3B8]">
                {settings?.banks?.[0]?.accountName}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyText(
                  'cbe',
                  settings?.banks?.[0]?.accountNumber || '1000123456789'
                )
              }
            >
              {copiedKey === 'cbe' ? 'Copied!' : 'Copy Acc'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
