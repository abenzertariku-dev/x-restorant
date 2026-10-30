'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Store, LayoutDashboard, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types';

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  roleLabel: string;
  accent?: string;
  showLanguage?: boolean;
  children?: React.ReactNode;
}

export function PortalHeader({
  title,
  subtitle,
  icon: Icon,
  roleLabel,
  accent = 'bg-[#F59E0B] text-[#0F1015]',
  showLanguage = false,
  children,
}: PortalHeaderProps) {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  const dashboardHref: Record<Role, string> = {
    admin: '/admin',
    manager: '/manager',
    waiter: '/waiter',
    kitchen: '/kitchen',
    cashier: '/cashier',
    driver: '/driver',
  };

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-[#FFFFFF] p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${accent}`}>
          <Icon className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-tight text-[#0F172A] sm:text-xl">
            {title}
          </h1>
          <p className="truncate text-xs text-[#64748B]">
            {subtitle || 'Live operations'}
            {user?.name && (
              <>
                {' · '}
                <span className="font-bold text-[#B45309]">{user.name}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}
        {showLanguage && (
          <Button type="button" variant="outline" size="sm" onClick={toggleLanguage}>
            <Globe className="mr-1.5 h-3.5 w-3.5 text-[#B45309]" />
            {language === 'en' ? 'አማርኛ' : 'EN'}
          </Button>
        )}
        <Badge variant="outline" className="hidden px-3 py-1.5 sm:inline-flex">
          {roleLabel}
        </Badge>
        {user && user.role !== 'admin' && (
          <Button variant="outline" size="sm" asChild>
            <Link href={dashboardHref[user.role]}>
              <LayoutDashboard className="mr-1.5 h-3.5 w-3.5 text-[#B45309]" />
              <span className="hidden sm:inline">My Station</span>
            </Link>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <Store className="mr-1.5 h-3.5 w-3.5 text-[#B45309]" />
            <span className="hidden sm:inline">Store</span>
          </Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={logout}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
      </div>
    </header>
  );
}
