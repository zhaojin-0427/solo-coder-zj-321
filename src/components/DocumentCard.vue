<script setup lang="ts">
import { computed } from 'vue';
import { Edit2, Trash2, Copy, FileText, Phone, MapPin, AlertTriangle } from 'lucide-vue-next';
import type { Document } from '@/types';
import { categoryLabels, categoryColors, getExpiryStatus, getExpiryStatusLabel, getExpiryStatusBgClass } from '@/types';

interface Props {
  document: Document;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [doc: Document];
  delete: [id: string];
}>();

const expiryStatus = computed(() => getExpiryStatus(props.document.expiryDate));

const expiryLabel = computed(() => getExpiryStatusLabel(expiryStatus.value));

const expiryBgClass = computed(() => getExpiryStatusBgClass(expiryStatus.value));

const isAtRisk = computed(() =>
  expiryStatus.value === 'expired' || expiryStatus.value === 'within30' || expiryStatus.value === 'within90'
);
</script>

<template>
  <div
    class="doc-card group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 cursor-pointer"
    :class="isAtRisk ? 'ring-2' : ''"
    :style="{
      borderLeftColor: isAtRisk ? (expiryStatus === 'expired' ? '#EF4444' : expiryStatus === 'within30' ? '#F97316' : '#EAB308') : categoryColors[document.category],
      borderLeftWidth: '6px',
      ...(isAtRisk ? { ringColor: expiryStatus === 'expired' ? 'rgba(239,68,68,0.3)' : expiryStatus === 'within30' ? 'rgba(249,115,22,0.3)' : 'rgba(234,179,8,0.3)' } : {}),
    }"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <span class="text-4xl">{{ document.icon }}</span>
        <div>
          <h3 class="font-bold text-lg text-gray-800">{{ document.name }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span
              class="inline-block text-xs px-2 py-1 rounded-full text-white font-medium"
              :style="{ backgroundColor: categoryColors[document.category] }"
            >
              {{ categoryLabels[document.category] }}
            </span>
            <span
              class="inline-block text-xs px-2 py-1 rounded-full font-bold border"
              :class="expiryBgClass"
            >
              {{ expiryLabel }}
            </span>
          </div>
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

      <div v-if="document.last4Digits" class="flex items-center gap-2 text-gray-600">
        <span class="text-lg">🔢</span>
        <span class="font-medium">尾号：</span>
        <span class="text-gray-700 font-mono">{{ document.last4Digits }}</span>
      </div>

      <div v-if="document.expiryDate" class="flex items-center gap-2 text-gray-600">
        <span class="text-lg">📅</span>
        <span class="font-medium">有效期至：</span>
        <span
          class="font-medium"
          :class="isAtRisk ? 'text-red-600 font-bold' : 'text-gray-700'"
        >
          {{ document.expiryDate }}
        </span>
      </div>

      <div v-if="document.issueDate" class="flex items-center gap-2 text-gray-600">
        <span class="text-lg">📆</span>
        <span class="font-medium">签发日期：</span>
        <span class="text-gray-700">{{ document.issueDate }}</span>
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
      v-if="isAtRisk && (document.replacementLocation || document.replacementPhone)"
      class="mt-3 pt-3 border-t-2 space-y-1.5"
      :class="expiryStatus === 'expired' ? 'border-red-200' : 'border-orange-200'"
    >
      <p class="text-xs font-bold text-gray-500 flex items-center gap-1">
        <AlertTriangle :size="12" />
        补办信息
      </p>
      <div
        v-if="document.replacementLocation"
        class="flex items-center gap-1.5 text-xs text-gray-600"
      >
        <MapPin :size="12" class="text-orange-500 flex-shrink-0" />
        <span>{{ document.replacementLocation }}</span>
      </div>
      <div
        v-if="document.replacementPhone"
        class="flex items-center gap-1.5 text-xs text-gray-600"
      >
        <Phone :size="12" class="text-green-500 flex-shrink-0" />
        <span>{{ document.replacementPhone }}</span>
      </div>
      <div
        v-if="document.replacementMaterials"
        class="text-xs text-gray-500"
      >
        📋 需带：{{ document.replacementMaterials }}
      </div>
      <div
        v-if="document.needInPerson"
        class="text-xs text-orange-600 font-medium"
      >
        ⚠️ 需本人到场
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
