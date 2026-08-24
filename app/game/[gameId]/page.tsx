'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Papa from 'papaparse';
import { INITIAL_GAMES, MOCK_PLAY_RECORDS } from '@/lib/mockData';
import { PlayRecord } from '@/lib/types';
import { ArrowLeft, Search, Plus, FileEdit, CheckCircle2, X, Download, Upload, Trash2 } from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const game = INITIAL_GAMES.find(g => g.id === gameId) || INITIAL_GAMES[0];

  const [records, setRecords] = useState<PlayRecord[]>(
    MOCK_PLAY_RECORDS.filter(r => r.gameId === gameId)
  );

  const [search, setSearch] = useState('');
  const [apFilter, setApFilter] = useState<'All' | 'AP' | 'MAX'>('All');

  // Modal State for adding a new play record
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [difficulty, setDifficulty] = useState('MASTER');
  const [level, setLevel] = useState('14');
  const [constantChart, setConstantChart] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [grade, setGrade] = useState('AP');
  const [maxMinus, setMaxMinus] = useState<string>('');
  const [isAp, setIsAp] = useState(true);
  const [isFc, setIsFc] = useState(true);
  const [isClear, setIsClear] = useState(true);
  const [isMax, setIsMax] = useState(false);
  const [composer, setComposer] = useState('');
  const [bpm, setBpm] = useState('');

  // Handle Add Play Record
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) return;

    const newRecord: PlayRecord = {
      id: `rec-${Date.now()}`,
      gameId,
      songTitle,
      difficulty,
      level,
      constantChart: constantChart ? parseFloat(constantChart) : undefined,
      notes: notes ? parseInt(notes, 10) : undefined,
      score: score ? parseInt(score, 10) : 0,
      grade: grade || 'AP',
      maxMinus: maxMinus !== '' ? parseInt(maxMinus, 10) : undefined,
      isAp,
      isFc: isAp || isFc,
      isClear: isAp || isFc || isClear,
      isMax,
      playedAt: new Date().toISOString(),
      customAttributes: {
        composer: composer || undefined,
        bpm: bpm ? parseInt(bpm, 10) : undefined
      }
    };

    setRecords([newRecord, ...records]);
    setIsModalOpen(false);

    // Reset Form
    setSongTitle('');
    setScore('');
    setMaxMinus('');
    setComposer('');
    setBpm('');
  };

  // Export current game's song play records to CSV
  const handleExportSongsCsv = () => {
    const exportData = records.map(r => ({
      'ID (識別子)': r.id,
      'Game Title': game.name,
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
      'Composer (コンポーザー)': r.customAttributes?.composer || '',
      'BPM': r.customAttributes?.bpm || ''
    }));

    // Add 1 sample row if empty so user gets headers
    if (exportData.length === 0) {
      exportData.push({
        'ID (識別子)': '',
        'Game Title': game.name,
        'Song Title (曲名)': 'サンプル曲名',
        'Difficulty (難易度)': 'MASTER',
        'Level (レベル)': '14',
        'Constant Chart (譜面定数)': '14.5',
        'Notes (ノーツ数)': '2000',
        'Score (スコア)': 1000000,
        'Grade (ランク)': 'AP',
        'MAX- (失点)': '0',
        'is_AP (1:はい / 0:いいえ)': 1,
        'is_FC (1:はい / 0:いいえ)': 1,
        'is_Clear (1:はい / 0:いいえ)': 1,
        'Composer (コンポーザー)': '作曲者名',
        'BPM': '200'
      });
    }

    const csv = Papa.unparse(exportData);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${game.name}_play_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Song CSV for this game
  const handleImportSongsCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedRecords: PlayRecord[] = results.data.map((row: any, idx: number) => {
          const isApVal = row['is_AP (1:はい / 0:いいえ)'] == 1 || String(row['Grade (ランク)']).toLowerCase().includes('ap') || String(row['Grade (ランク)']).toLowerCase().includes('pm');
          return {
            id: row['ID (識別子)'] || `imp-${Date.now()}-${idx}`,
            gameId,
            songTitle: row['Song Title (曲名)'] || row['title'] || row['曲名'] || '無題',
            difficulty: row['Difficulty (難易度)'] || row['difficulty'] || 'MASTER',
            level: String(row['Level (レベル)'] || row['level'] || '12'),
            constantChart: row['Constant Chart (譜面定数)'] ? parseFloat(row['Constant Chart (譜面定数)']) : undefined,
            notes: row['Notes (ノーツ数)'] ? parseInt(row['Notes (ノーツ数)'], 10) : undefined,
            score: parseInt(row['Score (スコア)'] || row['score'] || '0', 10),
            grade: row['Grade (ランク)'] || 'AP',
            maxMinus: row['MAX- (失点)'] !== '' ? parseInt(row['MAX- (失点)'], 10) : undefined,
            isAp: isApVal,
            isFc: isApVal || row['is_FC (1:はい / 0:いいえ)'] == 1,
            isClear: isApVal || row['is_Clear (1:はい / 0:いいえ)'] == 1,
            isMax: false,
            playedAt: new Date().toISOString(),
            customAttributes: {
              composer: row['Composer (コンポーザー)'] || row['composer'] || undefined,
              bpm: row['BPM'] ? parseInt(row['BPM'], 10) : undefined
            }
          };
        });

        setRecords([...importedRecords, ...records]);
      }
    });
  };

  // Filter records
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.songTitle.toLowerCase().includes(search.toLowerCase()) ||
                          (r.customAttributes?.composer || '').toLowerCase().includes(search.toLowerCase());
    const matchesAp = apFilter === 'All' || (apFilter === 'AP' && r.isAp) || (apFilter === 'MAX' && r.isMax);
    return matchesSearch && matchesAp;
  });

  const currentApCount = records.filter(r => r.isAp).length;
  const currentMaxCount = records.filter(r => r.isMax).length;

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
            登録曲数: <span className="font-mono text-zinc-300 font-bold">{records.length} 曲</span>
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center space-x-3">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{game.apTerm}</span>
            <span className="text-lg font-bold text-zinc-200 num-tabular">{currentApCount.toLocaleString()}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[10px] text-zinc-500 block truncate">{game.maxTerm}</span>
            <span className="text-lg font-bold text-zinc-300 num-tabular">{currentMaxCount.toLocaleString()}</span>
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

        {/* Action Buttons: Add Record, CSV Export, CSV Import */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportSongsCsv}
            title="この機種の楽曲リストCSVを出力"
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1.5 rounded text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">CSV出力</span>
          </button>

          <label
            htmlFor="song-csv-import"
            title="楽曲CSVを取り込み"
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
            onClick={() => setIsModalOpen(true)}
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
                <th className="py-2.5 px-3 text-center">{game.apTerm}</th>
                <th className="py-2.5 px-4">コンポーザー / BPM</th>
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
                    <td className="py-2.5 px-4 text-zinc-400 truncate max-w-xs">
                      {rec.customAttributes?.composer || '-'} {rec.customAttributes?.bpm ? `(BPM: ${rec.customAttributes.bpm})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setRecords(records.filter(r => r.id !== rec.id))}
                        className="text-zinc-600 hover:text-zinc-300 p-1 transition"
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

      {/* Modal for adding a new play record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121215] border border-zinc-700 w-full max-w-lg rounded-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">{game.name} - プレイ記録の追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3 text-xs">
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
                  <label className="text-zinc-300 font-medium block mb-1">スコア (Score)</label>
                  <input
                    type="number"
                    placeholder="例: 1000000"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">ランク (Grade)</label>
                  <input
                    type="text"
                    placeholder="例: SSS+, PM, AJ"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="text-zinc-300 font-medium block mb-1">コンポーザー (任意)</label>
                  <input
                    type="text"
                    placeholder="作曲者名"
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-3 py-2 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

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
                    <span className="text-zinc-200">{game.apTerm} (AP)</span>
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
                    <span className="text-zinc-300">FC (フルコンボ)</span>
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
                    <span className="text-zinc-400">Clear (クリア)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
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
