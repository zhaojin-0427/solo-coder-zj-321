<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, X, Save, Pill, Calendar, Clock, User, Search, Filter, ChevronDown, ChevronUp, Trash2, Edit, Link2, History as HistoryIcon, AlertCircle } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import type { MedicalRecord, Medication, DiagnosisRecord } from '@/types';
import { getFollowUpStatus, getFollowUpStatusLabel, getFollowUpStatusBgClass, getDaysUntilFollowUp } from '@/types';

const store = useAppStore();

const showAddModal = ref(false);
const showMedicationModal = ref(false);
const showDiagnosisModal = ref(false);
const showTimelineModal = ref(false);
const showLinkModal = ref(false);
const editingRecord = ref<MedicalRecord | null>(null);
const editingMedication = ref<Medication | null>(null);
const editingDiagnosis = ref<DiagnosisRecord | null>(null);
const currentRecordId = ref<string | null>(null);
const expandedRecordId = ref<string | null>(null);
const expandedTimelineId = ref<string | null>(null);

const filterHospital = ref('');
const filterDepartment = ref('');
const filterMedication = ref('');
const filterFollowUpStatus = ref<string>('all');
const showFilters = ref(false);

const formData = ref({
  elderName: '',
  hospital: '',
  department: '',
  doctorName: '',
  doctorPhone: '',
  diagnosis: '',
  visitDate: new Date().toISOString().split('T')[0],
  nextVisitDate: '',
  notes: '',
  contraindications: '',
});

const medicationForm = ref({
  name: '',
  dosage: '',
  frequency: '',
  remainingQuantity: 0,
  unit: '片',
  notes: '',
});

const diagnosisForm = ref({
  visitDate: new Date().toISOString().split('T')[0],
  diagnosis: '',
  doctorName: '',
  department: '',
  hospital: '',
  examinationNotes: '',
  prescriptionNotes: '',
});

const frequencyOptions = [
  '每日一次',
  '每日两次',
  '每日三次',
  '饭前服用',
  '饭后服用',
  '睡前服用',
  '按需服用',
  '每周一次',
];

const unitOptions = ['片', '粒', '袋', '瓶', '盒', '支', '毫升', '毫克', '克'];

const followUpStatusOptions = [
  { value: 'all', label: '全部' },
  { value: 'upcoming', label: '即将复诊' },
  { value: 'overdue', label: '已逾期' },
  { value: 'completed', label: '已完成' },
  { value: 'unknown', label: '未设置' },
];

const filteredRecords = computed(() => {
  return store.filterMedicalRecords({
    hospital: filterHospital.value || undefined,
    department: filterDepartment.value || undefined,
    medication: filterMedication.value || undefined,
    followUpStatus: filterFollowUpStatus.value === 'all' ? undefined : (filterFollowUpStatus.value as any),
  });
});

const uniqueHospitals = computed(() => {
  const set = new Set(store.medicalRecords.map((r) => r.hospital).filter(Boolean));
  return Array.from(set);
});

const uniqueDepartments = computed(() => {
  const set = new Set(store.medicalRecords.map((r) => r.department).filter(Boolean));
  return Array.from(set);
});

function resetForm() {
  formData.value = {
    elderName: '',
    hospital: '',
    department: '',
    doctorName: '',
    doctorPhone: '',
    diagnosis: '',
    visitDate: new Date().toISOString().split('T')[0],
    nextVisitDate: '',
    notes: '',
    contraindications: '',
  };
  editingRecord.value = null;
}

function resetMedicationForm() {
  medicationForm.value = {
    name: '',
    dosage: '',
    frequency: '',
    remainingQuantity: 0,
    unit: '片',
    notes: '',
  };
  editingMedication.value = null;
}

function resetDiagnosisForm() {
  diagnosisForm.value = {
    visitDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    doctorName: '',
    department: '',
    hospital: '',
    examinationNotes: '',
    prescriptionNotes: '',
  };
  editingDiagnosis.value = null;
}

function openAddModal() {
  resetForm();
  showAddModal.value = true;
}

function openEditModal(record: MedicalRecord) {
  editingRecord.value = record;
  formData.value = {
    elderName: record.elderName,
    hospital: record.hospital,
    department: record.department,
    doctorName: record.doctorName,
    doctorPhone: record.doctorPhone,
    diagnosis: record.diagnosis,
    visitDate: record.visitDate,
    nextVisitDate: record.nextVisitDate,
    notes: record.notes,
    contraindications: record.contraindications,
  };
  showAddModal.value = true;
}

