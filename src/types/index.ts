export interface FileTransaction {
  id: string;
  original_path: string;
  new_path: string;
  timestamp: string;
  summary: string;
  category_path: string;
  confidence: number;
  undo_status: boolean;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AppStatus {
  watcher_active: boolean;
  ollama_connected: boolean;
  processed_count: number;
}
