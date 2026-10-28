'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface OrdersTabProps {
  orders: Order[];
}

export function OrdersTab({ orders }: OrdersTabProps) {
  const { getText } = useLanguage();

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-base font-extrabold text-[#F8FAFC]">
          All Orders & Billing ({orders.length})
        </h3>
        <p className="text-xs text-[#94A3B8]">
          Complete transactional history across dine-in table bills and digital deliveries
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Dishes</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o, idx) => (
            <TableRow key={o._id || o.orderNumber || idx}>
              <TableCell className="font-mono font-bold text-[#F59E0B]">
                #{o.orderNumber}
              </TableCell>
              <TableCell className="capitalize font-semibold">
                {o.type.replace('_', ' ')}
              </TableCell>
              <TableCell className="font-medium">
                {o.type === 'dine_in'
                  ? `Table ${o.tableNumber}`
                  : o.customer?.phone || 'Guest'}
              </TableCell>
              <TableCell className="max-w-xs truncate text-[#94A3B8]">
                {o.items.map((i) => `${i.qty}× ${getText(i.name)}`).join(', ')}
              </TableCell>
              <TableCell className="font-extrabold text-[#F8FAFC]">
                {o.totalAmount} ETB
              </TableCell>
              <TableCell className="font-mono uppercase text-[#94A3B8]">
                {o.payment?.method || 'Unpaid'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    o.status === 'settled'
                      ? 'success'
                      : o.status === 'preparing'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {o.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-[#94A3B8]">
                No orders registered in the system yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
