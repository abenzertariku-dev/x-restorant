'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { Category, MenuItem, RestaurantSetting } from '@/types';
import { StoreNavbar } from '@/components/storefront/StoreNavbar';
import { StoreHero } from '@/components/storefront/StoreHero';
import { StoreFilterBar } from '@/components/storefront/StoreFilterBar';
import { StoreDishCard } from '@/components/storefront/StoreDishCard';
import { StoreFloatingCart } from '@/components/storefront/StoreFloatingCart';
import { StoreCheckoutModal, type CheckoutPayload } from '@/components/storefront/StoreCheckoutModal';
import { OrderTracker, type TrackingInfo } from '@/components/storefront/OrderTracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, UtensilsCrossed, Bike, Clock } from 'lucide-react';

const TRACKING_KEY = 'xr_last_order';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [fastingOnly, setFastingOnly] = useState<boolean>(false);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [lastOrder, setLastOrder] = useState<TrackingInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const { language, toggleLanguage, getText, t } = useLanguage();

  const loadMenu = useCallback(() => {
    return api<{ success: boolean; categories: Array<Category & { items?: MenuItem[] }> }>('/menu')
      .then((res) => {
        if (res.success && res.categories) {
          const flatItems: MenuItem[] = [];
          const cats: Category[] = [];
          res.categories.forEach((c) => {
            cats.push({ _id: c._id, name: c.name, slug: c.slug, icon: c.icon, order: c.order });
            if (c.items) flatItems.push(...c.items);
          });
          setCategories(cats);
          setItems(flatItems);
          setLoadError('');
        }
      })
      .catch((err: Error) => {
        setLoadError(err.message || 'Could not load the menu');
      })
      .finally(() => setLoading(false));
  }, []);

  const loadSettings = useCallback(() => {
    return api<{ success: boolean; setting: RestaurantSetting }>('/settings')
      .then((res) => {
        if (res.success) setSettings(res.setting);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadMenu();
    loadSettings();
  }, [loadMenu, loadSettings]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TRACKING_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLastOrder(JSON.parse(raw) as TrackingInfo);
    } catch {
      window.localStorage.removeItem(TRACKING_KEY);
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const leave = joinRoom('storefront');

    const onMenuUpdated = (payload: { itemId: string; isAvailable: boolean }) => {
      setItems((prev) =>
        prev.map((item) =>
          item._id === payload.itemId ? { ...item, isAvailable: payload.isAvailable } : item
        )
      );
    };

    const onRefreshMenu = () => {
      loadMenu();
      loadSettings();
    };

    socket.on('menu:updated', onMenuUpdated);
    socket.on('settings:updated', onRefreshMenu);

    return () => {
      socket.off('menu:updated', onMenuUpdated);
      socket.off('settings:updated', onRefreshMenu);
      leave();
    };
  }, [loadMenu, loadSettings]);

  useEffect(() => {
    if (!lastOrder) return;
    const socket = getSocket();
    const event = `order:${lastOrder.orderId}`;
    const onUpdate = (payload: { status?: TrackingInfo['status'] }) => {
      if (!payload?.status) return;
      const next = { ...lastOrder, status: payload.status };
      setLastOrder(next);
      window.localStorage.setItem(TRACKING_KEY, JSON.stringify(next));
      setTracking((current) => (current ? next : current));
    };
    socket.on(event, onUpdate);
    return () => {
      socket.off(event, onUpdate);
    };
  }, [lastOrder]);

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = Math.max(0, (prev[id] || 0) + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: updated };
    });
  };

  const totalCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const it = items.find((i) => i._id === id);
    return sum + (it ? it.price * qty : 0);
  }, 0);

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => {
      const it = items.find((i) => i._id === id);
      if (!it) return null;
      return { id, name: getText(it.name), price: it.price, qty };
    })
    .filter((line): line is { id: string; name: string; price: number; qty: number } => !!line);

  const filteredItems = items.filter((it) => {
    const categoryId =
      typeof it.category === 'string' ? it.category : (it.category as { _id?: string })?._id;
    if (activeCategory !== 'all' && categoryId !== activeCategory) return false;
    if (fastingOnly && !it.isFasting) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = it.name.en?.toLowerCase().includes(q) || it.name.am?.includes(searchQuery);
      const descMatch =
        it.description.en?.toLowerCase().includes(q) || it.description.am?.includes(searchQuery);
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });

  const featuredItem = items.find((i) => i.isAvailable) || items[0];

  const handlePlaceOrder = async (data: CheckoutPayload) => {
    setBusy(true);
    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => ({
        menuItemId: id,
        qty,
      }));

      const res = await api<{
        success: boolean;
        order: { _id: string; orderNumber: number; status: TrackingInfo['status']; totalAmount: number };
      }>('/orders', {
        method: 'POST',
        body: {
          type: data.type,
          customer: {
            name: data.customerName,
            phone: data.phone,
            address: data.address,
            notes: data.notes,
          },
          items: orderItems,
          payment: {
            method: data.paymentMethod,
            referenceCode: data.refCode,
            status: 'pending',
          },
        },
      });

      if (res.success && res.order) {
        const info: TrackingInfo = {
          orderId: res.order._id,
          orderNumber: res.order.orderNumber,
          type: data.type,
          status: res.order.status,
          total: res.order.totalAmount,
        };
        window.localStorage.setItem(TRACKING_KEY, JSON.stringify(info));
        setLastOrder(info);
        setTracking(info);
        setCart({});
        setCheckoutModal(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  const closeTracker = () => setTracking(null);

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      <StoreNavbar
        settings={settings}
        categories={categories}
        activeCategory={activeCategory}
        fastingOnly={fastingOnly}
        totalCount={totalCount}
        language={language}
        onSelectCategory={(id) => {
          setActiveCategory(id);
          setFastingOnly(false);
        }}
        onToggleFasting={() => setFastingOnly(!fastingOnly)}
        onToggleLanguage={toggleLanguage}
        onOpenCheckout={() => setCheckoutModal(true)}
        getText={getText}
      />

      {lastOrder && !tracking && (
        <div className="border-b border-emerald-500/20 bg-emerald-500/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs sm:px-6">
            <span className="flex items-center gap-2 text-emerald-300">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              Order #{lastOrder.orderNumber} · {t('liveTracking')}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTracking(lastOrder)}
              className="h-7 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20"
            >
              {t('trackOrder')}
            </Button>
          </div>
        </div>
      )}

      <StoreHero
        featuredItem={featuredItem}
        onOrderNow={(itemId) => updateCart(itemId, 1)}
        getText={getText}
      />

      <StoreFilterBar
        categories={categories}
        activeCategory={activeCategory}
        fastingOnly={fastingOnly}
        searchQuery={searchQuery}
        onSelectCategory={(id) => {
          setActiveCategory(id);
          setFastingOnly(false);
        }}
        onToggleFasting={() => setFastingOnly(!fastingOnly)}
        onSearchChange={setSearchQuery}
        getText={getText}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 pb-32 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-[#F8FAFC]">
              {activeCategory === 'all'
                ? 'Explore the menu'
                : getText(categories.find((c) => c._id === activeCategory)?.name)}
            </h2>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
              {fastingOnly ? ' · fasting friendly' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#F59E0B]" /> 30–45 min
            </span>
            <span className="flex items-center gap-1.5">
              <Bike className="h-3.5 w-3.5 text-[#F59E0B]" /> Addis delivery
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl border border-white/5 bg-[#171821]"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <p className="text-sm font-bold text-rose-400">{loadError}</p>
            <Button onClick={() => loadMenu()} className="mt-4" variant="outline">
              Try again
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#171821] p-12 text-center">
            <span className="text-5xl">🍽️</span>
            <h3 className="mt-4 text-lg font-black text-[#F8FAFC]">No dishes found</h3>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Try a different category, search term, or turn off the fasting filter.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFastingOnly(false);
                setActiveCategory('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <StoreDishCard
                key={item._id}
                item={item}
                quantity={cart[item._id] || 0}
                onUpdateQuantity={(delta) => updateCart(item._id, delta)}
                getText={getText}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 bg-[#14151D]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F59E0B] text-[#0F1015]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#F8FAFC]">
                {getText(settings?.name) || 'X-RESTORANT'}
              </p>
              <p className="text-[10px] text-[#64748B]">
                {getText(settings?.intro) || 'Fresh Ethiopian flavors, delivered hot.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Open now</Badge>
            {settings?.wifiName && (
              <span className="text-[10px] text-[#64748B]">WiFi: {settings.wifiName}</span>
            )}
          </div>
        </div>
      </footer>

      <StoreFloatingCart
        totalCount={totalCount}
        totalPrice={totalPrice}
        onOpenCheckout={() => setCheckoutModal(true)}
      />

      <StoreCheckoutModal
        isOpen={checkoutModal}
        lines={cartLines}
        totalPrice={totalPrice}
        settings={settings}
        busy={busy}
        onClose={() => setCheckoutModal(false)}
        onSubmit={handlePlaceOrder}
      />

      {tracking && <OrderTracker tracking={tracking} onClose={closeTracker} />}
    </div>
  );
}
