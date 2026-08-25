'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Papa from 'papaparse';
import { PlayRecord, GameTitle, CustomFieldDefinition, GradeMasterItem, DifficultyMasterItem, GradeCategory } from '@/lib/types';
import {
  getStoredGames, saveStoredGames,
  getStoredRecords, saveStoredRecords,
  getStoredCustomFields,
  fetchGamesAsync, saveGamesAsync,
  fetchRecordsAsync, replaceRecordsAsync,
  upsertRecordAsync, deleteRecordAsync
} from '@/lib/storage';
import {
  ArrowLeft, Search, Plus, FileEdit, CheckCircle2, X, Download, Upload, Trash2, Settings, PlusCircle, ArrowUp, ArrowDown, ArrowUpDown, Calculator, CircleDashed, ShieldAlert, ArchiveX, RefreshCw
} from 'lucide-react';

const parseCleanInt = (val: any): number => {
  if (val === null || val === undefined || String(val).trim() === '') return 0;
  const cleanStr = String(val).replace(/,/g, '').replace(/[^\d-]/g, '');
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? 0 : num;
};

const parseCleanFloat = (val: any): number | undefined => {
  if (val === null || val === undefined || String(val).trim() === '') return undefined;
  const cleanStr = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? undefined : num;
};

const evaluateFormula = (formula: string, notesVal: number, scoreVal: number): number | undefined => {
  if (!formula || !formula.trim()) return undefined;
  try {
    let expr = formula.toLowerCase()
      .replace(/\bnotes\b/g, String(notesVal))
      .replace(/\bscore\b/g, String(scoreVal))
      .replace(/\broundup\b/g, 'Math.ceil')
      .replace(/\brounddown\b/g, 'Math.floor')
      .replace(/\bround\b/g, 'Math.round')
      .replace(/\bfloor\b/g, 'Math.floor')
      .replace(/\bceil\b/g, 'Math.ceil')
      .replace(/\babs\b/g, 'Math.abs');
    
    const openParenCount = (expr.match(/\(/g) || []).length;
    const closeParenCount = (expr.match(/\)/g) || []).length;
    if (openParenCount > closeParenCount) {
      expr += ')'.repeat(openParenCount - closeParenCount);
    }

    if (!/^[0-9\+\-\*\/\(\)\s\.\,Math\.round|Math\.floor|Math\.ceil|Math\.abs]+$/.test(expr)) {
      return undefined;
    }

    const result = new Function(`return (${expr})`)();
    return typeof result === 'number' && !isNaN(result) ? Math.round(result) : undefined;
  } catch {
    return undefined;
  }
};

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [games, setGames] = useState<GameTitle[]>([]);
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Include Deleted Songs in Stats Toggle
  const [includeDeletedInStats, setIncludeDeletedInStats] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Initial quick load from local cache
      const cachedGames = getStoredGames();
      const cachedRecords = getStoredRecords().filter(r => r.gameId === gameId);
      const loadedFields = getStoredCustomFields();
      if (cachedGames.length > 0) setGames(cachedGames);
      if (cachedRecords.length > 0) setRecords(cachedRecords);
      setCustomFields(loadedFields);

      // 2. Fetch fresh data from Supabase
      const [freshGames, freshRecords] = await Promise.all([
        fetchGamesAsync(),
        fetchRecordsAsync(gameId)
      ]);
      setGames(freshGames);
      setRecords(freshRecords);
    } catch (e) {
      console.error('Failed to load game details', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [gameId]);

  const currentGame = games.find(g => g.id === gameId) || {
    id: gameId,
    name: gameId === 'arcaea' ? 'Arcaea' : gameId,
    sheetName: `[${gameId}]`,
    apCount: 0,
    maxCount: 0,
    apTerm: 'Pure Memory',
    maxTerm: 'MAX / 理論値',
    device: 'Mobile' as const,
    hasMaxConcept: true,
    maxMinusFormula: '10000000 + notes - score',
    gradeMasters: [
      { id: 'g0', name: '未プレイ', category: 'Unplayed' as const },
      { id: 'g1', name: 'Pure Memory (理論値)', category: 'MAX' as const },
      { id: 'g2', name: 'Pure Memory', category: 'AP' as const },
      { id: 'g3', name: 'Full Recall', category: 'FC' as const },
      { id: 'g4', name: 'Track Complete', category: 'Clear' as const },
      { id: 'g5', name: 'Track Lost', category: 'Failed' as const }
    ],
    difficultyMasters: [
      { id: 'd1', name: 'BYD', order: 1 },
      { id: 'd2', name: 'FTR', order: 2 },
      { id: 'd3', name: 'PRS', order: 3 },
      { id: 'd4', name: 'PST', order: 4 }
    ]
  };

  const gradeMasters = currentGame.gradeMasters || [
    { id: 'g0', name: '未プレイ', category: 'Unplayed' as const },
    { id: 'g1', name: 'Pure Memory (理論値)', category: 'MAX' as const },
    { id: 'g2', name: 'Pure Memory', category: 'AP' as const },
    { id: 'g3', name: 'Full Recall', category: 'FC' as const },
    { id: 'g4', name: 'Track Complete', category: 'Clear' as const },
    { id: 'g5', name: 'Track Lost', category: 'Failed' as const }
  ];

  const difficultyMasters = currentGame.difficultyMasters || [
    { id: 'd1', name: 'BYD', order: 1 },
    { id: 'd2', name: 'FTR', order: 2 },
    { id: 'd3', name: 'PRS', order: 3 },
    { id: 'd4', name: 'PST', order: 4 }
  ];

  const hasMaxConcept = currentGame.hasMaxConcept !== false;

  const [search, setSearch] = useState('');
  const [apFilter, setApFilter] = useState<'All' | 'Unplayed' | 'Played' | 'AP' | 'MAX' | 'Deleted'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'titleAsc' | 'diffHigh' | 'diffLow' | 'levelHigh' | 'scoreHigh'>('default');

  // Record Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [songTitle, setSongTitle] = useState('');
  const [difficulty, setDifficulty] = useState<string>(difficultyMasters[0]?.name || 'MASTER');
  const [level, setLevel] = useState('14');
  const [constantChart, setConstantChart] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [selectedGradeName, setSelectedGradeName] = useState<string>(gradeMasters[0]?.name || '未プレイ');
  const [maxMinus, setMaxMinus] = useState<string>('');
  const [isDeletedSong, setIsDeletedSong] = useState<boolean>(false);
  const [dynamicAttrs, setDynamicAttrs] = useState<Record<string, any>>({});

  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editedGradeMasters, setEditedGradeMasters] = useState<GradeMasterItem[]>(gradeMasters);
  const [editedDiffMasters, setEditedDiffMasters] = useState<DifficultyMasterItem[]>(difficultyMasters);
  const [editedFormula, setEditedFormula] = useState<string>(currentGame.maxMinusFormula || '');
  const [editedHasMax, setEditedHasMax] = useState<boolean>(hasMaxConcept);

  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeCategory, setNewGradeCategory] = useState<GradeCategory>('AP');
  const [newDiffName, setNewDiffName] = useState('');

  const [editedIncludeDeleted, setEditedIncludeDeleted] = useState<boolean>(currentGame.includeDeletedInStats === true);

  useEffect(() => {
    if (currentGame.gradeMasters) setEditedGradeMasters(currentGame.gradeMasters);
    if (currentGame.difficultyMasters) setEditedDiffMasters(currentGame.difficultyMasters);
    setEditedFormula(currentGame.maxMinusFormula || '');
    setEditedHasMax(currentGame.hasMaxConcept !== false);
    setEditedIncludeDeleted(currentGame.includeDeletedInStats === true);
  }, [currentGame]);

  // Auto-Calculate MAX-
  const autoCalculateMaxMinus = (newScoreStr: string, newNotesStr: string) => {
    const formula = currentGame.maxMinusFormula;
    if (!formula) return;

    const nVal = parseCleanInt(newNotesStr);
    const sVal = parseCleanInt(newScoreStr);

    const calcResult = evaluateFormula(formula, nVal, sVal);
    if (calcResult !== undefined) {
      setMaxMinus(String(calcResult));
    }
  };

  const handleScoreChange = (val: string) => {
    setScore(val);
    autoCalculateMaxMinus(val, notes);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    autoCalculateMaxMinus(score, val);
  };

  const handleOpenAddModal = () => {
    setEditingRecordId(null);
    setSongTitle('');
    setDifficulty(difficultyMasters[0]?.name || 'MASTER');
    setLevel('14');
    setConstantChart('');
    setNotes('');
    setScore('');
    setSelectedGradeName(gradeMasters[0]?.name || '未プレイ');
    setMaxMinus('');
    setIsDeletedSong(false);
    setDynamicAttrs({});
    setIsRecordModalOpen(true);
  };

  const handleOpenEditModal = (rec: PlayRecord) => {
    setEditingRecordId(rec.id);
    setSongTitle(rec.songTitle);
    setDifficulty(rec.difficulty);
    setLevel(rec.level);
    setConstantChart(rec.constantChart !== undefined ? String(rec.constantChart) : '');
    setNotes(rec.notes !== undefined ? String(rec.notes) : '');
    setScore(rec.score ? String(rec.score) : '');
    setSelectedGradeName(rec.grade || '未プレイ');
    setMaxMinus(rec.maxMinus !== undefined ? String(rec.maxMinus) : '');
    setIsDeletedSong(rec.isDeleted === true);
    setDynamicAttrs(rec.customAttributes || {});
    setIsRecordModalOpen(true);
  };

  const calculateFlagsFromGrade = (gradeName: string) => {
    const trimmed = String(gradeName || '').trim();
    let matchedGrade = gradeMasters.find(g => g.name.toLowerCase() === trimmed.toLowerCase());
    let category: GradeCategory = matchedGrade ? matchedGrade.category : 'Unplayed';

    if (!matchedGrade) {
      if (trimmed === 'PM' || trimmed.includes('理論値') || trimmed.includes('MAX')) category = 'MAX';
      else if (trimmed === 'AP' || trimmed.includes('Pure Memory')) category = 'AP';
      else if (trimmed === 'FR' || trimmed === 'FC' || trimmed.includes('Full')) category = 'FC';
      else if (trimmed === 'C' || trimmed.includes('Clear') || trimmed.includes('Complete')) category = 'Clear';
      else if (trimmed === 'TL' || trimmed.includes('Lost') || trimmed.includes('Failed')) category = 'Failed';
      else if (trimmed === '未プレイ' || trimmed === '-') category = 'Unplayed';
      else category = 'Clear';
    }

    let isPlayed = false;
    let isMax = false;
    let isAp = false;
    let isFc = false;
    let isClear = false;

    if (category === 'Unplayed') {
      isPlayed = false; isMax = false; isAp = false; isFc = false; isClear = false;
    } else if (category === 'MAX') {
      isPlayed = true; isMax = true; isAp = true; isFc = true; isClear = true;
    } else if (category === 'AP') {
      isPlayed = true; isMax = false; isAp = true; isFc = true; isClear = true;
    } else if (category === 'FC') {
      isPlayed = true; isMax = false; isAp = false; isFc = true; isClear = true;
    } else if (category === 'Clear') {
      isPlayed = true; isMax = false; isAp = false; isFc = false; isClear = true;
    } else {
      isPlayed = true; isMax = false; isAp = false; isFc = false; isClear = false;
    }

    return { isPlayed, isMax, isAp, isFc, isClear };
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) return;

    const { isPlayed, isMax, isAp, isFc, isClear } = calculateFlagsFromGrade(selectedGradeName);
    const parsedScore = parseCleanInt(score);
    const parsedNotes = notes !== '' ? parseCleanInt(notes) : undefined;
    const parsedMaxMinus = maxMinus !== '' ? Math.abs(parseCleanInt(maxMinus)) : undefined;

    let updatedRecords: PlayRecord[];
    let recordToUpsert: PlayRecord;

    if (editingRecordId) {
      recordToUpsert = {
        id: editingRecordId,
        gameId,
        songTitle,
        difficulty,
        level,
        constantChart: constantChart !== '' ? parseCleanFloat(constantChart) : undefined,
        notes: parsedNotes,
        score: parsedScore,
        grade: selectedGradeName,
        maxMinus: parsedMaxMinus,
        isPlayed, isAp, isFc, isClear, isMax,
        isDeleted: isDeletedSong,
        playedAt: records.find(r => r.id === editingRecordId)?.playedAt || new Date().toISOString(),
        customAttributes: dynamicAttrs
      };
      updatedRecords = records.map(r => r.id === editingRecordId ? recordToUpsert : r);
    } else {
      recordToUpsert = {
        id: `rec-${Date.now()}`,
        gameId,
        songTitle,
        difficulty,
        level,
        constantChart: constantChart !== '' ? parseCleanFloat(constantChart) : undefined,
        notes: parsedNotes,
        score: parsedScore,
        grade: selectedGradeName,
        maxMinus: parsedMaxMinus,
        isPlayed, isAp, isFc, isClear, isMax,
        isDeleted: isDeletedSong,
        playedAt: new Date().toISOString(),
        customAttributes: dynamicAttrs
      };
      updatedRecords = [recordToUpsert, ...records];
    }

    setIsRecordModalOpen(false);
    await upsertRecordAsync(recordToUpsert);
    await loadData();
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteRecordAsync(id, gameId);
    await loadData();
  };

  const handleMoveDiffOrder = (index: number, direction: 'up' | 'down') => {
    const newItems = [...editedDiffMasters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setEditedDiffMasters(reordered);
  };

  const handleSaveGameSettings = async () => {
    const updatedGames = games.map(g => {
      if (g.id === gameId) {
        return {
          ...g,
          gradeMasters: editedGradeMasters,
          difficultyMasters: editedDiffMasters,
          maxMinusFormula: editedFormula,
          hasMaxConcept: editedHasMax,
          includeDeletedInStats: editedIncludeDeleted
        };
      }
      return g;
    });

    setGames(updatedGames);
    await saveGamesAsync(updatedGames);
    setIsSettingsModalOpen(false);
  };

  // Export CSV (Includes Deleted flag column)
  const handleExportSongsCsv = () => {
    const currentGameRecords = records.filter(r => r.gameId === gameId);
    const exportData = currentGameRecords.map(r => ({
      'Game Title': currentGame.name,
      'Song Title (曲名)': r.songTitle,
      'Difficulty (難易度)': r.difficulty,
      'Level (レベル)': r.level,
      'Constant Chart (譜面定数)': r.constantChart ?? '',
      'Notes (ノーツ数)': r.notes ?? '',
      'Score (スコア)': r.score || '',
      'Grade (ランク)': r.grade || '未プレイ',
      'MAX- (失点)': r.maxMinus !== undefined ? `-${r.maxMinus}` : '',
      'Deleted (削除曲)': r.isDeleted ? 'TRUE' : 'FALSE',
      'Composer (コンポーザー)': r.customAttributes?.['コンポーザー'] || r.customAttributes?.composer || '',
      'BPM': r.customAttributes?.['BPM'] || r.customAttributes?.bpm || '',
      '譜面制作者': r.customAttributes?.['譜面制作者'] || r.customAttributes?.notesDesigner || ''
    }));

    if (exportData.length === 0) {
      exportData.push({
        'Game Title': currentGame.name,
        'Song Title (曲名)': '新曲サンプル枠',
        'Difficulty (難易度)': difficultyMasters[0]?.name || 'MASTER',
        'Level (レベル)': '14',
        'Constant Chart (譜面定数)': '14.5',
        'Notes (ノーツ数)': '2000',
        'Score (スコア)': '',
        'Grade (ランク)': '未プレイ',
        'MAX- (失点)': '',
        'Deleted (削除曲)': 'FALSE',
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

  // Import CSV (Parses Deleted flag column)
  const handleImportSongsCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const otherGameRecords = records.filter(r => r.gameId !== gameId);

        const newGameRecords: PlayRecord[] = results.data.map((row: any, idx: number) => {
          const title = String(row['Song Title (曲名)'] || row['title'] || row['曲名'] || '無題').trim();
          const diff = String(row['Difficulty (難易度)'] || row['difficulty'] || difficultyMasters[0]?.name || 'MASTER').trim();
          const gName = String(row['Grade (ランク)'] || row['grade'] || (row['Score (スコア)'] ? 'Pure Memory' : '未プレイ')).trim();
          const isDel = String(row['Deleted (削除曲)'] || row['is_deleted'] || 'FALSE').toUpperCase() === 'TRUE';
          
          const { isPlayed, isMax, isAp, isFc, isClear } = calculateFlagsFromGrade(gName);

          const notesVal = row['Notes (ノーツ数)'] !== undefined && String(row['Notes (ノーツ数)']).trim() !== ''
            ? parseCleanInt(row['Notes (ノーツ数)'])
            : undefined;
          
          const scoreVal = row['Score (スコア)'] !== undefined && String(row['Score (スコア)']).trim() !== ''
            ? parseCleanInt(row['Score (スコア)'])
            : 0;

          let computedMaxMinus: number | undefined = undefined;
          if (row['MAX- (失点)'] !== '' && row['MAX- (失点)'] !== undefined) {
            computedMaxMinus = Math.abs(parseCleanInt(row['MAX- (失点)']));
          } else if (currentGame.maxMinusFormula && notesVal !== undefined && scoreVal > 0) {
            computedMaxMinus = evaluateFormula(currentGame.maxMinusFormula, notesVal, scoreVal);
          }

          return {
            id: `imp-${Date.now()}-${idx}`,
            gameId,
            songTitle: title,
            difficulty: diff,
            level: String(row['Level (レベル)'] || row['level'] || '12').trim(),
            constantChart: row['Constant Chart (譜面定数)'] ? parseCleanFloat(row['Constant Chart (譜面定数)']) : undefined,
            notes: notesVal,
            score: scoreVal,
            grade: gName,
            maxMinus: computedMaxMinus,
            isPlayed, isAp, isFc, isClear, isMax,
            isDeleted: isDel,
            playedAt: new Date().toISOString(),
            customAttributes: {
              'コンポーザー': row['Composer (コンポーザー)'] || row['composer'],
              'BPM': row['BPM'],
              '譜面制作者': row['譜面制作者']
            }
          };
        });

        setIsLoading(true);
        try {
          await replaceRecordsAsync(gameId, newGameRecords);
          await loadData();
          alert(`${newGameRecords.length}件の楽曲データをクラウドDBに同期保存しました。`);
        } catch (err) {
          console.error('Import failed', err);
          alert('CSVの取込中にエラーが発生しました。');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const currentGameRecords = records.filter(r => r.gameId === gameId);

  const filteredRecords = currentGameRecords.filter(r => {
    const matchesSearch = r.songTitle.toLowerCase().includes(search.toLowerCase()) ||
                          Object.values(r.customAttributes || {}).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    
    let matchesStatus = true;
    if (apFilter === 'Unplayed') matchesStatus = !r.isPlayed;
    if (apFilter === 'Played') matchesStatus = r.isPlayed;
    if (apFilter === 'AP') matchesStatus = r.isAp;
    if (apFilter === 'MAX') matchesStatus = r.isMax;
    if (apFilter === 'Deleted') matchesStatus = r.isDeleted === true;

    return matchesSearch && matchesStatus;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'diffHigh') {
      const orderA = difficultyMasters.find(d => d.name === a.difficulty)?.order ?? 99;
      const orderB = difficultyMasters.find(d => d.name === b.difficulty)?.order ?? 99;
      return orderA - orderB;
    }
    if (sortBy === 'diffLow') {
      const orderA = difficultyMasters.find(d => d.name === a.difficulty)?.order ?? 99;
      const orderB = difficultyMasters.find(d => d.name === b.difficulty)?.order ?? 99;
      return orderB - orderA;
    }
    if (sortBy === 'levelHigh') {
      return (b.constantChart || parseCleanFloat(b.level) || 0) - (a.constantChart || parseCleanFloat(a.level) || 0);
    }
    if (sortBy === 'scoreHigh') {
      return b.score - a.score;
    }

    const titleCompare = a.songTitle.localeCompare(b.songTitle, 'ja', { numeric: true });
    if (titleCompare !== 0) return titleCompare;

    const orderA = difficultyMasters.find(d => d.name === a.difficulty)?.order ?? 99;
    const orderB = difficultyMasters.find(d => d.name === b.difficulty)?.order ?? 99;
    return orderA - orderB;
  });

  // Calculate Stat Counts with Option to Include or Exclude Deleted Songs
  const statsRecords = includeDeletedInStats
    ? currentGameRecords
    : currentGameRecords.filter(r => !r.isDeleted);

  const playedRecords = statsRecords.filter(r => r.isPlayed);
  const unplayedRecords = statsRecords.filter(r => !r.isPlayed);
  const currentMaxCount = playedRecords.filter(r => r.isMax).length;
  const currentApCount = playedRecords.filter(r => r.isAp).length;
  const currentFcCount = playedRecords.filter(r => r.isFc).length;
  const currentClearCount = playedRecords.filter(r => r.isClear).length;
  const totalDeletedCount = currentGameRecords.filter(r => r.isDeleted).length;

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
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              {currentGame.device}
            </span>
            <h1 className="text-xl font-bold text-zinc-100">{currentGame.name}</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            既プレイ曲数: <span className="font-mono text-zinc-200 font-bold">{playedRecords.length} 曲</span>
            {unplayedRecords.length > 0 && (
              <span className="ml-2 text-zinc-500">
                (未プレイ枠: <span className="font-mono text-zinc-400">{unplayedRecords.length} 曲</span> / 全{statsRecords.length}枠)
              </span>
            )}
            {totalDeletedCount > 0 && (
              <span className="ml-2 text-rose-400/80 font-medium">
                [削除曲: {totalDeletedCount}曲 {includeDeletedInStats ? '統計に包含中' : '統計から除外中'}]
              </span>
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center min-w-[70px]">
            <span className="text-[10px] text-zinc-500 block truncate">Clear</span>
            <span className="text-base font-bold text-amber-400 num-tabular">{currentClearCount.toLocaleString()}</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center min-w-[70px]">
            <span className="text-[10px] text-zinc-500 block truncate">{currentGame.fcTerm || 'Full Combo'}</span>
            <span className="text-base font-bold text-purple-400 num-tabular">{currentFcCount.toLocaleString()}</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center min-w-[70px]">
            <span className="text-[10px] text-zinc-500 block truncate">{currentGame.apTerm}</span>
            <span className="text-base font-bold text-emerald-400 num-tabular">{currentApCount.toLocaleString()}</span>
          </div>

          <div className={`px-3 py-1.5 rounded text-center min-w-[70px] border transition ${
            hasMaxConcept
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-zinc-950/60 border-zinc-900 opacity-50'
          }`}>
            <span className="text-[10px] text-zinc-500 block truncate">{currentGame.maxTerm}</span>
            {hasMaxConcept ? (
              <span className="text-base font-bold text-sky-400 num-tabular">{currentMaxCount.toLocaleString()}</span>
            ) : (
              <span className="text-xs font-semibold text-zinc-600 block mt-0.5" title="この機種には理論値(MAX)の概念が設定されていません">なし (-)</span>
            )}
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            title="機種マスター設定"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-2 rounded text-xs transition"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>機種設定</span>
          </button>
        </div>
      </div>

      {/* Table Toolbar / Controls (Includes Deleted Stats Toggle Switch!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] border border-zinc-800/80 p-4 rounded-lg">
        <div className="flex flex-wrap items-center space-x-2 flex-1 gap-y-2">
          <div className="relative flex-1 min-w-[140px] max-w-xs">
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
            {(['All', 'Played', 'Unplayed', 'AP', ...(hasMaxConcept ? ['MAX' as const] : []), 'Deleted'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setApFilter(filter)}
                className={`px-2.5 py-1 rounded transition ${
                  apFilter === filter ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter === 'All' ? '全枠' : filter === 'Played' ? 'プレイ済' : filter === 'Unplayed' ? '未プレイ' : filter === 'AP' ? currentGame.apTerm : filter === 'MAX' ? currentGame.maxTerm : '削除曲のみ'}
              </button>
            ))}
          </div>

          {/* Toggle: Include Deleted Songs in Stats */}
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeDeletedInStats}
                onChange={(e) => setIncludeDeletedInStats(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
            <span className="text-zinc-300 text-[11px]">削除曲を統計に含める</span>
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-zinc-300 focus:outline-none"
            >
              <option value="default">曲名順 ➔ 難易度順 (標準)</option>
              <option value="diffHigh">難易度高い順</option>
              <option value="diffLow">難易度低い順</option>
              <option value="levelHigh">譜面定数 / Level高い順</option>
              <option value="scoreHigh">スコア高い順</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            title="クラウドDBから最新データを取得"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1.5 rounded text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">同期</span>
          </button>

          <button
            onClick={handleExportSongsCsv}
            title="CSV出力"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1.5 rounded text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">CSV出力</span>
          </button>

          <label
            htmlFor="song-csv-import"
            title="CSV完全上書き取込"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer transition"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">CSV置換取込</span>
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
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-medium uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 align-middle">No.</th>
                <th className="py-3 px-4 align-middle">楽曲タイトル</th>
                <th className="py-3 px-3 align-middle">難易度</th>
                <th className="py-3 px-3 align-middle">Level</th>
                <th className="py-3 px-3 align-middle">譜面定数</th>
                <th className="py-3 px-3 align-middle">Notes</th>
                <th className="py-3 px-4 align-middle">Score</th>
                <th className="py-3 px-3 align-middle">Grade</th>
                <th className="py-3 px-3 align-middle">MAX-</th>
                <th className="py-3 px-4 align-middle">詳細属性</th>
                <th className="py-3 px-3 text-right align-middle">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-zinc-500">
                    対象の曲が見つかりません。「新しいプレイ記録を追加」ボタン、または「CSV置換取込」からデータを入れてください。
                  </td>
                </tr>
              ) : (
                sortedRecords.map((rec, index) => (
                  <tr key={rec.id} className={`transition-colors ${
                    rec.isDeleted
                      ? 'bg-rose-950/20 text-zinc-400 hover:bg-rose-900/20'
                      : !rec.isPlayed ? 'bg-zinc-950/40 text-zinc-500' : 'hover:bg-zinc-900/40'
                  }`}>
                    <td className="py-3 px-4 font-mono text-zinc-500 num-tabular align-middle">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-zinc-100 align-middle">
                      <div className="flex items-center gap-1.5 h-full">
                        {!rec.isPlayed && (
                          <span title="未プレイ" className="flex-shrink-0 inline-flex items-center">
                            <CircleDashed className="w-3.5 h-3.5 text-zinc-600" />
                          </span>
                        )}
                        <span className={`leading-tight ${rec.isDeleted ? 'line-through text-zinc-400' : ''}`}>
                          {rec.songTitle}
                        </span>
                        {rec.isDeleted && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-rose-950 text-rose-400 border border-rose-800 flex-shrink-0 flex items-center gap-0.5">
                            <ArchiveX className="w-3 h-3" /> 削除曲
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-200 border border-zinc-800 inline-block">
                        {rec.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-zinc-300 num-tabular align-middle">{rec.level}</td>
                    <td className="py-3 px-3 font-mono text-zinc-400 num-tabular align-middle">{rec.constantChart ?? '-'}</td>
                    <td className="py-3 px-3 font-mono text-zinc-400 num-tabular align-middle">{rec.notes ? rec.notes.toLocaleString() : '-'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-100 num-tabular align-middle">
                      {rec.isPlayed && rec.score ? rec.score.toLocaleString() : <span className="text-zinc-600 font-normal">未入力</span>}
                    </td>
                    <td className="py-3 px-3 align-middle">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        !rec.isPlayed ? 'bg-zinc-900 text-zinc-600 border border-zinc-800' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}>
                        {rec.grade || '未プレイ'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400 num-tabular align-middle">{rec.isPlayed && rec.maxMinus !== undefined ? `-${rec.maxMinus}` : '-'}</td>
                    <td className="py-3 px-4 text-zinc-400 truncate max-w-xs align-middle">
                      <div className="flex items-center space-x-1.5 truncate">
                        {Object.entries(rec.customAttributes || {}).map(([k, v]) => (
                          v ? <span key={k} className="text-[11px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 flex-shrink-0">{k}: {String(v)}</span> : null
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right align-middle">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(rec)}
                          className="text-zinc-400 hover:text-zinc-100 p-1 transition"
                          title="編集 (スコア入力 / 削除曲設定)"
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal (with Deleted Song Checkbox!) */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121215] border border-zinc-700 w-full max-w-lg rounded-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">
                {editingRecordId ? `${currentGame.name} - プレイ記録の編集` : `${currentGame.name} - 新しい楽曲・枠の追加`}
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

              {/* Deleted Song Flag Checkbox */}
              <div className="bg-zinc-900/60 border border-zinc-800 p-2.5 rounded flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-rose-300 block">削除曲フラグ</label>
                  <p className="text-[10px] text-zinc-400">アプデ等で削除・プレイ不可となった楽曲の場合にチェックを入れます。</p>
                </div>
                <input
                  type="checkbox"
                  checked={isDeletedSong}
                  onChange={(e) => setIsDeletedSong(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">難易度 (マスターから選択)</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-semibold"
                  >
                    {difficultyMasters.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
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
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">スコア (Score)</label>
                  <input
                    type="number"
                    placeholder="未プレイなら空欄"
                    value={score}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Grade / ランク</label>
                  <select
                    value={selectedGradeName}
                    onChange={(e) => setSelectedGradeName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-semibold"
                  >
                    {gradeMasters
                      .filter(g => hasMaxConcept || g.category !== 'MAX')
                      .map(g => (
                        <option key={g.id} value={g.name}>{g.name} = [{g.category}]</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">
                    MAX- (失点数) {currentGame.maxMinusFormula && <span className="text-[10px] text-zinc-400 font-normal">⚡自動計算</span>}
                  </label>
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
                  <label className="text-zinc-300 font-medium block">追加カスタム属性</label>
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

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121215] border border-zinc-700 w-full max-w-xl rounded-lg p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">{currentGame.name} - 機種マスター設定</h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 0: Has MAX Concept Toggle */}
            <div className="space-y-2 bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-zinc-200 block">理論値 (MAX) 概念の有無</label>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    プロセカやバンドリのように「理論値(MAX)」という個別概念が存在しない機種はOFFに設定します。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={editedHasMax}
                    onChange={(e) => setEditedHasMax(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
            </div>

            {/* Section 1: Formula */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-zinc-400" />
                1. MAX- (失点数) 自動計算式
              </h4>
              <input
                type="text"
                placeholder="例: ROUND((1010000-score)/(10000/notes))  または  10000000 + notes - score"
                value={editedFormula}
                onChange={(e) => setEditedFormula(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
              />
              <p className="text-[10px] text-zinc-500">
                使用可能関数: <code className="font-mono text-zinc-300">ROUND(...)</code>, <code className="font-mono text-zinc-300">FLOOR(...)</code>, <code className="font-mono text-zinc-300">CEIL(...)</code>, <code className="font-mono text-zinc-300">ABS(...)</code><br />
                使用可能変数: <code className="font-mono text-zinc-300">notes</code>, <code className="font-mono text-zinc-300">score</code>
              </p>
            </div>

            {/* Section 2: Grade Mappings */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-1">
                2. Grade (ランク) ＝ 達成区分のマッピング設定
              </h4>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {editedGradeMasters.map((g) => (
                  <div key={g.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-xs">
                    <span className="font-semibold text-zinc-200">{g.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-500 font-mono text-[11px]">= [{g.category}]</span>
                      <button
                        onClick={() => setEditedGradeMasters(editedGradeMasters.filter(x => x.id !== g.id))}
                        className="text-zinc-600 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-1 text-xs">
                <input
                  type="text"
                  placeholder="Grade名 (例: 未プレイ...)"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-1.5 focus:outline-none"
                />
                <select
                  value={newGradeCategory}
                  onChange={(e) => setNewGradeCategory(e.target.value as GradeCategory)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded px-2 py-1.5 focus:outline-none font-medium"
                >
                  <option value="Unplayed">Unplayed (未プレイ)</option>
                  <option value="MAX">MAX (理論値)</option>
                  <option value="AP">AP (All Perfect)</option>
                  <option value="FC">FC (Full Combo)</option>
                  <option value="Clear">Clear (クリア)</option>
                  <option value="Failed">Played / Failed (失敗)</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newGradeName.trim()) return;
                    setEditedGradeMasters([...editedGradeMasters, {
                      id: `g-${Date.now()}`,
                      name: newGradeName.trim(),
                      category: newGradeCategory
                    }]);
                    setNewGradeName('');
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded border border-zinc-700 font-medium transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>追加</span>
                </button>
              </div>
            </div>

            {/* Section 3: Difficulty Masters */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-1">
                3. 難易度 (Difficulty) マスター ＆ 並び順設定
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {editedDiffMasters.map((d, idx) => (
                  <div key={d.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-xs">
                    <span className="font-bold text-zinc-200">{d.name} <span className="text-[10px] font-normal text-zinc-500 ml-2">(順位: {idx + 1})</span></span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveDiffOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDiffOrder(idx, 'down')}
                        disabled={idx === editedDiffMasters.length - 1}
                        className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditedDiffMasters(editedDiffMasters.filter(x => x.id !== d.id))}
                        className="p-1 text-zinc-600 hover:text-rose-400 transition ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 pt-1 text-xs">
                <input
                  type="text"
                  placeholder="新難易度名 (例: BYD, FTR...)"
                  value={newDiffName}
                  onChange={(e) => setNewDiffName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-1.5 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newDiffName.trim()) return;
                    const nextOrder = editedDiffMasters.length + 1;
                    setEditedDiffMasters([...editedDiffMasters, {
                      id: `d-${Date.now()}`,
                      name: newDiffName.trim(),
                      order: nextOrder
                    }]);
                    setNewDiffName('');
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded border border-zinc-700 font-medium transition flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>難易度追加</span>
                </button>
              </div>
            </div>

            {/* Section 4: Include Deleted Songs in Stats Master Setting */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-200">
                4. 削除曲の集計・統計フラグ設定 (include_deleted_in_stats)
              </h4>
              <label className="flex items-center space-x-2 cursor-pointer bg-zinc-900 border border-zinc-800 p-2.5 rounded">
                <input
                  type="checkbox"
                  checked={editedIncludeDeleted}
                  onChange={(e) => setEditedIncludeDeleted(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-700 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs text-zinc-300">削除曲（非公開曲）を全体統計・カード集計にデフォルトで包含する (include_deleted_in_stats)</span>
              </label>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-3 py-1.5 rounded text-zinc-400 hover:bg-zinc-800 transition text-xs"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveGameSettings}
                className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-medium transition text-xs"
              >
                設定を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
