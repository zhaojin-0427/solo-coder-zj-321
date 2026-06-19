<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, X, Save, Image as ImageIcon, AlertTriangle } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import DocumentCard from './DocumentCard.vue';
import ExpiryReminder from './ExpiryReminder.vue';
import type { Document } from '@/types';

const store = useAppStore();

const showAddModal = ref(false);
const editingDoc = ref<Document | null>(null);
const filterCategory = ref<string>('all');
const showExpiryView = ref(false);

const formData = ref({
  name: '',
  icon: '📄',
  category: 'identity' as Document['category'],
  storageLocation: '',
  photoPlaceholder: '',
  notes: '',
  hasOriginal: true,
  hasCopy: false,
  last4Digits: '',
  issueDate: '',
  expiryDate: '',
  replacementLocation: '',
  replacementPhone: '',
  replacementMaterials: '',
  needInPerson: true,
});

const iconOptions = ['🆔', '💳', '📋', '📕', '🏦', '✅', '📄', '📑', '🔑', '💼', '🏠', '🚗'];
const categoryOptions = [
  { value: 'identity', label: '身份证件' },
  { value: 'medical', label: '医疗相关' },
  { value: 'finance', label: '财务相关' },
  { value: 'social', label: '社保相关' },
  { value: 'other', label: '其他' },
];

const filteredDocuments = computed(() => {
  if (filterCategory.value === 'all') {
    return store.documents;
  }
  return store.documents.filter((d) => d.category === filterCategory.value);
});

function openAddModal() {
  editingDoc.value = null;
  formData.value = {
    name: '',
    icon: '📄',
    category: 'identity',
    storageLocation: '',
    photoPlaceholder: '',
    notes: '',
    hasOriginal: true,
    hasCopy: false,
    last4Digits: '',
    issueDate: '',
    expiryDate: '',
    replacementLocation: '',
    replacementPhone: '',
    replacementMaterials: '',
    needInPerson: true,
  };
  showAddModal.value = true;
}

function openEditModal(doc: Document) {
  editingDoc.value = doc;
  formData.value = {
    name: doc.name,
    icon: doc.icon,
    category: doc.category,
    storageLocation: doc.storageLocation,
    photoPlaceholder: doc.photoPlaceholder,
    notes: doc.notes,
    hasOriginal: doc.hasOriginal,
    hasCopy: doc.hasCopy,
    last4Digits: doc.last4Digits || '',
    issueDate: doc.issueDate || '',
    expiryDate: doc.expiryDate || '',
    replacementLocation: doc.replacementLocation || '',
    replacementPhone: doc.replacementPhone || '',
    replacementMaterials: doc.replacementMaterials || '',
    needInPerson: doc.needInPerson ?? true,
  };
  showAddModal.value = true;
}

function handleSubmit() {
  if (!formData.value.name.trim()) {
    alert('请输入证件名称');
    return;
  }
  if (!formData.value.storageLocation.trim()) {
    alert('请输入存放位置');
    return;
  }

  if (editingDoc.value) {
    store.updateDocument(editingDoc.value.id, formData.value);
  } else {
    store.addDocument(formData.value);
  }
  showAddModal.value = false;
}

function handleDelete(id: string) {
  if (confirm('确定要删除这个证件吗？')) {
    store.deleteDocument(id);
  }
}
</script>

