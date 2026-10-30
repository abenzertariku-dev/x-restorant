'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/types';
import { api, getToken, setToken } from '@/lib/api';

interface LoginCredentials {
  username?: string;
  password?: string;
  pin?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (credentials: string | LoginCredentials, requestedRole?: Role) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const roleHome = (role?: Role | null): string => {
  switch (role) {
    case 'kitchen':
      return '/kitchen';
    case 'waiter':
      return '/waiter';
    case 'cashier':
      return '/cashier';
    case 'driver':
      return '/driver';
    case 'manager':
      return '/manager';
    case 'admin':
      return '/admin';
    default:
      return '/api/staff';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await api<{ success: boolean; user: User }>('/auth/me');
        if (!cancelled && res.success && res.user) setUser(res.user);
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      credentials: string | LoginCredentials,
      requestedRole?: Role
    ): Promise<User> => {
      const payload =
        typeof credentials === 'string'
          ? { pin: credentials, role: requestedRole }
          : { ...credentials, role: requestedRole };

      const res = await api<{ success: boolean; user: User; token?: string }>('/auth/login', {
        method: 'POST',
        body: payload,
      });

      if (!res.success || !res.user) throw new Error('Login failed');

      if (res.token) setToken(res.token);
      setUser(res.user);
      router.push(roleHome(res.user.role));
      return res.user;
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network failures while logging out locally.
    } finally {
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const hasRole = useCallback(
    (...roles: Role[]) => !!user && roles.includes(user.role),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      hasRole,
    }),
    [user, loading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
