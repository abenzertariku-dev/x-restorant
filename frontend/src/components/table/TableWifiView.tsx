'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Wifi, ArrowLeft } from 'lucide-react';
import { RestaurantSetting } from '@/types';

interface TableWifiViewProps {
  settings: RestaurantSetting | null;
  onBackToMenu: () => void;
}

export function TableWifiView({ settings, onBackToMenu }: TableWifiViewProps) {
  const [copiedWifi, setCopiedWifi] = useState(false);

  const ssid = settings?.wifiName || 'ABYSSINIA_GUEST';
  const pass = settings?.wifiPass || 'Guest2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(pass);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  return (
    <Card className="border-slate-200 bg-[#FFFFFF] shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/15 text-[#B45309]">
            <Wifi className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-black text-[#0F172A]">
            Guest High-Speed WiFi
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="rounded-xl border border-slate-200 bg-[#F1F5F9] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Network SSID:
          </span>
          <p className="mt-0.5 text-base font-bold text-[#0F172A]">{ssid}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#F1F5F9] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Password:
          </span>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-mono text-base font-black text-[#B45309]">{pass}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-slate-200 bg-[#FFFFFF] text-xs font-bold text-[#0F172A] hover:border-[#F59E0B]"
            >
              <Copy className="mr-1 h-3.5 w-3.5 text-[#B45309]" />
              {copiedWifi ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onBackToMenu}
          className="mt-4 w-full border border-slate-200 bg-[#F1F5F9] font-bold text-[#E2E8F0] hover:bg-[#E2E8F0]"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Menu
        </Button>
      </CardContent>
    </Card>
  );
}
