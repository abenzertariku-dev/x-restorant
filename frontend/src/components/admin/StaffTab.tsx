'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

interface StaffTabProps {
  staff: User[];
}

export function StaffTab({ staff }: StaffTabProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-[#F8FAFC]">
          Staff Accounts & Permissions
        </h3>
        <p className="text-xs text-[#94A3B8]">
          Staff members authenticate using their role-assigned credentials across kitchen, waiter, and cashier terminals
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {staff.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-white/5 bg-[#1D1E2A] p-5 shadow-sm transition hover:border-[#F59E0B]/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-extrabold text-[#F8FAFC] text-sm">{s.name}</h4>
                <p className="text-[11px] font-black uppercase tracking-wider text-[#F59E0B] mt-0.5">
                  {s.role}
                </p>
              </div>
              <Badge variant="success">
                Active
              </Badge>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-[#14151D] p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Username:</span>
                <span className="font-mono font-bold text-[#F8FAFC]">
                  {s.username || s.name.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Contact:</span>
                <span className="font-mono text-[#CBD5E1]">{s.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
