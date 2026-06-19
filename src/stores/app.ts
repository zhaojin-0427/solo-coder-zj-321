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
  Contact,
  CollaborationRecord,
  CollaborationActionType,
  ReminderDraft,
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
  loadContacts,
  saveContacts,
  loadCollaborationRecords,
  saveCollaborationRecords,
  loadReminderDrafts,
  saveReminderDrafts,
  generateId,
} from '@/utils/storage';
import {
  defaultRouteInfo,
  generateDefaultStages,
  actionTypeLabels,
} from '@/types';

export const useAppStore = defineStore('app', () => {
  const documents = ref<Document[]>([]);
  const scenes = ref<Scene[]>([]);
  const checklists = ref<Checklist[]>([]);
  const activeScene = ref<Scene | null>(null);
  const currentChecklist = ref<Checklist | null>(null);
  const showLargePreview = ref(false);
  const contacts = ref<Contact[]>([]);
  const collaborationRecords = ref<CollaborationRecord[]>([]);
  const reminderDrafts = ref<ReminderDraft[]>([]);

  function init() {
    const savedDocs = loadDocuments();
    const savedScenes = loadScenes();
    const savedChecklists = loadChecklists();
    const savedContacts = loadContacts();
    const savedRecords = loadCollaborationRecords();
    const savedDrafts = loadReminderDrafts();

    documents.value = savedDocs || presetDocuments;
    scenes.value = savedScenes || presetScenes;
    checklists.value = savedChecklists || [];
    contacts.value = savedContacts || [];
    collaborationRecords.value = savedRecords || [];
    reminderDrafts.value = savedDrafts || [];
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

  watch(
    contacts,
    (val) => {
      saveContacts(val);
    },
    { deep: true }
  );

  watch(
    collaborationRecords,
    (val) => {
      saveCollaborationRecords(val);
    },
    { deep: true }
  );

  watch(
    reminderDrafts,
    (val) => {
      saveReminderDrafts(val);
    },
    { deep: true }
  );

  function addCollaborationRecord(
    actionType: CollaborationActionType,
    targetType: CollaborationRecord['targetType'],
    targetId: string,
    targetName: string,
    description: string,
    details: Record<string, unknown> = {},
    relatedChecklistId?: string
  ) {
    const record: CollaborationRecord = {
      id: generateId('collab'),
      actionType,
      actionLabel: actionTypeLabels[actionType] || actionType,
      targetType,
      targetId,
      targetName,
      description,
      details,
      createdAt: new Date().toISOString(),
      relatedChecklistId,
    };
    collaborationRecords.value.unshift(record);
  }

  function addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString().split('T')[0];
    const newDoc = {
      ...doc,
      id: generateId('doc'),
      createdAt: now,
      updatedAt: now,
    };
    documents.value.push(newDoc);
    addCollaborationRecord(
      'document_add',
      'document',
      newDoc.id,
      newDoc.name,
      `添加了证件：${newDoc.name}`,
      { category: newDoc.category }
    );
  }

  function updateDocument(id: string, updates: Partial<Document>) {
    const index = documents.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      const oldDoc = { ...documents.value[index] };
      documents.value[index] = {
        ...documents.value[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      addCollaborationRecord(
        'document_edit',
        'document',
        id,
        documents.value[index].name,
        `编辑了证件：${documents.value[index].name}`,
        { oldName: oldDoc.name, newName: documents.value[index].name }
      );
    }
  }

  function deleteDocument(id: string) {
    const doc = documents.value.find((d) => d.id === id);
    if (doc) {
      addCollaborationRecord(
        'document_delete',
        'document',
        id,
        doc.name,
        `删除了证件：${doc.name}`,
        { category: doc.category }
      );
    }
    documents.value = documents.value.filter((d) => d.id !== id);
    scenes.value.forEach((scene) => {
      scene.requiredDocumentIds = scene.requiredDocumentIds.filter((did) => did !== id);
    });
  }

  function addScene(scene: Omit<Scene, 'id' | 'isPreset'>) {
    const newScene = {
      ...scene,
      id: generateId('scene'),
      isPreset: false,
    };
    scenes.value.push(newScene);
    addCollaborationRecord(
      'scene_add',
      'scene',
      newScene.id,
      newScene.name,
      `添加了办事情景：${newScene.name}`,
      { docCount: newScene.requiredDocumentIds.length }
    );
  }

  function updateScene(id: string, updates: Partial<Scene>) {
    const index = scenes.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      const oldScene = { ...scenes.value[index] };
      scenes.value[index] = {
        ...scenes.value[index],
        ...updates,
      };
      addCollaborationRecord(
        'scene_edit',
        'scene',
        id,
        scenes.value[index].name,
        `编辑了办事情景：${scenes.value[index].name}`,
        { oldName: oldScene.name, newName: scenes.value[index].name }
      );
    }
  }

  function deleteScene(id: string) {
    const scene = scenes.value.find((s) => s.id === id);
    if (scene) {
      addCollaborationRecord(
        'scene_delete',
        'scene',
        id,
        scene.name,
        `删除了办事情景：${scene.name}`,
        { docCount: scene.requiredDocumentIds.length }
      );
    }
    scenes.value = scenes.value.filter((s) => s.id !== id);
    if (activeScene.value?.id === id) {
      setActiveScene(null);
    }
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
      addCollaborationRecord(
        'checklist_edit',
        'checklist',
        currentChecklist.value.id,
        currentChecklist.value.sceneName,
        `编辑了清单方案：${currentChecklist.value.sceneName}`,
        { itemCount: currentChecklist.value.items.length },
        currentChecklist.value.id
      );
    } else {
      checklists.value.push({ ...currentChecklist.value });
      addCollaborationRecord(
        'checklist_add',
        'checklist',
        currentChecklist.value.id,
        currentChecklist.value.sceneName,
        `创建了清单方案：${currentChecklist.value.sceneName}`,
        { itemCount: currentChecklist.value.items.length },
        currentChecklist.value.id
      );
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
    addCollaborationRecord(
      'checklist_complete',
      'checklist',
      currentChecklist.value.id,
      currentChecklist.value.sceneName,
      `完成了核验：${currentChecklist.value.sceneName}`,
      { itemCount: currentChecklist.value.items.length },
      currentChecklist.value.id
    );
  }

  function updateRouteInfo(updates: Partial<RouteInfo>) {
    if (!currentChecklist.value) return;
    currentChecklist.value.routeInfo = {
      ...currentChecklist.value.routeInfo,
      ...updates,
    };
    addCollaborationRecord(
      'route_info_edit',
      'route',
      currentChecklist.value.id,
      currentChecklist.value.sceneName,
      `编辑了路线与交接提醒：${currentChecklist.value.sceneName}`,
      { updates },
      currentChecklist.value.id
    );
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
    addCollaborationRecord(
      'checklist_copy',
      'checklist',
      newChecklist.id,
      newChecklist.sceneName,
      `复制了方案：${newChecklist.sceneName}`,
      { originalId: checklist.id },
      newChecklist.id
    );
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

  const emergencyContacts = computed(() => {
    return contacts.value.filter((c) => c.isEmergency);
  });

  function addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString().split('T')[0];
    const newContact: Contact = {
      ...contact,
      id: generateId('contact'),
      createdAt: now,
      updatedAt: now,
    };
    contacts.value.push(newContact);
  }

  function updateContact(id: string, updates: Partial<Contact>) {
    const index = contacts.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts.value[index] = {
        ...contacts.value[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }
  }

  function deleteContact(id: string) {
    contacts.value = contacts.value.filter((c) => c.id !== id);
  }

  function getContactById(id: string): Contact | undefined {
    return contacts.value.find((c) => c.id === id);
  }

  function generateReminderContent(
    checklist: Checklist,
    note: string,
    selectedContacts: Contact[]
  ): string {
    const lines: string[] = [];
    lines.push(`【${checklist.sceneName}出门提醒】`);
    lines.push('');
    lines.push(`📅 日期：${checklist.date}`);
    if (checklist.routeInfo?.departureTime) {
      lines.push(`⏰ 出门时间：${checklist.routeInfo.departureTime}`);
    }
    if (checklist.routeInfo?.location) {
      lines.push(`📍 办事地点：${checklist.routeInfo.location}`);
    }
    if (checklist.routeInfo?.counterName) {
      lines.push(`🏢 窗口/科室：${checklist.routeInfo.counterName}`);
    }
    if (checklist.routeInfo?.contactPhone) {
      lines.push(`📞 联系电话：${checklist.routeInfo.contactPhone}`);
    }
    lines.push('');
    lines.push('📋 需携带证件：');
    checklist.items.forEach((item, index) => {
      const parts = [];
      if (item.needOriginal) parts.push('原件');
      if (item.needCopy) parts.push('复印件');
      lines.push(`  ${index + 1}. ${item.documentName}（${parts.join('+')}）`);
    });
    lines.push('');
    if (checklist.needsCompanion && checklist.companion) {
      lines.push(`👨‍👩‍👧 陪同人：${checklist.companion}`);
      lines.push('');
    }
    const reminders: string[] = [];
    if (checklist.routeInfo?.needPhoneConfirm) {
      reminders.push('• 出门前先打电话确认办公时间');
    }
    if (checklist.routeInfo?.needTemporaryKeep) {
      reminders.push('• 办事过程中证件交陪同人保管');
    }
    if (checklist.routeInfo?.needReturnToLocation) {
      reminders.push('• 办完事后证件放回原位');
    }
    if (reminders.length > 0) {
      lines.push('⚠️ 交接提醒：');
      reminders.forEach((r) => lines.push(r));
      lines.push('');
    }
    if (note) {
      lines.push(`📝 备注：${note}`);
      lines.push('');
    }
    if (selectedContacts.length > 0) {
      lines.push('🚨 紧急联系人：');
      selectedContacts.forEach((c) => {
        lines.push(`  • ${c.name}（${c.relationship}）：${c.phone}`);
      });
      lines.push('');
    }
    lines.push('---');
    lines.push('请家人留意，有问题及时联系！');
    return lines.join('\n');
  }

  function saveReminderDraft(
    checklistId: string,
    selectedContactIds: string[],
    note: string,
    content: string
  ) {
    const draft: ReminderDraft = {
      id: generateId('draft'),
      checklistId,
      selectedContactIds,
      note,
      content,
      createdAt: new Date().toISOString(),
    };
    reminderDrafts.value.unshift(draft);
    const contactNames = selectedContactIds
      .map((id) => getContactById(id)?.name)
      .filter(Boolean) as string[];
    addCollaborationRecord(
      'reminder_sent',
      'reminder',
      draft.id,
      `提醒-${checklistId}`,
      `生成了协作提醒，发送给：${contactNames.join('、')}`,
      { checklistId, contactCount: selectedContactIds.length, contactIds: selectedContactIds, contactNames },
      checklistId
    );
    return draft;
  }

  function getLatestReminderDraft(checklistId: string): ReminderDraft | undefined {
    return reminderDrafts.value.find((d) => d.checklistId === checklistId);
  }

  function getReminderDraftsByChecklist(checklistId: string): ReminderDraft[] {
    return reminderDrafts.value.filter((d) => d.checklistId === checklistId);
  }

  function getRecordsByChecklist(checklistId: string): CollaborationRecord[] {
    return collaborationRecords.value.filter((r) => r.relatedChecklistId === checklistId);
  }

  function getFilteredRecords(
    contactId?: string,
    actionType?: CollaborationActionType
  ): CollaborationRecord[] {
    let records = [...collaborationRecords.value];
    if (actionType) {
      records = records.filter((r) => r.actionType === actionType);
    }
    if (contactId) {
      records = records.filter((r) => {
        if (r.actionType === 'reminder_sent' && r.details?.contactIds) {
          const ids = r.details.contactIds as string[];
          return ids.includes(contactId);
        }
        return false;
      });
    }
    return records;
  }

  return {
    documents,
    scenes,
    checklists,
    activeScene,
    currentChecklist,
    showLargePreview,
    contacts,
    collaborationRecords,
    reminderDrafts,
    emergencyContacts,
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
    addContact,
    updateContact,
    deleteContact,
    getContactById,
    generateReminderContent,
    saveReminderDraft,
    getLatestReminderDraft,
    getReminderDraftsByChecklist,
    getRecordsByChecklist,
    getFilteredRecords,
    addCollaborationRecord,
  };
});
