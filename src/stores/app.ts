import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type {
  Document,
  Scene,
  Checklist,
  ChecklistItem,
  RouteInfo,
  CheckStages,
  StageStep,
} from '@/types';
import {
  presetDocuments,
  presetScenes,
} from '@/mock/initialData';
import {
  loadDocuments,
  saveDocuments,
  loadScenes,
  saveScenes,
  loadChecklists,
  saveChecklists,
  generateId,
} from '@/utils/storage';
import {
  defaultRouteInfo,
  generateDefaultStages,
} from '@/types';

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
      routeInfo: { ...defaultRouteInfo },
      checkStages: generateDefaultStages(scene.name),
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

  function updateRouteInfo(updates: Partial<RouteInfo>) {
    if (!currentChecklist.value) return;
    currentChecklist.value.routeInfo = {
      ...currentChecklist.value.routeInfo,
      ...updates,
    };
  }

  function toggleStageStep(
    stage: 'beforeLeave' | 'onTheWay' | 'afterFinish',
    stepId: string
  ) {
    if (!currentChecklist.value) return;
    const step = currentChecklist.value.checkStages[stage].find(
      (s) => s.id === stepId
    );
    if (step) {
      step.isChecked = !step.isChecked;
    }
  }

  function loadChecklist(checklist: Checklist) {
    currentChecklist.value = JSON.parse(JSON.stringify(checklist));
    const scene = scenes.value.find((s) => s.id === checklist.sceneId);
    activeScene.value = scene || null;
  }

  function copyChecklistAsNew(checklist: Checklist) {
    const clonedItems = checklist.items.map((item) => ({
      ...item,
      isChecked: false,
    }));

    const stages = checklist.checkStages || generateDefaultStages(checklist.sceneName);
    const newCheckStages: CheckStages = {
      beforeLeave: stages.beforeLeave.map((s) => ({ ...s, isChecked: false })),
      onTheWay: stages.onTheWay.map((s) => ({ ...s, isChecked: false })),
      afterFinish: stages.afterFinish.map((s) => ({ ...s, isChecked: false })),
    };

    const routeInfo = checklist.routeInfo || { ...defaultRouteInfo };

    const newChecklist: Checklist = {
      id: generateId('checklist'),
      sceneId: checklist.sceneId,
      sceneName: checklist.sceneName,
      date: new Date().toISOString().split('T')[0],
      companion: checklist.companion || '',
      needsCompanion: checklist.needsCompanion || false,
      items: clonedItems,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0],
      routeInfo: { ...routeInfo },
      checkStages: newCheckStages,
    };

    currentChecklist.value = newChecklist;
    const scene = scenes.value.find((s) => s.id === checklist.sceneId);
    activeScene.value = scene || null;
  }

  const stageCheckedCount = computed(() => {
    if (!currentChecklist.value) return { beforeLeave: 0, onTheWay: 0, afterFinish: 0 };
    const stages = currentChecklist.value.checkStages;
    return {
      beforeLeave: stages.beforeLeave.filter((s) => s.isChecked).length,
      onTheWay: stages.onTheWay.filter((s) => s.isChecked).length,
      afterFinish: stages.afterFinish.filter((s) => s.isChecked).length,
    };
  });

  const stageTotalCount = computed(() => {
    if (!currentChecklist.value) return { beforeLeave: 0, onTheWay: 0, afterFinish: 0 };
    const stages = currentChecklist.value.checkStages;
    return {
      beforeLeave: stages.beforeLeave.length,
      onTheWay: stages.onTheWay.length,
      afterFinish: stages.afterFinish.length,
    };
  });

  const allStagesCompleted = computed(() => {
    if (!currentChecklist.value) return false;
    const stages = currentChecklist.value.checkStages;
    return (
      stages.beforeLeave.every((s) => s.isChecked) &&
      stages.onTheWay.every((s) => s.isChecked) &&
      stages.afterFinish.every((s) => s.isChecked)
    );
  });

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
    stageCheckedCount,
    stageTotalCount,
    allStagesCompleted,
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
    updateRouteInfo,
    toggleStageStep,
    loadChecklist,
    copyChecklistAsNew,
  };
});
