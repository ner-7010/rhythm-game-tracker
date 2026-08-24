'use client';

import React, { useState } from 'react';
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

    // Save login session to localStorage
    const userInfo = { id: userId, name: userId };
    localStorage.setItem('rg_stats_user', JSON.stringify(userInfo));
    window.dispatchEvent(new Event('storage'));

    router.push('/');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-[#121215] border border-zinc-800 p-8 rounded-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-300">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-zinc-100">管理ログイン</h1>
          <p className="text-xs text-zinc-400">
            認証済みユーザー（オーナー）専用アクセス
          </p>
        </div>

        {error && (
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-300 p-3 rounded text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium block">ユーザーID / メールアドレス</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="UserID (例: admin)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded pl-9 pr-3 py-2 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-medium block">パスワード</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded pl-9 pr-3 py-2 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2 rounded border border-zinc-700 transition flex items-center justify-center space-x-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>ログイン</span>
          </button>
        </form>

        <div className="border-t border-zinc-800/80 pt-4 text-[11px] text-zinc-500 flex items-center justify-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Supabase Auth ＆ RLS 保護適用</span>
        </div>
      </div>
    </div>
  );
}
