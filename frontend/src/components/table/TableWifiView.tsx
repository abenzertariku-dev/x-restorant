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
    <Card className="border-white/5 bg-[#171821] shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/15 text-[#F59E0B]">
            <Wifi className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-black text-[#F8FAFC]">
            Guest High-Speed WiFi
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="rounded-xl border border-white/5 bg-[#1E202B] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Network SSID:
          </span>
          <p className="mt-0.5 text-base font-bold text-[#F8FAFC]">{ssid}</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#1E202B] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Password:
          </span>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-mono text-base font-black text-[#F59E0B]">{pass}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-white/10 bg-[#14151D] text-xs font-bold text-[#F8FAFC] hover:border-[#F59E0B]"
            >
              <Copy className="mr-1 h-3.5 w-3.5 text-[#F59E0B]" />
              {copiedWifi ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onBackToMenu}
          className="mt-4 w-full border border-white/10 bg-[#1E202B] font-bold text-[#E2E8F0] hover:bg-[#242634]"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Menu
        </Button>
      </CardContent>
    </Card>
  );
}
