export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface BackupConfig {
  githubToken: string;
  githubRepo: string;
  githubBranch: string;
  githubPath: string;
}

export interface BackupStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
  lastSync?: string;
}

export interface EditorSettings {
  theme: 'light' | 'dark';
  distractionFree: boolean;
  layout: 'split' | 'editor' | 'preview';
  fontSize: number;
  lineNumbers: boolean;
  cloudSyncEnabled: boolean;
}
