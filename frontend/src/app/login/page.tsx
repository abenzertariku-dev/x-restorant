'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, roleHome } from '@/context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  Shield,
  UtensilsCrossed,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace(roleHome(user.role));
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await login({ username: username.trim(), password: password.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Access Denied: Invalid credentials');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F6F7F9] p-4 text-[#334155] selection:bg-[#F59E0B] selection:text-[#0F1015]">
      {/* Return to Storefront */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="absolute left-6 top-6"
      >
        <Link href="/" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4 text-[#B45309]" />
          <span>Return to Storefront</span>
        </Link>
      </Button>

      {/* Modern Obsidian Shadcn Card */}
      <Card className="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl border-slate-200">
        {/* Brand Header */}
        <CardHeader className="p-0 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F59E0B] text-[#0F1015] shadow-md shadow-amber-500/20">
            <UtensilsCrossed className="h-7 w-7 stroke-[2.2]" />
          </div>

          <CardTitle className="text-2xl font-black tracking-tight text-[#0F172A]">
            X-RESTORANT
          </CardTitle>
          <CardDescription className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-[#B45309]">
            STAFF MANAGEMENT PORTAL
          </CardDescription>
        </CardHeader>

        {/* Error Alert */}
        {error && (
          <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        {/* Clean Form */}
        <CardContent className="p-0 mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Username or Staff ID
              </label>
              <div className="relative flex items-center">
                <User className="pointer-events-none absolute left-4 h-4 w-4 text-[#94A3B8]" />
                <Input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  placeholder="e.g. admin, waiter, kitchen, cashier"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Password / PIN
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-4 h-4 w-4 text-[#94A3B8]" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#94A3B8] transition hover:text-[#334155] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary Amber Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={busy}
                size="lg"
                className="w-full flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
              >
                <span>{busy ? 'Authenticating…' : 'SIGN IN'}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Button>
            </div>
          </form>

          {/* Security Footnote */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#94A3B8]">
            <Shield className="h-3.5 w-3.5 text-[#B45309]" />
            <span>Encrypted Session · Role-Based Staff Security</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
