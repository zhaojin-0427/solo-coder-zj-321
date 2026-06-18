import type { Document, Scene, Checklist } from '@/types';

const STORAGE_KEYS = {
  DOCUMENTS: 'elderly_documents',
  SCENES: 'elderly_scenes',
  CHECKLISTS: 'elderly_checklists',
};

export function saveDocuments(documents: Document[]): void {
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
}

export function loadDocuments(): Document[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
  return data ? JSON.parse(data) : null;
}

export function saveScenes(scenes: Scene[]): void {
  localStorage.setItem(STORAGE_KEYS.SCENES, JSON.stringify(scenes));
}

export function loadScenes(): Scene[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.SCENES);
  return data ? JSON.parse(data) : null;
}

export function saveChecklists(checklists: Checklist[]): void {
  localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
}

export function loadChecklists(): Checklist[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
  return data ? JSON.parse(data) : null;
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