function handleSubmitRecord() {
  if (!formData.value.elderName.trim()) {
    alert('请输入老人姓名');
    return;
  }
  if (!formData.value.hospital.trim()) {
    alert('请输入医院名称');
    return;
  }

  if (editingRecord.value) {
    store.updateMedicalRecord(editingRecord.value.id, formData.value);
  } else {
    store.addMedicalRecord(formData.value);
  }
  showAddModal.value = false;
  resetForm();
}

function handleDeleteRecord(id: string) {
  if (confirm('确定要删除这条就医记录吗？关联的时间线事件也会被删除。')) {
    store.deleteMedicalRecord(id);
  }
}

function openAddMedication(recordId: string) {
  currentRecordId.value = recordId;
  resetMedicationForm();
  showMedicationModal.value = true;
}

function openEditMedication(recordId: string, medication: Medication) {
  currentRecordId.value = recordId;
  editingMedication.value = medication;
  medicationForm.value = {
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    remainingQuantity: medication.remainingQuantity,
    unit: medication.unit,
    notes: medication.notes,
  };
  showMedicationModal.value = true;
}

function handleSubmitMedication() {
  if (!medicationForm.value.name.trim()) {
    alert('请输入药品名称');
    return;
  }
  if (!currentRecordId.value) return;

  if (editingMedication.value) {
    store.updateMedication(currentRecordId.value, editingMedication.value.id, medicationForm.value);
  } else {
    store.addMedication(currentRecordId.value, medicationForm.value);
  }
  showMedicationModal.value = false;
  resetMedicationForm();
}

function handleDeleteMedication(recordId: string, medicationId: string) {
  if (confirm('确定要删除这个药品吗？')) {
    store.deleteMedication(recordId, medicationId);
  }
}

function openAddDiagnosis(recordId: string) {
  currentRecordId.value = recordId;
  resetDiagnosisForm();
  const record = store.getMedicalRecordById(recordId);
  if (record) {
    diagnosisForm.value.hospital = record.hospital;
    diagnosisForm.value.department = record.department;
    diagnosisForm.value.doctorName = record.doctorName;
  }
  showDiagnosisModal.value = true;
}

function handleSubmitDiagnosis() {
  if (!diagnosisForm.value.diagnosis.trim()) {
    alert('请输入诊断结果');
    return;
  }
  if (!currentRecordId.value) return;

  store.addDiagnosisRecord(currentRecordId.value, diagnosisForm.value);
  showDiagnosisModal.value = false;
  resetDiagnosisForm();
}

function handleDeleteDiagnosis(recordId: string, diagnosisId: string) {
  if (confirm('确定要删除这条诊断记录吗？')) {
    store.deleteDiagnosisRecord(recordId, diagnosisId);
  }
}

function toggleExpand(recordId: string) {
  expandedRecordId.value = expandedRecordId.value === recordId ? null : recordId;
}

function toggleTimeline(recordId: string) {
  expandedTimelineId.value = expandedTimelineId.value === recordId ? null : recordId;
}

function openLinkModal(recordId: string) {
  currentRecordId.value = recordId;
  showLinkModal.value = true;
}

function handleLinkChecklist(checklistId: string) {
  if (!currentRecordId.value) return;
  store.linkChecklistToMedicalRecord(currentRecordId.value, checklistId);
  showLinkModal.value = false;
  alert('关联成功！');
}

