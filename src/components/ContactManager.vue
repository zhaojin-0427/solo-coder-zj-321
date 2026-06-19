<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, X, Save, Phone, User, Star, Pencil, Trash2 } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import type { Contact } from '@/types';
import { relationshipOptions } from '@/types';

const store = useAppStore();

const showAddModal = ref(false);
const editingContact = ref<Contact | null>(null);
const filterType = ref<'all' | 'emergency'>('all');

const formData = ref({
  name: '',
  relationship: '儿子',
  phone: '',
  isEmergency: false,
});

const filteredContacts = computed(() => {
  if (filterType.value === 'emergency') {
    return store.contacts.filter((c) => c.isEmergency);
  }
  return store.contacts;
});

function openAddModal() {
  editingContact.value = null;
  formData.value = {
    name: '',
    relationship: '儿子',
    phone: '',
    isEmergency: false,
  };
  showAddModal.value = true;
}

function openEditModal(contact: Contact) {
  editingContact.value = contact;
  formData.value = {
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
    isEmergency: contact.isEmergency,
  };
  showAddModal.value = true;
}

function handleSubmit() {
  if (!formData.value.name.trim()) {
    alert('请输入联系人姓名');
    return;
  }
  if (!formData.value.phone.trim()) {
    alert('请输入联系电话');
    return;
  }
  if (!formData.value.relationship) {
    alert('请选择与老人的关系');
    return;
  }

  if (editingContact.value) {
    store.updateContact(editingContact.value.id, formData.value);
  } else {
    store.addContact(formData.value);
  }
  showAddModal.value = false;
}

function handleDelete(id: string) {
  if (confirm('确定要删除这个联系人吗？')) {
    store.deleteContact(id);
  }
}

function getRelationshipIcon(relationship: string): string {
  const icons: Record<string, string> = {
    '配偶': '💑',
    '儿子': '👦',
    '女儿': '👧',
    '父亲': '👨',
    '母亲': '👩',
    '兄弟': '👬',
    '姐妹': '👭',
    '孙子': '👶',
    '孙女': '👧',
    '其他亲属': '👨‍👩‍👧‍👦',
    '朋友': '🤝',
    '邻居': '🏘️',
  };
  return icons[relationship] || '👤';
}
</script>

<template>
  <div class="contact-manager">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="text-3xl">👨‍👩‍👧‍👦</span>
          家庭协作联系人
        </h2>
        <p class="text-gray-500 mt-1">管理家人联系方式，出门办事更放心</p>
      </div>
      <button
        class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:-translate-y-0.5"
        @click="openAddModal"
      >
        <Plus :size="20" />
        添加联系人
      </button>
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        class="px-4 py-2 rounded-xl font-medium transition-all duration-200 min-h-[44px]"
        :class="
          filterType === 'all'
            ? 'bg-purple-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-purple-50'
        "
        @click="filterType = 'all'"
      >
        全部 ({{ store.contacts.length }})
      </button>
      <button
        class="px-4 py-2 rounded-xl font-medium transition-all duration-200 min-h-[44px]"
        :class="
          filterType === 'emergency'
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-red-50'
        "
        @click="filterType = 'emergency'"
      >
        ⭐ 紧急联系人 ({{ store.emergencyContacts.length }})
      </button>
    </div>

    <div
      v-if="filteredContacts.length === 0"
      class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
    >
      <span class="text-6xl">📭</span>
      <p class="mt-4 text-gray-500 text-lg">还没有添加联系人</p>
      <p class="text-gray-400">点击上方"添加联系人"按钮开始管理</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="contact in filteredContacts"
        :key="contact.id"
        class="bg-white rounded-2xl p-5 border-2 transition-all duration-200 hover:shadow-lg"
        :class="contact.isEmergency ? 'border-red-200 bg-red-50/50' : 'border-gray-100'"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              :class="contact.isEmergency ? 'bg-red-100' : 'bg-purple-100'"
            >
              {{ getRelationshipIcon(contact.relationship) }}
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                {{ contact.name }}
                <Star
                  v-if="contact.isEmergency"
                  :size="16"
                  class="text-red-500 fill-red-500"
                />
              </h4>
              <p class="text-gray-500 text-sm">{{ contact.relationship }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-gray-600">
            <Phone :size="16" class="text-green-500 flex-shrink-0" />
            <span class="font-medium text-lg">{{ contact.phone }}</span>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors min-h-[44px]"
            @click="openEditModal(contact)"
          >
            <Pencil :size="16" />
            编辑
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors min-h-[44px]"
            @click="handleDelete(contact.id)"
          >
            <Trash2 :size="16" />
            删除
          </button>
        </div>
      </div>
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
              {{ editingContact ? '✏️ 编辑联系人' : '➕ 添加联系人' }}
            </h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              @click="showAddModal = false"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                <User :size="16" class="inline mr-1" />
                联系人姓名 *
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors text-lg"
                placeholder="如：张小明、李阿姨"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">与老人的关系 *</label>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button
                  v-for="rel in relationshipOptions"
                  :key="rel"
                  class="py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 min-h-[44px]"
                  :class="
                    formData.relationship === rel
                      ? 'border-purple-400 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-purple-200'
                  "
                  @click="formData.relationship = rel"
                >
                  {{ getRelationshipIcon(rel) }} {{ rel }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                <Phone :size="16" class="inline mr-1" />
                联系电话 *
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors text-lg"
                placeholder="请输入手机号码或固定电话"
              />
            </div>

            <div class="pt-2">
              <label class="flex items-start gap-4 p-4 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
                <input
                  v-model="formData.isEmergency"
                  type="checkbox"
                  class="mt-1 w-6 h-6 text-red-500 rounded focus:ring-red-400 flex-shrink-0"
                />
                <div>
                  <p class="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Star :size="20" class="text-red-500 fill-red-500" />
                    设为紧急联系人
                  </p>
                  <p class="text-gray-600 mt-1">
                    出门提醒和紧急情况时会优先显示
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
            <button
              class="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
              @click="showAddModal = false"
            >
              取消
            </button>
            <button
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all min-h-[44px]"
              @click="handleSubmit"
            >
              <Save :size="18" />
              {{ editingContact ? '保存修改' : '添加联系人' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
