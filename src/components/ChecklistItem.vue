<script setup lang="ts">
import { FileText, Copy, MapPin } from 'lucide-vue-next';
import type { ChecklistItem } from '@/types';

interface Props {
  item: ChecklistItem;
  showToggle?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toggle: [];
  update: [updates: Partial<ChecklistItem>];
}>();

function toggleOriginal() {
  emit('update', { needOriginal: !props.item.needOriginal });
}

function toggleCopy() {
  emit('update', { needCopy: !props.item.needCopy });
}
</script>

<template>
  <div
    class="checklist-item flex items-center gap-4 p-4 bg-white rounded-2xl border-2 transition-all duration-300"
    :class="
      item.isChecked
        ? 'border-green-300 bg-green-50'
        : 'border-gray-100 hover:border-orange-200'
    "
  >
    <div v-if="showToggle" class="flex-shrink-0">
      <button
        class="w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all duration-200"
        :class="
          item.isChecked
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-orange-400'
        "
        @click="emit('toggle')"
        type="button"
      >
        <span v-if="item.isChecked" class="text-lg font-bold">✓</span>
      </button>
    </div>

    <div class="flex-shrink-0 text-4xl">
      {{ item.documentIcon }}
    </div>

    <div class="flex-1 min-w-0">
      <h4
        class="font-bold text-lg transition-all duration-200"
        :class="item.isChecked ? 'text-green-700 line-through' : 'text-gray-800'"
      >
        {{ item.documentName }}
      </h4>
      <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
        <MapPin :size="14" />
        <span>{{ item.storageLocation }}</span>
      </div>
    </div>

    <div v-if="showToggle" class="flex flex-col gap-2">
      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none"
        :class="
          item.needOriginal
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        "
        @click="toggleOriginal"
        type="button"
      >
        <FileText :size="14" />
        <span class="text-sm font-medium">原件</span>
      </button>
      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none"
        :class="
          item.needCopy
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        "
        @click="toggleCopy"
        type="button"
      >
        <Copy :size="14" />
        <span class="text-sm font-medium">复印件</span>
      </button>
    </div>

    <div v-else class="flex gap-2">
      <span
        v-if="item.needOriginal"
        class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
      >
        原件
      </span>
      <span
        v-if="item.needCopy"
        class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
      >
        复印件
      </span>
    </div>
  </div>
</template>
