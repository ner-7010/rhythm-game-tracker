import { GameTitle, PlayRecord, GrowthStats } from './types';

// 初期状態は Arcaea 1つのみ（まっさらな状態から自由に追加可能）
export const INITIAL_GAMES: GameTitle[] = [
  { 
    id: 'arcaea', 
    name: 'Arcaea', 
    sheetName: 'PM[Arcaea]', 
    apCount: 0, 
    maxCount: 0, 
    apTerm: 'Pure Memory', 
    maxTerm: 'MAX / 理論値', 
    device: 'Mobile' 
  }
];

export const MOCK_PLAY_RECORDS: PlayRecord[] = [];

export const MOCK_GROWTH_STATS: Record<'week' | 'month' | 'year', GrowthStats> = {
  week: {
    period: 'week',
    apDiff: 0,
    scoreDiff: 0,
    newTracksCount: 0,
    history: [
      { date: '今日', apCount: 0, maxCount: 0, totalPlayed: 0 }
    ]
  },
  month: {
    period: 'month',
    apDiff: 0,
    scoreDiff: 0,
    newTracksCount: 0,
    history: [
      { date: '今月', apCount: 0, maxCount: 0, totalPlayed: 0 }
    ]
  },
  year: {
    period: 'year',
    apDiff: 0,
    scoreDiff: 0,
    newTracksCount: 0,
    history: [
      { date: '今年', apCount: 0, maxCount: 0, totalPlayed: 0 }
    ]
  }
};