<template>
  <div class="document-manager">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="text-3xl">📁</span>
          证件收纳区
        </h2>
        <p class="text-gray-500 mt-1">管理家中老人的所有重要证件和资料</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 px-4 py-3 rounded-xl font-bold shadow-lg transition-all"
          :class="showExpiryView
            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xl'
            : 'bg-white border-2 border-red-200 text-red-600 hover:bg-red-50'"
          @click="showExpiryView = !showExpiryView"
        >
          <AlertTriangle :size="18" />
          临期提醒
          <span
            v-if="store.expiryWarningCount > 0"
            class="bg-white text-red-600 text-xs font-black px-1.5 py-0.5 rounded-full"
            :class="showExpiryView ? 'bg-white/20 text-white' : ''"
          >
            {{ store.expiryWarningCount }}
          </span>
        </button>
        <button
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-0.5"
          @click="openAddModal"
        >
          <Plus :size="20" />
          添加证件
        </button>
      </div>
    </div>

    <div v-if="showExpiryView" class="mb-6">
      <ExpiryReminder />
    </div>

    <div v-if="!showExpiryView" class="flex flex-wrap gap-2 mb-6">
      <button
        class="px-4 py-2 rounded-xl font-medium transition-all duration-200"
        :class="
          filterCategory === 'all'
            ? 'bg-orange-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-orange-50'
        "
        @click="filterCategory = 'all'"
      >
        全部 ({{ store.documents.length }})
      </button>
      <button
        v-for="cat in categoryOptions"
        :key="cat.value"
        class="px-4 py-2 rounded-xl font-medium transition-all duration-200"
        :class="
          filterCategory === cat.value
            ? 'bg-orange-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-orange-50'
        "
        @click="filterCategory = cat.value"
      >
        {{ cat.label }}
        ({{ store.documents.filter((d) => d.category === cat.value).length }})
      </button>
    </div>

    <div
      v-if="filteredDocuments.length === 0 && !showExpiryView"
      class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
    >
      <span class="text-6xl">📭</span>
      <p class="mt-4 text-gray-500 text-lg">还没有添加证件</p>
      <p class="text-gray-400">点击上方"添加证件"按钮开始管理</p>
    </div>

    <div v-else-if="!showExpiryView" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DocumentCard
        v-for="doc in filteredDocuments"
        :key="doc.id"
        :document="doc"
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
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
            <h3 class="text-xl font-bold text-gray-800">
              {{ editingDoc ? '✏️ 编辑证件' : '➕ 添加证件' }}
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
              <label class="block text-sm font-bold text-gray-700 mb-2">证件名称 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
                placeholder="如：身份证、医保卡"
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
                      ? 'border-orange-400 bg-orange-50 scale-110'
                      : 'border-gray-200 hover:border-orange-200'
                  "
                  @click="formData.icon = icon"
                >
                  {{ icon }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">证件分类</label>
              <select
                v-model="formData.category"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
              >
                <option v-for="cat in categoryOptions" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">存放位置 *</label>
              <input
                v-model="formData.storageLocation"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
                placeholder="如：卧室抽屉第1层"
              />
            </div>

            <div class="flex gap-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="formData.hasOriginal"
                  type="checkbox"
                  class="w-5 h-5 text-green-500 rounded focus:ring-green-400"
                />
                <span class="font-medium text-gray-700">有原件</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="formData.hasCopy"
                  type="checkbox"
                  class="w-5 h-5 text-blue-500 rounded focus:ring-blue-400"
                />
                <span class="font-medium text-gray-700">有复印件</span>
              </label>
            </div>

            <div class="border-t-2 border-dashed border-orange-200 pt-5">
              <h4 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="text-xl">📅</span>
                证件有效期信息
              </h4>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">证件号码后四位</label>
                  <input
                    v-model="formData.last4Digits"
                    type="text"
                    maxlength="4"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg font-mono"
                    placeholder="如：1234"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">签发日期</label>
                    <input
                      v-model="formData.issueDate"
                      type="date"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">有效期截止日期</label>
                    <input
                      v-model="formData.expiryDate"
                      type="text"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
                      placeholder="如：2030-12-31 或 长期"
                    />
                    <p class="text-xs text-gray-400 mt-1">输入日期或"长期"</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t-2 border-dashed border-orange-200 pt-5">
              <h4 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="text-xl">🔧</span>
                补办预约信息
              </h4>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">补办地点</label>
                  <input
                    v-model="formData.replacementLocation"
                    type="text"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
                    placeholder="如：户籍所在地派出所"
                  />
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">补办电话</label>
                  <input
                    v-model="formData.replacementPhone"
                    type="text"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
                    placeholder="如：12333"
                  />
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">补办所需材料</label>
                  <textarea
                    v-model="formData.replacementMaterials"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors resize-none"
                    rows="2"
                    placeholder="如：身份证原件及复印件、照片"
                  />
                </div>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="formData.needInPerson"
                    type="checkbox"
                    class="w-5 h-5 text-orange-500 rounded focus:ring-orange-400"
                  />
                  <span class="font-medium text-gray-700">需要本人到场办理</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">备注说明</label>
              <textarea
                v-model="formData.notes"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors resize-none"
                rows="2"
                placeholder="备注一些重要信息..."
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                <ImageIcon :size="16" class="inline mr-1" />
                照片占位说明
              </label>
              <input
                v-model="formData.photoPlaceholder"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                placeholder="可选：标记照片存放位置"
              />
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
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              @click="handleSubmit"
            >
              <Save :size="18" />
              {{ editingDoc ? '保存修改' : '添加证件' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
