-- ========================================================
-- 音ゲー詳細統計ポータル (RG STATS) データベーススキーマ
-- 実行方法: Supabaseの "SQL Editor" に張り付けて "Run" を実行
-- ========================================================

-- 1. テーブル削除（再構築用）
DROP TABLE IF EXISTS play_records CASCADE;
DROP TABLE IF EXISTS custom_field_definitions CASCADE;
DROP TABLE IF EXISTS games CASCADE;

-- 2. ゲームタイトルテーブル作成
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sheet_name TEXT NOT NULL,
    ap_count INTEGER DEFAULT 0,
    max_count INTEGER DEFAULT 0,
    ap_term TEXT NOT NULL DEFAULT 'ALL PERFECT',
    max_term TEXT NOT NULL DEFAULT 'MAX / 理論値',
    fc_term TEXT DEFAULT 'Full Combo',
    clear_term TEXT DEFAULT 'Clear',
    failed_term TEXT DEFAULT 'Failed',
    device TEXT CHECK (device IN ('Mobile', 'Arcade')) NOT NULL DEFAULT 'Mobile',
    has_max_concept BOOLEAN DEFAULT TRUE,
    special_max_count INTEGER DEFAULT 0,
    special_max_term TEXT,
    max_minus_formula TEXT,
    grade_masters JSONB DEFAULT '[]'::jsonb,
    difficulty_masters JSONB DEFAULT '[]'::jsonb,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 動的カスタム項目定義テーブル作成
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    field_type TEXT CHECK (field_type IN ('text', 'number', 'select')) NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. プレイ記録テーブル作成 (JSONBで拡張属性を保持)
CREATE TABLE play_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    song_title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    level TEXT NOT NULL,
    constant_chart DECIMAL(4, 1),
    notes INTEGER,
    score INTEGER NOT NULL,
    grade TEXT NOT NULL,
    max_minus INTEGER,
    is_played BOOLEAN DEFAULT TRUE,
    is_ap BOOLEAN DEFAULT FALSE,
    is_fc BOOLEAN DEFAULT FALSE,
    is_clear BOOLEAN DEFAULT FALSE,
    is_max BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    custom_attributes JSONB DEFAULT '{}'::jsonb
);

-- 5. インデックス作成 (検索・集計高速化)
CREATE INDEX IF NOT EXISTS idx_play_records_game_id ON play_records(game_id);
CREATE INDEX IF NOT EXISTS idx_play_records_user_id ON play_records(user_id);
CREATE INDEX IF NOT EXISTS idx_play_records_is_deleted ON play_records(is_deleted);

-- 6. Row Level Security (RLS) セキュリティ設定
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_records ENABLE ROW LEVEL SECURITY;

-- 閲覧: 誰でも可能 (Public Read)
CREATE POLICY "Public Read Games" ON games FOR SELECT USING (true);
CREATE POLICY "Public Read Fields" ON custom_field_definitions FOR SELECT USING (true);
CREATE POLICY "Public Read Records" ON play_records FOR SELECT USING (true);

-- 作成・更新・削除: 許可
CREATE POLICY "Public/Auth Write Games" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public/Auth Write Fields" ON custom_field_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public/Auth Write Records" ON play_records FOR ALL USING (true) WITH CHECK (true);

-- 7. 初期データ登録 (Arcaea)
INSERT INTO games (
    id, name, sheet_name, ap_count, max_count, ap_term, max_term, fc_term, clear_term, failed_term,
    device, has_max_concept, max_minus_formula, grade_masters, difficulty_masters
) VALUES (
    'arcaea',
    'Arcaea',
    'PM[Arcaea]',
    0,
    0,
    'Pure Memory',
    'MAX / 理論値',
    'Full Recall',
    'Track Complete',
    'Track Lost',
    'Mobile',
    TRUE,
    '10000000 + notes - score',
    '[
        {"id": "g0", "name": "未プレイ", "category": "Unplayed"},
        {"id": "g1", "name": "Pure Memory (理論値)", "category": "MAX"},
        {"id": "g2", "name": "Pure Memory", "category": "AP"},
        {"id": "g3", "name": "Full Recall", "category": "FC"},
        {"id": "g4", "name": "Track Complete", "category": "Clear"},
        {"id": "g5", "name": "Track Lost", "category": "Failed"}
    ]'::jsonb,
    '[
        {"id": "d1", "name": "BYD", "order": 1},
        {"id": "d2", "name": "FTR", "order": 2},
        {"id": "d3", "name": "PRS", "order": 3},
        {"id": "d4", "name": "PST", "order": 4}
    ]'::jsonb
);
