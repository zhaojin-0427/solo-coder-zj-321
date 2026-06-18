import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Document, Scene, Checklist, ChecklistItem } from '@/types';
import { presetDocuments, presetScenes } from '@/mock/initialData';
import {
  loadDocuments,
  saveDocuments,
  loadScenes,
  saveScenes,
  loadChecklists,
  saveChecklists,
  generateId,
} from '@/utils/storage';

export const useAppStore = defineStore('app', () => {
  const documents = ref<Document[]>([]);
  const scenes = ref<Scene[]>([]);
  const checklists = ref<Checklist[]>([]);
  const activeScene = ref<Scene | null>(null);
  const currentChecklist = ref<Checklist | null>(null);
  const showLargePreview = ref(false);

  function init() {
    const savedDocs = loadDocuments();
    const savedScenes = loadScenes();
    const savedChecklists = loadChecklists();

    documents.value = savedDocs || presetDocuments;
    scenes.value = savedScenes || presetScenes;
    checklists.value = savedChecklists || [];
  }

  watch(
    documents,
    (val) => {
      saveDocuments(val);
    },
    { deep: true }
  );

  watch(
    scenes,
    (val) => {
      saveScenes(val);
    },
    { deep: true }
  );

  watch(
    checklists,
    (val) => {
      saveChecklists(val);
    },
    { deep: true }
  );

  function addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString().split('T')[0];
    documents.value.push({
      ...doc,
      id: generateId('doc'),
      createdAt: now,
      updatedAt: now,
    });
  }

  function updateDocument(id: string, updates: Partial<Document>) {
    const index = documents.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      documents.value[index] = {
        ...documents.value[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }
  }

  function deleteDocument(id: string) {
    documents.value = documents.value.filter((d) => d.id !== id);
    scenes.value.forEach((scene) => {
      scene.requiredDocumentIds = scene.requiredDocumentIds.filter((did) => did !== id);
    });
  }

  function addScene(scene: Omit<Scene, 'id' | 'isPreset'>) {
    scenes.value.push({
      ...scene,
      id: generateId('scene'),
      isPreset: false,
    });
  }

  function updateScene(id: string, updates: Partial<Scene>) {
    const index = scenes.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      scenes.value[index] = {
        ...scenes.value[index],
        ...updates,
      };
    }
  }

  function deleteScene(id: string) {
    scenes.value = scenes.value.filter((s) => s.id !== id);
  }

  function setActiveScene(scene: Scene | null) {
    activeScene.value = scene;
    if (scene) {
      createChecklistFromScene(scene);
    } else {
      currentChecklist.value = null;
    }
  }

  function createChecklistFromScene(scene: Scene) {
    const items: ChecklistItem[] = scene.requiredDocumentIds
      .map((docId) => {
        const doc = documents.value.find((d) => d.id === docId);
        if (!doc) return null;
        return {
          documentId: doc.id,
          documentName: doc.name,
          documentIcon: doc.icon,
          storageLocation: doc.storageLocation,
          needOriginal: true,
          needCopy: false,
          isChecked: false,
        };
      })
      .filter(Boolean) as ChecklistItem[];

    currentChecklist.value = {
      id: generateId('checklist'),
      sceneId: scene.id,
      sceneName: scene.name,
      date: new Date().toISOString().split('T')[0],
      companion: '',
      needsCompanion: false,
      items,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
  }

  function updateChecklistItem(docId: string, updates: Partial<ChecklistItem>) {
    if (!currentChecklist.value) return;
    const index = currentChecklist.value.items.findIndex((i) => i.documentId === docId);
    if (index !== -1) {
      currentChecklist.value.items[index] = {
        ...currentChecklist.value.items[index],
        ...updates,
      };
    }
  }

  function toggleChecklistItem(docId: string) {
    if (!currentChecklist.value) return;
    const item = currentChecklist.value.items.find((i) => i.documentId === docId);
    if (item) {
      item.isChecked = !item.isChecked;
    }
  }

  function saveChecklist() {
    if (!currentChecklist.value) return;
    const existing = checklists.value.findIndex((c) => c.id === currentChecklist.value!.id);
    if (existing !== -1) {
      checklists.value[existing] = { ...currentChecklist.value };
    } else {
      checklists.value.push({ ...currentChecklist.value });
    }
  }

  const checkedCount = computed(() => {
    if (!currentChecklist.value) return 0;
    return currentChecklist.value.items.filter((i) => i.isChecked).length;
  });

  const totalCount = computed(() => {
    if (!currentChecklist.value) return 0;
    return currentChecklist.value.items.length;
  });

  const progressPercent = computed(() => {
    if (totalCount.value === 0) return 0;
    return Math.round((checkedCount.value / totalCount.value) * 100);
  });

  const allChecked = computed(() => {
    return currentChecklist.value?.items.every((i) => i.isChecked) ?? false;
  });

  function toggleLargePreview() {
    showLargePreview.value = !showLargePreview.value;
  }

  function openLargePreview() {
    showLargePreview.value = true;
  }

  function closeLargePreview() {
    showLargePreview.value = false;
  }

  function resetChecklist() {
    if (!currentChecklist.value) return;
    currentChecklist.value.items.forEach((item) => {
      item.isChecked = false;
    });
    currentChecklist.value.isCompleted = false;
  }

  function completeChecklist() {
    if (!currentChecklist.value) return;
    currentChecklist.value.isCompleted = true;
    saveChecklist();
  }

  return {
    documents,
    scenes,
    checklists,
    activeScene,
    currentChecklist,
    showLargePreview,
    checkedCount,
    totalCount,
    progressPercent,
    allChecked,
    init,
    addDocument,
    updateDocument,
    deleteDocument,
    addScene,
    updateScene,
    deleteScene,
    setActiveScene,
    createChecklistFromScene,
    updateChecklistItem,
    toggleChecklistItem,
    saveChecklist,
    toggleLargePreview,
    openLargePreview,
    closeLargePreview,
    resetChecklist,
    completeChecklist,
  };
});