function getChecklistsForLinking(record: MedicalRecord) {
  return store.checklists.filter(
    (c) => !record.relatedChecklistIds.includes(c.id) && (c.sceneName === '看病' || c.sceneName === '取药')
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '未设置';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getFollowUpDayText(nextVisitDate: string) {
  const days = getDaysUntilFollowUp(nextVisitDate);
  if (days === null) return '';
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days < 0) return `已逾期${Math.abs(days)}天`;
  return `${days}天后`;
}

function clearFilters() {
  filterHospital.value = '';
  filterDepartment.value = '';
  filterMedication.value = '';
  filterFollowUpStatus.value = 'all';
}

function hasActiveFilters() {
  return filterHospital.value || filterDepartment.value || filterMedication.value || filterFollowUpStatus.value !== 'all';
}
</script>

<template>
  <div class="medical-record-manager">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="text-3xl">🏥</span>
          就医用药记录
        </h2>
        <p class="text-gray-500 mt-1">管理老人的就医记录、处方药品和复诊提醒</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="store.followUpWarningCount > 0"
          class="flex items-center gap-2 px-4 py-3 rounded-xl font-bold shadow-lg transition-all bg-gradient-to-r from-orange-500 to-red-500 text-white"
        >
          <AlertCircle :size="18" />
          复诊提醒
          <span class="bg-white/30 text-white text-xs font-black px-2 py-0.5 rounded-full">
            {{ store.followUpWarningCount }}
          </span>
        </button>
        <button
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-rose-500 hover:to-pink-600 transition-all duration-300 transform hover:-translate-y-0.5"
          @click="openAddModal"
        >
          <Plus :size="20" />
          添加就医记录
        </button>
      </div>
    </div>

    <div class="mb-6">
      <button
        class="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all"
        :class="showFilters ? 'border-rose-400 text-rose-600' : ''"
        @click="showFilters = !showFilters"
      >
        <Filter :size="18" />
        筛选条件
        <component :is="showFilters ? ChevronUp : ChevronDown" :size="16" />
        <span v-if="hasActiveFilters()" class="ml-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
          已选
        </span>
      </button>

      <div
        v-if="showFilters"
        class="mt-4 p-5 bg-white rounded-2xl border-2 border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">医院名称</label>
          <input
            v-model="filterHospital"
            type="text"
            list="hospital-list"
            class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
            placeholder="搜索医院..."
          />
          <datalist id="hospital-list">
            <option v-for="h in uniqueHospitals" :key="h" :value="h" />
          </datalist>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">科室</label>
          <input
            v-model="filterDepartment"
            type="text"
            list="department-list"
            class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
            placeholder="搜索科室..."
          />
          <datalist id="department-list">
            <option v-for="d in uniqueDepartments" :key="d" :value="d" />
          </datalist>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">药品名称</label>
          <input
            v-model="filterMedication"
            type="text"
            class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
            placeholder="搜索药品..."
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">复诊状态</label>
          <select
            v-model="filterFollowUpStatus"
            class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
          >
            <option v-for="opt in followUpStatusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="sm:col-span-2 lg:col-span-4 flex gap-3">
          <button
            v-if="hasActiveFilters()"
            class="px-4 py-2 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="clearFilters"
          >
            清除筛选
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="filteredRecords.length === 0"
      class="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
    >
      <span class="text-6xl">🏥</span>
      <p class="mt-4 text-gray-500 text-lg">
        {{ hasActiveFilters() ? '没有符合条件的就医记录' : '还没有添加就医记录' }}
      </p>
      <p class="text-gray-400">
        {{ hasActiveFilters() ? '请调整筛选条件' : '点击上方"添加就医记录"按钮开始管理' }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-rose-200 transition-all"
      >
        <div class="p-5">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">
                    {{ record.elderName }}
                  </h3>
                  <p class="text-gray-500 text-sm">
                    {{ record.hospital }} · {{ record.department || '未设置科室' }}
                  </p>
                </div>
                <span
                  v-if="record.nextVisitDate"
                  class="ml-auto px-3 py-1 rounded-full text-sm font-bold border"
                  :class="getFollowUpStatusBgClass(getFollowUpStatus(record.nextVisitDate))"
                >
                  {{ getFollowUpStatusLabel(getFollowUpStatus(record.nextVisitDate)) }}
                  · {{ getFollowUpDayText(record.nextVisitDate) }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div class="flex items-center gap-2 text-gray-600">
                  <User :size="16" class="text-gray-400" />
                  <span>{{ record.doctorName || '未设置医生' }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <Calendar :size="16" class="text-gray-400" />
                  <span>就诊：{{ formatDate(record.visitDate) }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <Clock :size="16" class="text-gray-400" />
                  <span>复诊：{{ formatDate(record.nextVisitDate) }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <Pill :size="16" class="text-gray-400" />
                  <span>{{ record.medications.length }} 种药品</span>
                </div>
              </div>

              <div v-if="record.diagnosis" class="mt-3 p-3 bg-rose-50 rounded-xl">
                <p class="text-sm text-rose-700">
                  <span class="font-bold">诊断：</span>{{ record.diagnosis }}
                </p>
              </div>

              <div v-if="record.contraindications" class="mt-2 p-3 bg-red-50 rounded-xl">
                <p class="text-sm text-red-700">
                  <span class="font-bold">⚠️ 禁忌备注：</span>{{ record.contraindications }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 sm:flex-col">
              <button
                class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors text-sm"
                @click="openEditModal(record)"
              >
                <Edit :size="16" />
                编辑
              </button>
              <button
                class="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-medium hover:bg-teal-100 transition-colors text-sm"
                @click="openLinkModal(record.id)"
              >
                <Link2 :size="16" />
                关联清单
              </button>
              <button
                class="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors text-sm"
                @click="toggleTimeline(record.id)"
              >
                <HistoryIcon :size="16" />
                时间线
                <component :is="expandedTimelineId === record.id ? ChevronUp : ChevronDown" :size="14" />
              </button>
              <button
                class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
                @click="handleDeleteRecord(record.id)"
              >
                <Trash2 :size="16" />
                删除
              </button>
            </div>
          </div>

          <button
            class="mt-4 flex items-center gap-2 text-rose-600 font-medium hover:text-rose-700 transition-colors"
            @click="toggleExpand(record.id)"
          >
            <component :is="expandedRecordId === record.id ? ChevronUp : ChevronDown" :size="18" />
            {{ expandedRecordId === record.id ? '收起详情' : '查看详情（药品、诊断记录）' }}
          </button>
        </div>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[2000px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[2000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedRecordId === record.id" class="border-t-2 border-gray-100 bg-gray-50 overflow-hidden">
            <div class="p-5 space-y-6">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Pill :size="20" class="text-rose-500" />
                    处方药品清单
                    <span class="text-sm font-normal text-gray-500">({{ record.medications.length }} 种)</span>
                  </h4>
                  <button
                    class="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors text-sm"
                    @click="openAddMedication(record.id)"
                  >
                    <Plus :size="16" />
                    添加药品
                  </button>
                </div>

                <div v-if="record.medications.length === 0" class="p-6 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <p class="text-gray-500">暂无药品记录</p>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="med in record.medications"
                    :key="med.id"
                    class="p-4 bg-white rounded-xl border-2 border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <span class="text-2xl">💊</span>
                        <div>
                          <p class="font-bold text-gray-800 text-lg">{{ med.name }}</p>
                          <p class="text-gray-500 text-sm">{{ med.dosage }} · {{ med.frequency }}</p>
                        </div>
                        <span
                          v-if="med.remainingQuantity <= 7"
                          class="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"
                        >
                          药量不足：剩{{ med.remainingQuantity }}{{ med.unit }}
                        </span>
                        <span
                          v-else
                          class="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"
                        >
                          剩余：{{ med.remainingQuantity }}{{ med.unit }}
                        </span>
                      </div>
                      <p v-if="med.notes" class="text-sm text-gray-600">
                        <span class="font-medium">备注：</span>{{ med.notes }}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <button
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        @click="openEditMedication(record.id, med)"
                        title="编辑"
                      >
                        <Edit :size="18" />
                      </button>
                      <button
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        @click="handleDeleteMedication(record.id, med.id)"
                        title="删除"
                      >
                        <Trash2 :size="18" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <span class="text-2xl">📋</span>
                    诊断记录
                    <span class="text-sm font-normal text-gray-500">({{ record.diagnosisRecords.length }} 条)</span>
                  </h4>
                  <button
                    class="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors text-sm"
                    @click="openAddDiagnosis(record.id)"
                  >
                    <Plus :size="16" />
                    添加诊断记录
                  </button>
                </div>

                <div v-if="record.diagnosisRecords.length === 0" class="p-6 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <p class="text-gray-500">暂无诊断记录</p>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="diag in record.diagnosisRecords"
                    :key="diag.id"
                    class="p-4 bg-white rounded-xl border-2 border-gray-100"
                  >
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                            🩺
                          </div>
                          <div>
                            <p class="font-bold text-gray-800">{{ diag.diagnosis }}</p>
                            <p class="text-gray-500 text-sm">
                              {{ diag.hospital }} · {{ diag.department }} · {{ diag.doctorName }} · {{ formatDate(diag.visitDate) }}
                            </p>
                          </div>
                        </div>
                        <div class="space-y-2 ml-13 pl-13" style="margin-left: 52px;">
                          <p v-if="diag.examinationNotes" class="text-sm text-gray-600">
                            <span class="font-medium">检查情况：</span>{{ diag.examinationNotes }}
                          </p>
                          <p v-if="diag.prescriptionNotes" class="text-sm text-gray-600">
                            <span class="font-medium">处方说明：</span>{{ diag.prescriptionNotes }}
                          </p>
                        </div>
                      </div>
                      <button
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        @click="handleDeleteDiagnosis(record.id, diag.id)"
                        title="删除"
                      >
                        <Trash2 :size="18" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="record.relatedChecklistIds.length > 0">
                <h4 class="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4">
                  <Link2 :size="20" class="text-teal-500" />
                  关联的办事清单
                  <span class="text-sm font-normal text-gray-500">({{ record.relatedChecklistIds.length }} 个)</span>
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="cid in record.relatedChecklistIds"
                    :key="cid"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm"
                  >
                    {{ store.checklists.find((c) => c.id === cid)?.sceneName || '已删除清单' }}
                    · {{ formatDate(store.checklists.find((c) => c.id === cid)?.date || '') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[1000px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[1000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedTimelineId === record.id" class="border-t-2 border-gray-100 bg-purple-50 overflow-hidden">
            <div class="p-5">
              <h4 class="font-bold text-lg text-purple-800 flex items-center gap-2 mb-4">
                <HistoryIcon :size="20" />
                就医时间线
              </h4>
              <div v-if="store.getTimelineByMedicalRecord(record.id).length === 0" class="p-6 text-center bg-white rounded-xl">
                <p class="text-gray-500">暂无时间线记录</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="event in store.getTimelineByMedicalRecord(record.id)"
                  :key="event.id"
                  class="flex items-start gap-3 p-4 bg-white rounded-xl"
                >
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    :class="{
                      'bg-blue-100': event.eventType === 'visit',
                      'bg-rose-100': event.eventType === 'medication',
                      'bg-teal-100': event.eventType === 'checklist',
                      'bg-amber-100': event.eventType === 'note',
                    }"
                  >
                    {{ event.eventType === 'visit' ? '🏥' : event.eventType === 'medication' ? '💊' : event.eventType === 'checklist' ? '📝' : '📌' }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <p class="font-bold text-gray-800">{{ event.eventLabel }}</p>
                      <span class="text-sm text-gray-400">{{ formatDate(event.date) }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
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
              {{ editingRecord ? '✏️ 编辑就医记录' : '➕ 添加就医记录' }}
            </h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              @click="showAddModal = false"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">老人姓名 *</label>
                <input
                  v-model="formData.elderName"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                  placeholder="如：张爷爷、李奶奶"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">就诊日期 *</label>
                <input
                  v-model="formData.visitDate"
                  type="date"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">医院名称 *</label>
                <input
                  v-model="formData.hospital"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                  placeholder="如：协和医院"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">科室</label>
                <input
                  v-model="formData.department"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                  placeholder="如：心内科、内分泌科"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">主治医生</label>
                <input
                  v-model="formData.doctorName"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                  placeholder="如：王医生"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">医生联系电话</label>
                <input
                  v-model="formData.doctorPhone"
                  type="tel"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                  placeholder="医生或科室电话"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">诊断结果</label>
              <input
                v-model="formData.diagnosis"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                placeholder="如：高血压、2型糖尿病"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">下次复诊日期</label>
              <input
                v-model="formData.nextVisitDate"
                type="date"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
              />
              <p class="text-xs text-gray-400 mt-1">设置后系统会在复诊临近时提醒</p>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">⚠️ 饮食/用药禁忌</label>
              <textarea
                v-model="formData.contraindications"
                class="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-400 focus:outline-none transition-colors resize-none"
                rows="2"
                placeholder="如：忌辛辣、不能空腹服药、避免与XX药同服等"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">其他注意事项</label>
              <textarea
                v-model="formData.notes"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors resize-none"
                rows="2"
                placeholder="需要特殊留意的事项..."
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
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              @click="handleSubmitRecord"
            >
              <Save :size="18" />
              {{ editingRecord ? '保存修改' : '添加记录' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showMedicationModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showMedicationModal = false"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
            <h3 class="text-xl font-bold text-gray-800">
              {{ editingMedication ? '✏️ 编辑药品' : '💊 添加药品' }}
            </h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              @click="showMedicationModal = false"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">药品名称 *</label>
              <input
                v-model="medicationForm.name"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors text-lg"
                placeholder="如：阿司匹林、二甲双胍"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">剂量/用法</label>
                <input
                  v-model="medicationForm.dosage"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                  placeholder="如：每次1片"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">服用频次</label>
                <select
                  v-model="medicationForm.frequency"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                >
                  <option value="">请选择</option>
                  <option v-for="f in frequencyOptions" :key="f" :value="f">{{ f }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">剩余药量</label>
                <input
                  v-model.number="medicationForm.remainingQuantity"
                  type="number"
                  min="0"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                  placeholder="如：30"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">单位</label>
                <select
                  v-model="medicationForm.unit"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                >
                  <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">备注</label>
              <textarea
                v-model="medicationForm.notes"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors resize-none"
                rows="2"
                placeholder="如：饭后服用、需要冷藏等"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
            <button
              class="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              @click="showMedicationModal = false"
            >
              取消
            </button>
            <button
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              @click="handleSubmitMedication"
            >
              <Save :size="18" />
              {{ editingMedication ? '保存修改' : '添加药品' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showDiagnosisModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showDiagnosisModal = false"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
            <h3 class="text-xl font-bold text-gray-800">
              📋 添加诊断记录
            </h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              @click="showDiagnosisModal = false"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">就诊日期</label>
                <input
                  v-model="diagnosisForm.visitDate"
                  type="date"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">诊断结果 *</label>
                <input
                  v-model="diagnosisForm.diagnosis"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                  placeholder="诊断结论"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">医院</label>
                <input
                  v-model="diagnosisForm.hospital"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">科室</label>
                <input
                  v-model="diagnosisForm.department"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">医生</label>
                <input
                  v-model="diagnosisForm.doctorName"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">检查情况说明</label>
              <textarea
                v-model="diagnosisForm.examinationNotes"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors resize-none"
                rows="2"
                placeholder="检查项目、指标情况等"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">处方说明</label>
              <textarea
                v-model="diagnosisForm.prescriptionNotes"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none transition-colors resize-none"
                rows="2"
                placeholder="开了什么药、用药调整等"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
            <button
              class="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              @click="showDiagnosisModal = false"
            >
              取消
            </button>
            <button
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              @click="handleSubmitDiagnosis"
            >
              <Save :size="18" />
              添加记录
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showLinkModal && currentRecordId"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showLinkModal = false"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
            <h3 class="text-xl font-bold text-gray-800">
              🔗 关联办事清单
            </h3>
            <button
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              @click="showLinkModal = false"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6">
            <p class="text-gray-600 mb-4">
              选择一个"看病"或"取药"办事清单关联到此就医记录：
            </p>

            <div v-if="getChecklistsForLinking(store.getMedicalRecordById(currentRecordId)!).length === 0" class="p-6 text-center bg-gray-50 rounded-xl">
              <p class="text-gray-500">暂无可关联的清单</p>
              <p class="text-sm text-gray-400 mt-1">请先在"清单预演"中创建看病或取药的清单方案</p>
            </div>

            <div v-else class="space-y-3">
              <button
                v-for="checklist in getChecklistsForLinking(store.getMedicalRecordById(currentRecordId)!)"
                :key="checklist.id"
                class="w-full p-4 bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 rounded-xl text-left transition-colors"
                @click="handleLinkChecklist(checklist.id)"
              >
                <p class="font-bold text-teal-800">
                  {{ checklist.sceneName }} - {{ formatDate(checklist.date) }}
                </p>
                <p class="text-sm text-teal-600 mt-1">
                  {{ checklist.items.length }} 项证件{{ checklist.isCompleted ? ' · 已完成' : '' }}
                </p>
              </button>
            </div>

            <div v-if="store.getMedicalRecordById(currentRecordId)?.relatedChecklistIds.length" class="mt-6">
              <p class="text-sm font-bold text-gray-700 mb-3">已关联的清单：</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="cid in store.getMedicalRecordById(currentRecordId)?.relatedChecklistIds"
                  :key="cid"
                  class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm"
                >
                  {{ store.checklists.find((c) => c.id === cid)?.sceneName }} · {{ formatDate(store.checklists.find((c) => c.id === cid)?.date || '') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
