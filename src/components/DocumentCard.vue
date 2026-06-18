<script setup lang="ts">
import { Edit2, Trash2, Copy, FileText } from 'lucide-vue-next';
import type { Document } from '@/types';
import { categoryLabels, categoryColors } from '@/types';

interface Props {
  document: Document;
}

defineProps<Props>();

const emit = defineEmits<{
  edit: [doc: Document];
  delete: [id: string];
}>();
</script>

<template>
  <div
    class="doc-card group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 cursor-pointer"
    :style="{ borderLeftColor: categoryColors[document.category], borderLeftWidth: '6px' }"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <span class="text-4xl">{{ document.icon }}</span>
        <div>
          <h3 class="font-bold text-lg text-gray-800">{{ document.name }}</h3>
          <span
            class="inline-block text-xs px-2 py-1 rounded-full text-white font-medium"
            :style="{ backgroundColor: categoryColors[document.category] }"
          >
            {{ categoryLabels[document.category] }}
          </span>
        </div>
      </div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
          title="编辑"
          @click.stop="emit('edit', document)"
        >
          <Edit2 :size="18" />
        </button>
        <button
          class="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title="删除"
          @click.stop="emit('delete', document.id)"
        >
          <Trash2 :size="18" />
        </button>
      </div>
    </div>

    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-2 text-gray-600">
        <span class="text-lg">📍</span>
        <span class="font-medium">存放位置：</span>
        <span class="text-gray-700">{{ document.storageLocation }}</span>
      </div>
      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-1 px-2 py-1 rounded-lg"
          :class="document.hasOriginal ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'"
        >
          <FileText :size="14" />
          <span class="text-xs font-medium">原件</span>
        </div>
        <div
          class="flex items-center gap-1 px-2 py-1 rounded-lg"
          :class="document.hasCopy ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'"
        >
          <Copy :size="14" />
          <span class="text-xs font-medium">复印件</span>
        </div>
      </div>
    </div>

    <div
      v-if="document.notes"
      class="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 italic"
    >
      💡 {{ document.notes }}
    </div>

    <div
      v-if="document.photoPlaceholder"
      class="mt-3 w-full h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200"
    >
      <span class="text-gray-400 text-sm">📷 照片占位</span>
    </div>
  </div>
</template>
