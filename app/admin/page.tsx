'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { getStoredGames, fetchGamesAsync, saveGamesAsync } from '@/lib/storage';
import { GameTitle, GradeMasterItem, DifficultyMasterItem, GradeCategory } from '@/lib/types';
import { Download, Upload, Plus, FileSpreadsheet, CheckCircle, Database, Settings, ShieldCheck, Gamepad2, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [games, setGames] = useState<GameTitle[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      setGames(getStoredGames());
      const freshGames = await fetchGamesAsync();
      setGames(freshGames);
    } catch (e) {
      console.error('Failed to load games in admin', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Export Games Master Config CSV
  const handleDownloadGamesMasterCsv = () => {
    const storedGames = getStoredGames();

    const csvRows = storedGames.map(game => {
      const diffs = game.difficultyMasters || [];
      const grades = game.gradeMasters || [];

      const getGradeNameByCategory = (cat: GradeCategory) => {
        const item = grades.find(g => g.category === cat);
        return item ? item.name : '';
      };

      return {
        'game_id': game.id,
        'game_name': game.name,
        'sheet_name': game.sheetName || `[${game.name}]`,
        'device': game.device || 'Mobile',
        'has_max_concept': game.hasMaxConcept !== false ? 'TRUE' : 'FALSE',
        'ap_term': game.apTerm || 'AP',
        'max_term': game.maxTerm || 'MAX',
        'fc_term': game.fcTerm || 'Full Combo',
        'clear_term': game.clearTerm || 'Clear',
        'max_minus_formula': game.maxMinusFormula || '',
        'grade_MAX': getGradeNameByCategory('MAX'),
        'grade_AP': getGradeNameByCategory('AP'),
        'grade_FC': getGradeNameByCategory('FC'),
        'grade_Clear': getGradeNameByCategory('Clear'),
        'grade_Failed': getGradeNameByCategory('Failed'),
        'grade_Unplayed': getGradeNameByCategory('Unplayed'),
        'difficulty_1': diffs[0]?.name || '',
        'difficulty_2': diffs[1]?.name || '',
        'difficulty_3': diffs[2]?.name || '',
        'difficulty_4': diffs[3]?.name || '',
        'difficulty_5': diffs[4]?.name || '',
        'difficulty_6': diffs[5]?.name || '',
        'difficulty_7': diffs[6]?.name || '',
        'difficulty_8': diffs[7]?.name || '',
        'difficulty_9': diffs[8]?.name || '',
        'difficulty_10': diffs[9]?.name || ''
      };
    });

    if (csvRows.length === 0) {
      csvRows.push({
        'game_id': 'arcaea',
        'game_name': 'Arcaea',
        'sheet_name': 'PM[Arcaea]',
        'device': 'Mobile',
        'has_max_concept': 'TRUE',
        'ap_term': 'Pure Memory',
        'max_term': 'MAX / 理論値',
        'fc_term': 'Full Recall',
        'clear_term': 'Track Complete',
        'max_minus_formula': '10000000 + notes - score',
        'grade_MAX': 'Pure Memory (理論値)',
        'grade_AP': 'Pure Memory',
        'grade_FC': 'Full Recall',
        'grade_Clear': 'Track Complete',
        'grade_Failed': 'Track Lost',
        'grade_Unplayed': '未プレイ',
        'difficulty_1': 'BYD',
        'difficulty_2': 'FTR',
        'difficulty_3': 'PRS',
        'difficulty_4': 'PST',
        'difficulty_5': '',
        'difficulty_6': '',
        'difficulty_7': '',
        'difficulty_8': '',
        'difficulty_9': '',
        'difficulty_10': ''
      });
    }

    const csv = Papa.unparse(csvRows);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rg_stats_games_master_config.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Games Master Config CSV
  const handleUploadGamesMasterCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const existingGames = getStoredGames();

        const updatedGames: GameTitle[] = results.data.map((row: any, idx: number) => {
          const name = String(row['game_name'] || row['Game Name'] || `Game ${idx + 1}`).trim();
          const id = (row['game_id'] || name.toLowerCase().replace(/[^a-z0-9]/g, '') || `game-${Date.now()}-${idx}`).trim();
          const device = (row['device'] || 'Mobile').trim() === 'Arcade' ? 'Arcade' : 'Mobile';
          const hasMaxConcept = String(row['has_max_concept'] || 'TRUE').toUpperCase() !== 'FALSE';

          const apTerm = String(row['ap_term'] || 'AP').trim();
          const maxTerm = String(row['max_term'] || 'MAX').trim();
          const fcTerm = String(row['fc_term'] || 'Full Combo').trim();
          const clearTerm = String(row['clear_term'] || 'Clear').trim();
          const formula = String(row['max_minus_formula'] || '').trim();

          // Build Grade Masters
          const gradeMasters: GradeMasterItem[] = [];
          if (row['grade_Unplayed'] || true) gradeMasters.push({ id: `g-unplay`, name: String(row['grade_Unplayed'] || '未プレイ').trim(), category: 'Unplayed' });
          if (hasMaxConcept && row['grade_MAX']) gradeMasters.push({ id: `g-max`, name: String(row['grade_MAX']).trim(), category: 'MAX' });
          if (row['grade_AP']) gradeMasters.push({ id: `g-ap`, name: String(row['grade_AP']).trim(), category: 'AP' });
          if (row['grade_FC']) gradeMasters.push({ id: `g-fc`, name: String(row['grade_FC']).trim(), category: 'FC' });
          if (row['grade_Clear']) gradeMasters.push({ id: `g-clear`, name: String(row['grade_Clear']).trim(), category: 'Clear' });
          if (row['grade_Failed']) gradeMasters.push({ id: `g-failed`, name: String(row['grade_Failed']).trim(), category: 'Failed' });

          // Build Difficulty Masters (difficulty_1 ~ difficulty_10)
          const difficultyMasters: DifficultyMasterItem[] = [];
          for (let i = 1; i <= 10; i++) {
            const diffName = String(row[`difficulty_${i}`] || '').trim();
            if (diffName) {
              difficultyMasters.push({
                id: `d-${i}-${Date.now()}`,
                name: diffName,
                order: i
              });
            }
          }

          // Fallback diffs if empty
          if (difficultyMasters.length === 0) {
            difficultyMasters.push({ id: 'd1', name: 'MASTER', order: 1 });
            difficultyMasters.push({ id: 'd2', name: 'EXPERT', order: 2 });
          }

          // Find existing counts or default
          const existing = existingGames.find(g => g.id === id);

          return {
            id,
            name,
            sheetName: String(row['sheet_name'] || `[${name}]`).trim(),
            apCount: existing ? existing.apCount : 0,
            maxCount: existing ? existing.maxCount : 0,
            apTerm,
            maxTerm,
            fcTerm,
            clearTerm,
            device,
            hasMaxConcept,
            maxMinusFormula: formula,
            gradeMasters,
            difficultyMasters
          };
        });

        setIsLoading(true);
        try {
          await saveGamesAsync(updatedGames);
          await loadData();
          setImportStatus(`機種マスター一括更新完了: ${updatedGames.length} 件のゲームタイトル設定をSupabaseに保存しました！`);
        } catch (err: any) {
          setImportStatus(`保存中にエラーが発生しました: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      },
      error: (err) => {
        setImportStatus(`エラーが発生しました: ${err.message}`);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-400" /> 機種マスター設定 ＆ CSV一括管理
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            登録されている全音ゲータイトルの機種マスター（難易度順序、Gradeマッピング、理論値有無、計算式）を一括管理します
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded text-xs font-medium transition self-start sm:self-auto"
          title="クラウドDBから最新データを取得"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>最新データ同期</span>
        </button>
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

      {/* CSV Games Master Section */}
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-zinc-400" /> 機種マスター一括更新 CSV (機種構成データ)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            楽曲プレイ記録は各ゲームページ (`/game/[gameId]`) で管理し、このページでは全タイトルの難易度定義やGrade設定を一括更新します。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
          <div>
            <span className="font-medium text-zinc-200 text-xs block">全機種マスター設定 CSV のエクスポート</span>
            <p className="text-[11px] text-zinc-400 mt-1">
              現在登録されているゲームタイトルの難易度順序（difficulty_1〜10）、Grade表記、理論値有無、計算式が1ファイルにまとまったCSVを出力します。
            </p>
          </div>
          <button
            onClick={handleDownloadGamesMasterCsv}
            className="mt-3 flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>全機種マスター設定 CSV をダウンロード</span>
          </button>
        </div>

        {/* File Upload Zone */}
        <div className="border border-dashed border-zinc-800 bg-zinc-900/50 p-6 rounded text-center space-y-2 transition">
          <Upload className="w-6 h-6 text-zinc-500 mx-auto" />
          <div>
            <label htmlFor="master-csv-upload" className="cursor-pointer text-xs font-medium text-zinc-200 hover:underline">
              編集済み機種マスターCSVファイルを選択
            </label>
            <span className="text-xs text-zinc-500"> またはドラッグ＆ドロップ</span>
            <input
              id="master-csv-upload"
              type="file"
              accept=".csv"
              onChange={handleUploadGamesMasterCsv}
              className="hidden"
            />
          </div>
          <p className="text-[11px] text-zinc-500">
            取り込みを行うと、全ゲームタイトルの難易度順序やGradeマスターが一括で置換・上書き更新されます。
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

      {/* Current Active Games Overview Table */}
      <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-lg space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Database className="w-4 h-4 text-zinc-400" /> 登録済み機種マスター一覧 ({games.length} 機種)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-medium uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">ゲームタイトル</th>
                <th className="py-2.5 px-3">デバイス</th>
                <th className="py-2.5 px-3">理論値(MAX)</th>
                <th className="py-2.5 px-3">難易度マスター順序 (difficulty_1 ~ 10)</th>
                <th className="py-2.5 px-3">MAX- 計算式</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-zinc-900/40 transition">
                  <td className="py-2.5 px-3 font-mono text-zinc-500">{g.id}</td>
                  <td className="py-2.5 px-3 font-bold text-zinc-100">{g.name}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{g.device}</td>
                  <td className="py-2.5 px-3">
                    {g.hasMaxConcept !== false ? (
                      <span className="text-sky-400 font-semibold">あり ({g.maxTerm})</span>
                    ) : (
                      <span className="text-zinc-600 font-normal">なし (-)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-300">
                    {(g.difficultyMasters || []).map(d => d.name).join(' ➔ ') || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-400">{g.maxMinusFormula || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
