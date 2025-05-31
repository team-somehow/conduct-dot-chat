import { create } from 'zustand';

// TODO(SettingsStore):
// 1. Implement user preferences
// 2. Add API key management
// 3. Create theme settings
// 4. Add notification preferences
// 5. Implement data export/import
// END TODO

interface SettingsState {
  apiKeys: {
    [key: string]: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    autoSave: boolean;
    language: string;
  };
  setApiKey: (service: string, key: string) => void;
  removeApiKey: (service: string) => void;
  updatePreferences: (preferences: Partial<SettingsState['preferences']>) => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKeys: {},
  preferences: {
    theme: 'system',
    notifications: true,
    autoSave: true,
    language: 'en',
  },
  setApiKey: (service, key) =>
    set((state) => ({
      apiKeys: { ...state.apiKeys, [service]: key },
    })),
  removeApiKey: (service) =>
    set((state) => {
      const { [service]: _, ...rest } = state.apiKeys;
      return { apiKeys: rest };
    }),
  updatePreferences: (newPreferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
    })),
  exportSettings: (): string => {
    const state: SettingsState = useSettingsStore.getState();
    return JSON.stringify({
      apiKeys: state.apiKeys,
      preferences: state.preferences,
    });
  },
  importSettings: (settings) => {
    try {
      const { apiKeys, preferences } = JSON.parse(settings);
      set({ apiKeys, preferences });
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
  },
})); 