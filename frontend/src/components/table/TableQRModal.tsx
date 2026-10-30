'use client';

import React, { useState } from 'react';
import { QrCode, ExternalLink, Copy, Check, Printer, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TableQRModalProps {
  tableNumber: number | null;
  zone?: string;
  capacity?: number;
  open: boolean;
  onClose: () => void;
}

export function TableQRModal({
  tableNumber,
  zone = 'Indoor',
  capacity = 4,
  open,
  onClose,
}: TableQRModalProps) {
  const [copied, setCopied] = useState(false);

  if (!tableNumber) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
  const tableUrl = `${origin}/t/${tableNumber}`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(
    tableUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(tableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent onClose={onClose} className="max-w-md p-6 bg-[#F8FAFC] border-slate-200 text-[#0F172A]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#B45309]">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-[#0F172A]">
                Table {tableNumber} QR Code
              </DialogTitle>
              <p className="text-[11px] font-semibold text-[#64748B]">
                {zone} Zone · {capacity} Seats · Customer Scan Code
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Stand Card */}
        <div id="printable-qr-card" className="mt-4 flex flex-col items-center rounded-2xl border border-slate-200 bg-[#FFFFFF] p-6 text-center shadow-xl">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#B45309]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>X-RESTORANT</span>
          </div>

          <h2 className="text-2xl font-black text-[#0F172A]">
            TABLE {tableNumber}
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Scan with your phone to order, call waiter, or request bill
          </p>

          {/* QR Code Container */}
          <div className="my-5 rounded-2xl bg-white p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImage}
              alt={`QR Code for Table ${tableNumber}`}
              width={220}
              height={220}
              className="h-[220px] w-[220px] rounded-lg object-contain"
            />
          </div>

          <Badge variant="outline" className="border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#B45309] font-mono text-[11px]">
            {tableUrl}
          </Badge>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 text-xs border-slate-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="flex items-center justify-center gap-1.5 text-xs border-slate-200 hover:border-[#F59E0B]"
          >
            <a href={tableUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 text-[#B45309]" />
              <span>Test Table Page</span>
            </a>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="col-span-2 flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F1015] hover:bg-[#F59E0B]/90 font-bold text-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Table Stand Card</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
