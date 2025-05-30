import { create } from 'zustand';

// TODO(HistoryStore):
// 1. Implement execution history tracking
// 2. Add history filtering and search
// 3. Create history export functionality
// 4. Add pagination support
// 5. Implement history cleanup/archival
// END TODO

interface ExecutionRecord {
  id: string;
  timestamp: Date;
  workflowId: string;
  status: 'success' | 'error' | 'running';
  duration: number;
  results: any;
  error?: string;
}

interface HistoryState {
  executions: ExecutionRecord[];
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    status: ExecutionRecord['status'][];
    workflowId: string | null;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  setFilters: (filters: Partial<HistoryState['filters']>) => void;
  setPagination: (pagination: Partial<HistoryState['pagination']>) => void;
  addExecution: (execution: ExecutionRecord) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  executions: [],
  filters: {
    startDate: null,
    endDate: null,
    status: [],
    workflowId: null,
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setPagination: (newPagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    })),
  addExecution: (execution) =>
    set((state) => ({
      executions: [execution, ...state.executions],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    })),
  clearHistory: () =>
    set({
      executions: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
    }),
})); 