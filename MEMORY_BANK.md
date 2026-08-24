# 🎵 Rhythm Game Tracker (音ゲー実績・プレイ記録管理ツール) - MEMORY BANK

このドキュメントは、別PCや別の開発セッションにおいてAIエージェントが過去の決定事項、技術スタック、ユーザーの強いこだわり・仕様を100%再現・継承するための**プロジェクト記憶バンク (Memory Bank)** です。

---

## 🛠 技術スタック & アーキテクチャ

* **フレームワーク**: Next.js 14 (App Router / React / TypeScript)
* **スタイル**: Tailwind CSS (ダークテーマ `#121215` / シック＆エレガント多色パレット)
* **データ管理**: LocalStorage (`lib/storage.ts`) / 将来的には Supabase / RLS 連携可能な構造
* **CSVパース・出力**: PapaParse (`papaparse`) / UTF-8 with BOM (\uFEFF)
* **グラフ・視覚化**: Recharts (`AreaChart`, `LineChart`)

---

## 🏛 画面設計と役割の厳密な分担

1. **総合ダッシュボード (`/`)**:
   * 全機種の総 Clear数, 総 FC数, 総 AP数, 総 MAX(理論値)数の4カード表示
   * 成長推移ピラミッドグラフ（土台: 既プレイ ➔ Clear ➔ FC ➔ AP ➔ 頂点: MAX）
   * 機種アーカイブ一覧（理論値概念なし機種は `理論値: -` と表示）

2. **各機種別詳細ページ (`/game/[gameId]`)**:
   * 対象機種の楽曲プレイ記録一覧（No., 楽曲タイトル, 難易度, Level, 譜面定数, Notes, Score, Grade, MAX-, 詳細属性, 操作）
   * **CSV置換取込 (Replace Mode)**: 取込時に対象機種の旧データを全削除し、CSVの内容で丸ごと上書き更新（重複防止＆CSV側での一括削除を可能にするため）
   * **標準デフォルトソート**: 1. 楽曲タイトル順 (あいうえお/ABC) ➔ 2. 難易度マスター順 (例: BYD ➔ FTR ➔ PRS ➔ PST)
   * **Pure Memory (AP) 列の非表示**: テーブル上から重複列を除外しスッキリ化
   * **削除曲 (isDeleted) 管理**: 削除曲フラグ（初期値 `FALSE`）、削除曲を統計に含めるかどうかのON/OFFスイッチ、`[削除曲]` バッジ表示

3. **管理画面 (`/admin`)**:
   * **全機種マスター構成CSVの一括管理専用ページ**:
     * ヘッダー: `game_id,game_name,sheet_name,device,has_max_concept,ap_term,max_term,fc_term,clear_term,max_minus_formula,grade_MAX,grade_AP,grade_FC,grade_Clear,grade_Failed,grade_Unplayed,difficulty_1,difficulty_2,...,difficulty_10`

---

## 💎 ユーザーのこだわり＆確定仕様 (User Knowledge)

1. **CSV完全置換取込（Replace モード）**:
   * 差分マージではなく、取込時に対象ゲームの既存データを一度クリアしてCSV全件で置き換える。これによりデータの二重登録を防ぎ、CSVで不要な曲行を消して上げればアプリ側からも一括削除可能。
   * CSVには内部管理ID列 (`ID (識別子)`) を含めない。

2. **理論値 (MAX) 概念の有無 (hasMaxConcept)**:
   * プロセカやバンドリなど「理論値(MAX)」の個別概念が存在しないゲームは `hasMaxConcept: false`。
   * カードや一覧で「0曲」ではなく **`なし (-)` と暗くグレーアウト表示** する。

3. **失点数 (MAX-) 自動計算エンジン**:
   * 数式評価関数 (`evaluateFormula`) は四則演算 `+ - * /`、ネストカッコ `((...))`、および `ROUND(...)`（四捨五入）、`FLOOR(...)`（切り捨て）、`CEIL(...)`（切り上げ）、`ABS(...)`（絶対値）をサポート。
   * カッコが1つ不足していても自動補正して計算を保護。
   * Arcaea デフォルト: `10000000 + notes - score`
   * 音ゲー例: `ROUND((1010000-score)/(10000/notes))`

4. **CSV数値パースのカンマ全自動クリーニング**:
   * `9,854,120` や `10,000,469` などの桁区切りカンマを除去する `parseCleanInt` / `parseCleanFloat` を使用（`parseInt` がカンマで途切れて `9` になる大バグを防止）。

5. **Grade 省略形マッピング**:
   * `PM` ➔ MAX (理論値)
   * `AP` ➔ AP (All Perfect)
   * `FR` / `FC` ➔ FC (Full Combo)
   * `C` ➔ Clear (Track Complete)
   * `TL` ➔ Failed (Track Lost)

6. **削除曲フラグ (isDeleted)**:
   * 初期値 `FALSE`
   * ツールバーの「削除曲を統計に含める」スイッチ（初期値 `FALSE`）で、統計カウント・グラフへの包含/除外を即座に切り替え可能。

---

## 🚀 別PCで開発を継続・引き継ぐ手順

1. 別PCでリポジトリをクローンまたは pull します：
   ```bash
   git pull origin main
   ```
2. AIエージェント（Antigravity CLI / AGY / IDE）を起動した際、以下のように指示します：
   > 「`MEMORY_BANK.md` を確認して、これまでの設計方針とユーザーのこだわりを把握した上で作業を再開してください。」
