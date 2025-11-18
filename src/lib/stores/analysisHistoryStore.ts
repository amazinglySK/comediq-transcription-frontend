import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface AnalysisHistoryItem {
  id: string;
  filename: string;
  transcript: string;
  analysis: string;
  segmentation: any[];
  timestamp: number;
  summary?: string; // First 100 chars of transcript for preview
}

function createAnalysisHistoryStore() {
  const STORAGE_KEY = 'comedy-analysis-history';
  const MAX_HISTORY = 20;

  // Load from localStorage on initialization
  const getStoredHistory = (): AnalysisHistoryItem[] => {
    if (!browser) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const { subscribe, set, update } = writable<AnalysisHistoryItem[]>(getStoredHistory());

  // Save to localStorage whenever store updates
  const saveToStorage = (history: AnalysisHistoryItem[]) => {
    if (browser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.warn('Failed to save analysis history:', error);
      }
    }
  };

  return {
    subscribe,
    
    addAnalysis: (analysis: Omit<AnalysisHistoryItem, 'id' | 'timestamp' | 'summary'>) => {
      update(history => {
        const newItem: AnalysisHistoryItem = {
          ...analysis,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          summary: analysis.transcript.slice(0, 100) + '...'
        };
        
        const newHistory = [newItem, ...history].slice(0, MAX_HISTORY);
        saveToStorage(newHistory);
        return newHistory;
      });
    },

    removeAnalysis: (id: string) => {
      update(history => {
        const newHistory = history.filter(item => item.id !== id);
        saveToStorage(newHistory);
        return newHistory;
      });
    },

    clearHistory: () => {
      set([]);
      saveToStorage([]);
    },

    loadAnalysis: (id: string): AnalysisHistoryItem | null => {
      const history = getStoredHistory();
      return history.find(item => item.id === id) || null;
    }
  };
}

export const analysisHistory = createAnalysisHistoryStore();