import type { Document, Scene, Checklist, Contact, CollaborationRecord, ReminderDraft, MedicalRecord, MedicalTimelineEvent } from '@/types';

const STORAGE_KEYS = {
  DOCUMENTS: 'elderly_documents',
  SCENES: 'elderly_scenes',
  CHECKLISTS: 'elderly_checklists',
  CONTACTS: 'elderly_contacts',
  COLLABORATION_RECORDS: 'elderly_collaboration_records',
  REMINDER_DRAFTS: 'elderly_reminder_drafts',
  MEDICAL_RECORDS: 'elderly_medical_records',
  MEDICAL_TIMELINE: 'elderly_medical_timeline',
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

export function saveContacts(contacts: Contact[]): void {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

export function loadContacts(): Contact[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  return data ? JSON.parse(data) : null;
}

export function saveCollaborationRecords(records: CollaborationRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.COLLABORATION_RECORDS, JSON.stringify(records));
}

export function loadCollaborationRecords(): CollaborationRecord[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.COLLABORATION_RECORDS);
  return data ? JSON.parse(data) : null;
}

export function saveReminderDrafts(drafts: ReminderDraft[]): void {
  localStorage.setItem(STORAGE_KEYS.REMINDER_DRAFTS, JSON.stringify(drafts));
}

export function loadReminderDrafts(): ReminderDraft[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.REMINDER_DRAFTS);
  return data ? JSON.parse(data) : null;
}

export function saveMedicalRecords(records: MedicalRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(records));
}

export function loadMedicalRecords(): MedicalRecord[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.MEDICAL_RECORDS);
  return data ? JSON.parse(data) : null;
}

export function saveMedicalTimelineEvents(events: MedicalTimelineEvent[]): void {
  localStorage.setItem(STORAGE_KEYS.MEDICAL_TIMELINE, JSON.stringify(events));
}

export function loadMedicalTimelineEvents(): MedicalTimelineEvent[] | null {
  const data = localStorage.getItem(STORAGE_KEYS.MEDICAL_TIMELINE);
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
