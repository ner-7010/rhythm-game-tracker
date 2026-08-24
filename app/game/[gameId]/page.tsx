'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Papa from 'papaparse';
import { PlayRecord, GameTitle, CustomFieldDefinition } from '@/lib/types';
import {
  getStoredGames, saveStoredGames,
  getStoredRecords, saveStoredRecords,
  getStoredCustomFields
} from '@/lib/storage';
import {
  ArrowLeft, Search, Plus, FileEdit, CheckCircle2, X, Download, Upload, Trash2, Settings, PlusCircle
} from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  // Games & Records loaded from localStorage for full persistence
  const [games, setGames] = useState<GameTitle[]>([]);
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const loadedGames = getStoredGames();
    const loadedRecords = getStoredRecords();
    const loadedFields = getStoredCustomFields();

    setGames(loadedGames);
    setRecords(loadedRecords);
    setCustomFields(loadedFields);
  }, []);

  const currentGame = games.find(g => g.id === gameId) || {
    id: gameId,
    name: gameId === 'arcaea' ? 'Arcaea' : gameId,
    sheetName: `[${gameId}]`,
    apCount: 0,
    maxCount: 0,
    apTerm: 'AP / Pure Memory',
    maxTerm: 'MAX / 理論値',
    device: 'Mobile' as const,
    grades: ['Pure Memory (理論値)', 'Pure Memory', 'Full Recall', 'Track Complete', 'Track Lost']
  };

  const currentGrades = currentGame.grades || [
    'Pure Memory (理論値)', 'Pure Memory', 'Full Recall', 'Track Complete', 'Track Lost',
    'ALL PERFECT', 'ALL JUSTICE', 'SSS+', 'SSS', 'SS', 'S', 'Clear', 'Failed'
  ];

  const [search, setSearch] = useState('');
  const [apFilter, setApFilter] = useState<'All' | 'AP' | 'MAX'>('All');

  // Record Modal State (for both Add & Edit)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [songTitle, setSongTitle] = useState('');
  const [difficulty, setDifficulty] = useState('MASTER');
  const [level, setLevel] = useState('14');
  const [constantChart, setConstantChart] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [grade, setGrade] = useState<string>(currentGrades[0] || 'Pure Memory');
  const [maxMinus, setMaxMinus] = useState<string>('');
  const [isAp, setIsAp] = useState(true);
  const [isFc, setIsFc] = useState(true);
  const [isClear, setIsClear] = useState(true);
  const [isMax, setIsMax] = useState(false);
  const [dynamicAttrs, setDynamicAttrs] = useState<Record<string, any>>({});

  // Game Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [newGradeInput, setNewGradeInput] = useState('');
  const [editedGrades, setEditedGrades] = useState<string[]>(currentGrades);

  // Sync edited grades when game changes
  useEffect(() => {
    if (currentGame.grades) {
      setEditedGrades(currentGame.grades);
    }
  }, [currentGame]);

  // Open modal for NEW record
  const handleOpenAddModal = () => {
    setEditingRecordId(null);
    setSongTitle('');
    setDifficulty('MASTER');
    setLevel('14');
    setConstantChart('');
    setNotes('');
    setScore('');
    setGrade(currentGrades[0] || 'Pure Memory');
    setMaxMinus('');
    setIsAp(true);
    setIsFc(true);
    setIsClear(true);
    setIsMax(false);
    setDynamicAttrs({});
    setIsRecordModalOpen(true);
  };

  // Open modal for EDITING existing record
  const handleOpenEditModal = (rec: PlayRecord) => {
    setEditingRecordId(rec.id);
    setSongTitle(rec.songTitle);
    setDifficulty(rec.difficulty);
    setLevel(rec.level);
    setConstantChart(rec.constantChart !== undefined ? String(rec.constantChart) : '');
    setNotes(rec.notes !== undefined ? String(rec.notes) : '');
    setScore(String(rec.score));
    setGrade(rec.grade);
    setMaxMinus(rec.maxMinus !== undefined ? String(rec.maxMinus) : '');
    setIsAp(rec.isAp);
    setIsFc(rec.isFc);
    setIsClear(rec.isClear);
    setIsMax(rec.isMax);
    setDynamicAttrs(rec.customAttributes || {});
    setIsRecordModalOpen(true);
  };

  // Save (Create or Update) Record
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) return;

    let updatedRecords: PlayRecord[];

    if (editingRecordId) {
      // UPDATE existing record
      updatedRecords = records.map(r => {
        if (r.id === editingRecordId) {
          return {
            ...r,
            songTitle,
            difficulty,
            level,
            constantChart: constantChart !== '' ? parseFloat(constantChart) : undefined,
            notes: notes !== '' ? parseInt(notes, 10) : undefined,
            score: score !== '' ? parseInt(score, 10) : 0,
            grade,
            maxMinus: maxMinus !== '' ? parseInt(maxMinus, 10) : undefined,
            isAp,
            isFc: isAp || isFc,
            isClear: isAp || isFc || isClear,
            isMax,
            customAttributes: dynamicAttrs
          };
        }
        return r;
      });
    } else {
      // CREATE new record
      const newRecord: PlayRecord = {
        id: `rec-${Date.now()}`,
        gameId,
        songTitle,
        difficulty,
        level,
        constantChart: constantChart !== '' ? parseFloat(constantChart) : undefined,
        notes: notes !== '' ? parseInt(notes, 10) : undefined,
        score: score !== '' ? parseInt(score, 10) : 0,
        grade,
        maxMinus: maxMinus !== '' ? parseInt(maxMinus, 10) : undefined,
        isAp,
        isFc: isAp || isFc,
        isClear: isAp || isFc || isClear,
        isMax,
        playedAt: new Date().toISOString(),
        customAttributes: dynamicAttrs
      };
      updatedRecords = [newRecord, ...records];
    }

    setRecords(updatedRecords);
    saveStoredRecords(updatedRecords);
    setIsRecordModalOpen(false);
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveStoredRecords(updated);
  };

  // Save Game Grades Settings
  const handleSaveGameSettings = () => {
    const updatedGames = games.map(g => {
      if (g.id === gameId) {
        return {
          ...g,
          grades: editedGrades
        };
      }
      return g;
    });

    setGames(updatedGames);
    saveStoredGames(updatedGames);
    setIsSettingsModalOpen(false);
  };

  // Export CSV
  const handleExportSongsCsv = () => {
    const currentGameRecords = records.filter(r => r.gameId === gameId);
    const exportData = currentGameRecords.map(r => ({
      'ID (識別子)': r.id,
      'Game Title': currentGame.name,
      'Song Title (曲名)': r.songTitle,
      'Difficulty (難易度)': r.difficulty,
      'Level (レベル)': r.level,
      'Constant Chart (譜面定数)': r.constantChart ?? '',
      'Notes (ノーツ数)': r.notes ?? '',
      'Score (スコア)': r.score,
      'Grade (ランク)': r.grade,
      'MAX- (失点)': r.maxMinus ?? '',
      'is_AP (1:はい / 0:いいえ)': r.isAp ? 1 : 0,
      'is_FC (1:はい / 0:いいえ)': r.isFc ? 1 : 0,
      'is_Clear (1:はい / 0:いいえ)': r.isClear ? 1 : 0,
      'Composer (コンポーザー)': r.customAttributes?.['コンポーザー'] || r.customAttributes?.composer || '',
      'BPM': r.customAttributes?.['BPM'] || r.customAttributes?.bpm || '',
      '譜面制作者': r.customAttributes?.['譜面制作者'] || r.customAttributes?.notesDesigner || ''
    }));

    if (exportData.length === 0) {
      exportData.push({
        'ID (識別子)': '',
        'Game Title': currentGame.name,
        'Song Title (曲名)': 'サンプル曲',
        'Difficulty (難易度)': 'MASTER',
        'Level (レベル)': '14',
        'Constant Chart (譜面定数)': '14.5',
        'Notes (ノーツ数)': '2000',
        'Score (スコア)': 1000000,
        'Grade (ランク)': currentGrades[0] || 'Pure Memory',
        'MAX- (失点)': '0',
        'is_AP (1:はい / 0:いいえ)': 1,
        'is_FC (1:はい / 0:いいえ)': 1,
        'is_Clear (1:はい / 0:いいえ)': 1,
        'Composer (コンポーザー)': '作曲者名',
        'BPM': '200',
        '譜面制作者': '譜面制作者名'
      });
    }

    const csv = Papa.unparse(exportData);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentGame.name}_play_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV
  const handleImportSongsCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedRecords: PlayRecord[] = results.data.map((row: any, idx: number) => {
          const isApVal = row['is_AP (1:はい / 0:いいえ)'] == 1 || String(row['Grade (ランク)']).toLowerCase().includes('ap') || String(row['Grade (ランク)']).toLowerCase().includes('pure');
          return {
            id: row['ID (識別子)'] || `imp-${Date.now()}-${idx}`,
            gameId,
            songTitle: row['Song Title (曲名)'] || row['title'] || row['曲名'] || '無題',
            difficulty: row['Difficulty (難易度)'] || row['difficulty'] || 'MASTER',
            level: String(row['Level (レベル)'] || row['level'] || '12'),
            constantChart: row['Constant Chart (譜面定数)'] ? parseFloat(row['Constant Chart (譜面定数)']) : undefined,
            notes: row['Notes (ノーツ数)'] ? parseInt(row['Notes (ノーツ数)'], 10) : undefined,
            score: parseInt(row['Score (スコア)'] || row['score'] || '0', 10),
            grade: row['Grade (ランク)'] || currentGrades[0] || 'Pure Memory',
            maxMinus: row['MAX- (失点)'] !== '' ? parseInt(row['MAX- (失点)'], 10) : undefined,
            isAp: isApVal,
            isFc: isApVal || row['is_FC (1:はい / 0:いいえ)'] == 1,
            isClear: isApVal || row['is_Clear (1:はい / 0:いいえ)'] == 1,
            isMax: false,
            playedAt: new Date().toISOString(),
            customAttributes: {
              'コンポーザー': row['Composer (コンポーザー)'] || row['composer'],
              'BPM': row['BPM'],
              '譜面制作者': row['譜面制作者']
            }
          };
        });

        const newRecords = [...importedRecords, ...records];
        setRecords(newRecords);
        saveStoredRecords(newRecords);
      }
    });
  };

  // Filter records for current game
  const currentGameRecords = records.filter(r => r.gameId === gameId);
  const filteredRecords = currentGameRecords.filter(r => {
    const matchesSearch = r.songTitle.toLowerCase().includes(search.toLowerCase()) ||
                          Object.values(r.customAttributes || {}).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchesAp = apFilter === 'All' || (apFilter === 'AP' && r.isAp) || (apFilter === 'MAX' && r.isMax);
    return matchesSearch && matchesAp;
  });

  const currentApCount = currentGameRecords.filter(r => r.isAp).length;
  const currentMaxCount = currentGameRecords.filter(r => r.isMax).length;

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
              {currentGame.device}
            </span>
            <h1 className="text-xl font-bold text-zinc-100">{currentGame.name}</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            登録曲数: <span className="font-mono text-zinc-300 font-bold">{currentGameRecords.length} 曲</span>
          </p>
        </div>

        {/* Stats & Settings button */}
        <div className="flex items-center space-x-3">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{currentGame.apTerm}</span>
            <span className="text-lg font-bold text-zinc-200 num-tabular">{currentApCount.toLocaleString()}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{currentGame.maxTerm}</span>
            <span className="text-lg font-bold text-zinc-300 num-tabular">{currentMaxCount.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            title="この機種のランク(Grade)マスター設定"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-2 rounded text-xs transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grade設定</span>
          </button>
        </div>
      </div>

      {/* Table Toolbar / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="曲名・属性で検索..."
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
                {filter === 'All' ? '全曲' : filter === 'AP' ? currentGame.apTerm : currentGame.maxTerm}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportSongsCsv}
            title="CSVエクスポート"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1.5 rounded text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">CSV出力</span>
          </button>

          <label
            htmlFor="song-csv-import"
            title="CSVインポート"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer transition"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">CSV取込</span>
            <input
              id="song-csv-import"
              type="file"
              accept=".csv"
              onChange={handleImportSongsCsv}
              className="hidden"
            />
          </label>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-1.5 rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>新しいプレイ記録を追加</span>
          </button>
        </div>
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
                <th className="py-2.5 px-3 text-center">{currentGame.apTerm}</th>
                <th className="py-2.5 px-4">詳細属性 (BPM・制作者等)</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-zinc-500">
                    登録されているプレイ記録がありません。「新しいプレイ記録を追加」ボタン、または「CSV取込」からデータを入れてください。
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => (
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
                    <td className="py-2.5 px-4 font-mono font-bold text-zinc-100 num-tabular">{rec.score ? rec.score.toLocaleString() : '-'}</td>
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
                    <td className="py-2.5 px-4 text-zinc-400 truncate max-w-xs space-x-2">
                      {Object.entries(rec.customAttributes || {}).map(([k, v]) => (
                        v ? <span key={k} className="text-[11px] bg-zinc-900/80 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{k}: {String(v)}</span> : null
                      ))}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(rec)}
                        className="text-zinc-400 hover:text-zinc-100 p-1 transition"
                        title="編集"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="text-zinc-600 hover:text-rose-400 p-1 transition"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for ADDING or EDITING a play record */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121215] border border-zinc-700 w-full max-w-lg rounded-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">
                {editingRecordId ? `${currentGame.name} - プレイ記録の編集` : `${currentGame.name} - 新しいプレイ記録の追加`}
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">楽曲タイトル *</label>
                <input
                  type="text"
                  placeholder="曲名を入力..."
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">難易度 (Difficulty)</label>
                  <input
                    type="text"
                    placeholder="例: MASTER, EXPERT, BYD..."
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Level (表示レベル)</label>
                  <input
                    type="text"
                    placeholder="例: 14, 14+..."
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">譜面定数 (CC)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="例: 14.6"
                    value={constantChart}
                    onChange={(e) => setConstantChart(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">ノーツ数 (Notes)</label>
                  <input
                    type="number"
                    placeholder="例: 2222"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">スコア (Score)</label>
                  <input
                    type="number"
                    placeholder="例: 1000000"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Grade Combobox */}
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Grade / ランク (マスターから選択)</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-semibold"
                  >
                    {currentGrades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">MAX- (失点数)</label>
                  <input
                    type="number"
                    placeholder="例: 0, 5..."
                    value={maxMinus}
                    onChange={(e) => setMaxMinus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Custom Fields Inputs */}
              {customFields.length > 0 && (
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <label className="text-zinc-300 font-medium block">追加カスタム属性 (自動生成)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {customFields.map(field => (
                      <div key={field.id}>
                        <label className="text-zinc-400 text-[11px] block mb-1">{field.name}</label>
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder={`${field.name}を入力...`}
                          value={dynamicAttrs[field.name] || ''}
                          onChange={(e) => setDynamicAttrs({
                            ...dynamicAttrs,
                            [field.name]: e.target.value
                          })}
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-1.5 focus:outline-none focus:border-zinc-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Flags */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <label className="text-zinc-300 font-medium block">達成フラグ</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAp}
                      onChange={(e) => {
                        setIsAp(e.target.checked);
                        if (e.target.checked) {
                          setIsFc(true);
                          setIsClear(true);
                        }
                      }}
                      className="rounded bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-0"
                    />
                    <span className="text-zinc-200">{currentGame.apTerm} (AP)</span>
                  </label>

                  <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFc}
                      onChange={(e) => {
                        setIsFc(e.target.checked);
                        if (e.target.checked) setIsClear(true);
                        if (!e.target.checked) setIsAp(false);
                      }}
                      className="rounded bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-0"
                    />
                    <span className="text-zinc-300">{currentGame.fcTerm || 'FC (フルコンボ)'}</span>
                  </label>

                  <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isClear}
                      onChange={(e) => {
                        setIsClear(e.target.checked);
                        if (!e.target.checked) {
                          setIsFc(false);
                          setIsAp(false);
                        }
                      }}
                      className="rounded bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-0"
                    />
                    <span className="text-zinc-400">{currentGame.clearTerm || 'Clear (クリア)'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:bg-zinc-800 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium transition"
                >
                  {editingRecordId ? '更新して保存' : '追加する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Game Grade Master Settings */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121215] border border-zinc-700 w-full max-w-md rounded-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">{currentGame.name} - Grade / ランクマスター設定</h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-400 text-[11px]">
                この機種で入力時にコンボボックスに表示されるランク (Grade) の一覧を設定します。
              </p>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {editedGrades.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded">
                    <span className="font-mono text-zinc-200">{g}</span>
                    <button
                      onClick={() => setEditedGrades(editedGrades.filter((_, i) => i !== idx))}
                      className="text-zinc-600 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Grade Form */}
              <div className="flex space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="新しいGrade名 (例: Pure Memory, AJ...)"
                  value={newGradeInput}
                  onChange={(e) => setNewGradeInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-1.5 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newGradeInput.trim()) return;
                    setEditedGrades([...editedGrades, newGradeInput.trim()]);
                    setNewGradeInput('');
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded border border-zinc-700 font-medium transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>追加</span>
                </button>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:bg-zinc-800 transition"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSaveGameSettings}
                  className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium transition"
                >
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
