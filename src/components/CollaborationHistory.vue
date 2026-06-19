<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Clock,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import type { CollaborationActionType, CollaborationRecord } from '@/types';
import { actionTypeLabels } from '@/types';

const props = defineProps<{
  checklistId?: string;
  title?: string;
  maxHeight?: string;
}>();

const store = useAppStore();
const isExpanded = ref(true);
const filterAction = ref<CollaborationActionType | 'all'>('all');

const records = computed(() => {
  if (props.checklistId) {
    return store.getRecordsByChecklist(props.checklistId);
  }
  if (filterAction.value === 'all') {
    return store.collaborationRecords;
  }
  return store.getFilteredRecords(undefined, filterAction.value);
});

const actionTypeOptions = computed(() => {
  const types = Object.keys(actionTypeLabels) as CollaborationActionType[];
  return types.map((type) => ({
    value: type,
    label: actionTypeLabels[type],
  }));
});

function getActionIcon(actionType: CollaborationActionType): string {
  const icons: Record<CollaborationActionType, string> = {
    document_add: '➕',
    document_edit: '✏️',
    document_delete: '🗑️',
    scene_add: '➕',
    scene_edit: '✏️',
    scene_delete: '🗑️',
    checklist_add: '📝',
    checklist_edit: '✏️',
    checklist_delete: '🗑️',
    checklist_copy: '📋',
    checklist_complete: '✅',
    route_info_edit: '🗺️',
    reminder_sent: '💬',
  };
  return icons[actionType] || '📌';
}

function getTargetTypeLabel(targetType: string): string {
  const labels: Record<string, string> = {
    document: '证件',
    scene: '场景',
    checklist: '清单',
    route: '路线',
    reminder: '提醒',
  };
  return labels[targetType] || targetType;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 overflow-hidden">
    <button
      class="w-full p-5 flex items-center justify-between hover:bg-indigo-100/50 transition-colors text-left"
      @click="toggleExpand"
    >
      <h4 class="font-bold text-xl text-indigo-800 flex items-center gap-3">
        <span class="text-3xl">📜</span>
        {{ title || '协作动态记录' }}
        <span class="text-sm font-normal text-indigo-500 ml-2">
          （共 {{ records.length }} 条）
        </span>
      </h4>
      <component
        :is="isExpanded ? ChevronUp : ChevronDown"
        :size="24"
        class="text-indigo-400"
      />
    </button>

    <div v-show="isExpanded" class="px-5 pb-6 space-y-4 border-t border-indigo-100 pt-5">
      <div v-if="!checklistId" class="flex flex-wrap gap-2 items-center">
        <div class="flex items-center gap-2 text-indigo-600">
          <Filter :size="18" />
          <span class="font-bold">筛选：</span>
        </div>
        <button
          class="px-3 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px]"
          :class="
            filterAction === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-white text-gray-600 hover:bg-indigo-50'
          "
          @click="filterAction = 'all'"
        >
          全部
        </button>
        <button
          v-for="option in actionTypeOptions"
          :key="option.value"
          class="px-3 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px]"
          :class="
            filterAction === option.value
              ? 'bg-indigo-500 text-white'
              : 'bg-white text-gray-600 hover:bg-indigo-50'
          "
          @click="filterAction = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <div
        v-if="records.length === 0"
        class="text-center py-10 bg-white rounded-xl"
      >
        <span class="text-5xl">📭</span>
        <p class="mt-3 text-gray-500 text-lg">暂无协作记录</p>
        <p class="text-gray-400 text-sm">操作后会自动记录在这里</p>
      </div>

      <div
        v-else
        class="space-y-3 overflow-y-auto pr-2"
        :style="{ maxHeight: maxHeight || '400px' }"
      >
        <div
          v-for="record in records"
          :key="record.id"
          class="bg-white rounded-xl p-4 border border-indigo-100 hover:shadow-md transition-all"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              :class="{
                'bg-green-100': record.actionType.includes('add'),
                'bg-blue-100': record.actionType.includes('edit'),
                'bg-red-100': record.actionType.includes('delete'),
                'bg-purple-100': record.actionType.includes('copy') || record.actionType.includes('reminder'),
                'bg-amber-100': record.actionType.includes('complete'),
                'bg-teal-100': record.actionType.includes('route'),
              }"
            >
              {{ getActionIcon(record.actionType) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-gray-800 text-lg">
                  {{ record.actionLabel }}
                </span>
                <span class="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                  {{ getTargetTypeLabel(record.targetType) }}
                </span>
              </div>
              <p class="text-gray-600 mt-1">{{ record.description }}</p>
              <div class="flex items-center gap-3 mt-2 text-sm text-gray-400">
                <span class="flex items-center gap-1">
                  <Clock :size="14" />
                  {{ formatDateTime(record.createdAt) }}
                </span>
                <span class="flex items-center gap-1">
                  <FileText :size="14" />
                  {{ record.targetName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
