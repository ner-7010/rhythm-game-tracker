import { GameTitle, PlayRecord, CustomFieldDefinition } from './types';
import { INITIAL_GAMES, MOCK_PLAY_RECORDS } from './mockData';
import { supabase } from './supabase';

const GAMES_STORAGE_KEY = 'rg_stats_games_v2';
const RECORDS_STORAGE_KEY = 'rg_stats_records_v2';
const CUSTOM_FIELDS_KEY = 'rg_stats_custom_fields_v2';

// ----------------------------------------------------
// 0. Mappers between CamelCase (App) and SnakeCase (DB)
// ----------------------------------------------------
export const mapDbToGame = (dbGame: any): GameTitle => {
  return {
    id: dbGame.id,
    name: dbGame.name,
    sheetName: dbGame.sheet_name,
    apCount: dbGame.ap_count ?? 0,
    maxCount: dbGame.max_count ?? 0,
    apTerm: dbGame.ap_term ?? 'ALL PERFECT',
    maxTerm: dbGame.max_term ?? 'MAX / 理論値',
    fcTerm: dbGame.fc_term ?? 'Full Combo',
    clearTerm: dbGame.clear_term ?? 'Clear',
    failedTerm: dbGame.failed_term ?? 'Failed',
    device: dbGame.device ?? 'Mobile',
    hasMaxConcept: dbGame.has_max_concept !== false,
    specialMaxCount: dbGame.special_max_count ?? 0,
    specialMaxTerm: dbGame.special_max_term ?? undefined,
    maxMinusFormula: dbGame.max_minus_formula ?? undefined,
    gradeMasters: dbGame.grade_masters ?? [],
    difficultyMasters: dbGame.difficulty_masters ?? [],
    customFields: dbGame.custom_fields ?? [],
  };
};

export const mapGameToDb = (game: GameTitle): any => {
  return {
    id: game.id,
    name: game.name,
    sheet_name: game.sheetName,
    ap_count: game.apCount,
    max_count: game.maxCount,
    ap_term: game.apTerm,
    max_term: game.maxTerm,
    fc_term: game.fcTerm,
    clear_term: game.clearTerm,
    failed_term: game.failedTerm,
    device: game.device,
    has_max_concept: game.hasMaxConcept !== false,
    special_max_count: game.specialMaxCount,
    special_max_term: game.specialMaxTerm,
    max_minus_formula: game.maxMinusFormula,
    grade_masters: game.gradeMasters,
    difficulty_masters: game.difficultyMasters,
    custom_fields: game.customFields,
  };
};

export const mapDbToRecord = (dbRec: any): PlayRecord => {
  return {
    id: dbRec.id,
    gameId: dbRec.game_id,
    songTitle: dbRec.song_title,
    difficulty: dbRec.difficulty,
    level: dbRec.level,
    constantChart: dbRec.constant_chart !== null && dbRec.constant_chart !== undefined ? Number(dbRec.constant_chart) : undefined,
    notes: dbRec.notes !== null && dbRec.notes !== undefined ? Number(dbRec.notes) : undefined,
    score: dbRec.score ?? 0,
    grade: dbRec.grade ?? '',
    maxMinus: dbRec.max_minus !== null && dbRec.max_minus !== undefined ? Number(dbRec.max_minus) : undefined,
    isPlayed: dbRec.is_played ?? true,
    isAp: dbRec.is_ap ?? false,
    isFc: dbRec.is_fc ?? false,
    isClear: dbRec.is_clear ?? false,
    isMax: dbRec.is_max ?? false,
    isDeleted: dbRec.is_deleted ?? false,
    playedAt: dbRec.played_at ?? new Date().toISOString(),
    customAttributes: dbRec.custom_attributes ?? {},
  };
};

export const mapRecordToDb = (rec: PlayRecord, userId?: string | null): any => {
  return {
    id: rec.id.includes('-') && rec.id.length >= 32 ? rec.id : undefined, // let DB generate UUID if not valid UUID
    user_id: userId || null,
    game_id: rec.gameId,
    song_title: rec.songTitle,
    difficulty: rec.difficulty,
    level: rec.level,
    constant_chart: rec.constantChart ?? null,
    notes: rec.notes ?? null,
    score: rec.score,
    grade: rec.grade,
    max_minus: rec.maxMinus ?? null,
    is_played: rec.isPlayed,
    is_ap: rec.isAp,
    is_fc: rec.isFc,
    is_clear: rec.isClear,
    is_max: rec.isMax,
    is_deleted: rec.isDeleted ?? false,
    played_at: rec.playedAt || new Date().toISOString(),
    custom_attributes: rec.customAttributes || {},
  };
};

// ----------------------------------------------------
// 1. Games CRUD (API Route + Supabase + LocalStorage Fallback)
// ----------------------------------------------------
export const fetchGamesAsync = async (): Promise<GameTitle[]> => {
  try {
    const res = await fetch('/api/games');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.games)) {
        const games = data.games.map(mapDbToGame);
        saveStoredGames(games);
        return games;
      }
    }
  } catch (e) {
    console.warn('API /api/games fetch error, fallback to direct Supabase', e);
  }

  // Direct Supabase fallback
  try {
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: true });
    if (!error && Array.isArray(data)) {
      const games = data.map(mapDbToGame);
      saveStoredGames(games);
      return games;
    }
  } catch (e) {
    console.warn('Direct Supabase fetch error, fallback to local', e);
  }

  return getStoredGames();
};

export const saveGamesAsync = async (games: GameTitle[]): Promise<void> => {
  saveStoredGames(games);
  const dbGames = games.map(mapGameToDb);

  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ games: dbGames }),
    });
    if (res.ok) return;
  } catch (e) {
    console.warn('API /api/games POST error, trying direct Supabase', e);
  }

  try {
    await supabase.from('games').upsert(dbGames, { onConflict: 'id' });
  } catch (e) {
    console.error('Failed to save games to Supabase', e);
  }
};

