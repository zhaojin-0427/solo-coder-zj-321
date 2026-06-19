<script setup lang="ts">
import { computed } from 'vue';
import {
  RotateCcw,
  FileDown,
  Printer,
  Eye,
  Users,
  UserCheck,
  History,
  AlertTriangle,
} from 'lucide-vue-next';
import { ref } from 'vue';
import { useAppStore } from '@/stores/app';
import ChecklistItem from './ChecklistItem.vue';
import RouteInfoForm from './RouteInfoForm.vue';
import CheckStages from './CheckStages.vue';
import ChecklistHistory from './ChecklistHistory.vue';
import CollaborationReminder from './CollaborationReminder.vue';
import ValidityVerification from './ValidityVerification.vue';
import { exportAsImage } from '@/utils/export';
import { printElement } from '@/utils/print';
import type { ChecklistItem as ChecklistItemType } from '@/types';

const store = useAppStore();
const showHistory = ref(false);

const sceneColor = computed(() => store.activeScene?.color || '#FF8C42');

const hasExpiryWarnings = computed(() => store.currentChecklistExpiryWarnings.length > 0);

function toggleHistory() {
  showHistory.value = !showHistory.value;
}

function handleItemToggle(docId: string) {
  store.toggleChecklistItem(docId);
}

function handleItemUpdate(docId: string, updates: Partial<ChecklistItemType>) {
  store.updateChecklistItem(docId, updates);
}

function handleReset() {
  if (confirm('确定要重置核验状态吗？')) {
    store.resetChecklist();
  }
}

async function handleExport() {
  try {
    store.openLargePreview();
    setTimeout(async () => {
      try {
        await exportAsImage('large-print-preview', `出门核对卡-${store.currentChecklist?.sceneName}`);
      } finally {
        store.closeLargePreview();
      }
    }, 150);
  } catch (e) {
    alert('导出失败，请重试');
    console.error(e);
    store.closeLargePreview();
  }
}

function handlePrint() {
  store.openLargePreview();
  setTimeout(() => {
    printElement('large-print-preview');
    setTimeout(() => {
      store.closeLargePreview();
    }, 1500);
  }, 150);
}

function handleLargePreview() {
  store.openLargePreview();
}
</script>

