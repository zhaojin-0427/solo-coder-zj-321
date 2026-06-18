<script setup lang="ts">
import { computed } from 'vue';
import {
  MapPin,
  Clock,
  Building2,
  Phone,
  MessageCircle,
  Handshake,
  Home,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next';
import { ref } from 'vue';
import { useAppStore } from '@/stores/app';
import type { RouteInfo } from '@/types';

const store = useAppStore();
const isExpanded = ref(true);

const routeInfo = computed({
  get: () => store.currentChecklist?.routeInfo || ({} as RouteInfo),
  set: (val) => {
    store.updateRouteInfo(val);
  },
});

function handleInputChange(key: keyof RouteInfo, value: string | boolean) {
  store.updateRouteInfo({ [key]: value });
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <div class="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
    <button
      class="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      @click="toggleExpand"
    >
      <h4 class="font-bold text-xl text-gray-800 flex items-center gap-3">
        <span class="text-3xl">🗺️</span>
        办事路线与交接提醒
        <span class="text-sm font-normal text-gray-500 ml-2">（填写后同步到随身卡）</span>
      </h4>
      <component
        :is="isExpanded ? ChevronUp : ChevronDown"
        :size="24"
        class="text-gray-400"
      />
    </button>

    <div
      v-show="isExpanded"
      class="px-5 pb-6 space-y-5 border-t border-gray-100"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
        <div class="space-y-2">
          <label class="flex items-center gap-2 font-bold text-gray-700 text-lg">
            <MapPin :size="22" class="text-red-500" />
            办事地点
          </label>
          <input
            :value="routeInfo.location"
            @input="handleInputChange('location', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-400 focus:outline-none transition-colors"
            placeholder="如：市中心医院、XX银行支行、社保服务中心"
          />
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 font-bold text-gray-700 text-lg">
            <Clock :size="22" class="text-blue-500" />
            预计出门时间
          </label>
          <input
            :value="routeInfo.departureTime"
            @input="handleInputChange('departureTime', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-400 focus:outline-none transition-colors"
            placeholder="如：上午8:30、下午2:00"
          />
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 font-bold text-gray-700 text-lg">
            <Building2 :size="22" class="text-purple-500" />
            窗口/科室/柜台
          </label>
          <input
            :value="routeInfo.counterName"
            @input="handleInputChange('counterName', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-400 focus:outline-none transition-colors"
            placeholder="如：内科门诊3号窗、社保业务柜台"
          />
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 font-bold text-gray-700 text-lg">
            <Phone :size="22" class="text-green-500" />
            联系电话
          </label>
          <input
            :value="routeInfo.contactPhone"
            @input="handleInputChange('contactPhone', ($event.target as HTMLInputElement).value)"
            type="tel"
            class="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-400 focus:outline-none transition-colors"
            placeholder="如：12345678、010-12345678"
          />
        </div>
      </div>

      <div class="pt-3 space-y-4">
        <label class="flex items-start gap-4 p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
          <input
            :checked="routeInfo.needPhoneConfirm"
            @change="handleInputChange('needPhoneConfirm', ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="mt-1 w-6 h-6 text-blue-500 rounded focus:ring-blue-400 flex-shrink-0"
          />
          <div>
            <p class="font-bold text-gray-800 text-lg flex items-center gap-2">
              <MessageCircle :size="20" class="text-blue-500" />
              需要提前电话确认
            </p>
            <p class="text-gray-600 mt-1">出门前先打电话确认办公时间和所需材料</p>
          </div>
        </label>

        <label class="flex items-start gap-4 p-4 bg-orange-50 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors">
          <input
            :checked="routeInfo.needTemporaryKeep"
            @change="handleInputChange('needTemporaryKeep', ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="mt-1 w-6 h-6 text-orange-500 rounded focus:ring-orange-400 flex-shrink-0"
          />
          <div>
            <p class="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Handshake :size="20" class="text-orange-500" />
              证件交陪同人临时保管
            </p>
            <p class="text-gray-600 mt-1">办事过程中由陪同人负责保管证件原件</p>
          </div>
        </label>

        <label class="flex items-start gap-4 p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
          <input
            :checked="routeInfo.needReturnToLocation"
            @change="handleInputChange('needReturnToLocation', ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="mt-1 w-6 h-6 text-green-500 rounded focus:ring-green-400 flex-shrink-0"
          />
          <div>
            <p class="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Home :size="20" class="text-green-500" />
              返回后归还原存放位置
            </p>
            <p class="text-gray-600 mt-1">办完事后记得把证件放回原来的存放位置</p>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
