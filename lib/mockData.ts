import { GameTitle, PlayRecord, GrowthStats } from './types';

export const INITIAL_GAMES: GameTitle[] = [
  { 
    id: 'arcaea', 
    name: 'Arcaea', 
    sheetName: 'PM[Arcaea]', 
    apCount: 0, 
    maxCount: 0, 
    apTerm: 'Pure Memory', 
    maxTerm: 'MAX / 理論値', 
    fcTerm: 'Full Recall',
    clearTerm: 'Track Complete',
    failedTerm: 'Track Lost',
    device: 'Mobile',
    grades: [
      'Pure Memory (理論値)',
      'Pure Memory',
      'Full Recall',
      'Track Complete',
      'Track Lost'
    ]
  }
];

export const MOCK_PLAY_RECORDS: PlayRecord[] = [];

export const MOCK_GROWTH_STATS: Record<'week' | 'month' | 'year', GrowthStats> = {
  week: {
    period: 'week',
    apDiff: 0,
    fcDiff: 0,
    clearDiff: 0,
    scoreDiff: 0,
    newTracksCount: 0,
    history: [
      { date: '08/18', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '08/19', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '08/20', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '08/21', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '08/22', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '08/23', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '08/24', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 }
    ]
  },
  month: {
    period: 'month',
    apDiff: 0,
    fcDiff: 0,
    clearDiff: 0,
    scoreDiff: 0,
    newTracksCount: 0,
    history: [
      { date: '1週目', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '2週目', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '3週目', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: '4週目', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 }
    ]
  },
  year: {
    period: 'year',
    apDiff: 0,
    fcDiff: 0,
    clearDiff: 0,
    scoreDiff: 0,
    newTracksCount: 0,
    history: [
      { date: 'Q1', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: 'Q2', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: 'Q3', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 },
      { date: 'Q4', apCount: 0, fcCount: 0, clearCount: 0, failedCount: 0 }
    ]
  }
};