<template>
  <div class="checklist-preview">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="text-3xl">📝</span>
          清单预演面板
        </h2>
        <p class="text-gray-500 mt-1">勾选需要的证件原件/复印件，设置陪同信息</p>
      </div>
      <div
        v-if="store.currentChecklist"
        class="flex flex-wrap items-center gap-3"
      >
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-purple-200 rounded-xl font-bold text-purple-600 hover:bg-purple-50 transition-all"
          :class="showHistory ? 'bg-purple-100 border-purple-400' : ''"
          @click="toggleHistory"
        >
          <History :size="18" />
          历史方案 ({{ store.checklists.length }})
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
          @click="handleReset"
        >
          <RotateCcw :size="18" />
          重置
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-blue-200 rounded-xl font-bold text-blue-600 hover:bg-blue-50 transition-all"
          @click="handleExport"
        >
          <FileDown :size="18" />
          导出图片
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-teal-200 rounded-xl font-bold text-teal-600 hover:bg-teal-50 transition-all"
          @click="handlePrint"
        >
          <Printer :size="18" />
          打印
        </button>
        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
          :style="{ backgroundColor: sceneColor }"
          @click="handleLargePreview"
        >
          <Eye :size="18" />
          大字预览
        </button>
      </div>
    </div>

    <div
      v-if="!store.activeScene || !store.currentChecklist"
      class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
    >
      <span class="text-6xl">👆</span>
      <p class="mt-4 text-gray-500 text-lg">请先从上方选择一个办事场景</p>
      <p class="text-gray-400">选择场景后会自动生成需要携带的证件清单</p>
    </div>

    <div v-else class="space-y-6">
      <ChecklistHistory
        v-if="showHistory"
        @close="showHistory = false"
      />

      <div
        v-if="hasExpiryWarnings"
        class="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl"
      >
        <div class="flex items-center gap-3">
          <AlertTriangle :size="24" class="text-red-500" />
          <div class="flex-1">
            <p class="font-bold text-red-700">
              发现 {{ store.currentChecklistExpiryWarnings.length }} 个临期/过期证件
            </p>
            <p class="text-sm text-red-600">请在下方"有效期核验"步骤中确认证件是否可用</p>
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-2xl text-white"
        :style="{ backgroundColor: sceneColor }"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <span class="text-5xl">{{ store.activeScene.icon }}</span>
            <div>
              <h3 class="text-2xl font-bold">{{ store.currentChecklist.sceneName }}</h3>
              <p class="text-white/80 mt-1">{{ store.activeScene.description }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-white/80 text-sm">出门日期</p>
            <p class="text-xl font-bold">{{ store.currentChecklist.date }}</p>
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium">核验进度</span>
            <span class="font-bold text-lg">
              {{ store.checkedCount }} / {{ store.totalCount }} 项
              ({{ store.progressPercent }}%)
            </span>
          </div>
          <div class="w-full h-4 bg-white/30 rounded-full overflow-hidden">
            <div
              class="h-full bg-white rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${store.progressPercent}%` }"
            />
          </div>
        </div>

        <div
          v-if="store.allChecked"
          class="mt-4 p-3 bg-white/20 rounded-xl text-center font-bold animate-pulse"
        >
          🎉 太棒了！所有证件都已准备就绪！
        </div>
      </div>

      <ValidityVerification />

      <div class="bg-white rounded-2xl p-5 border-2 border-gray-100">
        <h4 class="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Users :size="20" />
          陪同设置
        </h4>
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="store.currentChecklist.needsCompanion"
              type="checkbox"
              class="w-6 h-6 text-orange-500 rounded focus:ring-orange-400"
            />
            <span class="font-medium text-gray-700">需要家人陪同</span>
          </label>
          <div
            v-if="store.currentChecklist.needsCompanion"
            class="flex-1 flex items-center gap-3"
          >
            <UserCheck :size="20" class="text-orange-500" />
            <input
              v-model="store.currentChecklist.companion"
              type="text"
              class="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
              placeholder="陪同人姓名，如：儿子、女儿、老伴"
            />
          </div>
        </div>
      </div>

      <RouteInfoForm />

      <CollaborationReminder />

      <div>
        <h4 class="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <span class="text-2xl">✅</span>
          出门前逐项核验
          <span class="text-sm font-normal text-gray-500">（点击复选框标记已准备好）</span>
        </h4>
        <div class="space-y-3">
          <ChecklistItem
            v-for="item in store.currentChecklist.items"
            :key="item.documentId"
            :item="item"
            :show-toggle="true"
            @toggle="handleItemToggle(item.documentId)"
            @update="(updates) => handleItemUpdate(item.documentId, updates)"
          />
        </div>
      </div>

      <CheckStages />

      <button
        v-if="store.allChecked && store.allStagesCompleted && store.allVerificationsCompleted && !store.currentChecklist.isCompleted"
        class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:-translate-y-0.5"
        @click="store.completeChecklist()"
      >
        ✅ 全部核验完成，保存方案记录
      </button>

      <div
        v-if="hasExpiryWarnings && !store.allVerificationsCompleted && store.currentChecklist"
        class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-center"
      >
        <p class="text-red-700 font-bold">
          🚨 请先完成"有效期核验"步骤，确认临期/过期证件是否可用
        </p>
      </div>

      <div
        v-else-if="!store.allStagesCompleted && store.currentChecklist"
        class="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-center"
      >
        <p class="text-amber-700 font-bold">
          ⚠️ 请完成所有三阶段核验步骤后再保存
        </p>
      </div>

      <div
        v-if="store.currentChecklist.isCompleted"
        class="p-5 bg-green-50 border-2 border-green-200 rounded-2xl text-center"
      >
        <span class="text-5xl">💚</span>
        <p class="mt-3 text-green-700 font-bold text-xl">方案已完成并保存</p>
        <p class="text-green-600 mt-1">放心出门办事吧，一切都准备好了！</p>
        <p class="text-green-500 mt-2 text-sm">
          您可以在"历史方案"中查看或复制此方案
        </p>
      </div>
    </div>
  </div>
</template>
