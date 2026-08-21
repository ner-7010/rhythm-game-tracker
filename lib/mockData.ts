import { GameTitle, PlayRecord, GrowthStats } from './types';

export const INITIAL_GAMES: GameTitle[] = [
  { id: 'arcaea', name: 'Arcaea', sheetName: 'PM[Arcaea]', apCount: 1582, maxCount: 822, apTerm: 'Pure Memory', maxTerm: 'MAX / 理論値', device: 'Mobile' },
  { id: 'rotaeno', name: 'Rotaeno', sheetName: 'AP[Rotaeno]', apCount: 712, maxCount: 72, apTerm: 'ALL PERFECT', maxTerm: 'ALL PERFECT+', device: 'Mobile' },
  { id: 'pjsekai', name: 'プロセカ', sheetName: 'AP[プロセカ]', apCount: 451, maxCount: 0, apTerm: 'ALL PERFECT', maxTerm: '-', device: 'Mobile' },
  { id: 'paradigm', name: 'Paradigm: Reboot', sheetName: 'AD[Paradigm: Reboot]', apCount: 305, maxCount: 22, apTerm: 'ALL DECRYPTED', maxTerm: 'MAX / 理論値', device: 'Mobile' },
  { id: 'hololive', name: 'hololive Dreams', sheetName: 'AP[hololive Dreams]', apCount: 353, maxCount: 0, apTerm: 'ALL PERFECT', maxTerm: '-', device: 'Mobile' },
  { id: 'cytus2', name: 'Cytus II', sheetName: 'MM[Cytus II]', apCount: 123, maxCount: 67, apTerm: 'Million Master', maxTerm: 'TP 100', device: 'Mobile', specialMaxCount: 0, specialMaxTerm: 'MAX MASTER' },
  { id: 'chunithm', name: 'CHUNITHM', sheetName: 'AJ[CHUNITHM]', apCount: 85, maxCount: 0, apTerm: 'ALL JUSTICE', maxTerm: 'ALL JUSTICE CRITICAL', device: 'Arcade' },
  { id: 'phigros', name: 'Phigros', sheetName: 'Phi[Phigros]', apCount: 58, maxCount: 0, apTerm: 'Phi', maxTerm: '-', device: 'Mobile' },
  { id: 'ryceam', name: 'RYCEAM', sheetName: 'AP[RYCEAM]', apCount: 57, maxCount: 0, apTerm: 'ALL PRECISE', maxTerm: '-', device: 'Mobile' },
  { id: 'takumi3', name: 'TAKUMI³', sheetName: 'AJ[TAKUMI³]', apCount: 53, maxCount: 14, apTerm: 'ALL JUST', maxTerm: 'MAX / 理論値', device: 'Mobile' },
  { id: 'maimai', name: 'maimai', sheetName: 'AP[maimai]', apCount: 49, maxCount: 15, apTerm: 'ALL PERFECT', maxTerm: 'ALL PERFECT+', device: 'Arcade', specialMaxCount: 0, specialMaxTerm: 'でらっくスコア理論値' },
  { id: 'orzmic', name: 'Orzmic', sheetName: 'PD[Orzmic]', apCount: 34, maxCount: 10, apTerm: 'PERFECT DECRYPTION', maxTerm: 'ORZ', device: 'Mobile' },
  { id: 'kalpa', name: 'KALPA', sheetName: 'AP[KALPA]', apCount: 33, maxCount: 0, apTerm: 'ALL PERFECT', maxTerm: '-', device: 'Mobile' },
  { id: 'musicdiver', name: 'MUSIC DIVER', sheetName: 'AP[MUSIC DIVER]', apCount: 26, maxCount: 0, apTerm: 'ALL PERFECT', maxTerm: 'ALL CRITICAL', device: 'Arcade' },
  { id: 'milthm', name: 'Milthm', sheetName: 'AP[Milthm]', apCount: 23, maxCount: 6, apTerm: 'ALL PERFECT', maxTerm: 'RHYTHM of RAIN', device: 'Mobile' },
  { id: 'lanota', name: 'Lanota', sheetName: 'PP[Lanota]', apCount: 19, maxCount: 0, apTerm: 'Perfect Purified', maxTerm: '-', device: 'Mobile' },
  { id: 'liminality', name: 'Liminality', sheetName: 'L[Liminality]', apCount: 14, maxCount: 0, apTerm: 'Liminality', maxTerm: 'ALL HI-TECH+', device: 'Mobile' },
  { id: 'ongeki', name: 'オンゲキ', sheetName: 'AB[オンゲキ]', apCount: 9, maxCount: 0, apTerm: 'ALL BREAK', maxTerm: 'テクニカルスコア理論値', device: 'Arcade', specialMaxCount: 0, specialMaxTerm: 'P-スコア理論値' },
  { id: 'rizline', name: 'Rizline', sheetName: 'AP[Rizline]', apCount: 7, maxCount: 7, apTerm: 'ALL PERFECT', maxTerm: 'MAX / 理論値', device: 'Mobile' },
  { id: 'ellia', name: 'ELLIA', sheetName: 'X[ELLIA]', apCount: 6, maxCount: 0, apTerm: 'MAXX', maxTerm: '理論値', device: 'Mobile' },
  { id: 'deemo', name: 'DEEMO -Reborn-', sheetName: 'AC[DEEMO -Reborn-]', apCount: 2, maxCount: 0, apTerm: 'ALL CHARMING', maxTerm: '-', device: 'Mobile' }
];

