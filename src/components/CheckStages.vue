<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Circle } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import type { StageStep } from '@/types';

const store = useAppStore();

const stages = [
  {
    key: 'beforeLeave' as const,
    title: '出门前',
    icon: '🏠',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    accentColor: 'bg-blue-500',
  },
  {
    key: 'onTheWay' as const,
    title: '路上',
    icon: '🚗',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    accentColor: 'bg-amber-500',
  },
  {
    key: 'afterFinish' as const,
    title: '办完后',
    icon: '✅',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    accentColor: 'bg-green-500',
  },
];

function handleStepToggle(
  stage: 'beforeLeave' | 'onTheWay' | 'afterFinish',
  stepId: string
) {
  store.toggleStageStep(stage, stepId);
}

function getStageSteps(key: 'beforeLeave' | 'onTheWay' | 'afterFinish'): StageStep[] {
  return store.currentChecklist?.checkStages[key] || [];
}

function getProgressPercent(key: 'beforeLeave' | 'onTheWay' | 'afterFinish') {
  const total = store.stageTotalCount[key];
  const checked = store.stageCheckedCount[key];
  if (total === 0) return 0;
  return Math.round((checked / total) * 100);
}

function isStageComplete(key: 'beforeLeave' | 'onTheWay' | 'afterFinish') {
  return store.stageCheckedCount[key] === store.stageTotalCount[key];
}
</script>

<template>
  <div class="space-y-6">
    <h4 class="font-bold text-xl text-gray-800 flex items-center gap-3">
      <span class="text-3xl">📋</span>
      三阶段核验步骤
      <span class="text-sm font-normal text-gray-500">（点击完成每项核验）</span>
    </h4>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        v-for="stage in stages"
        :key="stage.key"
        class="rounded-2xl border-2 overflow-hidden transition-all duration-300"
        :class="[
          stage.bgColor,
          stage.borderColor,
          isStageComplete(stage.key) ? 'ring-4 ring-offset-2 ring-green-400' : '',
        ]"
      >
        <div class="p-5 border-b-2" :class="stage.borderColor">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-4xl">{{ stage.icon }}</span>
              <div>
                <h5 class="text-2xl font-black" :class="stage.textColor">
                  {{ stage.title }}
                </h5>
                <p class="text-sm text-gray-500 font-medium">
                  {{ store.stageCheckedCount[stage.key] }} /
                  {{ store.stageTotalCount[stage.key] }} 项
                </p>
              </div>
            </div>
            <div
              v-if="isStageComplete(stage.key)"
              class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"
            >
              <CheckCircle2 :size="28" />
            </div>
          </div>
          <div class="w-full h-3 bg-white/50 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="stage.accentColor"
              :style="{ width: `${getProgressPercent(stage.key)}%` }"
            />
          </div>
        </div>

        <div class="p-4 space-y-3">
          <div
            v-for="step in getStageSteps(stage.key)"
            :key="step.id"
            class="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200"
            :class="
              step.isChecked
                ? 'bg-white shadow-md'
                : 'bg-white/70 hover:bg-white hover:shadow'
            "
            @click="handleStepToggle(stage.key, step.id)"
          >
            <button
              class="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
              :class="step.isChecked ? 'text-green-500' : 'text-gray-300'"
            >
              <CheckCircle2 v-if="step.isChecked" :size="28" fill="currentColor" />
              <Circle v-else :size="28" />
            </button>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ step.icon }}</span>
                <p
                  class="font-bold text-lg"
                  :class="step.isChecked ? 'text-gray-400 line-through' : 'text-gray-800'"
                >
                  {{ step.title }}
                </p>
              </div>
              <p
                class="mt-1 text-base"
                :class="step.isChecked ? 'text-gray-400' : 'text-gray-600'"
              >
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
