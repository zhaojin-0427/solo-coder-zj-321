<script setup lang="ts">
import { computed } from 'vue';
import { AlertTriangle, Clock, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, Phone, MapPin } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import { getExpiryStatusLabel, getExpiryStatusBgClass } from '@/types';
import type { ExpiryStatus, Document } from '@/types';

const store = useAppStore();

const props = defineProps<{
  compact?: boolean;
}>();

const expandedGroups = computed(() => ({
  expired: true,
  within30: true,
  within90: false,
  longTerm: false,
  unknown: false,
}));

const toggleStates = computed(() => ({
  expired: true,
  within30: true,
  within90: true,
  longTerm: false,
  unknown: false,
}));

const localToggle = computed(() => {
  const state: Record<string, boolean> = {
    expired: true,
    within30: true,
    within90: true,
    longTerm: false,
    unknown: false,
  };
  return state;
});

const groups = computed(() => [
  {
    key: 'expired' as ExpiryStatus,
    label: '已过期',
    icon: '🚨',
    iconComp: AlertTriangle,
    color: 'red',
    borderColor: 'border-red-300',
    bgColor: 'bg-red-50',
    headerBg: 'bg-red-100',
    textColor: 'text-red-700',
    docs: store.documentsByExpiryGroup.expired,
  },
  {
    key: 'within30' as ExpiryStatus,
    label: '30天内到期',
    icon: '⚠️',
    iconComp: AlertTriangle,
    color: 'orange',
    borderColor: 'border-orange-300',
    bgColor: 'bg-orange-50',
    headerBg: 'bg-orange-100',
    textColor: 'text-orange-700',
    docs: store.documentsByExpiryGroup.within30,
  },
  {
    key: 'within90' as ExpiryStatus,
    label: '90天内到期',
    icon: '⏰',
    iconComp: Clock,
    color: 'yellow',
    borderColor: 'border-yellow-300',
    bgColor: 'bg-yellow-50',
    headerBg: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    docs: store.documentsByExpiryGroup.within90,
  },
  {
    key: 'longTerm' as ExpiryStatus,
    label: '长期有效',
    icon: '✅',
    iconComp: CheckCircle2,
    color: 'green',
    borderColor: 'border-green-300',
    bgColor: 'bg-green-50',
    headerBg: 'bg-green-100',
    textColor: 'text-green-700',
    docs: store.documentsByExpiryGroup.longTerm,
  },
  {
    key: 'unknown' as ExpiryStatus,
    label: '未设置有效期',
    icon: '❓',
    iconComp: HelpCircle,
    color: 'gray',
    borderColor: 'border-gray-300',
    bgColor: 'bg-gray-50',
    headerBg: 'bg-gray-100',
    textColor: 'text-gray-600',
    docs: store.documentsByExpiryGroup.unknown,
  },
]);

const warningGroups = computed(() =>
  groups.value.filter((g) => g.key === 'expired' || g.key === 'within30' || g.key === 'within90')
);

const safeGroups = computed(() =>
  groups.value.filter((g) => g.key === 'longTerm' || g.key === 'unknown')
);
</script>

<template>
  <div class="expiry-reminder">
    <div
      v-if="store.expiryWarningCount === 0"
      class="p-4 bg-green-50 border-2 border-green-200 rounded-2xl"
    >
      <div class="flex items-center gap-3">
        <CheckCircle2 :size="24" class="text-green-500" />
        <div>
          <p class="font-bold text-green-700">所有证件都在有效期内</p>
          <p class="text-sm text-green-600">暂无临期或过期证件，请放心使用</p>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-if="!compact"
        class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl"
      >
        <div class="flex items-center gap-3">
          <AlertTriangle :size="24" class="text-red-500" />
          <div>
            <p class="font-bold text-red-700">
              您有 {{ store.expiryWarningCount }} 个证件存在有效期风险
            </p>
            <p class="text-sm text-red-600">请及时确认或补办，避免影响办事</p>
          </div>
        </div>
      </div>

      <div
        v-for="group in warningGroups"
        :key="group.key"
      >
        <div
          v-if="group.docs.length > 0"
          class="rounded-2xl border-2 overflow-hidden"
          :class="group.borderColor"
        >
          <div
            class="px-4 py-3 flex items-center justify-between"
            :class="[group.headerBg, group.textColor]"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ group.icon }}</span>
              <span class="font-bold">{{ group.label }}</span>
              <span class="text-sm font-medium opacity-75">（{{ group.docs.length }} 项）</span>
            </div>
          </div>

          <div class="p-3 space-y-2" :class="group.bgColor">
            <div
              v-for="doc in group.docs"
              :key="doc.id"
              class="p-3 bg-white rounded-xl shadow-sm"
            >
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{{ doc.icon }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-800">{{ doc.name }}</span>
                    <span
                      v-if="doc.last4Digits"
                      class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono"
                    >
                      尾号{{ doc.last4Digits }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 mt-0.5">
                    <span v-if="doc.expiryDate && doc.expiryDate !== '长期'">
                      有效期至：{{ doc.expiryDate }}
                    </span>
                    <span v-else-if="doc.expiryDate === '长期'" class="text-green-600">
                      长期有效
                    </span>
                    <span v-else class="text-gray-400">未设置有效期</span>
                  </div>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold border"
                  :class="getExpiryStatusBgClass(group.key)"
                >
                  {{ getExpiryStatusLabel(group.key) }}
                </span>
              </div>

              <div
                v-if="doc.replacementLocation || doc.replacementPhone"
                class="mt-2 pt-2 border-t border-gray-100 space-y-1"
              >
                <p class="text-xs text-gray-500 font-bold">补办信息：</p>
                <div
                  v-if="doc.replacementLocation"
                  class="flex items-center gap-1.5 text-xs text-gray-600"
                >
                  <MapPin :size="12" class="text-orange-500 flex-shrink-0" />
                  <span>{{ doc.replacementLocation }}</span>
                </div>
                <div
                  v-if="doc.replacementPhone"
                  class="flex items-center gap-1.5 text-xs text-gray-600"
                >
                  <Phone :size="12" class="text-green-500 flex-shrink-0" />
                  <span>{{ doc.replacementPhone }}</span>
                </div>
                <div
                  v-if="doc.replacementMaterials"
                  class="text-xs text-gray-600"
                >
                  📋 所需材料：{{ doc.replacementMaterials }}
                </div>
                <div
                  v-if="doc.needInPerson"
                  class="text-xs text-orange-600 font-medium"
                >
                  ⚠️ 需本人到场办理
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <details
        v-if="!compact"
        class="rounded-2xl border-2 border-gray-200 overflow-hidden"
      >
        <summary class="px-4 py-3 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-2 text-gray-600">
            <CheckCircle2 :size="18" />
            <span class="font-bold">长期有效 / 未设置</span>
            <span class="text-sm opacity-75">
              （{{ store.documentsByExpiryGroup.longTerm.length + store.documentsByExpiryGroup.unknown.length }} 项）
            </span>
          </div>
        </summary>
        <div class="p-3 space-y-2 bg-gray-50">
          <div
            v-for="group in safeGroups"
            :key="'safe-' + group.key"
          >
            <div
              v-for="doc in group.docs"
              :key="doc.id"
              class="p-3 bg-white rounded-xl shadow-sm mb-2"
            >
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ doc.icon }}</span>
                <div class="flex-1">
                  <span class="font-medium text-gray-700">{{ doc.name }}</span>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{ getExpiryStatusLabel(group.key) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>
