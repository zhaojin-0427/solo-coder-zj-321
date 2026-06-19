<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  Star,
  FileText,
} from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import type { Contact } from '@/types';

const store = useAppStore();
const isExpanded = ref(false);
const note = ref('');
const selectedContactIds = ref<string[]>([]);
const copied = ref(false);

const selectedContacts = computed(() => {
  return selectedContactIds.value
    .map((id) => store.getContactById(id))
    .filter(Boolean) as Contact[];
});

const reminderContent = computed(() => {
  if (!store.currentChecklist) return '';
  return store.generateReminderContent(
    store.currentChecklist,
    note.value,
    selectedContacts.value
  );
});

function toggleContact(contactId: string) {
  const index = selectedContactIds.value.indexOf(contactId);
  if (index === -1) {
    selectedContactIds.value.push(contactId);
  } else {
    selectedContactIds.value.splice(index, 1);
  }
}

function selectAllEmergency() {
  store.emergencyContacts.forEach((c) => {
    if (!selectedContactIds.value.includes(c.id)) {
      selectedContactIds.value.push(c.id);
    }
  });
}

function clearSelection() {
  selectedContactIds.value = [];
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(reminderContent.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    alert('复制失败，请手动复制');
  }
}

function saveReminder() {
  if (!store.currentChecklist) return;
  store.saveReminderDraft(
    store.currentChecklist.id,
    selectedContactIds.value,
    note.value,
    reminderContent.value
  );
  alert('提醒已保存到协作记录！');
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <div class="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
    <button
      class="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      @click="toggleExpand"
    >
      <h4 class="font-bold text-xl text-gray-800 flex items-center gap-3">
        <span class="text-3xl">💬</span>
        协作提醒
        <span class="text-sm font-normal text-gray-500 ml-2">（生成可分享的出门提醒）</span>
      </h4>
      <component
        :is="isExpanded ? ChevronUp : ChevronDown"
        :size="24"
        class="text-gray-400"
      />
    </button>

    <div v-show="isExpanded" class="px-5 pb-6 space-y-5 border-t border-gray-100 pt-5">
      <div>
        <label class="block text-sm font-bold text-gray-700 mb-3 text-lg">
          👨‍👩‍👧 选择要提醒的亲属
        </label>
        <div v-if="store.contacts.length === 0" class="text-center py-6 bg-gray-50 rounded-xl">
          <p class="text-gray-500">还没有添加联系人</p>
          <p class="text-gray-400 text-sm mt-1">请先在家庭协作联系人中添加</p>
        </div>
        <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2">
          <label
            v-for="contact in store.contacts"
            :key="contact.id"
            class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2"
            :class="
              selectedContactIds.includes(contact.id)
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-200 hover:border-purple-200'
            "
          >
            <input
              type="checkbox"
              :checked="selectedContactIds.includes(contact.id)"
              class="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
              @change="toggleContact(contact.id)"
            />
            <div class="flex-1">
              <p class="font-bold text-gray-800 flex items-center gap-2">
                {{ contact.name }}
                <Star
                  v-if="contact.isEmergency"
                  :size="14"
                  class="text-red-500 fill-red-500"
                />
              </p>
              <p class="text-gray-500 text-sm">{{ contact.relationship }}</p>
            </div>
            <div class="flex items-center gap-1 text-gray-600">
              <Phone :size="14" class="text-green-500" />
              <span class="text-sm">{{ contact.phone }}</span>
            </div>
          </label>
        </div>
        <div class="flex gap-2 mt-3">
          <button
            v-if="store.emergencyContacts.length > 0"
            class="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm min-h-[44px]"
            @click="selectAllEmergency"
          >
            ⭐ 全选紧急联系人
          </button>
          <button
            class="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm min-h-[44px]"
            @click="clearSelection"
          >
            清空选择
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-gray-700 mb-2 text-lg">
          📝 本次出门备注
        </label>
        <textarea
          v-model="note"
          rows="2"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors resize-none text-lg"
          placeholder="填写一些特别提醒，比如：记得带雨伞、路上注意安全..."
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-bold text-gray-700 text-lg flex items-center gap-2">
            <FileText :size="20" />
            提醒内容预览
          </label>
          <div class="flex gap-2">
            <button
              class="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition-colors min-h-[44px]"
              @click="saveReminder"
            >
              <MessageCircle :size="16" />
              保存提醒
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors min-h-[44px]"
              @click="copyToClipboard"
            >
              <component :is="copied ? Check : Copy" :size="16" />
              {{ copied ? '已复制' : '复制文本' }}
            </button>
          </div>
        </div>
        <div
          class="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 max-h-80 overflow-y-auto"
        >
          <pre class="whitespace-pre-wrap text-gray-700 font-sans text-base leading-relaxed">{{ reminderContent }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
