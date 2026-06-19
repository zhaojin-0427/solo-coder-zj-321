<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  RotateCcw,
  FileDown,
  Printer,
  Eye,
  Users,
  UserCheck,
  History,
  AlertTriangle,
  Link2,
  Pill,
  FileText,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import ChecklistItem from './ChecklistItem.vue';
import RouteInfoForm from './RouteInfoForm.vue';
import CheckStages from './CheckStages.vue';
import ChecklistHistory from './ChecklistHistory.vue';
import CollaborationReminder from './CollaborationReminder.vue';
import ValidityVerification from './ValidityVerification.vue';
import { exportAsImage } from '@/utils/export';
import { printElement } from '@/utils/print';
import type { ChecklistItem as ChecklistItemType, MedicalRecord } from '@/types';

const store = useAppStore();
const showHistory = ref(false);
const showLinkMedicalModal = ref(false);
const selectedMedicalRecordId = ref<string>('');

const sceneColor = computed(() => store.activeScene?.color || '#FF8C42');

const hasExpiryWarnings = computed(() => store.currentChecklistExpiryWarnings.length > 0);

const isMedicalScene = computed(() => {
  if (!store.currentChecklist) return false;
  return store.currentChecklist.sceneName === '看病' || store.currentChecklist.sceneName === '取药';
});

const linkedMedicalRecord = computed((): MedicalRecord | undefined => {
  if (!store.currentChecklist) return undefined;
  if (store.currentChecklist.relatedMedicalRecordId) {
    return store.getMedicalRecordById(store.currentChecklist.relatedMedicalRecordId);
  }
  return store.getRelatedMedicalRecordForChecklist(store.currentChecklist.id);
});

const availableMedicalRecords = computed(() => {
  if (!store.currentChecklist) return [];
  return store.medicalRecords.filter(
    (r) => !r.relatedChecklistIds.includes(store.currentChecklist!.id)
  );
});

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

function openLinkMedicalModal() {
  if (linkedMedicalRecord.value) {
    selectedMedicalRecordId.value = linkedMedicalRecord.value.id;
  } else {
    selectedMedicalRecordId.value = '';
  }
  showLinkMedicalModal.value = true;
}

function handleLinkMedical() {
  if (!store.currentChecklist || !selectedMedicalRecordId.value) {
    showLinkMedicalModal.value = false;
    return;
  }
  store.linkChecklistToMedicalRecord(selectedMedicalRecordId.value, store.currentChecklist.id);
  showLinkMedicalModal.value = false;
}

