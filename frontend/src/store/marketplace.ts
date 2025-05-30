import { create } from 'zustand';

// TODO(MarketplaceStore):
// 1. Implement model listing and filtering
// 2. Add model rating system
// 3. Create model usage tracking
// 4. Add pricing management
// 5. Implement model search and sorting
// END TODO

interface Model {
  id: string;
  name: string;
  description: string;
  rating: number;
  price: number;
  category: string;
  tags: string[];
}

interface MarketplaceState {
  models: Model[];
  selectedModel: Model | null;
  filters: {
    category: string[];
    minRating: number;
    maxPrice: number;
    tags: string[];
  };
  setSelectedModel: (model: Model | null) => void;
  updateFilters: (filters: Partial<MarketplaceState['filters']>) => void;
  rateModel: (modelId: string, rating: number) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  models: [],
  selectedModel: null,
  filters: {
    category: [],
    minRating: 0,
    maxPrice: Infinity,
    tags: [],
  },
  setSelectedModel: (model) => set({ selectedModel: model }),
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  rateModel: (modelId, rating) =>
    set((state) => ({
      models: state.models.map((model) =>
        model.id === modelId
          ? { ...model, rating: (model.rating + rating) / 2 }
          : model
      ),
    })),
})); 