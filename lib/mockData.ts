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
    gradeMasters: [
      { id: 'g1', name: 'Pure Memory (理論値)', category: 'MAX' },
      { id: 'g2', name: 'Pure Memory', category: 'AP' },
      { id: 'g3', name: 'Full Recall', category: 'FC' },
      { id: 'g4', name: 'Track Complete', category: 'Clear' },
      { id: 'g5', name: 'Track Lost', category: 'Failed' }
    ],
    difficultyMasters: [
      { id: 'd1', name: 'BYD', order: 1 },
      { id: 'd2', name: 'FTR', order: 2 },
      { id: 'd3', name: 'PRS', order: 3 },
      { id: 'd4', name: 'PST', order: 4 }
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
