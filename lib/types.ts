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
  constantChart?: number; // 譜面定数 (e.g. 14.6)
  notes?: number;
  score: number;
  grade: string;
  maxMinus?: number; // MAXマイナス / 失点
  isAp: boolean;
  isMax: boolean;
  playedAt: string;
  customAttributes: Record<string, any>; // コンポーザー, 譜面制作者, BPMなど
}

export interface GrowthStats {
  period: 'week' | 'month' | 'year';
  apDiff: number;
  scoreDiff: number;
  newTracksCount: number;
  history: { date: string; apCount: number; maxCount: number; totalPlayed: number }[];
}
