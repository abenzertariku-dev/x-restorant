'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (
    credentials: string | { username?: string; password?: string; pin?: string },
    requestedRole?: Role
  ) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if session token exists
    api<{ success: boolean; user: User }>('/auth/me')
      .then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (
    credentials: string | { username?: string; password?: string; pin?: string },
    requestedRole?: Role
  ): Promise<User> => {
    const payload =
      typeof credentials === 'string'
        ? { pin: credentials, role: requestedRole }
        : { ...credentials, role: requestedRole };

    const res = await api<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: payload,
    });

    if (res.success && res.user) {
      setUser(res.user);

      // Role-based auto redirection
      switch (res.user.role) {
        case 'kitchen':
          router.push('/kitchen');
          break;
        case 'waiter':
          router.push('/waiter');
          break;
        case 'cashier':
          router.push('/cashier');
          break;
        case 'driver':
          router.push('/driver');
          break;
        case 'admin':
        case 'manager':
          router.push('/admin');
          break;
        default:
          router.push('/');
      }
      return res.user;
    }
    throw new Error('Login failed');
  };

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
