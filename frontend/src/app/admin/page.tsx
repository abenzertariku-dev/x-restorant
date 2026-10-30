'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { AuthGuard } from '@/components/shared/AuthGuard';
import {
  MenuItem,
  Category,
  User,
  RestaurantSetting,
  Order,
  DishForm,
  Role,
} from '@/types';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { MenuCatalogTab } from '@/components/admin/MenuCatalogTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { StaffTab } from '@/components/admin/StaffTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { AddDishModal } from '@/components/admin/AddDishModal';
import { Loader2, AlertTriangle } from 'lucide-react';

type AdminTab = 'analytics' | 'menu' | 'orders' | 'staff' | 'settings';

type CategoryWithItems = Category & { items: MenuItem[] };

const emptyDish: DishForm = {
  nameEn: '',
  nameAm: '',
  descEn: '',
  descAm: '',
  price: '',
  categoryId: '',
  spiceLevel: 'None',
  isFasting: false,
  imageUrl: '',
  prepTimeMinutes: '15',
  isAvailable: true,
};

function categoryIdOf(item: MenuItem): string {
  return typeof item.category === 'string' ? item.category : item.category?._id || '';
}

export default function AdminPage() {
  return (
    <AuthGuard roles={['admin']}>
      <AdminDashboard />
    </AuthGuard>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>('analytics');
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [itemModal, setItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<DishForm>(emptyDish);
  const [savingItem, setSavingItem] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);

  const loadMenu = useCallback(async () => {
    const res = await api<{ success: boolean; categories: CategoryWithItems[] }>('/menu');
    if (res.success) setCategories(res.categories);
  }, []);

  const loadOrders = useCallback(async () => {
    const res = await api<{ success: boolean; orders: Order[] }>('/orders');
    if (res.success) setOrders(res.orders);
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const res = await api<{ success: boolean; staff: User[] }>('/auth/staff');
      if (res.success) setStaff(res.staff);
    } catch {
      setStaff([]);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await api<{ success: boolean; setting: RestaurantSetting }>('/settings');
    if (res.success) setSettings(res.setting);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadMenu(), loadOrders(), loadStaff(), loadSettings()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurant data.');
    } finally {
      setLoading(false);
    }
  }, [loadMenu, loadOrders, loadStaff, loadSettings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const socket = getSocket();
    joinRoom('admin');

    const refreshOrders = () => loadOrders();
    const refreshMenu = () => loadMenu();
    const events = ['order:created', 'order:updated', 'order:new', 'order:settled'];
    events.forEach((event) => socket.on(event, refreshOrders));
    socket.on('menu:updated', refreshMenu);
    socket.on('settings:updated', loadSettings);

    return () => {
      events.forEach((event) => socket.off(event, refreshOrders));
      socket.off('menu:updated', refreshMenu);
      socket.off('settings:updated', loadSettings);
    };
  }, [loadOrders, loadMenu, loadSettings]);

  const activeOrders = orders.filter((o) => !['settled', 'cancelled'].includes(o.status));

  const openAdd = (categoryId = '') => {
    setEditingItem(null);
    setItemForm({
      ...emptyDish,
      categoryId: categoryId || categories[0]?._id || '',
    });
    setItemModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      nameEn: item.name.en,
      nameAm: item.name.am,
      descEn: item.description?.en || '',
      descAm: item.description?.am || '',
      price: String(item.price),
      categoryId: categoryIdOf(item),
      spiceLevel: item.spiceLevel || 'None',
      isFasting: !!item.isFasting,
      imageUrl: item.imageUrl || '',
      prepTimeMinutes: String(item.prepTimeMinutes || 15),
      isAvailable: item.isAvailable !== false,
    });
    setItemModal(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    setError('');
    try {
      const body = {
        name: { en: itemForm.nameEn.trim(), am: itemForm.nameAm.trim() },
        description: { en: itemForm.descEn.trim(), am: itemForm.descAm.trim() },
        price: Number(itemForm.price) || 0,
        category: itemForm.categoryId || categories[0]?._id,
        spiceLevel: itemForm.spiceLevel,
        isFasting: itemForm.isFasting,
        isAvailable: itemForm.isAvailable,
        imageUrl: itemForm.imageUrl.trim(),
        prepTimeMinutes: Number(itemForm.prepTimeMinutes) || 15,
      };

      if (editingItem) {
        await api(`/menu/items/${editingItem._id}`, { method: 'PUT', body });
      } else {
        await api('/menu/items', { method: 'POST', body });
      }

      setItemModal(false);
      setEditingItem(null);
      setItemForm(emptyDish);
      await loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dish.');
    } finally {
      setSavingItem(false);
    }
  };

  const toggleStock = async (itemId: string) => {
    try {
      await api(`/menu/items/${itemId}/toggle`, { method: 'PATCH' });
      await loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock.');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm('Remove this dish from the menu permanently?')) return;
    try {
      await api(`/menu/items/${itemId}`, { method: 'DELETE' });
      await loadMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dish.');
    }
  };

  const createStaff = async (payload: {
    name: string;
    role: Role;
    pin: string;
    phone: string;
  }) => {
    setCreatingStaff(true);
    try {
      await api('/auth/staff', { method: 'POST', body: payload });
      await loadStaff();
    } finally {
      setCreatingStaff(false);
    }
  };

  const saveSettings = async (payload: Partial<RestaurantSetting>) => {
    await api('/settings', { method: 'PUT', body: payload });
    await loadSettings();
  };

  const voidOrder = async (orderId: string) => {
    try {
      await api(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: 'cancelled' },
      });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F1015] text-[#CBD5E1] selection:bg-[#F59E0B] selection:text-[#0F1015]">
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

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AdminHeader
          tab={tab}
          settings={settings}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewItemModal={() => openAdd()}
        />

        <main className="min-w-0 flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="cursor-pointer text-rose-300 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#94A3B8]">
              <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading operations…</p>
            </div>
          ) : (
            <>
              {tab === 'analytics' && (
                <OverviewTab
                  orders={orders}
                  settings={settings}
                  onOpenOrders={() => setTab('orders')}
                  onOpenMenu={() => setTab('menu')}
                  onOpenSettings={() => setTab('settings')}
                />
              )}

              {tab === 'menu' && (
                <MenuCatalogTab
                  categories={categories}
                  selectedCatId={selectedCatId}
                  setSelectedCatId={setSelectedCatId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onToggleStock={toggleStock}
                  onDelete={deleteItem}
                  onEdit={openEdit}
                  onOpenAddModalForCategory={(catId) => openAdd(catId)}
                />
              )}

              {tab === 'orders' && <OrdersTab orders={orders} onVoid={voidOrder} />}

              {tab === 'staff' && (
                <StaffTab staff={staff} onCreateStaff={createStaff} creating={creatingStaff} />
              )}

              {tab === 'settings' && <SettingsTab settings={settings} onSave={saveSettings} />}
            </>
          )}
        </main>
      </div>

      <AddDishModal
        open={itemModal}
        onOpenChange={(open) => {
          setItemModal(open);
          if (!open) setEditingItem(null);
        }}
        categories={categories}
        itemForm={itemForm}
        setItemForm={setItemForm}
        onSubmit={saveItem}
        editing={!!editingItem}
        busy={savingItem}
      />
    </div>
  );
}
