export interface CrawlRequest {
  url: string;
  max_pages?: number;
  max_depth?: number;
  urls_to_crawl?: string[];
}

interface CrawlUrl {
  url: string;
  type: string;
}

export interface Crawl {
  id: string;
  name: string;
  description: string;
  document_count: number;
  created_at: string;
  urls: CrawlUrl[];
}

export interface QueryRequest {
  query: string;
}

export interface QuerySource {
  url: string;
  type: string;
  chunk_index: number;
  distance: number;
  number: number;
}

export interface QueryResponse {
  success: boolean;
  data: {
    query: string;
    chatbot: Crawl;
    answer: string;
    sources: QuerySource[];
  };
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Request payload for collecting URLs
export interface CollectUrlsRequest {
  url: string;
  max_depth: number;
  max_pages: number;
}

// Response structure for collecting URLs
export interface CollectUrlsResponse {
  success: boolean;
  data: {
    collected_urls: string[];
    count: number;
  };
  // Add error details if the API provides them
}

export interface Task {
  id: string;
  user_id: string;
  chatbot_id: string;
  task_type: string;
  status: string;
  details: {
    url: string;
    max_depth: number;
    max_pages: number;
    name: string;
    description: string;
  };
  created_at: string;
  updated_at: string;
}
