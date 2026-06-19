<script setup lang="ts">
import { computed } from 'vue';
import { Shield, Phone, Wrench, AlertTriangle, CheckCircle2, Clock, MapPin } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import {
  getExpiryStatusLabel,
  getExpiryStatusBgClass,
  getVerificationStatusLabel,
} from '@/types';
import type { VerificationStatus } from '@/types';

const store = useAppStore();

const warningItems = computed(() =>
  store.currentChecklist?.items.filter(
    (item) => item.expiryStatus === 'expired' || item.expiryStatus === 'within30' || item.expiryStatus === 'within90'
  ) || []
);

const allVerified = computed(() => store.allVerificationsCompleted);

function setVerification(docId: string, status: VerificationStatus) {
  store.updateVerificationStatus(docId, status);
}

function getVerificationButtonClass(status: VerificationStatus, currentStatus: VerificationStatus) {
  const base = 'flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all min-h-[44px]';
  if (status === currentStatus) {
    const activeClasses: Record<VerificationStatus, string> = {
      valid: 'bg-green-500 text-white shadow-lg',
      phoneConfirmed: 'bg-blue-500 text-white shadow-lg',
      needReplacement: 'bg-red-500 text-white shadow-lg',
      pending: 'bg-gray-200 text-gray-500',
    };
    return `${base} ${activeClasses[status]}`;
  }
  return `${base} bg-gray-100 text-gray-500 hover:bg-gray-200`;
}
</script>

<template>
  <div class="validity-verification">
    <h4 class="font-bold text-xl text-gray-800 mb-4 flex items-center gap-3">
      <span class="text-3xl">🔍</span>
      有效期核验
      <span class="text-sm font-normal text-gray-500">
        （确认临期/过期证件是否可用）
      </span>
    </h4>

    <div
      v-if="warningItems.length === 0"
      class="p-6 bg-green-50 border-2 border-green-200 rounded-2xl text-center"
    >
      <CheckCircle2 :size="40" class="text-green-500 mx-auto mb-2" />
      <p class="font-bold text-green-700 text-lg">所有证件均在有效期内</p>
      <p class="text-sm text-green-600 mt-1">无需额外核验，可以放心出门</p>
    </div>

    <div v-else class="space-y-4">
      <div
        class="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl"
      >
        <div class="flex items-center gap-2">
          <AlertTriangle :size="20" class="text-amber-600" />
          <p class="font-bold text-amber-700">
            发现 {{ warningItems.length }} 个证件需要确认有效期
          </p>
        </div>
        <p class="text-sm text-amber-600 mt-1">
          请逐项确认证件状态，确保出门办事时证件可用
        </p>
      </div>

      <div
        v-for="item in warningItems"
        :key="item.documentId"
        class="bg-white rounded-2xl border-2 overflow-hidden shadow-sm"
        :class="item.verificationStatus === 'needReplacement' ? 'border-red-300' : item.verificationStatus !== 'pending' ? 'border-green-300' : 'border-gray-200'"
      >
        <div class="p-4">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">{{ item.documentIcon }}</span>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h5 class="font-bold text-lg text-gray-800">{{ item.documentName }}</h5>
                <span
                  v-if="item.last4Digits"
                  class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono"
                >
                  尾号{{ item.last4Digits }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="inline-block text-xs px-2 py-1 rounded-full font-bold border"
                  :class="getExpiryStatusBgClass(item.expiryStatus)"
                >
                  {{ getExpiryStatusLabel(item.expiryStatus) }}
                </span>
                <span
                  v-if="item.expiryDate && item.expiryDate !== '长期'"
                  class="text-sm text-gray-500"
                >
                  有效期至：{{ item.expiryDate }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-sm font-bold text-gray-600 mb-2">请确认该证件状态：</p>
            <div class="flex flex-wrap gap-2">
              <button
                :class="getVerificationButtonClass('valid', item.verificationStatus)"
                @click="setVerification(item.documentId, 'valid')"
              >
                <CheckCircle2 :size="16" />
                在有效期内
              </button>
              <button
                :class="getVerificationButtonClass('phoneConfirmed', item.verificationStatus)"
                @click="setVerification(item.documentId, 'phoneConfirmed')"
              >
                <Phone :size="16" />
                已电话确认可用
              </button>
              <button
                :class="getVerificationButtonClass('needReplacement', item.verificationStatus)"
                @click="setVerification(item.documentId, 'needReplacement')"
              >
                <Wrench :size="16" />
                需要先补办
              </button>
            </div>
          </div>

          <div
            v-if="item.verificationStatus === 'needReplacement'"
            class="mt-3 pt-3 border-t-2 border-dashed border-red-200"
          >
            <p class="text-sm font-bold text-red-600 mb-2">⚠️ 该证件需要先补办</p>
            <div
              v-for="doc in store.documents.filter(d => d.id === item.documentId)"
              :key="doc.id"
              class="space-y-1.5"
            >
              <div
                v-if="doc.replacementLocation"
                class="flex items-center gap-2 text-sm text-gray-600"
              >
                <MapPin :size="14" class="text-orange-500 flex-shrink-0" />
                <span>补办地点：{{ doc.replacementLocation }}</span>
              </div>
              <div
                v-if="doc.replacementPhone"
                class="flex items-center gap-2 text-sm text-gray-600"
              >
                <Phone :size="14" class="text-green-500 flex-shrink-0" />
                <span>补办电话：{{ doc.replacementPhone }}</span>
              </div>
              <div
                v-if="doc.replacementMaterials"
                class="text-sm text-gray-600"
              >
                📋 需带材料：{{ doc.replacementMaterials }}
              </div>
              <div
                v-if="doc.needInPerson"
                class="text-sm text-orange-600 font-medium"
              >
                ⚠️ 需本人到场办理
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="allVerified"
        class="p-4 bg-green-50 border-2 border-green-200 rounded-2xl text-center"
      >
        <CheckCircle2 :size="24" class="text-green-500 inline" />
        <span class="ml-2 font-bold text-green-700">所有临期证件已确认完毕</span>
      </div>

      <div
        v-else
        class="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-center"
      >
        <Clock :size="20" class="text-amber-500 inline" />
        <span class="ml-2 font-bold text-amber-700">
          还有 {{ warningItems.filter(i => i.verificationStatus === 'pending').length }} 项证件待确认
        </span>
      </div>
    </div>
  </div>
</template>
