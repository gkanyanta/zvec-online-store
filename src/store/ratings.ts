import { create } from 'zustand';

interface RatingSummary { avg: number; count: number; }

interface RatingsStore {
  summaries: Record<string, RatingSummary>;
  status: 'idle' | 'loading' | 'ready';
  fetchSummaries: () => Promise<void>;
}

export const useRatingsStore = create<RatingsStore>()((set, get) => ({
  summaries: {},
  status: 'idle',
  fetchSummaries: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const res = await fetch('/api/reviews/summary');
      const data: Record<string, RatingSummary> = await res.json();
      set({ summaries: data, status: 'ready' });
    } catch {
      set({ status: 'idle' });
    }
  },
}));
