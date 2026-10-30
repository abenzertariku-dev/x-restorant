'use client';

import React, { useState } from 'react';
import { Plus, Shield, Phone, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Role, User } from '@/types';

interface StaffTabProps {
  staff: User[];
  onCreateStaff: (payload: {
    name: string;
    role: Role;
    pin: string;
    phone: string;
  }) => Promise<void>;
  creating?: boolean;
}

const ROLES: Role[] = ['admin', 'manager', 'waiter', 'kitchen', 'cashier', 'driver'];

const roleTone: Record<Role, string> = {
  admin: 'text-rose-600 bg-rose-500/10 border-rose-500/30',
  manager: 'text-[#B45309] bg-[#F59E0B]/10 border-[#F59E0B]/30',
  waiter: 'text-sky-600 bg-sky-500/10 border-sky-500/30',
  kitchen: 'text-orange-600 bg-orange-500/10 border-orange-500/30',
  cashier: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  driver: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
};

const emptyForm = { name: '', role: 'waiter' as Role, pin: '', phone: '' };

export function StaffTab({ staff, onCreateStaff, creating = false }: StaffTabProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4,6}$/.test(form.pin)) {
      setError('PIN must be 4 to 6 digits.');
      return;
    }
    try {
      await onCreateStaff(form);
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create staff account.');
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A]">Staff Accounts & Permissions</h3>
          <p className="text-xs text-[#64748B]">
            Create logins and PINs for managers, waiters, kitchen, cashiers and drivers.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {staff.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-slate-200 bg-[#F1F5F9] p-5 shadow-sm transition hover:border-[#F59E0B]/30"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-extrabold text-[#0F172A]">{s.name}</h4>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${roleTone[s.role]}`}
                  >
                    {s.role}
                  </span>
                </p>
              </div>
              <Badge variant={s.active === false ? 'destructive' : 'success'}>
                {s.active === false ? 'Inactive' : 'Active'}
              </Badge>
            </div>

            <div className="mt-4 space-y-1.5 rounded-xl border border-slate-200 bg-[#FFFFFF] p-3 text-xs">
              <div className="flex items-center justify-between gap-2 text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" /> Login
                </span>
                <span className="truncate font-mono font-bold text-[#0F172A]">
                  {s.username || s.name.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Contact
                </span>
                <span className="truncate font-mono text-[#334155]">{s.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 py-12 text-center text-xs text-[#64748B]">
            No staff accounts returned by the server.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create Staff Login</DialogTitle>
            <DialogDescription>
              The staff member signs in with their name and 4–6 digit PIN.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="mt-5 space-y-3.5">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Full Name
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Selam Tadesse"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as Role }))}
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] outline-none focus:border-[#F59E0B]"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#FFFFFF] capitalize">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  PIN (4–6 digits)
                </label>
                <Input
                  required
                  inputMode="numeric"
                  pattern="\d{4,6}"
                  maxLength={6}
                  value={form.pin}
                  onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
                  placeholder="e.g. 4321"
                  className="font-mono tracking-widest"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Phone (Optional)
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+251911000000"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600">
                {error}
              </p>
            )}

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 text-[11px] text-[#64748B]">
              <Shield className="h-4 w-4 shrink-0 text-[#B45309]" />
              This account will be restricted to the {form.role} portal.
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button type="submit" className="flex-1" disabled={creating}>
                {creating ? 'Creating…' : 'Create Staff Account'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
