'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GameTitle, PlayRecord } from '@/lib/types';
import { getStoredGames, getStoredRecords, fetchGamesAsync, fetchRecordsAsync, saveGamesAsync } from '@/lib/storage';
import { Award, Zap, Gamepad2, TrendingUp, Calendar, ChevronRight, Search, Plus, X, BarChart2, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function DashboardPage() {
  const [games, setGames] = useState<GameTitle[]>([]);
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chartMode, setChartMode] = useState<'stacked' | 'gameComparison' | 'singleGame'>('stacked');
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  const [filterDevice, setFilterDevice] = useState<'All' | 'Mobile' | 'Arcade'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // New Game Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newApTerm, setNewApTerm] = useState('ALL PERFECT');
  const [newMaxTerm, setNewMaxTerm] = useState('MAX / 理論値');
  const [newDevice, setNewDevice] = useState<'Mobile' | 'Arcade'>('Mobile');
  const [newHasMax, setNewHasMax] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Initial quick load from local cache
      const cachedGames = getStoredGames();
      const cachedRecords = getStoredRecords();
      setGames(cachedGames);
      setRecords(cachedRecords);
      if (cachedGames.length > 0 && !selectedGameId) {
        setSelectedGameId(cachedGames[0].id);
      }

      // 2. Fetch fresh data from Supabase
      const [freshGames, freshRecords] = await Promise.all([
        fetchGamesAsync(),
        fetchRecordsAsync()
      ]);
      setGames(freshGames);
      setRecords(freshRecords);
      if (freshGames.length > 0 && !selectedGameId) {
        setSelectedGameId(freshGames[0].id);
      }
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live game counts based on active (non-deleted) played records
  const activeRecords = records.filter(r => !r.isDeleted);

  const gamesWithLiveCounts = games.map(g => {
    const gameRecs = activeRecords.filter(r => r.gameId === g.id && r.isPlayed);
    const ap = gameRecs.filter(r => r.isAp).length;
    const max = gameRecs.filter(r => r.isMax).length;
    return {
      ...g,
      apCount: ap || g.apCount,
      maxCount: max || g.maxCount
    };
  });

  const playedRecords = activeRecords.filter(r => r.isPlayed);
  const totalClear = playedRecords.filter(r => r.isClear).length;
  const totalFc = playedRecords.filter(r => r.isFc).length;
  const totalAp = gamesWithLiveCounts.reduce((acc, g) => acc + g.apCount, 0);
  const totalMax = gamesWithLiveCounts.filter(g => g.hasMaxConcept !== false).reduce((acc, g) => acc + g.maxCount, 0);

  const filteredGames = gamesWithLiveCounts.filter(g => {
    const matchesDevice = filterDevice === 'All' || g.device === filterDevice;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.apTerm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDevice && matchesSearch;
  });

  const handleAddGame = async (e: React.FormEvent) => {
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
      device: newDevice,
      hasMaxConcept: newHasMax,
      gradeMasters: [
        { id: 'g0', name: '未プレイ', category: 'Unplayed' },
        ...(newHasMax ? [{ id: 'g1', name: newMaxTerm || '理論値', category: 'MAX' as const }] : []),
        { id: 'g2', name: newApTerm || 'AP', category: 'AP' },
        { id: 'g3', name: 'Full Combo', category: 'FC' },
        { id: 'g4', name: 'Clear', category: 'Clear' },
        { id: 'g5', name: 'Failed', category: 'Failed' }
      ],
      difficultyMasters: [
        { id: 'd1', name: 'MASTER', order: 1 },
        { id: 'd2', name: 'EXPERT', order: 2 },
        { id: 'd3', name: 'ADVANCED', order: 3 },
        { id: 'd4', name: 'BASIC', order: 4 }
      ]
    };

    const updated = [...games, newGame];
    setGames(updated);
    await saveGamesAsync(updated);

    if (!selectedGameId) setSelectedGameId(id);
    setNewGameName('');
    setIsModalOpen(false);
  };

  const targetRecords = chartMode === 'singleGame'
    ? playedRecords.filter(r => r.gameId === selectedGameId)
    : playedRecords;

  const totalMaxRecords = targetRecords.filter(r => r.isMax).length;
  const totalApRecords = targetRecords.filter(r => r.isAp && !r.isMax).length;
  const totalFcRecords = targetRecords.filter(r => r.isFc && !r.isAp && !r.isMax).length;
  const totalClearRecords = targetRecords.filter(r => r.isClear && !r.isFc && !r.isAp && !r.isMax).length;
  const totalFailedRecords = targetRecords.filter(r => !r.isClear).length;

  const chartHistoryData = [
    { date: '過去', maxCount: 0, apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
    { date: '現在', maxCount: totalMaxRecords, apCount: totalApRecords, fcCount: totalFcRecords, clearCount: totalClearRecords, failedCount: totalFailedRecords }
  ];

  const gameComparisonData = [
    {
      date: '現在',
      ...games.reduce((acc, g) => {
        const gPlayed = activeRecords.filter(r => r.gameId === g.id && r.isPlayed);
        acc[`${g.id}_ap`] = gPlayed.filter(r => r.isAp).length;
        acc[`${g.id}_max`] = gPlayed.filter(r => r.isMax).length;
        return acc;
      }, {} as Record<string, number>)
    }
  ];

  const gameColors = [
    { border: '#38bdf8', fill: '#0284c7' },
    { border: '#34d399', fill: '#059669' },
    { border: '#fbbf24', fill: '#d97706' },
    { border: '#c084fc', fill: '#9333ea' },
    { border: '#f43f5e', fill: '#e11d48' },
    { border: '#2dd4bf', fill: '#0d9488' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const max = payload.find((p: any) => p.dataKey === 'maxCount')?.value || 0;
      const ap = payload.find((p: any) => p.dataKey === 'apCount')?.value || 0;
      const fc = payload.find((p: any) => p.dataKey === 'fcCount')?.value || 0;
      const clear = payload.find((p: any) => p.dataKey === 'clearCount')?.value || 0;
      const failed = payload.find((p: any) => p.dataKey === 'failedCount')?.value || 0;

      const totalAp = max + ap;
      const totalFc = totalAp + fc;
      const totalClear = totalFc + clear;
      const totalPlayed = totalClear + failed;

      return (
        <div className="bg-[#18181b] border border-zinc-700 p-3 rounded text-xs space-y-1.5 shadow-xl">
          <p className="font-bold text-zinc-200 border-b border-zinc-800 pb-1">{label}</p>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between space-x-4 text-sky-400 font-bold">
              <span>★ MAX (理論値/頂点):</span>
              <span>{max} 曲</span>
            </div>
            <div className="flex justify-between space-x-4 text-emerald-400 font-bold">
              <span>▲ MAX + AP 累積:</span>
              <span>{totalAp} 曲</span>
            </div>
            <div className="flex justify-between space-x-4 text-purple-300">
              <span>AP + FC 累積:</span>
              <span>{totalFc} 曲</span>
            </div>
            <div className="flex justify-between space-x-4 text-amber-300">
              <span>FC + Clear 累積:</span>
              <span>{totalClear} 曲</span>
            </div>
            <div className="flex justify-between space-x-4 text-slate-400">
              <span>■ 総既プレイ数 (土台):</span>
              <span>{totalPlayed} 曲</span>
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
            全音ゲーのプレイ記録・成長推移をリアルタイム分析
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded text-xs font-medium transition"
            title="クラウドDBから最新データを取得"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>最新データ同期</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-1.5 rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>新しい音ゲータイトルを追加</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 Clear 達成数</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400 num-tabular">
              {totalClear.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">全 {games.length} 機種合計</span>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 FC 達成数</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-400 num-tabular">
              {totalFc.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Full Combo達成</span>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 AP 達成数</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 num-tabular">
              {totalAp.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">All Perfect達成</span>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>総 MAX / 理論値</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-400 num-tabular">
              {totalMax.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">理論値概念あり機種</span>
        </div>
      </div>

      {/* Growth Trend Graph Section */}
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" /> 成長・リザルト累積推移
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {chartMode === 'stacked' && '土台「既プレイ」→「Clear」→「FC」→「AP」→「MAX(頂点)」のシック色分けピラミッド'}
              {chartMode === 'gameComparison' && '各音ゲータイトルごとの AP 達成曲数を比較'}
              {chartMode === 'singleGame' && `${games.find(g => g.id === selectedGameId)?.name || ''} 専用のカテゴリ推移`}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded p-0.5">
              <button
                onClick={() => setChartMode('stacked')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
                  chartMode === 'stacked' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>総合ピラミッド</span>
              </button>
              <button
                onClick={() => setChartMode('gameComparison')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
                  chartMode === 'gameComparison' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BarChart2 className="w-3 h-3" />
                <span>機種別比較</span>
              </button>
              <button
                onClick={() => setChartMode('singleGame')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
                  chartMode === 'singleGame' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Gamepad2 className="w-3 h-3" />
                <span>単一機種</span>
              </button>
            </div>

            {chartMode === 'singleGame' && (
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none"
              >
                {games.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}

            <div className="flex items-center space-x-1 bg-zinc-900/80 p-0.5 rounded border border-zinc-800">
              {(['week', 'month', 'year'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    period === p ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p === 'week' ? '週' : p === 'month' ? '月' : '年'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'gameComparison' ? (
              <LineChart data={gameComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {games.map((g, idx) => (
                  <Line
                    key={g.id}
                    type="monotone"
                    dataKey={`${g.id}_ap`}
                    name={`${g.name} (${g.apTerm})`}
                    stroke={gameColors[idx % gameColors.length].border}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => {
                    if (value === 'failedCount') return '既プレイ (未Clear含む / 土台)';
                    if (value === 'clearCount') return 'Clear';
                    if (value === 'fcCount') return 'FC';
                    if (value === 'apCount') return 'AP';
                    if (value === 'maxCount') return '★ MAX (理論値 / 最頂点)';
                    return value;
                  }}
                />
                <Area type="monotone" dataKey="failedCount" stackId="1" stroke="#64748b" fill="#334155" fillOpacity={0.4} strokeWidth={1.5} />
                <Area type="monotone" dataKey="clearCount" stackId="1" stroke="#fbbf24" fill="#d97706" fillOpacity={0.4} strokeWidth={1.5} />
                <Area type="monotone" dataKey="fcCount" stackId="1" stroke="#c084fc" fill="#9333ea" fillOpacity={0.4} strokeWidth={1.5} />
                <Area type="monotone" dataKey="apCount" stackId="1" stroke="#34d399" fill="#059669" fillOpacity={0.5} strokeWidth={1.5} />
                <Area type="monotone" dataKey="maxCount" stackId="1" stroke="#38bdf8" fill="#0284c7" fillOpacity={0.6} strokeWidth={2} />
              </AreaChart>
            )}
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
                  <span className="font-bold text-emerald-400 text-sm num-tabular">
                    {game.apCount.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">曲</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block truncate" title={game.maxTerm}>
                    {game.maxTerm}
                  </span>
                  {game.hasMaxConcept !== false ? (
                    <span className="font-bold text-sky-400 text-sm num-tabular">
                      {game.maxCount.toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">曲</span>
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs font-normal">なし (-)</span>
                  )}
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
                <label className="text-zinc-300 font-medium block mb-1">理論値 (MAX) 概念の有無</label>
                <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 p-2 rounded">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="hasMax"
                      checked={newHasMax === true}
                      onChange={() => setNewHasMax(true)}
                    />
                    <span>あり (Arcaea, maimai, CHUNITHM等)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="hasMax"
                      checked={newHasMax === false}
                      onChange={() => setNewHasMax(false)}
                    />
                    <span>なし (プロセカ, バンドリ等)</span>
                  </label>
                </div>
              </div>

              {newHasMax && (
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">MAX/理論値相当の用語 (例: 理論値, TP 100)</label>
                  <input
                    type="text"
                    value={newMaxTerm}
                    onChange={(e) => setNewMaxTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              )}

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
