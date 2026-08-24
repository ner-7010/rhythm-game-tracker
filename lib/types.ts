export type GradeCategory = 'MAX' | 'AP' | 'FC' | 'Clear' | 'Failed';

export interface GradeMasterItem {
  id: string;
  name: string; // 例: "Pure Memory", "Track Complete"
  category: GradeCategory; // MAX / AP / FC / Clear / Failed
}

export interface DifficultyMasterItem {
  id: string;
  name: string; // 例: "BYD", "FTR", "PRS", "PST"
  order: number; // 並び順 (数値が小さいほど高難易度)
}

export interface GameTitle {
  id: string;
  name: string;
  sheetName: string;
  apCount: number;
  maxCount: number;
  apTerm: string;
  maxTerm: string;
  fcTerm?: string;
  clearTerm?: string;
  failedTerm?: string;
  device: 'Mobile' | 'Arcade';
  specialMaxCount?: number;
  specialMaxTerm?: string;
  gradeMasters?: GradeMasterItem[];       // Gradeマッピングマスター
  difficultyMasters?: DifficultyMasterItem[]; // 難易度順序マスター
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
