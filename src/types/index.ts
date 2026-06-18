export interface Document {
  id: string;
  name: string;
  icon: string;
  category: 'identity' | 'medical' | 'finance' | 'social' | 'other';
  storageLocation: string;
  photoPlaceholder: string;
  notes: string;
  hasOriginal: boolean;
  hasCopy: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  requiredDocumentIds: string[];
  isPreset: boolean;
}

export interface ChecklistItem {
  documentId: string;
  documentName: string;
  documentIcon: string;
  storageLocation: string;
  needOriginal: boolean;
  needCopy: boolean;
  isChecked: boolean;
}

export interface Checklist {
  id: string;
  sceneId: string;
  sceneName: string;
  date: string;
  companion: string;
  needsCompanion: boolean;
  items: ChecklistItem[];
  isCompleted: boolean;
  createdAt: string;
}

export type AppState = {
  documents: Document[];
  scenes: Scene[];
  checklists: Checklist[];
  activeScene: Scene | null;
  currentChecklist: Checklist | null;
};

export const categoryLabels: Record<string, string> = {
  identity: '身份证件',
  medical: '医疗相关',
  finance: '财务相关',
  social: '社保相关',
  other: '其他',
};

export const categoryColors: Record<string, string> = {
  identity: '#FF8C42',
  medical: '#FF6B6B',
  finance: '#4ECDC4',
  social: '#2A9D8F',
  other: '#AA96DA',
};
