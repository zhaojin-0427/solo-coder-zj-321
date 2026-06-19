<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Eye, Copy, Calendar, MapPin, Clock, History, ChevronDown, ChevronUp } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import type { Checklist } from '@/types';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useAppStore();
const expandedChecklistId = ref<string | null>(null);

const sortedChecklists = computed(() => {
  return [...store.checklists].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

function handleOpen(checklist: Checklist) {
  store.loadChecklist(checklist);
  emit('close');
}

function handleCopy(checklist: Checklist) {
  store.copyChecklistAsNew(checklist);
  emit('close');
}

function toggleExpand(checklistId: string) {
  if (expandedChecklistId.value === checklistId) {
    expandedChecklistId.value = null;
  } else {
    expandedChecklistId.value = checklistId;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActionIcon(actionType: string): string {
  const icons: Record<string, string> = {
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
</script>

<template>
  <div class="bg-purple-50 rounded-2xl border-2 border-purple-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-black text-purple-800 flex items-center gap-3">
        <span class="text-4xl">📚</span>
        历史方案记录
      </h3>
      <button
        class="p-2 hover:bg-purple-100 rounded-xl transition-colors"
        @click="emit('close')"
      >
        <X :size="24" class="text-purple-600" />
      </button>
    </div>

    <div
      v-if="sortedChecklists.length === 0"
      class="text-center py-12 bg-white rounded-xl"
    >
      <span class="text-6xl">📝</span>
      <p class="mt-4 text-gray-500 text-lg">暂无历史方案</p>
      <p class="text-gray-400">完成第一次核验后，方案会自动保存到这里</p>
    </div>

    <div
      v-else
      class="space-y-4 max-h-96 overflow-y-auto pr-2"
    >
      <div
        v-for="checklist in sortedChecklists"
        :key="checklist.id"
        class="bg-white rounded-xl p-5 border-2 border-purple-100 hover:border-purple-300 transition-all"
      >
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">
                {{ checklist.sceneName === '看病' ? '🏥' : 
                   checklist.sceneName === '取药' ? '💊' :
                   checklist.sceneName === '领补贴' ? '💰' :
                   checklist.sceneName === '银行卡挂失' ? '🏦' :
                   checklist.sceneName === '社保认证' ? '✅' : '📋' }}
              </span>
              <div>
                <h4 class="text-xl font-bold text-gray-800">
                  {{ checklist.sceneName }}
                </h4>
                <div class="flex items-center gap-2 text-gray-500 text-sm mt-1">
                  <Calendar :size="14" />
                  <span>{{ formatDate(checklist.createdAt) }}</span>
                </div>
              </div>
              <span
                v-if="checklist.isCompleted"
                class="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold"
              >
                ✓ 已完成
              </span>
            </div>

            <div class="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
              <span
                v-if="checklist.routeInfo?.location"
                class="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg"
              >
                <MapPin :size="14" />
                {{ checklist.routeInfo.location }}
              </span>
              <span
                v-if="checklist.routeInfo?.departureTime"
                class="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg"
              >
                <Clock :size="14" />
                {{ checklist.routeInfo.departureTime }}
              </span>
              <span
                v-if="checklist.needsCompanion && checklist.companion"
                class="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg"
              >
                👨‍👩‍👧 陪同：{{ checklist.companion }}
              </span>
              <span class="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-lg">
                📋 {{ checklist.items.length }} 项证件
              </span>
            </div>

            <div
              v-if="checklist.routeInfo?.counterName || checklist.routeInfo?.contactPhone"
              class="text-sm text-gray-500 mb-3"
            >
              <span v-if="checklist.routeInfo.counterName">
                窗口：{{ checklist.routeInfo.counterName }}
              </span>
              <span v-if="checklist.routeInfo.contactPhone" class="ml-3">
                电话：{{ checklist.routeInfo.contactPhone }}
              </span>
            </div>
          </div>

          <div class="flex gap-2 sm:flex-col">
            <button
              class="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all text-sm min-h-[44px]"
              @click="handleOpen(checklist)"
            >
              <Eye :size="16" />
              查看
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all text-sm min-h-[44px]"
              @click="handleCopy(checklist)"
            >
              <Copy :size="16" />
              复制为新方案
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all text-sm min-h-[44px]"
              @click="toggleExpand(checklist.id)"
            >
              <History :size="16" />
              协作记录
              <component :is="expandedChecklistId === checklist.id ? ChevronUp : ChevronDown" :size="14" />
            </button>
          </div>
        </div>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div
            v-if="expandedChecklistId === checklist.id"
            class="mt-4 pt-4 border-t-2 border-dashed border-purple-200 overflow-hidden"
          >
            <h5 class="font-bold text-indigo-700 mb-3 flex items-center gap-2">
              <span class="text-xl">📜</span>
              协作动态记录
              <span class="text-sm font-normal text-gray-500">
                ({{ store.getRecordsByChecklist(checklist.id).length }} 条)
              </span>
            </h5>
            <div
              v-if="store.getRecordsByChecklist(checklist.id).length === 0"
              class="text-center py-6 bg-white rounded-xl"
            >
              <p class="text-gray-400">暂无协作记录</p>
            </div>
            <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2">
              <div
                v-for="record in store.getRecordsByChecklist(checklist.id)"
                :key="record.id"
                class="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-100"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
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
                  <p class="font-medium text-gray-800 text-sm">{{ record.actionLabel }}</p>
                  <p class="text-xs text-gray-500 mt-0.5 truncate">{{ record.description }}</p>
                </div>
                <span class="text-xs text-gray-400 flex-shrink-0">
                  {{ formatDateTime(record.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
