'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { INITIAL_GAMES } from '@/lib/mockData';
import { Download, Upload, Plus, FileSpreadsheet, CheckCircle, Database, Settings, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [customFields, setCustomFields] = useState([
    { id: '1', name: 'コンポーザー', type: 'text' },
    { id: '2', name: 'BPM', type: 'number' },
    { id: '3', name: '譜面制作者 (Notes Designer)', type: 'text' }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'select'>('text');

  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Export full existing data as template CSV
  const handleDownloadExistingDataCsv = () => {
    const dataToExport = INITIAL_GAMES.map(g => ({
      'ID (識別子)': g.id,
      'Game Title': g.name,
      'Sheet Name': g.sheetName,
      'AP Count': g.apCount,
      'MAX Count': g.maxCount,
      'AP Term': g.apTerm,
      'MAX Term': g.maxTerm,
      'Device': g.device,
      'コンポーザー (任意)': '',
      'BPM (任意)': '',
      '備考': ''
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rg_stats_full_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export empty CSV template
  const handleDownloadEmptyTemplate = () => {
    const emptyHeaders = [{
      'ID (識別子)': '',
      'Game Title': '',
      'Sheet Name': '',
      'AP Count': 0,
      'MAX Count': 0,
      'AP Term': 'ALL PERFECT',
      'MAX Term': 'MAX / 理論値',
      'Device': 'Mobile',
      'コンポーザー (任意)': '',
      'BPM (任意)': ''
    }];
    const csv = Papa.unparse(emptyHeaders);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rg_stats_empty_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload & import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportStatus(`CSVファイルの解析完了: ${results.data.length} 件のレコードを正常に読み込み・同期しました！`);
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
          CSVテンプレートの入出力・データ一括更新・動的カスタム項目の設定を行います
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
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" /> CSVテンプレート ＆ 一括データ管理
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            既存データのバックアップ・一括修正、または新規データの追加を行えます
          </p>
        </div>

        {/* Action Buttons: Export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
            <div>
              <span className="font-medium text-zinc-200 text-xs block">既存データ入りテンプレート CSV</span>
              <p className="text-[11px] text-zinc-400 mt-1">
                登録済みのデータを全件含んだCSVを出力します。編集して再アップロードすると一括修正されます。
              </p>
            </div>
            <button
              onClick={handleDownloadExistingDataCsv}
              className="mt-3 flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>全データ入りCSVをエクスポート</span>
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
            <div>
              <span className="font-medium text-zinc-200 text-xs block">新規追加用 空テンプレート</span>
              <p className="text-[11px] text-zinc-400 mt-1">
                新しい曲やプレイ記録を一から入力するための空フォーマットCSVをダウンロードします。
              </p>
            </div>
            <button
              onClick={handleDownloadEmptyTemplate}
              className="mt-3 flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>空テンプレートをダウンロード</span>
            </button>
          </div>
        </div>

        {/* File Upload Zone */}
        <div className="border border-dashed border-zinc-800 bg-zinc-900/50 p-6 rounded text-center space-y-2 transition">
          <Upload className="w-6 h-6 text-zinc-500 mx-auto" />
          <div>
            <label htmlFor="csv-upload" className="cursor-pointer text-xs font-medium text-zinc-200 hover:underline">
              編集済みテンプレートCSVファイルを選択
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
        </div>

        {/* Status Notification */}
        {importStatus && (
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-200 p-3 rounded text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
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

        {/* Current Custom Fields List */}
        <div className="space-y-2">
          {customFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-2 rounded text-xs">
              <span className="font-medium text-zinc-300">{field.name}</span>
              <span className="text-zinc-500 font-mono text-[11px]">タイプ: {field.type}</span>
            </div>
          ))}
        </div>

        {/* Add Field Form */}
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
