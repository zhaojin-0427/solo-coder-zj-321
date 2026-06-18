<script setup lang="ts">
import { computed } from 'vue';
import { X, FileDown, Printer, MapPin, Users } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import { exportAsImage } from '@/utils/export';
import { printElement } from '@/utils/print';

const store = useAppStore();

const sceneColor = computed(() => store.activeScene?.color || '#FF8C42');

async function handleExport() {
  try {
    await exportAsImage('large-print-preview', `出门核对卡-${store.currentChecklist?.sceneName}`);
  } catch (e) {
    alert('导出失败，请重试');
    console.error(e);
  }
}

function handlePrint() {
  printElement('large-print-preview');
}

function handleClose() {
  store.toggleLargePreview();
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="store.showLargePreview && store.currentChecklist"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="handleClose"
    >
      <div class="relative w-full max-w-3xl my-8">
        <div class="flex justify-center mb-4 gap-3 no-print">
          <button
            class="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all"
            @click="handleExport"
          >
            <FileDown :size="20" />
            导出图片
          </button>
          <button
            class="flex items-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-xl font-bold shadow-lg hover:bg-teal-600 transition-all"
            @click="handlePrint"
          >
            <Printer :size="20" />
            打印随身卡
          </button>
          <button
            class="flex items-center gap-2 px-5 py-3 bg-gray-500 text-white rounded-xl font-bold shadow-lg hover:bg-gray-600 transition-all"
            @click="handleClose"
          >
            <X :size="20" />
            关闭
          </button>
        </div>

        <div
          id="large-print-preview"
          class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-4 border-yellow-200"
          :style="{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,140,66,0.08) 28px, rgba(255,140,66,0.08) 29px)'
          }"
        >
          <div class="text-center mb-8 pb-6 border-b-4 border-dashed border-yellow-300">
            <div
              class="inline-flex items-center justify-center w-20 h-20 rounded-full text-white text-5xl mb-4 shadow-lg"
              :style="{ backgroundColor: sceneColor }"
            >
              {{ store.activeScene?.icon }}
            </div>
            <h1 class="text-5xl font-black text-gray-800 mb-2">
              {{ store.currentChecklist.sceneName }}出门核对卡
            </h1>
            <p class="text-2xl text-gray-600 font-medium">
              📅 日期：{{ store.currentChecklist.date }}
            </p>
          </div>

          <div
            v-if="store.currentChecklist.needsCompanion && store.currentChecklist.companion"
            class="mb-8 p-6 bg-blue-50 rounded-2xl border-3 border-blue-200"
          >
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl">
                👨‍👩‍👧
              </div>
              <div>
                <p class="text-2xl font-bold text-blue-800">陪同人员</p>
                <p class="text-3xl font-black text-blue-600">{{ store.currentChecklist.companion }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-5">
            <div
              v-for="(item, index) in store.currentChecklist.items"
              :key="item.documentId"
              class="flex items-center gap-5 p-5 bg-white rounded-2xl shadow-md border-3 transition-all duration-200"
              :class="item.isChecked ? 'border-green-400 bg-green-50' : 'border-gray-200'"
            >
              <div
                class="w-14 h-14 rounded-full border-4 flex items-center justify-center flex-shrink-0 text-3xl font-black"
                :class="item.isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'"
              >
                {{ item.isChecked ? '✓' : index + 1 }}
              </div>

              <div class="flex-shrink-0 text-6xl">
                {{ item.documentIcon }}
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-3xl font-black text-gray-800 leading-tight">
                  {{ item.documentName }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <MapPin :size="24" class="text-orange-500 flex-shrink-0" />
                  <span class="text-xl text-gray-600 font-medium">
                    存放位置：{{ item.storageLocation }}
                  </span>
                </div>
              </div>

              <div class="flex gap-3">
                <span
                  v-if="item.needOriginal"
                  class="px-5 py-2 bg-green-500 text-white rounded-full text-xl font-bold shadow-md"
                >
                  原件
                </span>
                <span
                  v-if="item.needCopy"
                  class="px-5 py-2 bg-blue-500 text-white rounded-full text-xl font-bold shadow-md"
                >
                  复印件
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="store.allChecked"
            class="mt-8 p-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl text-white text-center shadow-xl"
          >
            <p class="text-4xl font-black mb-2">🎉 全部准备就绪！</p>
            <p class="text-2xl font-medium">可以放心出门啦！</p>
          </div>

          <div
            v-else
            class="mt-8 p-6 bg-yellow-100 rounded-2xl border-3 border-yellow-400 text-center"
          >
            <p class="text-3xl font-black text-yellow-800 mb-2">
              ⚠️ 还有 {{ store.totalCount - store.checkedCount }} 项未准备
            </p>
            <p class="text-xl text-yellow-700 font-medium">请仔细核对，不要遗漏哦！</p>
          </div>

          <div class="mt-8 pt-6 border-t-4 border-dashed border-yellow-300 text-center">
            <p class="text-xl text-gray-500 font-medium">
              💡 小贴士：出门前再核对一遍，确保所有物品都已放入包中
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
