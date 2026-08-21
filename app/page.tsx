'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_GAMES, MOCK_GROWTH_STATS, MOCK_PLAY_RECORDS } from '@/lib/mockData';
import { Award, Zap, Gamepad2, TrendingUp, Calendar, ChevronRight, Search, Filter } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [filterDevice, setFilterDevice] = useState<'All' | 'Mobile' | 'Arcade'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = MOCK_GROWTH_STATS[period];

  const totalAp = INITIAL_GAMES.reduce((acc, g) => acc + g.apCount, 0);
  const totalMax = INITIAL_GAMES.reduce((acc, g) => acc + g.maxCount, 0);

  const filteredGames = INITIAL_GAMES.filter(g => {
    const matchesDevice = filterDevice === 'All' || g.device === filterDevice;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.apTerm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDevice && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            総合統計ダッシュボード
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            全21機種・4,000件超のAP/理論値達成ログおよび推移分析
          </p>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 AP 達成数</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white num-tabular">
              {totalAp.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{stats.apDiff}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">全21機種 合計</span>
        </div>

        <div className="bg-card border border-card-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 MAX / 理論値</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white num-tabular">
              {totalMax.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{stats.scoreDiff}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">完全理論値達成</span>
        </div>

        <div className="bg-card border border-card-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>登録機種数</span>
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white num-tabular">
              21 <span className="text-sm font-normal text-zinc-400">機種</span>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Mobile 17 / Arcade 4</span>
        </div>

        <div className="bg-card border border-card-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>新規記録数 ({period === 'week' ? '今週' : period === 'month' ? '今月' : '今年'})</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 num-tabular">
              +{stats.newTracksCount} <span className="text-sm font-normal text-zinc-400">曲</span>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">プレイログ推移</span>
        </div>
      </div>

      {/* Growth Trend Graph Section */}
      <div className="bg-card border border-card-border p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> 成長・AP更新推移グラフ
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">時系列でのAP達成数および理論値推移（差分データ）</p>
          </div>
          
          {/* Period Selector Tabs */}
          <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                period === 'week' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              週の差分
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                period === 'month' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              月の差分
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                period === 'year' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              年の差分
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="apGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Area type="monotone" dataKey="apCount" name="AP累積数" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#apGradient)" />
              <Area type="monotone" dataKey="maxCount" name="理論値累積数" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#maxGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Game Title List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-blue-400" /> 機種別アーカイブ ({filteredGames.length} タイトル)
            </h2>
            <p className="text-xs text-zinc-400">タイトルごとに専用ページで個別の楽曲・APデータ・詳細項目を管理できます</p>
          </div>

          {/* Search & Filter bar */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="機種名・用語で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
              />
            </div>
            
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
              {(['All', 'Mobile', 'Arcade'] as const).map(device => (
                <button
                  key={device}
                  onClick={() => setFilterDevice(device)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterDevice === device ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {device === 'All' ? '全機種' : device}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              className="group bg-card border border-card-border hover:border-zinc-600 rounded-xl p-4 transition-all duration-200 hover:bg-card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      game.device === 'Arcade'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                        : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50'
                    }`}>
                      {game.device}
                    </span>
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      {game.name}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">{game.sheetName}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block truncate" title={game.apTerm}>
                    AP ({game.apTerm})
                  </span>
                  <span className="font-extrabold text-amber-400 text-sm num-tabular">
                    {game.apCount.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">件</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block truncate" title={game.maxTerm}>
                    MAX ({game.maxTerm})
                  </span>
                  <span className="font-extrabold text-blue-400 text-sm num-tabular">
                    {game.maxCount.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">件</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-card border border-card-border p-5 rounded-xl space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> 直近のAP・スコア更新ログ
        </h2>
        <div className="divide-y divide-zinc-800 text-xs">
          {MOCK_PLAY_RECORDS.map(rec => (
            <div key={rec.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                  CHUNITHM
                </span>
                <div>
                  <span className="font-bold text-zinc-100">{rec.songTitle}</span>
                  <span className="text-zinc-500 ml-2">[{rec.difficulty} Lv.{rec.level}]</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-mono text-zinc-300 num-tabular">{rec.score.toLocaleString()}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                  {rec.grade}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
