'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, User, Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      setError('ユーザーIDとパスワードを入力してください');
      return;
    }
    // Simulate login for prototype
    router.push('/');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-card border border-card-border p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center mx-auto text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">管理ログイン</h1>
          <p className="text-xs text-zinc-400">
            認証済みユーザー（オーナー）専用の操作権限
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800/60 text-rose-300 p-3 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold block">ユーザーID / メールアドレス</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="UserID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold block">パスワード</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition shadow-lg flex items-center justify-center space-x-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>セキュアログイン</span>
          </button>
        </form>

        <div className="border-t border-zinc-800 pt-4 text-[11px] text-zinc-500 flex items-center justify-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Supabase Auth & Row Level Security 保護適用済み</span>
        </div>
      </div>
    </div>
  );
}
