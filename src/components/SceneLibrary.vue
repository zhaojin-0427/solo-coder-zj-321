<script setup lang="ts">
import { ref } from 'vue';
import { Plus, X, Save, Palette } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import SceneCard from './SceneCard.vue';
import type { Scene, Document } from '@/types';

const store = useAppStore();

const showAddModal = ref(false);
const editingScene = ref<Scene | null>(null);

const formData = ref({
  name: '',
  icon: '📋',
  description: '',
  color: '#FF8C42',
  requiredDocumentIds: [] as string[],
});

const iconOptions = ['🏥', '💊', '💰', '🏦', '✅', '📋', '🚗', '🏠', '👨‍👩‍👧', '🎫', '📱', '💼'];
const colorOptions = [
  '#FF6B6B', '#FF8C42', '#F4D35E', '#4ECDC4', '#2A9D8F',
  '#AA96DA', '#F38181', '#95E1D3', '#81C784', '#64B5F6',
];

function openAddModal() {
  editingScene.value = null;
  formData.value = {
    name: '',
    icon: '📋',
    description: '',
    color: '#FF8C42',
    requiredDocumentIds: [],
  };
  showAddModal.value = true;
}

function openEditModal(scene: Scene) {
  editingScene.value = scene;
  formData.value = {
    name: scene.name,
    icon: scene.icon,
    description: scene.description,
    color: scene.color,
    requiredDocumentIds: [...scene.requiredDocumentIds],
  };
  showAddModal.value = true;
}

function toggleDocument(docId: string) {
  const index = formData.value.requiredDocumentIds.indexOf(docId);
  if (index === -1) {
    formData.value.requiredDocumentIds.push(docId);
  } else {
    formData.value.requiredDocumentIds.splice(index, 1);
  }
}

function handleSubmit() {
  if (!formData.value.name.trim()) {
    alert('请输入场景名称');
    return;
  }
  if (formData.value.requiredDocumentIds.length === 0) {
    alert('请至少选择一个证件');
    return;
  }

  if (editingScene.value) {
    store.updateScene(editingScene.value.id, formData.value);
  } else {
    store.addScene(formData.value);
  }
  showAddModal.value = false;
}

function handleDelete(id: string) {
  if (confirm('确定要删除这个场景吗？')) {
    store.deleteScene(id);
    if (store.activeScene?.id === id) {
      store.setActiveScene(null);
    }
  }
}
</script>

<template>
  <div class="scene-library">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="text-3xl">🎯</span>
          办事情景库
        </h2>
        <p class="text-gray-500 mt-1">选择办事场景，自动生成证件清单</p>
      </div>
      <button
        class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-0.5"
        @click="openAddModal"
      >
        <Plus :size="20" />
        自定义场景
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <SceneCard
        v-for="scene in store.scenes"
        :key="scene.id"
        :scene="scene"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showAddModal = false"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
            <h3 class="text-xl font-bold text-gray-800">
              {{ editingScene ? '✏️ 编辑场景' : '➕ 自定义场景' }}
            </h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              @click="showAddModal = false"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">场景名称 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none transition-colors text-lg"
                placeholder="如：去银行、办理社保"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">选择图标</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="icon in iconOptions"
                  :key="icon"
                  class="w-12 h-12 text-2xl rounded-xl border-2 transition-all duration-200 hover:scale-110"
                  :class="
                    formData.icon === icon
                      ? 'border-teal-400 bg-teal-50 scale-110'
                      : 'border-gray-200 hover:border-teal-200'
                  "
                  @click="formData.icon = icon"
                >
                  {{ icon }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                <Palette :size="16" class="inline mr-1" />
                主题颜色
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  class="w-10 h-10 rounded-xl border-3 transition-all duration-200 hover:scale-110"
                  :class="
                    formData.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-white'
                  "
                  :style="{ backgroundColor: color }"
                  @click="formData.color = color"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">场景说明</label>
              <input
                v-model="formData.description"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none transition-colors"
                placeholder="简单描述这个办事场景"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-3">
                需要携带的证件 *
                <span class="text-gray-400 font-normal text-sm ml-2">
                  已选 {{ formData.requiredDocumentIds.length }} 个
                </span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2">
                <label
                  v-for="doc in store.documents"
                  :key="doc.id"
                  class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200"
                  :class="
                    formData.requiredDocumentIds.includes(doc.id)
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                  "
                >
                  <input
                    type="checkbox"
                    :checked="formData.requiredDocumentIds.includes(doc.id)"
                    class="w-5 h-5 text-teal-500 rounded focus:ring-teal-400"
                    @change="toggleDocument(doc.id)"
                  />
                  <span class="text-2xl">{{ doc.icon }}</span>
                  <span class="font-medium text-gray-700">{{ doc.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
            <button
              class="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              @click="showAddModal = false"
            >
              取消
            </button>
            <button
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              @click="handleSubmit"
            >
              <Save :size="18" />
              {{ editingScene ? '保存修改' : '创建场景' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
