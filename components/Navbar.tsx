'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileSpreadsheet, Settings, LogIn, Disc } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 text-zinc-100 hover:text-white transition">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <Disc className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">RG STATS</span>
            <span className="text-xs text-zinc-400 block -mt-1 font-normal">Sound Game Archives</span>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">総合ダッシュボード</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">CSVインポート / 管理</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-medium bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition ml-2"
          >
            <LogIn className="w-4 h-4" />
            <span>ログイン</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
