'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { INITIAL_GAMES, MOCK_PLAY_RECORDS } from '@/lib/mockData';
import { ArrowLeft, Award, Zap, Search, Filter, Plus, FileEdit, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const game = INITIAL_GAMES.find(g => g.id === gameId) || INITIAL_GAMES[0];

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [apFilter, setApFilter] = useState<'All' | 'AP' | 'MAX'>('All');

  // Filter records
  const records = MOCK_PLAY_RECORDS.filter(r => {
    const matchesSearch = r.songTitle.toLowerCase().includes(search.toLowerCase()) ||
                          (r.customAttributes?.composer || '').toLowerCase().includes(search.toLowerCase());
    const matchesAp = apFilter === 'All' || (apFilter === 'AP' && r.isAp) || (apFilter === 'MAX' && r.isMax);
    return matchesSearch && matchesAp;
  });

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div>
        <Link href="/" className="inline-flex items-center space-x-1 text-xs text-zinc-400 hover:text-zinc-200 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>総合ダッシュボードへ戻る</span>
        </Link>
      </div>

      {/* Game Header Banner */}
      <div className="bg-card border border-card-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              game.device === 'Arcade'
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50'
            }`}>
              {game.device}
            </span>
            <h1 className="text-2xl font-extrabold text-white">{game.name}</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            シート識別名: <span className="font-mono text-zinc-300">{game.sheetName}</span>
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center space-x-4">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{game.apTerm}</span>
            <span className="text-xl font-extrabold text-amber-400 num-tabular">{game.apCount.toLocaleString()}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{game.maxTerm}</span>
            <span className="text-xl font-extrabold text-blue-400 num-tabular">{game.maxCount.toLocaleString()}</span>
          </div>
          {game.specialMaxTerm && (
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-center">
              <span className="text-[10px] text-zinc-500 block truncate">{game.specialMaxTerm}</span>
              <span className="text-xl font-extrabold text-emerald-400 num-tabular">{game.specialMaxCount || 0}</span>
            </div>
          )}
        </div>
      </div>

      {/* Table Toolbar / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-card-border p-4 rounded-xl">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="曲名・コンポーザーで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            {(['All', 'AP', 'MAX'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setApFilter(filter)}
                className={`px-2.5 py-1 rounded-md transition ${
                  apFilter === filter ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter === 'All' ? '全曲' : filter === 'AP' ? game.apTerm : game.maxTerm}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition">
          <Plus className="w-4 h-4" />
          <span>新しいプレイ記録を追加</span>
        </button>
      </div>

      {/* Detailed Play Records Table */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">楽曲タイトル</th>
                <th className="py-3 px-3">難易度</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">譜面定数</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-3">Grade</th>
                <th className="py-3 px-3">MAX-</th>
                <th className="py-3 px-3 text-center">{game.apTerm}</th>
                <th className="py-3 px-4">コンポーザー / 備考</th>
                <th className="py-3 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {records.map((rec, index) => (
                <tr key={rec.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-500 num-tabular">{index + 1}</td>
                  <td className="py-3 px-4 font-bold text-white">{rec.songTitle}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {rec.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-zinc-300 num-tabular">{rec.level}</td>
                  <td className="py-3 px-3 font-mono text-zinc-400 num-tabular">{rec.constantChart ?? '-'}</td>
                  <td className="py-3 px-3 font-mono text-zinc-400 num-tabular">{rec.notes ? rec.notes.toLocaleString() : '-'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-400 num-tabular">{rec.score.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      {rec.grade}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-rose-400 num-tabular">{rec.maxMinus !== undefined ? `-${rec.maxMinus}` : '-'}</td>
                  <td className="py-3 px-3 text-center">
                    {rec.isAp ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> AP
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 truncate max-w-xs">
                    {rec.customAttributes?.composer || '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-zinc-500 hover:text-zinc-200 p-1 transition">
                      <FileEdit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
