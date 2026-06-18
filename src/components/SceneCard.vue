<script setup lang="ts">
import { computed } from 'vue';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import type { Scene } from '@/types';

interface Props {
  scene: Scene;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  edit: [scene: Scene];
  delete: [id: string];
}>();

const store = useAppStore();

const isActive = computed(() => store.activeScene?.id === props.scene.id);
const docCount = computed(() => {
  return props.scene.requiredDocumentIds.filter((id) =>
    store.documents.some((d) => d.id === id)
  ).length;
});
</script>

<template>
  <div
    class="scene-card relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-3 overflow-hidden"
    :class="isActive ? 'ring-4 ring-orange-300 scale-[1.02]' : 'border-transparent hover:border-orange-100'"
    :style="{ borderTopWidth: '6px', borderTopColor: scene.color }"
    @click="store.setActiveScene(isActive ? null : scene)"
  >
    <div
      v-if="isActive"
      class="absolute top-3 right-3 text-green-500"
    >
      <CheckCircle2 :size="24" />
    </div>

    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <span
          class="text-5xl block"
          :style="{ filter: isActive ? 'none' : 'grayscale(0.2)' }"
        >
          {{ scene.icon }}
        </span>
        <div>
          <h3
            class="font-bold text-xl"
            :class="isActive ? 'text-orange-600' : 'text-gray-800'"
          >
            {{ scene.name }}
          </h3>
          <p class="text-sm text-gray-500 mt-0.5">{{ scene.description }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between mt-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">需要证件：</span>
        <span
          class="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
          :style="{ backgroundColor: scene.color }"
        >
          {{ docCount }}
        </span>
      </div>

      <div v-if="!scene.isPreset" class="flex gap-1">
        <button
          class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
          title="编辑"
          @click.stop="emit('edit', scene)"
        >
          <Edit2 :size="16" />
        </button>
        <button
          class="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title="删除"
          @click.stop="emit('delete', scene.id)"
        >
          <Trash2 :size="16" />
        </button>
      </div>

      <span
        v-else
        class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500"
      >
        预设场景
      </span>
    </div>

    <div v-if="isActive" class="mt-4 pt-4 border-t border-orange-100">
      <p class="text-sm text-orange-600 font-medium">
        ✅ 已选择此场景，下方清单预演已更新
      </p>
    </div>
  </div>
</template>
