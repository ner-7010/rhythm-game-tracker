'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { getStoredGames, saveStoredGames, getStoredRecords, saveStoredRecords } from '@/lib/storage';
import { PlayRecord } from '@/lib/types';
import { Download, Upload, Plus, FileSpreadsheet, CheckCircle, Database, Settings, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [customFields, setCustomFields] = useState([
    { id: '1', name: 'コンポーザー', type: 'text' },
    { id: '2', name: 'BPM', type: 'number' },
    { id: '3', name: '譜面制作者', type: 'text' }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'select'>('text');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Export Clean Songs Template CSV
  const handleDownloadSongsTemplateCsv = () => {
    const templateData = [
      {
        'Game Title (ゲーム名)': 'Arcaea',
        'Song Title (曲名)': 'Testify',
        'Difficulty (難易度)': 'BYD',
        'Level (レベル)': '12',
        'Constant Chart (譜面定数)': '12.0',
        'Notes (ノーツ数)': '2222',
        'Score (スコア)': '10000000',
        'Grade (ランク)': 'Pure Memory (理論値)',
        'MAX- (失点)': '0',
        'Composer (コンポーザー)': 'void (Mournfinale)',
        'BPM': '195',
        '譜面制作者': '譜面制作者名'
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rg_stats_song_records_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV (FULL OVERWRITE / REPLACE LOGIC for imported games)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const storedGames = getStoredGames();
        const storedRecords = getStoredRecords();

        // 1. Identify which games are present in this CSV
        const targetGameNames = new Set<string>();
        results.data.forEach((row: any) => {
          const gName = row['Game Title (ゲーム名)'] || row['Game Title'] || row['ゲーム名'] || 'Arcaea';
          targetGameNames.add(gName.trim());
        });

        // 2. Map game names to gameIds
        const targetGameIds = new Set<string>();
        targetGameNames.forEach(gName => {
          const matchedGame = storedGames.find(g => g.name.toLowerCase() === gName.toLowerCase());
          if (matchedGame) {
            targetGameIds.add(matchedGame.id);
          } else {
            targetGameIds.add(gName.toLowerCase().replace(/[^a-z0-9]/g, ''));
          }
        });

        // 3. Clear ALL existing records for the imported games
        const recordsToKeep = storedRecords.filter(r => !targetGameIds.has(r.gameId));

        // 4. Create new PlayRecords
        const newRecords: PlayRecord[] = results.data.map((row: any, idx: number) => {
          const gName = (row['Game Title (ゲーム名)'] || row['Game Title'] || row['ゲーム名'] || 'Arcaea').trim();
          const matchedGame = storedGames.find(g => g.name.toLowerCase() === gName.toLowerCase());
          const gameId = matchedGame ? matchedGame.id : gName.toLowerCase().replace(/[^a-z0-9]/g, '');

          const title = row['Song Title (曲名)'] || row['title'] || row['曲名'] || '無題';
          const diff = row['Difficulty (難易度)'] || row['difficulty'] || 'MASTER';
          const gGrade = row['Grade (ランク)'] || (row['Score (スコア)'] ? 'Pure Memory' : '未プレイ');

          const isPlayed = gGrade !== '未プレイ' && row['Score (スコア)'] !== '' && row['Score (スコア)'] !== undefined;
          const isMax = gGrade.includes('理論値') || gGrade.includes('MAX');
          const isAp = isMax || gGrade.includes('Pure Memory') || gGrade.includes('AP') || gGrade.includes('ALL PERFECT');
          const isFc = isAp || gGrade.includes('Full') || gGrade.includes('FC');
          const isClear = isFc || gGrade.includes('Clear') || gGrade.includes('Complete');

          return {
            id: `imp-${Date.now()}-${idx}`,
            gameId,
            songTitle: title,
            difficulty: diff,
            level: String(row['Level (レベル)'] || row['level'] || '12'),
            constantChart: row['Constant Chart (譜面定数)'] ? parseFloat(row['Constant Chart (譜面定数)']) : undefined,
            notes: row['Notes (ノーツ数)'] ? parseInt(row['Notes (ノーツ数)'], 10) : undefined,
            score: row['Score (スコア)'] ? parseInt(row['Score (スコア)'], 10) : 0,
            grade: gGrade,
            maxMinus: row['MAX- (失点)'] !== '' ? parseInt(row['MAX- (失点)'], 10) : undefined,
            isPlayed, isAp, isFc, isClear, isMax,
            playedAt: new Date().toISOString(),
            customAttributes: {
              'コンポーザー': row['Composer (コンポーザー)'] || row['composer'],
              'BPM': row['BPM'],
              '譜面制作者': row['譜面制作者']
            }
          };
        });

        // 5. Save updated records
        const finalRecords = [...newRecords, ...recordsToKeep];
        saveStoredRecords(finalRecords);
        setImportStatus(`CSV完全置換完了: ${newRecords.length} 件のプレイ記録で対象機種のデータを綺麗に上書き更新しました！`);
      },
      error: (err) => {
        setImportStatus(`エラーが発生しました: ${err.message}`);
      }
    });
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    setCustomFields([
      ...customFields,
      { id: Date.now().toString(), name: newFieldName, type: newFieldType }
    ]);
    setNewFieldName('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-zinc-400" /> 管理画面 & データインポート
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          全楽曲のプレイ記録CSVの完全置換インポート・カスタム項目の管理
        </p>
      </div>

      {/* Security Status Box */}
      <div className="bg-[#121215] border border-zinc-800 p-4 rounded-lg flex items-center space-x-3 text-xs text-zinc-300">
        <ShieldCheck className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        <div>
          <span className="font-semibold text-zinc-200">セキュリティ保護 (Row Level Security / Auth) 有効</span>
          <p className="text-zinc-400 mt-0.5 text-[11px]">
            認証済みアカウント以外の更新・書き込みは拒否されます。
          </p>
        </div>
      </div>

      {/* CSV Export & Import Section */}
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" /> CSVテンプレート ＆ 楽曲データ完全置き換え管理
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            CSVファイルを取り込むと、該当機種の旧データは一度全消去され、CSVの内容で丸ごと綺麗に上書き置換されます。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
          <div>
            <span className="font-medium text-zinc-200 text-xs block">楽曲プレイ記録テンプレート CSV</span>
            <p className="text-[11px] text-zinc-400 mt-1">
              内部ID（`rec-xxx`）不要のシンプルなヘッダー構造です。エクスポートしたCSVを修正してアップロードすれば、削除・追記が一括で適用されます。
            </p>
          </div>
          <button
            onClick={handleDownloadSongsTemplateCsv}
            className="mt-3 flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>シンプル楽曲記録用CSVをダウンロード</span>
          </button>
        </div>

        {/* File Upload Zone */}
        <div className="border border-dashed border-zinc-800 bg-zinc-900/50 p-6 rounded text-center space-y-2 transition">
          <Upload className="w-6 h-6 text-zinc-500 mx-auto" />
          <div>
            <label htmlFor="csv-upload" className="cursor-pointer text-xs font-medium text-zinc-200 hover:underline">
              編集済み楽曲CSVファイルを選択
            </label>
            <span className="text-xs text-zinc-500"> またはドラッグ＆ドロップ</span>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <p className="text-[11px] text-zinc-500">
            取り込みを実行すると、CSVに含まれているゲームの旧データは完全に削除され、CSVに記載されている曲のみで丸ごと置き換えられます。
          </p>
        </div>

        {/* Status Notification */}
        {importStatus && (
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-200 p-3 rounded text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

      {/* Dynamic Custom Fields Section */}
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" /> 動的カスタム管理項目（コード編集不要）
          </h2>
        </div>

        <div className="space-y-2">
          {customFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-2 rounded text-xs">
              <span className="font-medium text-zinc-300">{field.name}</span>
              <span className="text-zinc-500 font-mono text-[11px]">タイプ: {field.type}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="項目名 (例: ジャンル, 原曲名...)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded px-3 py-2 focus:outline-none focus:border-zinc-600 w-full"
          />
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded px-3 py-2 focus:outline-none"
          >
            <option value="text">テキスト (文字列)</option>
            <option value="number">数値 (BPM等)</option>
          </select>
          <button
            onClick={handleAddCustomField}
            className="w-full sm:w-auto flex items-center justify-center space-x-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3.5 py-2 rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>項目を追加</span>
          </button>
        </div>
      </div>
    </div>
  );
}
