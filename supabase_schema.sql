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
    ap_term TEXT NOT NULL,
    max_term TEXT NOT NULL,
    device TEXT CHECK (device IN ('Mobile', 'Arcade')) NOT NULL,
    special_max_count INTEGER DEFAULT 0,
    special_max_term TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 動的カスタム項目定義テーブル作成
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    field_type TEXT CHECK (field_type IN ('text', 'number', 'select')) NOT NULL,
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
    is_ap BOOLEAN DEFAULT FALSE,
    is_max BOOLEAN DEFAULT FALSE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    custom_attributes JSONB DEFAULT '{}'::jsonb
);

-- 5. Row Level Security (RLS) セキュリティ設定
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_records ENABLE ROW LEVEL SECURITY;

-- 閲覧: 誰でも可能 (Public Read)
CREATE POLICY "Public Read Games" ON games FOR SELECT USING (true);
CREATE POLICY "Public Read Fields" ON custom_field_definitions FOR SELECT USING (true);
CREATE POLICY "Public Read Records" ON play_records FOR SELECT USING (true);

-- 作成・更新・削除: ログイン済み認証ユーザーのみ許可 (Authenticated Write Only)
CREATE POLICY "Auth Write Games" ON games FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Write Fields" ON custom_field_definitions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Write Records" ON play_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. 初期データ登録 (全21機種の正確な初期値)
INSERT INTO games (id, name, sheet_name, ap_count, max_count, ap_term, max_term, device, special_max_count, special_max_term) VALUES
('arcaea', 'Arcaea', 'PM[Arcaea]', 1582, 822, 'Pure Memory', 'MAX / 理論値', 'Mobile', 0, NULL),
('rotaeno', 'Rotaeno', 'AP[Rotaeno]', 712, 72, 'ALL PERFECT', 'ALL PERFECT+', 'Mobile', 0, NULL),
('pjsekai', 'プロセカ', 'AP[プロセカ]', 451, 0, 'ALL PERFECT', '-', 'Mobile', 0, NULL),
('paradigm', 'Paradigm: Reboot', 'AD[Paradigm: Reboot]', 305, 22, 'ALL DECRYPTED', 'MAX / 理論値', 'Mobile', 0, NULL),
('hololive', 'hololive Dreams', 'AP[hololive Dreams]', 353, 0, 'ALL PERFECT', '-', 'Mobile', 0, NULL),
('cytus2', 'Cytus II', 'MM[Cytus II]', 123, 67, 'Million Master', 'TP 100', 'Mobile', 0, 'MAX MASTER'),
('chunithm', 'CHUNITHM', 'AJ[CHUNITHM]', 85, 0, 'ALL JUSTICE', 'ALL JUSTICE CRITICAL', 'Arcade', 0, NULL),
('phigros', 'Phigros', 'Phi[Phigros]', 58, 0, 'Phi', '-', 'Mobile', 0, NULL),
('ryceam', 'RYCEAM', 'AP[RYCEAM]', 57, 0, 'ALL PRECISE', '-', 'Mobile', 0, NULL),
('takumi3', 'TAKUMI³', 'AJ[TAKUMI³]', 53, 14, 'ALL JUST', 'MAX / 理論値', 'Mobile', 0, NULL),
('maimai', 'maimai', 'AP[maimai]', 49, 15, 'ALL PERFECT', 'ALL PERFECT+', 'Arcade', 0, 'でらっくスコア理論値'),
('orzmic', 'Orzmic', 'PD[Orzmic]', 34, 10, 'PERFECT DECRYPTION', 'ORZ', 'Mobile', 0, NULL),
('kalpa', 'KALPA', 'AP[KALPA]', 33, 0, 'ALL PERFECT', '-', 'Mobile', 0, NULL),
('musicdiver', 'MUSIC DIVER', 'AP[MUSIC DIVER]', 26, 0, 'ALL PERFECT', 'ALL CRITICAL', 'Arcade', 0, NULL),
('milthm', 'Milthm', 'AP[Milthm]', 23, 6, 'ALL PERFECT', 'RHYTHM of RAIN', 'Mobile', 0, NULL),
('lanota', 'Lanota', 'PP[Lanota]', 19, 0, 'Perfect Purified', '-', 'Mobile', 0, NULL),
('liminality', 'Liminality', 'L[Liminality]', 14, 0, 'Liminality', 'ALL HI-TECH+', 'Mobile', 0, NULL),
('ongeki', 'オンゲキ', 'AB[オンゲキ]', 9, 0, 'ALL BREAK', 'テクニカルスコア理論値', 'Arcade', 0, 'P-スコア理論値'),
('rizline', 'Rizline', 'AP[Rizline]', 7, 7, 'ALL PERFECT', 'MAX / 理論値', 'Mobile', 0, NULL),
('ellia', 'ELLIA', 'X[ELLIA]', 6, 0, 'MAXX', '理論値', 'Mobile', 0, NULL),
('deemo', 'DEEMO -Reborn-', 'AC[DEEMO -Reborn-]', 2, 0, 'ALL CHARMING', '-', 'Mobile', 0, NULL);
