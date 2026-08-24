'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { INITIAL_GAMES, MOCK_PLAY_RECORDS } from '@/lib/mockData';
import { ArrowLeft, Search, Plus, FileEdit, CheckCircle2 } from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const game = INITIAL_GAMES.find(g => g.id === gameId) || INITIAL_GAMES[0];

  const [search, setSearch] = useState('');
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
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              {game.device}
            </span>
            <h1 className="text-xl font-bold text-zinc-100">{game.name}</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            識別名: <span className="font-mono text-zinc-400">{game.sheetName}</span>
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center space-x-3">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{game.apTerm}</span>
            <span className="text-lg font-bold text-zinc-200 num-tabular">{game.apCount.toLocaleString()}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{game.maxTerm}</span>
            <span className="text-lg font-bold text-zinc-300 num-tabular">{game.maxCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Table Toolbar / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="曲名・コンポーザーで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="flex bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs">
            {(['All', 'AP', 'MAX'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setApFilter(filter)}
                className={`px-2.5 py-1 rounded transition ${
                  apFilter === filter ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter === 'All' ? '全曲' : filter === 'AP' ? game.apTerm : game.maxTerm}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center justify-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-1.5 rounded text-xs font-medium transition">
          <Plus className="w-3.5 h-3.5" />
          <span>新しいプレイ記録を追加</span>
        </button>
      </div>

      {/* Detailed Play Records Table */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-medium uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">No.</th>
                <th className="py-2.5 px-4">楽曲タイトル</th>
                <th className="py-2.5 px-3">難易度</th>
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">譜面定数</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-4">Score</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">MAX-</th>
                <th className="py-2.5 px-3 text-center">{game.apTerm}</th>
                <th className="py-2.5 px-4">コンポーザー / 備考</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-zinc-500">
                    登録されているプレイ記録がありません。「新しいプレイ記録を追加」またはCSVから一括インポートできます。
                  </td>
                </tr>
              ) : (
                records.map((rec, index) => (
                  <tr key={rec.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-zinc-500 num-tabular">{index + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-zinc-100">{rec.songTitle}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {rec.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-zinc-300 num-tabular">{rec.level}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400 num-tabular">{rec.constantChart ?? '-'}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400 num-tabular">{rec.notes ? rec.notes.toLocaleString() : '-'}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-zinc-100 num-tabular">{rec.score.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {rec.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400 num-tabular">{rec.maxMinus !== undefined ? `-${rec.maxMinus}` : '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      {rec.isAp ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-200 border border-zinc-700">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-zinc-400" /> AP
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400 truncate max-w-xs">
                      {rec.customAttributes?.composer || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button className="text-zinc-500 hover:text-zinc-200 p-1 transition">
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
