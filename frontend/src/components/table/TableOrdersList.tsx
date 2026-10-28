'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Order } from '@/types';

interface TableOrdersListProps {
  tableNumber: string;
  activeOrders: Order[];
  getText: (field: any) => string;
}

export function TableOrdersList({ tableNumber, activeOrders, getText }: TableOrdersListProps) {
  if (activeOrders.length === 0) return null;

  return (
    <Card className="border-white/5 bg-[#171821] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-xs font-black uppercase text-[#F59E0B]">
          <Clock className="h-4 w-4" /> Live Orders at Table #{tableNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-white/5 pt-1">
        {activeOrders.map((ord) => (
          <div key={ord._id} className="py-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#F8FAFC]">
                Order #{ord.orderNumber}
              </span>
              <Badge variant="warning" className="text-[10px] uppercase font-bold">
                {ord.status}
              </Badge>
            </div>
            <div className="mt-1 text-[11px] text-[#94A3B8]">
              {ord.items.map((i) => `${i.qty}× ${getText(i.name)}`).join(', ')}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