export const MOCK_PLAY_RECORDS: PlayRecord[] = [
  {
    id: 'rec-1',
    gameId: 'chunithm',
    songTitle: 'Grievous Lady',
    difficulty: 'MASTER',
    level: '14+',
    constantChart: 14.9,
    notes: 2450,
    score: 1010000,
    grade: 'AJC',
    maxMinus: 0,
    isAp: true,
    isMax: true,
    playedAt: '2026-08-20T15:30:00Z',
    customAttributes: { composer: 'Team Grimoire vs Laur', bpm: 210, notesDesigner: '音撃＆CHUNITHM開発チーム' }
  },
  {
    id: 'rec-2',
    gameId: 'chunithm',
    songTitle: '業 -GOU-',
    difficulty: 'MASTER',
    level: '15',
    constantChart: 15.2,
    notes: 3100,
    score: 1009850,
    grade: 'AJ',
    maxMinus: 15,
    isAp: true,
    isMax: false,
    playedAt: '2026-08-18T12:10:00Z',
    customAttributes: { composer: 'かねこちはる', bpm: 240, notesDesigner: 'チャン@100本勝負' }
  },
  {
    id: 'rec-3',
    gameId: 'arcaea',
    songTitle: 'Testify',
    difficulty: 'BYD',
    level: '12',
    constantChart: 12.0,
    notes: 2222,
    score: 10000000,
    grade: 'PM',
    maxMinus: 0,
    isAp: true,
    isMax: true,
    playedAt: '2026-08-21T09:00:00Z',
    customAttributes: { composer: 'void (Mournfinale) feat. 709sec.', bpm: 195 }
  }
];

export const MOCK_GROWTH_STATS: Record<'week' | 'month' | 'year', GrowthStats> = {
  week: {
    period: 'week',
    apDiff: 24,
    scoreDiff: 15,
    newTracksCount: 32,
    history: [
      { date: '08/15', apCount: 3977, maxCount: 1020, totalPlayed: 5400 },
      { date: '08/16', apCount: 3982, maxCount: 1022, totalPlayed: 5410 },
      { date: '08/17', apCount: 3988, maxCount: 1025, totalPlayed: 5425 },
      { date: '08/18', apCount: 3991, maxCount: 1028, totalPlayed: 5438 },
      { date: '08/19', apCount: 3995, maxCount: 1030, totalPlayed: 5450 },
      { date: '08/20', apCount: 3998, maxCount: 1032, totalPlayed: 5462 },
      { date: '08/21', apCount: 4001, maxCount: 1035, totalPlayed: 5480 }
    ]
  },
  month: {
    period: 'month',
    apDiff: 110,
    scoreDiff: 78,
    newTracksCount: 145,
    history: [
      { date: 'W1', apCount: 3891, maxCount: 990, totalPlayed: 5200 },
      { date: 'W2', apCount: 3925, maxCount: 1005, totalPlayed: 5280 },
      { date: 'W3', apCount: 3960, maxCount: 1018, totalPlayed: 5370 },
      { date: 'W4', apCount: 4001, maxCount: 1035, totalPlayed: 5480 }
    ]
  },
  year: {
    period: 'year',
    apDiff: 1240,
    scoreDiff: 850,
    newTracksCount: 1600,
    history: [
      { date: '2025-Q3', apCount: 2761, maxCount: 650, totalPlayed: 3800 },
      { date: '2025-Q4', apCount: 3120, maxCount: 760, totalPlayed: 4200 },
      { date: '2026-Q1', apCount: 3500, maxCount: 880, totalPlayed: 4700 },
      { date: '2026-Q2', apCount: 3850, maxCount: 990, totalPlayed: 5200 },
      { date: '現在', apCount: 4001, maxCount: 1035, totalPlayed: 5480 }
    ]
  }
};
