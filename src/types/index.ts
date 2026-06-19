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

export interface RouteInfo {
  location: string;
  departureTime: string;
  counterName: string;
  contactPhone: string;
  needPhoneConfirm: boolean;
  needTemporaryKeep: boolean;
  needReturnToLocation: boolean;
}

export interface StageStep {
  id: string;
  title: string;
  description: string;
  isChecked: boolean;
  icon: string;
}

export interface CheckStages {
  beforeLeave: StageStep[];
  onTheWay: StageStep[];
  afterFinish: StageStep[];
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
  routeInfo: RouteInfo;
  checkStages: CheckStages;
}

export const defaultRouteInfo: RouteInfo = {
  location: '',
  departureTime: '',
  counterName: '',
  contactPhone: '',
  needPhoneConfirm: false,
  needTemporaryKeep: false,
  needReturnToLocation: false,
};

export function generateDefaultStages(sceneName: string): CheckStages {
  return {
    beforeLeave: [
      {
        id: 'before-1',
        title: '检查所有证件是否齐全',
        description: '对照清单逐一确认证件原件和复印件都已放入包中',
        isChecked: false,
        icon: '✅',
      },
      {
        id: 'before-2',
        title: '确认出门时间',
        description: '查看预计出门时间，提前10分钟做好准备',
        isChecked: false,
        icon: '⏰',
      },
      {
        id: 'before-3',
        title: '锁好门窗',
        description: '检查家门、窗户是否锁好，水电煤气是否关闭',
        isChecked: false,
        icon: '🔐',
      },
      {
        id: 'before-4',
        title: '带好钥匙和手机',
        description: '确认钥匙、手机、钱包等随身物品已带好',
        isChecked: false,
        icon: '📱',
      },
    ],
    onTheWay: [
      {
        id: 'way-1',
        title: '注意交通安全',
        description: '过马路走人行横道，注意来往车辆',
        isChecked: false,
        icon: '🚸',
      },
      {
        id: 'way-2',
        title: '保管好随身物品',
        description: '证件和贵重物品放在内层口袋，不要离开视线',
        isChecked: false,
        icon: '👜',
      },
      {
        id: 'way-3',
        title: '确认办事地点',
        description: '对照路线信息确认目的地，不要下错车站',
        isChecked: false,
        icon: '📍',
      },
    ],
    afterFinish: [
      {
        id: 'after-1',
        title: '清点所有证件',
        description: '办完事后立即检查所有证件是否都在',
        isChecked: false,
        icon: '📋',
      },
      {
        id: 'after-2',
        title: '确认交接提醒',
        description: '如需将证件交陪同人保管或归还原位，按提醒执行',
        isChecked: false,
        icon: '🤝',
      },
      {
        id: 'after-3',
        title: '收好回执单据',
        description: '办事完成后收好所有单据和回执',
        isChecked: false,
        icon: '🧾',
      },
    ],
  };
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

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CollaborationActionType =
  | 'document_add'
  | 'document_edit'
  | 'document_delete'
  | 'scene_add'
  | 'scene_edit'
  | 'scene_delete'
  | 'checklist_add'
  | 'checklist_edit'
  | 'checklist_delete'
  | 'checklist_copy'
  | 'checklist_complete'
  | 'route_info_edit'
  | 'reminder_sent';

export interface CollaborationRecord {
  id: string;
  actionType: CollaborationActionType;
  actionLabel: string;
  targetType: 'document' | 'scene' | 'checklist' | 'route' | 'reminder';
  targetId: string;
  targetName: string;
  description: string;
  details: Record<string, unknown>;
  createdAt: string;
  relatedChecklistId?: string;
}

export interface ReminderDraft {
  id: string;
  checklistId: string;
  selectedContactIds: string[];
  note: string;
  content: string;
  createdAt: string;
}

export const actionTypeLabels: Record<CollaborationActionType, string> = {
  document_add: '添加证件',
  document_edit: '编辑证件',
  document_delete: '删除证件',
  scene_add: '添加场景',
  scene_edit: '编辑场景',
  scene_delete: '删除场景',
  checklist_add: '创建清单',
  checklist_edit: '编辑清单',
  checklist_delete: '删除清单',
  checklist_copy: '复制方案',
  checklist_complete: '完成核验',
  route_info_edit: '编辑路线信息',
  reminder_sent: '发送提醒',
};

export const relationshipOptions = [
  '配偶',
  '儿子',
  '女儿',
  '父亲',
  '母亲',
  '兄弟',
  '姐妹',
  '孙子',
  '孙女',
  '其他亲属',
  '朋友',
  '邻居',
];
