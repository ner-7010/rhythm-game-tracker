'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, Mail, Shield, AlertCircle, Loader2, Info, Server } from 'lucide-react';
import { supabase, supabaseUrl, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('Supabaseの接続情報（NEXT_PUBLIC_SUPABASE_URL または KEY）が環境変数に設定されていません。VercelのEnvironment Variables設定を確認してください。');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (authError) {
          if (authError.message === 'Invalid login credentials') {
            setError('メールアドレスまたはパスワードが正しくありません');
          } else if (authError.message.includes('fetch') || authError.message.includes('NetworkError')) {
            setError(`Supabaseへの接続に失敗しました (${authError.message})。APIキーまたはURLが正しいかご確認ください。`);
          } else {
            setError(authError.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const userInfo = { id: data.user.id, name: data.user.email?.split('@')[0] || data.user.id };
          localStorage.setItem('rg_stats_user', JSON.stringify(userInfo));
          window.dispatchEvent(new Event('storage'));
          router.push('/');
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (authError) {
          setError(authError.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          const userInfo = { id: data.user!.id, name: data.user!.email?.split('@')[0] || data.user!.id };
          localStorage.setItem('rg_stats_user', JSON.stringify(userInfo));
          window.dispatchEvent(new Event('storage'));
          router.push('/');
        } else {
          setMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。');
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
        setError('【Failed to fetch エラー】Supabase API への通信が失敗しました。Vercel の Environment Variables に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が正しく設定され、再デプロイされているかご確認ください。');
      } else {
        setError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-[#121215] border border-zinc-800 p-8 rounded-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-300">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-zinc-100">
            {mode === 'login' ? '管理ログイン' : '新規アカウント登録'}
          </h1>
          <p className="text-xs text-zinc-400">
            {mode === 'login' ? 'Supabase Auth によるクラウド同期アクセス' : 'Supabase Auth に新しいユーザーを作成'}
          </p>
        </div>

        {!isConfigured && (
          <div className="bg-amber-950/40 border border-amber-800 text-amber-300 p-3 rounded text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>環境変数が読み込めていません</span>
            </div>
            <p className="text-[11px] text-amber-400/90 leading-relaxed">
              Vercel の「Settings」>「Environment Variables」に <code>NEXT_PUBLIC_SUPABASE_URL</code> と <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> が設定されているか確認し、設定後に <strong>Redeploy（再デプロイ）</strong> を実行してください。
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 rounded text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-3 rounded text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium block">メールアドレス</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded pl-9 pr-3 py-2 focus:outline-none focus:border-zinc-600"
                required
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
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-100 font-medium py-2 rounded border border-zinc-700 transition flex items-center justify-center space-x-2 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{mode === 'login' ? 'ログイン' : 'アカウントを作成'}</span>
          </button>
        </form>

        <div className="flex justify-between items-center text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setMessage('');
            }}
            className="hover:text-zinc-200 transition underline text-[11px]"
          >
            {mode === 'login' ? '新規アカウント登録はこちら' : 'ログイン画面に戻る'}
          </button>
          
          <div className="flex items-center space-x-1 text-[11px] text-zinc-500" title={`Endpoint: ${supabaseUrl}`}>
            <Server className="w-3 h-3 text-zinc-400" />
            <span className="truncate max-w-[120px]">
              {isConfigured ? 'Supabase 接続済' : '未設定 (Mock)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

