'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Utensils,
  Receipt,
  Users,
  Settings,
  ChefHat,
  UtensilsCrossed,
  CreditCard,
  Bike,
  Store,
  ChevronRight,
  ExternalLink,
  LogOut,
  X as CloseIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, RestaurantSetting } from '@/types';

interface SidebarProps {
  tab: 'analytics' | 'menu' | 'orders' | 'staff' | 'settings';
  setTab: (tab: 'analytics' | 'menu' | 'orders' | 'staff' | 'settings') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeOrdersCount: number;
  settings: RestaurantSetting | null;
  user: User | null;
  logout: () => void;
}

export function Sidebar({
  tab,
  setTab,
  sidebarOpen,
  setSidebarOpen,
  activeOrdersCount,
  settings,
  user,
  logout,
}: SidebarProps) {
  const mainNavItems = [
    { id: 'analytics' as const, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'menu' as const, label: 'Food & Drink Catalog', icon: Utensils },
    { id: 'orders' as const, label: 'Live Orders & Bills', icon: Receipt, badge: activeOrdersCount },
    { id: 'staff' as const, label: 'Staff Management', icon: Users },
    { id: 'settings' as const, label: 'Restaurant Settings', icon: Settings },
  ];

  const stationLinks = [
    { href: '/manager', label: 'Manager Floor', icon: LayoutDashboard, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
    { href: '/kitchen', label: 'Kitchen KDS', icon: ChefHat, color: 'text-[#F59E0B]', bg: 'bg-orange-500/10' },
    { href: '/waiter', label: 'Waiter Station', icon: UtensilsCrossed, color: 'text-[#F59E0B]', bg: 'bg-amber-500/10' },
    { href: '/cashier', label: 'Cashier POS', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { href: '/driver', label: 'Driver Dispatch', icon: Bike, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { href: '/', label: 'Storefront', icon: Store, color: 'text-[#F8FAFC]', bg: 'bg-white/5', external: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Modern Obsidian Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-white/5 bg-[#14151D] shadow-2xl lg:shadow-none transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto p-5 scrollbar-none">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F59E0B] text-[#0F1015] shadow-md shadow-amber-500/20 transition group-hover:scale-105">
                <UtensilsCrossed className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-[#F8FAFC]">
                  {settings?.name?.en || 'X-RESTORANT'}
                </h1>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#F59E0B]">
                  Management Suite
                </p>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden rounded-xl p-1.5 text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="mt-6">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              Main Menu
            </span>
            <nav className="mt-2 space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#F59E0B] text-[#0F1015] shadow-md shadow-amber-500/20'
                        : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${active ? 'text-[#0F1015]' : 'text-[#94A3B8]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge
                        variant={active ? 'secondary' : 'default'}
                        className={active ? 'bg-[#0F1015] text-[#F59E0B] border-none' : ''}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Operations Stations */}
          <div className="mt-8">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              Operations Stations
            </span>
            <nav className="mt-2 space-y-1">
              {stationLinks.map((st) => {
                const Icon = st.icon;
                return (
                  <Link
                    key={st.href}
                    href={st.href}
                    className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#94A3B8] transition hover:bg-white/5 hover:text-[#F8FAFC]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${st.bg} ${st.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{st.label}</span>
                    </div>
                    {st.external ? (
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-600" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Profile Card & Logout */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center justify-between rounded-xl bg-[#1A1B24] p-3 border border-white/5">
              <div className="flex items-center gap-2.5 min-w-0" suppressHydrationWarning>
                <Avatar className="h-9 w-9 rounded-lg" suppressHydrationWarning>
                  <AvatarFallback className="text-xs">
                    {user?.name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1" suppressHydrationWarning>
                  <p className="truncate text-xs font-bold text-[#F8FAFC]">
                    {user?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#F59E0B]">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="rounded-lg p-2 text-[#94A3B8] hover:bg-rose-500/10 hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
