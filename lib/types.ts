export interface GameTitle {
  id: string;
  name: string;
  sheetName: string;
  apCount: number;
  maxCount: number;
  apTerm: string;
  maxTerm: string;
  fcTerm?: string;       // 例: Full Recall, ALL JUSTICE...
  clearTerm?: string;    // 例: Track Complete, Clear...
  failedTerm?: string;   // 例: Track Lost, Failed...
  device: 'Mobile' | 'Arcade';
  specialMaxCount?: number;
  specialMaxTerm?: string;
  grades?: string[];     // 機種ごとのランクマスター (例: ["理論値", "Pure Memory", "Full Recall", "Track Complete", "Track Lost"])
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
  customAttributes: Record<string, any>; // BPM, 譜面制作者など動的項目
}

export interface GrowthHistoryPoint {
  date: string;
  apCount: number;
  fcCount: number;
  clearCount: number;
  failedCount: number;
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