function handleUnlinkMedical() {
  if (!store.currentChecklist || !linkedMedicalRecord.value) return;
  if (confirm('确定要取消与该就医记录的关联吗？')) {
    store.unlinkChecklistFromMedicalRecord(linkedMedicalRecord.value.id, store.currentChecklist.id);
  }
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
          v-if="isMedicalScene"
          class="flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-xl font-bold transition-all"
          :class="linkedMedicalRecord ? 'border-rose-400 text-rose-600 bg-rose-50' : 'border-rose-200 text-rose-600 hover:bg-rose-50'"
          @click="openLinkMedicalModal"
        >
          <Link2 :size="18" />
          {{ linkedMedicalRecord ? '已关联就医记录' : '关联就医记录' }}
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

      <div
        v-if="isMedicalScene && linkedMedicalRecord"
        class="p-5 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl"
      >
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold text-lg text-rose-800 flex items-center gap-2">
            <span class="text-2xl">🏥</span>
            关联就医信息提醒
            <span class="text-sm font-normal text-rose-600">（{{ linkedMedicalRecord.elderName }}）</span>
          </h4>
          <button
            class="text-sm text-rose-600 hover:text-rose-800 font-medium"
            @click="handleUnlinkMedical"
          >
            取消关联
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-white rounded-xl">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar :size="20" class="text-blue-600" />
              </div>
              <div>
                <p class="font-bold text-gray-800">复诊信息</p>
                <p class="text-gray-600 text-sm mt-1">
                  {{ linkedMedicalRecord.hospital }} · {{ linkedMedicalRecord.department }}
                </p>
                <p class="text-rose-600 font-bold mt-1">
                  {{ linkedMedicalRecord.nextVisitDate ? `下次复诊：${linkedMedicalRecord.nextVisitDate}` : '暂无复诊计划' }}
                </p>
                <p v-if="linkedMedicalRecord.doctorName" class="text-gray-500 text-sm">
                  主治医生：{{ linkedMedicalRecord.doctorName }}
                </p>
              </div>
            </div>
          </div>

          <div class="p-4 bg-white rounded-xl">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText :size="20" class="text-amber-600" />
              </div>
              <div>
                <p class="font-bold text-gray-800">需携带资料</p>
                <div class="mt-1 space-y-1">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-sm">
                    📋 病历本
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-sm">
                    💊 处方单
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-sm">
                    🔬 检查报告单
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-sm">
                    💳 医保卡
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="linkedMedicalRecord.medications.length > 0" class="mt-4 p-4 bg-white rounded-xl">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Pill :size="20" class="text-rose-600" />
            </div>
            <div class="flex-1">
              <p class="font-bold text-gray-800">当前服药清单（{{ linkedMedicalRecord.medications.length }} 种）</p>
              <p class="text-gray-500 text-sm">请告知医生目前正在服用的药物</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-13" style="margin-left: 52px;">
            <div
              v-for="med in linkedMedicalRecord.medications"
              :key="med.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <p class="font-bold text-gray-800">{{ med.name }}</p>
              <p class="text-sm text-gray-600">{{ med.dosage }} · {{ med.frequency }}</p>
              <p class="text-sm" :class="med.remainingQuantity <= 7 ? 'text-rose-600 font-bold' : 'text-gray-500'">
                剩余：{{ med.remainingQuantity }}{{ med.unit }}
                <span v-if="med.remainingQuantity <= 7">（药量不足）</span>
              </p>
            </div>
          </div>
        </div>

        <div v-if="linkedMedicalRecord.contraindications" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div class="flex items-start gap-3">
            <AlertCircle :size="22" class="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-bold text-red-800">⚠️ 用药禁忌/饮食注意</p>
              <p class="text-red-700 mt-1">{{ linkedMedicalRecord.contraindications }}</p>
            </div>
          </div>
        </div>

        <div v-if="linkedMedicalRecord.notes" class="mt-3 p-3 bg-amber-50 rounded-xl">
          <p class="text-sm text-amber-800">
            <span class="font-bold">📝 备注：</span>{{ linkedMedicalRecord.notes }}
          </p>
        </div>
      </div>

      <div
        v-else-if="isMedicalScene && !linkedMedicalRecord"
        class="p-4 bg-gradient-to-r from-gray-50 to-rose-50 border-2 border-dashed border-rose-200 rounded-2xl"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">💡</span>
            <div>
              <p class="font-bold text-gray-800">关联就医记录</p>
              <p class="text-sm text-gray-600">关联后将自动提示复诊信息、服药清单、需携带的病历处方等</p>
            </div>
          </div>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
            @click="openLinkMedicalModal"
          >
            <Link2 :size="18" />
            去关联
          </button>
        </div>
      </div>

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

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showLinkMedicalModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showLinkMedicalModal = false"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="showLinkMedicalModal"
            class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
          >
            <div class="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span class="text-2xl">🏥</span>
                关联就医记录
              </h3>
              <button
                class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                @click="showLinkMedicalModal = false"
              >
                <X :size="20" />
              </button>
            </div>

            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <p class="text-sm text-gray-600">
                选择要关联的就医记录，关联后将自动展示复诊信息、服药清单和需携带的资料提醒
              </p>

              <div v-if="availableMedicalRecords.length === 0" class="p-6 text-center bg-gray-50 rounded-xl">
                <span class="text-4xl">📋</span>
                <p class="mt-3 font-bold text-gray-800">暂无可用的就医记录</p>
                <p class="text-gray-500 text-sm mt-1">请到"就医用药"标签页创建就医记录</p>
              </div>

              <div
                v-for="record in availableMedicalRecords"
                :key="record.id"
                class="p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md"
                :class="selectedMedicalRecordId === record.id ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-300'"
                @click="selectedMedicalRecordId = record.id"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-bold text-gray-800">{{ record.elderName }} · {{ record.department }}</p>
                    <p class="text-sm text-gray-500">{{ record.hospital }}</p>
                    <p class="text-sm text-gray-500 mt-1">
                      {{ record.doctorName ? `医生：${record.doctorName}` : '' }}
                      {{ record.nextVisitDate ? ` · 复诊：${record.nextVisitDate}` : '' }}
                    </p>
                  </div>
                  <div
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1"
                    :class="selectedMedicalRecordId === record.id ? 'bg-rose-500 border-rose-500' : 'border-gray-300'"
                  >
                    <svg
                      v-if="selectedMedicalRecordId === record.id"
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-5 border-t border-gray-100 flex gap-3">
              <button
                class="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                @click="showLinkMedicalModal = false"
              >
                取消
              </button>
              <button
                class="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg"
                :disabled="!selectedMedicalRecordId"
                :class="!selectedMedicalRecordId ? 'opacity-50 cursor-not-allowed' : ''"
                @click="handleLinkMedical"
              >
                确认关联
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
