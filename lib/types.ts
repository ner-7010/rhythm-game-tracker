export interface GameTitle {
  id: string;
  name: string;
  sheetName: string;
  apCount: number;
  maxCount: number;
  apTerm: string;
  maxTerm: string;
  device: 'Mobile' | 'Arcade';
  specialMaxCount?: number;
  specialMaxTerm?: string;
  customFields?: CustomFieldDefinition[];
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}

export interface PlayRecord {
  id: string;
  gameId: string;
  songTitle: string;
  difficulty: string;
  level: string;
  constantChart?: number;
  notes?: number;
  score: number;
  grade: string;
  maxMinus?: number;
  isAp: boolean;
  isFc: boolean;
  isClear: boolean;
  isMax: boolean;
  playedAt: string;
  customAttributes: Record<string, any>;
}

export interface GrowthHistoryPoint {
  date: string;
  apCount: number;      // AP数 (FC・クリアの上位)
  fcCount: number;      // FC数 (AP除くフルコンボ数)
  clearCount: number;   // クリア数 (FC除くクリア数)
  failedCount: number;  // 未クリア・挑戦数 (クリア除く既プレイ数)
}

export interface GrowthStats {
  period: 'week' | 'month' | 'year';
  apDiff: number;
  fcDiff: number;
  clearDiff: number;
  scoreDiff: number;
  newTracksCount: number;
  history: GrowthHistoryPoint[];
}
