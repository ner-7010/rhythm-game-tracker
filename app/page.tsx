'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_GAMES, MOCK_GROWTH_STATS } from '@/lib/mockData';
import { GameTitle } from '@/lib/types';
import { Award, Zap, Gamepad2, TrendingUp, Calendar, ChevronRight, Search, Plus, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function DashboardPage() {
  const [games, setGames] = useState<GameTitle[]>(INITIAL_GAMES);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [filterDevice, setFilterDevice] = useState<'All' | 'Mobile' | 'Arcade'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // New Game Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newApTerm, setNewApTerm] = useState('ALL PERFECT');
  const [newMaxTerm, setNewMaxTerm] = useState('MAX / 理論値');
  const [newDevice, setNewDevice] = useState<'Mobile' | 'Arcade'>('Mobile');

  const stats = MOCK_GROWTH_STATS[period];
  const totalAp = games.reduce((acc, g) => acc + g.apCount, 0);
  const totalMax = games.reduce((acc, g) => acc + g.maxCount, 0);

  const filteredGames = games.filter(g => {
    const matchesDevice = filterDevice === 'All' || g.device === filterDevice;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.apTerm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDevice && matchesSearch;
  });

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) return;

    const id = newGameName.toLowerCase().replace(/[^a-z0-9]/g, '') || `game-${Date.now()}`;
    const newGame: GameTitle = {
      id,
      name: newGameName,
      sheetName: `${newApTerm.slice(0, 2)}[${newGameName}]`,
      apCount: 0,
      maxCount: 0,
      apTerm: newApTerm || 'AP',
      maxTerm: newMaxTerm || 'MAX',
      device: newDevice
    };

    setGames([...games, newGame]);
    setNewGameName('');
    setIsModalOpen(false);
  };

  // Custom Tooltip for Stacked Chart to display cumulative totals nicely
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const ap = payload.find((p: any) => p.dataKey === 'apCount')?.value || 0;
      const fc = payload.find((p: any) => p.dataKey === 'fcCount')?.value || 0;
      const clear = payload.find((p: any) => p.dataKey === 'clearCount')?.value || 0;
      const failed = payload.find((p: any) => p.dataKey === 'failedCount')?.value || 0;

      const totalFc = ap + fc;
      const totalClear = totalFc + clear;
      const totalPlayed = totalClear + failed;

      return (
        <div className="bg-[#18181b] border border-zinc-700 p-3 rounded text-xs space-y-1.5 shadow-xl">
          <p className="font-bold text-zinc-200 border-b border-zinc-800 pb-1">{label}</p>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between space-x-4 text-zinc-100">
              <span>AP (完全精度):</span>
              <span className="font-bold">{ap} 曲</span>
            </div>
            <div className="flex justify-between space-x-4 text-zinc-300">
              <span>AP + FC 累積:</span>
              <span className="font-bold">{totalFc} 曲</span>
            </div>
            <div className="flex justify-between space-x-4 text-zinc-400">
              <span>AP + FC + Clear 累積:</span>
              <span className="font-bold">{totalClear} 曲</span>
            </div>
            <div className="flex justify-between space-x-4 text-zinc-500">
              <span>総既プレイ数 (失敗含む):</span>
              <span className="font-bold">{totalPlayed} 曲</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            総合統計ダッシュボード
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            音ゲーのプレイ記録・成長推移を管理・分析
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-1.5 rounded text-xs font-medium transition self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span>新しい音ゲータイトルを追加</span>
        </button>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 AP 達成数</span>
            <Award className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100 num-tabular">
              {totalAp.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">全 {games.length} 機種</span>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 MAX / 理論値</span>
            <Zap className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100 num-tabular">
              {totalMax.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">理論値達成</span>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>登録機種数</span>
            <Gamepad2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-100 num-tabular">
              {games.length} <span className="text-xs font-normal text-zinc-400">機種</span>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">管理中のタイトル</span>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>新規記録数</span>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-200 num-tabular">
              {stats.newTracksCount} <span className="text-xs font-normal text-zinc-400">曲</span>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">推移記録</span>
        </div>
      </div>

      {/* Growth Trend Graph Section - Stacked Area Chart */}
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" /> 成長・リザルト累積推移 (積み上げ)
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              下から「AP」→「AP+FC」→「AP+FC+Clear」→「全既プレイ数」の順に積み上げて表示
            </p>
          </div>
          
          {/* Period Selector Tabs */}
          <div className="flex items-center space-x-1 bg-zinc-900/80 p-1 rounded border border-zinc-800 text-xs self-start sm:self-auto">
            {(['week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded font-medium transition ${
                  period === p ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p === 'week' ? '週の差分' : p === 'month' ? '月の差分' : '年の差分'}
              </button>
            ))}
          </div>
        </div>

        {/* Stacked Quiet Area Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  if (value === 'apCount') return 'AP数';
                  if (value === 'fcCount') return 'FC数 (AP除く)';
                  if (value === 'clearCount') return 'Clear数 (FC除く)';
                  if (value === 'failedCount') return '既プレイ数 (未Clear含む)';
                  return value;
                }}
              />
              {/* Stacked Order: apCount (Bottom) -> fcCount -> clearCount -> failedCount (Top) */}
              <Area type="monotone" dataKey="apCount" stackId="1" stroke="#e4e4e7" fill="#e4e4e7" fillOpacity={0.8} />
              <Area type="monotone" dataKey="fcCount" stackId="1" stroke="#a1a1aa" fill="#a1a1aa" fillOpacity={0.6} />
              <Area type="monotone" dataKey="clearCount" stackId="1" stroke="#71717a" fill="#71717a" fillOpacity={0.4} />
              <Area type="monotone" dataKey="failedCount" stackId="1" stroke="#3f3f46" fill="#3f3f46" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Game Title List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-zinc-400" /> 機種アーカイブ ({filteredGames.length})
            </h2>
          </div>

          {/* Search & Filter bar */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="機種名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-zinc-600 w-40 sm:w-48"
              />
            </div>
            
            <div className="flex bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs">
              {(['All', 'Mobile', 'Arcade'] as const).map(device => (
                <button
                  key={device}
                  onClick={() => setFilterDevice(device)}
                  className={`px-2.5 py-1 rounded transition ${
                    filterDevice === device ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {device === 'All' ? 'すべて' : device}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              className="group bg-[#121215] border border-zinc-800/80 hover:border-zinc-600 rounded-lg p-4 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {game.device}
                    </span>
                    <h3 className="font-bold text-zinc-100 text-sm group-hover:text-white transition-colors">
                      {game.name}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">{game.sheetName}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block truncate" title={game.apTerm}>
                    {game.apTerm}
                  </span>
                  <span className="font-bold text-zinc-200 text-sm num-tabular">
                    {game.apCount.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">曲</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block truncate" title={game.maxTerm}>
                    {game.maxTerm}
                  </span>
                  <span className="font-bold text-zinc-300 text-sm num-tabular">
                    {game.maxCount.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">曲</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Modal for adding a new game title */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121215] border border-zinc-700 w-full max-w-md rounded-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">新規音ゲータイトルの追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGame} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">ゲームタイトル名</label>
                <input
                  type="text"
                  placeholder="例: maimai, プロセカ, CHUNITHM..."
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">AP相当の用語 (例: ALL PERFECT, Pure Memory)</label>
                <input
                  type="text"
                  value={newApTerm}
                  onChange={(e) => setNewApTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">MAX/理論値相当の用語 (例: 理論値, TP 100)</label>
                <input
                  type="text"
                  value={newMaxTerm}
                  onChange={(e) => setNewMaxTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">デバイス区分</label>
                <select
                  value={newDevice}
                  onChange={(e) => setNewDevice(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="Mobile">Mobile (スマホ・タブレット)</option>
                  <option value="Arcade">Arcade (ゲーセン・AC)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:bg-zinc-800 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium transition"
                >
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
