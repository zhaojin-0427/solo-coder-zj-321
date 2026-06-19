<script setup lang="ts">
import { ref } from 'vue';
import { Heart } from 'lucide-vue-next';
import DocumentManager from '@/components/DocumentManager.vue';
import SceneLibrary from '@/components/SceneLibrary.vue';
import ChecklistPreview from '@/components/ChecklistPreview.vue';
import LargePrintPreview from '@/components/LargePrintPreview.vue';
import ContactManager from '@/components/ContactManager.vue';
import CollaborationHistory from '@/components/CollaborationHistory.vue';

const activeTab = ref<'documents' | 'scenes' | 'checklist' | 'collaboration'>('documents');

const tabs = [
  { key: 'documents', label: '📁 证件收纳', color: 'from-orange-400 to-orange-500' },
  { key: 'scenes', label: '🎯 办事情景', color: 'from-teal-400 to-teal-500' },
  { key: 'checklist', label: '📝 清单预演', color: 'from-green-400 to-green-500' },
  { key: 'collaboration', label: '👨‍👩‍👧 家庭协作', color: 'from-purple-400 to-indigo-500' },
] as const;
</script>

<template>
  <div class="min-h-screen pb-16">
    <header class="bg-gradient-to-r from-orange-400 via-orange-500 to-teal-500 text-white shadow-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl shadow-lg">
              👴👵
            </div>
            <div>
              <h1 class="text-3xl sm:text-4xl font-black tracking-tight">
                长者证件收纳与办事清单预演器
              </h1>
              <p class="text-white/90 mt-1 text-lg font-medium">
                出门办事不发愁，证件清单早准备，家人更放心
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
            <Heart :size="20" class="text-red-200 animate-pulse" fill="currentColor" />
            <span class="font-medium">用心关爱，温暖陪伴</span>
          </div>
        </div>

        <nav class="mt-8 flex gap-3 flex-wrap">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform"
            :class="
              activeTab === tab.key
                ? `bg-gradient-to-r ${tab.color} text-white shadow-xl scale-105`
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-5 shadow-md border-l-4 border-orange-400">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🆔</span>
            <div>
              <p class="text-3xl font-black text-gray-800">{{ $pinia.state.value.app.documents.length }}</p>
              <p class="text-gray-500 font-medium">已录入证件</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-md border-l-4 border-teal-400">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🎯</span>
            <div>
              <p class="text-3xl font-black text-gray-800">{{ $pinia.state.value.app.scenes.length }}</p>
              <p class="text-gray-500 font-medium">办事场景</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-md border-l-4 border-green-400">
          <div class="flex items-center gap-3">
            <span class="text-4xl">✅</span>
            <div>
              <p class="text-3xl font-black text-gray-800">{{ $pinia.state.value.app.checklists.length }}</p>
              <p class="text-gray-500 font-medium">历史清单</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-md border-l-4 border-purple-400">
          <div class="flex items-center gap-3">
            <span class="text-4xl">👨‍👩‍👧</span>
            <div>
              <p class="text-3xl font-black text-gray-800">{{ $pinia.state.value.app.contacts.length }}</p>
              <p class="text-gray-500 font-medium">协作联系人</p>
            </div>
          </div>
        </div>
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
        mode="out-in"
      >
        <DocumentManager v-if="activeTab === 'documents'" />
        <SceneLibrary v-else-if="activeTab === 'scenes'" />
        <ChecklistPreview v-else-if="activeTab === 'checklist'" />
        <div v-else-if="activeTab === 'collaboration'" class="space-y-6">
          <ContactManager />
          <CollaborationHistory />
        </div>
      </Transition>
    </main>

    <footer class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 py-3 px-4">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center sm:text-left">
        <p class="text-gray-500 text-sm">
          💡 所有数据保存在您的浏览器本地，请定期导出重要清单备份
        </p>
        <p class="text-gray-400 text-sm">
          用爱制作 · 让老人出门办事更安心
        </p>
      </div>
    </footer>

    <LargePrintPreview />
  </div>
</template>
