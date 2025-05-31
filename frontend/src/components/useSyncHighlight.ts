import { create } from 'zustand';

interface SyncHighlightState {
  activeId: string | null;
  setActive: (id: string | null) => void;
}

export const useSyncHighlight = create<SyncHighlightState>((set) => ({
  activeId: null,
  setActive: (id) => set({ activeId: id }),
})); 