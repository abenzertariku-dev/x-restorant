'use client';

import React from 'react';
import Link from 'next/link';
import { Menu as MenuIcon, Plus, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantSetting } from '@/types';

interface AdminHeaderProps {
  tab: 'analytics' | 'menu' | 'orders' | 'staff' | 'settings';
  settings: RestaurantSetting | null;
  onOpenSidebar: () => void;
  onOpenNewItemModal: () => void;
}

export function AdminHeader({
  tab,
  settings,
  onOpenSidebar,
  onOpenNewItemModal,
}: AdminHeaderProps) {
  const getTabTitle = () => {
    switch (tab) {
      case 'analytics':
        return 'Operations Overview';
      case 'menu':
        return 'Menu Catalog & Pricing';
      case 'orders':
        return 'Live Orders & Billing';
      case 'staff':
        return 'Staff Management';
      case 'settings':
        return 'Restaurant Settings';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-3 border-b border-slate-200 bg-[#FFFFFF]/90 px-4 py-3 backdrop-blur-md sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="shrink-0 rounded-xl border border-slate-200 bg-[#F1F5F9] p-2 text-[#0F172A] hover:bg-slate-100 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold capitalize text-[#0F172A] sm:text-xl">
            {getTabTitle()}
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-[#64748B] sm:text-xs">
            <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            <span className="truncate">
              Service Active · {settings?.tablesCount || 16} Tables Ready
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {tab === 'menu' && (
          <Button
            onClick={onOpenNewItemModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Dish</span>
          </Button>
        )}

        <Button
          variant="outline"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-3.5 w-3.5 text-[#B45309]" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
