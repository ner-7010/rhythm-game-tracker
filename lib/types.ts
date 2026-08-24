export type GradeCategory = 'MAX' | 'AP' | 'FC' | 'Clear' | 'Failed' | 'Unplayed';

export interface GradeMasterItem {
  id: string;
  name: string;
  category: GradeCategory;
}

export interface DifficultyMasterItem {
  id: string;
  name: string;
  order: number;
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
  hasMaxConcept?: boolean;                // 理論値(MAX)概念の有無
  specialMaxCount?: number;
  specialMaxTerm?: string;
  maxMinusFormula?: string;
  gradeMasters?: GradeMasterItem[];
  difficultyMasters?: DifficultyMasterItem[];
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
  isPlayed: boolean;
  isAp: boolean;
  isFc: boolean;
  isClear: boolean;
  isMax: boolean;
  isDeleted?: boolean;                    // 削除曲フラグ
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
