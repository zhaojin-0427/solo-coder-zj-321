<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';
import { Pill, Calendar, AlertTriangle, Clock, ChevronRight } from 'lucide-vue-next';
import { getDaysUntilFollowUp, getFollowUpStatus, getFollowUpStatusLabel, getFollowUpStatusBgClass } from '@/types';

const store = useAppStore();

const sortedUpcoming = computed(() => store.upcomingFollowUps);

const lowMedRecords = computed(() => store.lowMedicationRecords);

function formatDate(dateStr: string) {
  if (!dateStr) return '未设置';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  });
}

function getFollowUpText(nextVisitDate: string) {
  const days = getDaysUntilFollowUp(nextVisitDate);
  if (days === null) return '';
  if (days === 0) return '今天复诊';
  if (days === 1) return '明天复诊';
  if (days < 0) return `已逾期${Math.abs(days)}天`;
  return `${days}天后复诊`;
}

function getLowMeds(record: typeof store.medicalRecords[0]) {
  return record.medications.filter((m) => m.remainingQuantity <= 7);
}
</script>

<template>
  <div class="medication-reminder">
    <div
      v-if="sortedUpcoming.length === 0 && lowMedRecords.length === 0"
      class="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 text-center"
    >
      <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4">
        ✅
      </div>
      <h3 class="text-xl font-bold text-green-800 mb-2">暂无复诊与用药提醒</h3>
      <p class="text-green-600">所有情况正常，请继续保持！</p>
    </div>

    <div v-else class="space-y-4">
      <div v-if="sortedUpcoming.length > 0">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Calendar :size="22" class="text-orange-500" />
          复诊提醒
          <span class="ml-2 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
            {{ sortedUpcoming.length }} 项
          </span>
        </h3>

        <div class="space-y-3">
          <div
            v-for="record in sortedUpcoming"
            :key="'fu-' + record.id"
            class="p-4 bg-white rounded-2xl border-2 transition-all hover:shadow-md"
            :class="getFollowUpStatus(record.nextVisitDate) === 'overdue' ? 'border-red-200' : 'border-orange-200'"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  :class="getFollowUpStatus(record.nextVisitDate) === 'overdue' ? 'bg-red-100' : 'bg-orange-100'"
                >
                  🏥
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-gray-800 text-lg">{{ record.elderName }}</h4>
                    <span
                      class="px-2.5 py-0.5 rounded-full text-sm font-bold border"
                      :class="getFollowUpStatusBgClass(getFollowUpStatus(record.nextVisitDate))"
                    >
                      {{ getFollowUpText(record.nextVisitDate) }}
                    </span>
                  </div>
                  <p class="text-gray-600 mt-1">
                    {{ record.hospital }} · {{ record.department || '未设置科室' }}
                  </p>
                  <p class="text-gray-500 text-sm mt-1">
                    <Clock :size="14" class="inline mr-1" />
                    {{ formatDate(record.nextVisitDate) }}
                    <span v-if="record.doctorName"> · {{ record.doctorName }}</span>
                  </p>
                  <p v-if="record.diagnosis" class="text-gray-500 text-sm mt-1">
                    诊断：{{ record.diagnosis }}
                  </p>
                </div>
              </div>
              <ChevronRight :size="20" class="text-gray-400 flex-shrink-0 mt-2" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="lowMedRecords.length > 0">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Pill :size="22" class="text-rose-500" />
          用药提醒（药量不足）
          <span class="ml-2 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">
            {{ lowMedRecords.reduce((sum, r) => sum + getLowMeds(r).length, 0) }} 项
          </span>
        </h3>

        <div class="space-y-3">
          <div
            v-for="record in lowMedRecords"
            :key="'med-' + record.id"
            class="p-4 bg-white rounded-2xl border-2 border-rose-200 transition-all hover:shadow-md"
          >
            <div class="flex items-start gap-3 mb-3">
              <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                👤
              </div>
              <div>
                <h4 class="font-bold text-gray-800 text-lg">{{ record.elderName }}</h4>
                <p class="text-gray-500 text-sm">{{ record.hospital }}</p>
              </div>
            </div>

            <div class="ml-15 pl-15 space-y-2" style="margin-left: 60px;">
              <div
                v-for="med in getLowMeds(record)"
                :key="med.id"
                class="flex items-center justify-between p-3 bg-rose-50 rounded-xl"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">💊</span>
                  <div>
                    <p class="font-bold text-gray-800">{{ med.name }}</p>
                    <p class="text-sm text-gray-500">{{ med.dosage }} · {{ med.frequency }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-black text-rose-600">
                    {{ med.remainingQuantity }}{{ med.unit }}
                  </p>
                  <p class="text-xs text-rose-500 font-medium">药量不足</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="sortedUpcoming.some(r => getFollowUpStatus(r.nextVisitDate) === 'overdue')"
        class="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle :size="24" class="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-red-800">有复诊已逾期</p>
            <p class="text-sm text-red-700 mt-1">请尽快联系医生安排复诊，避免影响治疗效果</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
