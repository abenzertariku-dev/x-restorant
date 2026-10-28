'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { MenuItem, Category, RestaurantSetting } from '@/types';
import { StoreNavbar } from '@/components/storefront/StoreNavbar';
import { StoreHero } from '@/components/storefront/StoreHero';
import { StoreFilterBar } from '@/components/storefront/StoreFilterBar';
import { StoreDishCard } from '@/components/storefront/StoreDishCard';
import { StoreFloatingCart } from '@/components/storefront/StoreFloatingCart';
import { StoreCheckoutModal } from '@/components/storefront/StoreCheckoutModal';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [fastingOnly, setFastingOnly] = useState<boolean>(false);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [orderDone, setOrderDone] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const { language, toggleLanguage, getText } = useLanguage();

  useEffect(() => {
    api<{ success: boolean; categories: any }>('/menu')
      .then((res) => {
        if (res.success && res.categories) {
          const flatItems: MenuItem[] = [];
          const cats: Category[] = [];
          res.categories.forEach((c: any) => {
            cats.push({ _id: c._id, name: c.name, slug: c.slug, icon: c.icon, order: c.order });
            if (c.items) flatItems.push(...c.items);
          });
          setCategories(cats);
          setItems(flatItems);
        }
      })
      .catch(() => {});

    api<{ success: boolean; setting: RestaurantSetting }>('/settings')
      .then((res) => {
        if (res.success) setSettings(res.setting);
      })
      .catch(() => {});
  }, []);

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

  const filteredItems = items.filter((it) => {
    if (activeCategory !== 'all' && (it.category as any)?._id !== activeCategory && it.category !== activeCategory) {
      return false;
    }
    if (fastingOnly && !it.isFasting) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = it.name.en?.toLowerCase().includes(q) || it.name.am?.includes(q);
      const descMatch = it.description.en?.toLowerCase().includes(q) || it.description.am?.includes(q);
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });

  const featuredItem = items.find((i) => i.isAvailable) || items[0];

  const handlePlaceOrder = async (data: {
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: 'telebirr' | 'cbe_transfer' | 'cash';
    refCode: string;
  }) => {
    setBusy(true);
    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const it = items.find((i) => i._id === id);
        return {
          menuItemId: id,
          qty,
          name: it?.name,
          price: it?.price,
        };
      });

      const res = await api<{ success: boolean; order: any }>('/orders', {
        method: 'POST',
        body: {
          type: 'delivery',
          customer: {
            name: data.customerName,
            phone: data.phone,
            address: data.address,
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
        setCart({});
        setCheckoutModal(false);
        setOrderDone(res.order.orderNumber);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* Top Navbar */}
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

      {/* Hero Showcase */}
      <StoreHero
        featuredItem={featuredItem}
        onOrderNow={(itemId) => updateCart(itemId, 1)}
        getText={getText}
      />

      {/* Order Complete Notification Banner */}
      {orderDone && (
        <div className="mx-auto my-6 max-w-md rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-400 shadow-sm">
          <span className="text-4xl">🎉</span>
          <h3 className="mt-2 text-2xl font-black text-[#F8FAFC]">Order Placed!</h3>
          <p className="mt-1 text-sm text-[#CBD5E1]">
            Order #{orderDone} received. Our kitchen is preparing your dishes!
          </p>
          <Button
            type="button"
            onClick={() => setOrderDone(null)}
            className="mt-4 rounded-xl bg-[#F59E0B] px-6 py-2 text-xs font-black uppercase text-[#0F1015] shadow-md hover:bg-[#FBBF24]"
          >
            Order More
          </Button>
        </div>
      )}

      {/* Category Pills & Search Filter */}
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

      {/* Menu Cards Grid */}
      <main className="mx-auto max-w-6xl px-4 py-8 pb-32 sm:px-6">
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
      </main>

      {/* Floating Cart Bar */}
      <StoreFloatingCart
        totalCount={totalCount}
        totalPrice={totalPrice}
        onOpenCheckout={() => setCheckoutModal(true)}
      />

      {/* Checkout Modal */}
      <StoreCheckoutModal
        isOpen={checkoutModal}
        totalPrice={totalPrice}
        settings={settings}
        busy={busy}
        onClose={() => setCheckoutModal(false)}
        onSubmit={handlePlaceOrder}
      />
    </div>
  );
}
