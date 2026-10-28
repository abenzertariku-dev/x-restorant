'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { MenuItem, Category, User, RestaurantSetting, Order } from '@/types';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { MenuCatalogTab } from '@/components/admin/MenuCatalogTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { StaffTab } from '@/components/admin/StaffTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { AddDishModal } from '@/components/admin/AddDishModal';

export default function AdminPage() {
  const [tab, setTab] = useState<'analytics' | 'menu' | 'orders' | 'staff' | 'settings'>('analytics');
  const [menu, setMenu] = useState<{ categories: Array<Category & { items: MenuItem[] }> }>({
    categories: [],
  });
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New dish modal state
  const [newItemModal, setNewItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({
    nameEn: '',
    nameAm: '',
    descEn: '',
    descAm: '',
    price: '',
    categoryId: '',
    spiceLevel: 'None',
    isFasting: false,
    imageUrl: '',
  });

  const { user, logout } = useAuth();

  const loadData = async () => {
    try {
      const [menuRes, orderRes, staffRes, settingRes] = await Promise.all([
        api<{ success: boolean; categories: any }>('/menu'),
        api<{ success: boolean; orders: Order[] }>('/orders'),
        api<{ success: boolean; staff: User[] }>('/auth/staff').catch(() => ({
          success: false,
          staff: [],
        })),
        api<{ success: boolean; setting: RestaurantSetting }>('/settings'),
      ]);

      if (menuRes.success) setMenu(menuRes);
      if (orderRes.success) setOrders(orderRes.orders);
      if (staffRes.success) setStaff(staffRes.staff);
      if (settingRes.success) setSettings(settingRes.setting);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStock = async (itemId: string) => {
    try {
      await api(`/menu/items/${itemId}/toggle`, { method: 'PATCH' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      await api(`/menu/items/${itemId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/menu/items', {
        method: 'POST',
        body: {
          name: { en: itemForm.nameEn, am: itemForm.nameAm },
          description: { en: itemForm.descEn, am: itemForm.descAm },
          price: parseInt(itemForm.price) || 0,
          category: itemForm.categoryId || menu.categories[0]?._id,
          spiceLevel: itemForm.spiceLevel,
          isFasting: itemForm.isFasting,
          imageUrl: itemForm.imageUrl,
        },
      });
      setNewItemModal(false);
      setItemForm({
        nameEn: '',
        nameAm: '',
        descEn: '',
        descAm: '',
        price: '',
        categoryId: '',
        spiceLevel: 'None',
        isFasting: false,
        imageUrl: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create item');
    }
  };

  const activeOrders = orders.filter(
    (o) => !['settled', 'cancelled'].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#CBD5E1] flex selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* Modular Sidebar */}
      <Sidebar
        tab={tab}
        setTab={setTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeOrdersCount={activeOrders.length}
        settings={settings}
        user={user}
        logout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <AdminHeader
          tab={tab}
          settings={settings}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewItemModal={() => setNewItemModal(true)}
        />

        {/* Dynamic Tab Body */}
        <main className="w-full flex-1 p-6 sm:p-8 space-y-8 min-w-0">
          {tab === 'analytics' && (
            <OverviewTab
              orders={orders}
              settings={settings}
              onViewAllOrders={() => setTab('orders')}
            />
          )}

          {tab === 'menu' && (
            <MenuCatalogTab
              categories={menu.categories}
              selectedCatId={selectedCatId}
              setSelectedCatId={setSelectedCatId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onToggleStock={toggleStock}
              onDelete={deleteItem}
              onOpenAddModalForCategory={(catId) => {
                setItemForm((prev) => ({ ...prev, categoryId: catId }));
                setNewItemModal(true);
              }}
            />
          )}

          {tab === 'orders' && <OrdersTab orders={orders} />}

          {tab === 'staff' && <StaffTab staff={staff} />}

          {tab === 'settings' && <SettingsTab settings={settings} />}
        </main>
      </div>

      {/* New Dish Modal */}
      <AddDishModal
        open={newItemModal}
        onOpenChange={setNewItemModal}
        categories={menu.categories}
        itemForm={itemForm}
        setItemForm={setItemForm}
        onSubmit={handleCreateItem}
      />
    </div>
  );
}
