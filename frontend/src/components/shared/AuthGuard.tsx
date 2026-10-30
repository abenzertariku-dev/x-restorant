'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, roleHome } from '@/context/AuthContext';
import type { Role } from '@/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  roles?: Role[];
  children: React.ReactNode;
}

export function AuthGuard({ roles, children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace(roleHome(user.role));
    }
  }, [loading, user, roles, router]);

  if (loading || !user || (roles && !roles.includes(user.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F1015]">
        <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
          <Loader2 className="h-7 w-7 animate-spin text-[#F59E0B]" />
          <p className="text-xs font-bold uppercase tracking-widest">Verifying staff session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
