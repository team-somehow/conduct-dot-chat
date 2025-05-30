// TODO(Types):
// 1. Add more specific types for workflow nodes
// 2. Create API response types
// 3. Add error types
// 4. Create user types
// 5. Add configuration types
// END TODO

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: 'success' | 'error';
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    [key: string]: any;
  };
}

export interface ModelConfig {
  id: string;
  name: string;
  type: string;
  parameters: {
    [key: string]: any;
  };
  version: string;
}

export interface ExecutionConfig {
  workflowId: string;
  input: {
    [key: string]: any;
  };
  options?: {
    timeout?: number;
    retries?: number;
    [key: string]: any;
  };
} 