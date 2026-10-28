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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-[#14151D]/90 px-6 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden rounded-xl border border-white/10 bg-[#1A1B24] p-2 text-[#F8FAFC] hover:bg-white/5"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-xl font-extrabold text-[#F8FAFC] capitalize">
            {getTabTitle()}
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Service Active · {settings?.tablesCount || 16} Tables Ready</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
            <Store className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
