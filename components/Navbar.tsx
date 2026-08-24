'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileSpreadsheet, LogIn, LogOut, User, Disc } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // 1. Initial check Supabase session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || session.user.id.slice(0, 8),
          });
          return;
        }
      } catch (e) {
        console.warn('Failed to get Supabase session', e);
      }

      // LocalStorage fallback
      const storedUser = localStorage.getItem('rg_stats_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ id: 'admin', name: storedUser });
        }
      } else {
        setUser(null);
      }
    };

    getSession();

    // 2. Listen to Supabase Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || session.user.id.slice(0, 8),
        });
      } else {
        const storedUser = localStorage.getItem('rg_stats_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser({ id: 'admin', name: storedUser });
          }
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out', e);
    }
    localStorage.removeItem('rg_stats_user');
    setUser(null);
    router.push('/');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 text-zinc-100 hover:text-white transition">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Disc className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">RG STATS</span>
            <span className="text-[10px] text-zinc-500 block -mt-1 font-normal">Sound Game Archives</span>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">総合ダッシュボード</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">CSVインポート / 管理</span>
          </Link>

          {/* User Auth Status Area */}
          {user ? (
            <div className="flex items-center space-x-2 border-l border-zinc-800 pl-3 ml-2">
              <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded text-xs text-zinc-300">
                <User className="w-3 h-3 text-zinc-400" />
                <span className="font-medium text-zinc-200">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="ログアウト"
                className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition ml-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ログイン</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
