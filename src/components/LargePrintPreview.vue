<script setup lang="ts">
import { computed } from 'vue';
import {
  X,
  FileDown,
  Printer,
  MapPin,
  Clock,
  Building2,
  Phone,
  Handshake,
  Home,
} from 'lucide-vue-next';
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
  store.closeLargePreview();
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
            @click.stop="handleExport"
          >
            <FileDown :size="20" />
            导出图片
          </button>
          <button
            class="flex items-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-xl font-bold shadow-lg hover:bg-teal-600 transition-all"
            @click.stop="handlePrint"
          >
            <Printer :size="20" />
            打印随身卡
          </button>
          <button
            class="flex items-center gap-2 px-5 py-3 bg-gray-500 text-white rounded-xl font-bold shadow-lg hover:bg-gray-600 transition-all"
            @click.stop="handleClose"
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
          @click.stop
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

          <div
            v-if="store.currentChecklist.routeInfo?.location || store.currentChecklist.routeInfo?.departureTime || store.currentChecklist.routeInfo?.counterName || store.currentChecklist.routeInfo?.contactPhone"
            class="mb-8 p-6 bg-purple-50 rounded-2xl border-3 border-purple-200"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-4xl">
                🗺️
              </div>
              <div>
                <p class="text-2xl font-bold text-purple-800">办事路线信息</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-if="store.currentChecklist.routeInfo?.location"
                class="flex items-center gap-3 p-4 bg-white rounded-xl"
              >
                <MapPin :size="28" class="text-red-500 flex-shrink-0" />
                <div>
                  <p class="text-lg font-bold text-gray-800">办事地点</p>
                  <p class="text-2xl font-black text-gray-700">{{ store.currentChecklist.routeInfo.location }}</p>
                </div>
              </div>
              <div
                v-if="store.currentChecklist.routeInfo?.departureTime"
                class="flex items-center gap-3 p-4 bg-white rounded-xl"
              >
                <Clock :size="28" class="text-blue-500 flex-shrink-0" />
                <div>
                  <p class="text-lg font-bold text-gray-800">出门时间</p>
                  <p class="text-2xl font-black text-gray-700">{{ store.currentChecklist.routeInfo.departureTime }}</p>
                </div>
              </div>
              <div
                v-if="store.currentChecklist.routeInfo?.counterName"
                class="flex items-center gap-3 p-4 bg-white rounded-xl"
              >
                <Building2 :size="28" class="text-purple-500 flex-shrink-0" />
                <div>
                  <p class="text-lg font-bold text-gray-800">窗口/科室</p>
                  <p class="text-2xl font-black text-gray-700">{{ store.currentChecklist.routeInfo.counterName }}</p>
                </div>
              </div>
              <div
                v-if="store.currentChecklist.routeInfo?.contactPhone"
                class="flex items-center gap-3 p-4 bg-white rounded-xl"
              >
                <Phone :size="28" class="text-green-500 flex-shrink-0" />
                <div>
                  <p class="text-lg font-bold text-gray-800">联系电话</p>
                  <p class="text-2xl font-black text-gray-700">{{ store.currentChecklist.routeInfo.contactPhone }}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="store.currentChecklist.routeInfo?.needPhoneConfirm || store.currentChecklist.routeInfo?.needTemporaryKeep || store.currentChecklist.routeInfo?.needReturnToLocation"
            class="mb-8 p-6 bg-amber-50 rounded-2xl border-3 border-amber-300"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white text-4xl">
                ⚠️
              </div>
              <div>
                <p class="text-2xl font-bold text-amber-800">重要交接提醒</p>
              </div>
            </div>
            <div class="space-y-3">
              <div
                v-if="store.currentChecklist.routeInfo?.needPhoneConfirm"
                class="flex items-start gap-3 p-4 bg-white rounded-xl"
              >
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                  📞
                </div>
                <div>
                  <p class="text-xl font-bold text-gray-800">提前电话确认</p>
                  <p class="text-lg text-gray-600">出门前先打电话确认办公时间和所需材料</p>
                </div>
              </div>
              <div
                v-if="store.currentChecklist.routeInfo?.needTemporaryKeep"
                class="flex items-start gap-3 p-4 bg-white rounded-xl"
              >
                <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                  <Handshake :size="24" />
                </div>
                <div>
                  <p class="text-xl font-bold text-gray-800">证件交陪同人保管</p>
                  <p class="text-lg text-gray-600">办事过程中由陪同人负责保管证件原件</p>
                </div>
              </div>
              <div
                v-if="store.currentChecklist.routeInfo?.needReturnToLocation"
                class="flex items-start gap-3 p-4 bg-white rounded-xl"
              >
                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                  <Home :size="24" />
                </div>
                <div>
                  <p class="text-xl font-bold text-gray-800">返回后归还原位</p>
                  <p class="text-lg text-gray-600">办完事后记得把证件放回原来的存放位置</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-3xl font-black text-gray-800 mb-4 flex items-center gap-3">
              <span class="text-4xl">📋</span>
              需携带证件清单
            </h2>
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

              <div class="flex flex-col gap-2">
                <span
                  v-if="item.needOriginal"
                  class="px-5 py-2 bg-green-500 text-white rounded-full text-xl font-bold shadow-md text-center"
                >
                  原件
                </span>
                <span
                  v-if="item.needCopy"
                  class="px-5 py-2 bg-blue-500 text-white rounded-full text-xl font-bold shadow-md text-center"
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
