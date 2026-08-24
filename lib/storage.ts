import { GameTitle, PlayRecord, CustomFieldDefinition } from './types';
import { INITIAL_GAMES, MOCK_PLAY_RECORDS } from './mockData';

const GAMES_STORAGE_KEY = 'rg_stats_games_v2';
const RECORDS_STORAGE_KEY = 'rg_stats_records_v2';
const CUSTOM_FIELDS_KEY = 'rg_stats_custom_fields_v2';

// 1. Get Games
export const getStoredGames = (): GameTitle[] => {
  if (typeof window === 'undefined') return INITIAL_GAMES;
  try {
    const data = localStorage.getItem(GAMES_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load games from localStorage', e);
  }
  return INITIAL_GAMES;
};

// Save Games
export const saveStoredGames = (games: GameTitle[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.error('Failed to save games to localStorage', e);
  }
};

// 2. Get Records
export const getStoredRecords = (): PlayRecord[] => {
  if (typeof window === 'undefined') return MOCK_PLAY_RECORDS;
  try {
    const data = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load records from localStorage', e);
  }
  return MOCK_PLAY_RECORDS;
};

// Save Records
export const saveStoredRecords = (records: PlayRecord[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to localStorage', e);
  }
};

// 3. Get Custom Field Definitions
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