export const deleteGameAsync = async (gameId: string): Promise<void> => {
  const localGames = getStoredGames().filter(g => g.id !== gameId);
  saveStoredGames(localGames);

  try {
    const res = await fetch(`/api/games?id=${encodeURIComponent(gameId)}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (e) {
    console.warn('API /api/games DELETE error, trying direct Supabase', e);
  }

  try {
    await supabase.from('games').delete().eq('id', gameId);
  } catch (err) {
    console.error('Failed to delete game', err);
  }
};

// ----------------------------------------------------
// 2. Play Records CRUD (API Route + Supabase + LocalStorage Fallback)
// ----------------------------------------------------
export const fetchRecordsAsync = async (gameId?: string): Promise<PlayRecord[]> => {
  try {
    const url = gameId ? `/api/records?gameId=${encodeURIComponent(gameId)}` : '/api/records';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.records)) {
        const records = data.records.map(mapDbToRecord);
        if (gameId) {
          const otherRecords = getStoredRecords().filter(r => r.gameId !== gameId);
          saveStoredRecords([...otherRecords, ...records]);
        } else {
          saveStoredRecords(records);
        }
        return records;
      }
    }
  } catch (e) {
    console.warn('API /api/records fetch error, fallback to direct Supabase', e);
  }

  // Direct Supabase fallback (with pagination loop)
  try {
    let allDbRecords: any[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      let query = supabase.from('play_records').select('*').range(from, from + pageSize - 1);
      if (gameId) {
        query = query.eq('game_id', gameId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) break;
      allDbRecords = allDbRecords.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    if (allDbRecords.length > 0) {
      const records = allDbRecords.map(mapDbToRecord);
      if (gameId) {
        const otherRecords = getStoredRecords().filter(r => r.gameId !== gameId);
        saveStoredRecords([...otherRecords, ...records]);
      } else {
        saveStoredRecords(records);
      }
      return records;
    }
  } catch (e) {
    console.warn('Direct Supabase records error, fallback to local', e);
  }

  const localRecords = getStoredRecords();
  return gameId ? localRecords.filter(r => r.gameId === gameId) : localRecords;
};

// Replace Mode: Clears old records for gameId and bulk-inserts new records
export const replaceRecordsAsync = async (gameId: string, records: PlayRecord[]): Promise<void> => {
  const otherRecords = getStoredRecords().filter(r => r.gameId !== gameId);
  saveStoredRecords([...otherRecords, ...records]);

  const dbRecords = records.map(r => mapRecordToDb(r));

  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'replace', gameId, records: dbRecords }),
    });
    if (res.ok) return;
  } catch (e) {
    console.warn('API /api/records replace error, trying direct Supabase', e);
  }

  try {
    await supabase.from('play_records').delete().eq('game_id', gameId);
    if (records.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < dbRecords.length; i += chunkSize) {
        const chunk = dbRecords.slice(i, i + chunkSize);
        const { error } = await supabase.from('play_records').insert(chunk);
        if (error) throw error;
      }
    }
  } catch (e) {
    console.error('Failed to replace records in Supabase', e);
  }
};

export const upsertRecordAsync = async (record: PlayRecord): Promise<void> => {
  const localRecords = getStoredRecords();
  const idx = localRecords.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    localRecords[idx] = record;
  } else {
    localRecords.push(record);
  }
  saveStoredRecords(localRecords);

  const dbRecord = mapRecordToDb(record);

  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'upsertSingle', record: dbRecord }),
    });
    if (res.ok) return;
  } catch (e) {
    console.warn('API /api/records upsertSingle error, trying direct Supabase', e);
  }

  try {
    await supabase.from('play_records').upsert(dbRecord);
  } catch (e) {
    console.error('Failed to upsert record to Supabase', e);
  }
};

export const deleteRecordAsync = async (recordId: string, gameId: string): Promise<void> => {
  const localRecords = getStoredRecords().filter(r => r.id !== recordId);
  saveStoredRecords(localRecords);

  try {
    const res = await fetch(`/api/records?id=${encodeURIComponent(recordId)}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (e) {
    console.warn('API /api/records delete error, trying direct Supabase', e);
  }

  try {
    await supabase.from('play_records').delete().eq('id', recordId);
  } catch (e) {
    console.error('Failed to delete record from Supabase', e);
  }
};

// ----------------------------------------------------
// 3. LocalStorage Sync helpers (Sync clean cache)
// ----------------------------------------------------
export const getStoredGames = (): GameTitle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(GAMES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load games from localStorage', e);
  }
  return [];
};

export const saveStoredGames = (games: GameTitle[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.error('Failed to save games to localStorage', e);
  }
};

export const getStoredRecords = (): PlayRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load records from localStorage', e);
  }
  return [];
};

export const saveStoredRecords = (records: PlayRecord[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to localStorage', e);
  }
};

export const getStoredCustomFields = (): CustomFieldDefinition[] => {
  const defaultFields: CustomFieldDefinition[] = [
    { id: '1', name: 'コンポーザー', type: 'text' },
    { id: '2', name: 'BPM', type: 'number' },
    { id: '3', name: '譜面制作者', type: 'text' }
  ];

  if (typeof window === 'undefined') return defaultFields;
  try {
    const data = localStorage.getItem(CUSTOM_FIELDS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load custom fields', e);
  }
  return defaultFields;
};

export const saveStoredCustomFields = (fields: CustomFieldDefinition[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_FIELDS_KEY, JSON.stringify(fields));
  } catch (e) {
    console.error('Failed to save custom fields', e);
  }
};

