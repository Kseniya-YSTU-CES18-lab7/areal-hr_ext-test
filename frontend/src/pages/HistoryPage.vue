<template>
  <q-page class="q-pa-md">
    
    <!-- Заголовок страницы -->
    <div class="text-h5 text-dark q-mb-md">История изменений</div>

    <!-- Панель фильтров -->
    <q-card class="q-mb-md bg-secondary">
      <q-card-section>
        <div class="row q-gutter-sm">
          <div class="col">
            <q-select
              v-model="filters.entityType"
              :options="entityTypeOptions"
              label="Тип сущности"
              outlined
              dense
              clearable
              @update:model-value="onFilter"
            />
          </div>
          <div class="col">
            <q-select
              v-model="filters.operationType"
              :options="operationTypeOptions"
              label="Тип операции"
              outlined
              dense
              clearable
              @update:model-value="onFilter"
            />
          </div>
          <div class="col">
            <q-input
              v-model="filters.entityId"
              label="ID сущности"
              outlined
              dense
              clearable
              @update:model-value="onFilter"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Таблица истории -->
    <q-card class="bg-secondary">
      <q-table
        :rows="history"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        :pagination="pagination"
        @request="onRequestPagination"
        dense
        class="text-dark"
      >
        <!-- Кастомизация колонки "Тип операции" -->
        <template v-slot:body-cell-operationType="props">
          <q-td :props="props">
            <q-badge :color="getOperationTypeColor(props.value)">
              {{ getOperationTypeLabel(props.value) }}
            </q-badge>
          </q-td>
        </template>

        <!-- Кастомизация колонки "Тип сущности" -->
        <template v-slot:body-cell-entityType="props">
          <q-td :props="props">
            <q-badge outline color="primary">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <!-- Сообщение, если данных нет -->
        <template v-slot:no-data>
          <div class="full-width row flex flex-center q-gutter-sm">
            <q-icon name="warning" color="warning" size="2em" />
            <span>Записи истории не найдены</span>
          </div>
        </template>

        <!-- Сообщение при загрузке -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>
    
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { historyService } from 'src/services/history'
import type { History } from 'src/types/models'

// Получаем экземпляр Quasar
const $q = useQuasar()

// === Типы сущностей ===
const entityTypeOptions = [
  'Organization',
  'Department',
  'Position',
  'Employee',
  'HROperation',
  'File'
]

// === Типы операций ===
const operationTypeOptions = [
  { label: 'Создание', value: 'create' },
  { label: 'Обновление', value: 'update' },
  { label: 'Удаление', value: 'delete' }
]

function getOperationTypeLabel(value: string): string {
  const option = operationTypeOptions.find(opt => opt.value === value)
  return option?.label || value
}

function getOperationTypeColor(value: string): string {
  const colors: Record<string, string> = {
    create: 'positive',
    update: 'info',
    delete: 'negative'
  }
  return colors[value] || 'grey'
}

// === Состояние таблицы ===
const columns = [
  { name: 'createdAt', required: true, label: 'Дата и время', align: 'left', field: 'createdAt', sortable: true,
    format: (val: string) => val ? new Date(val).toLocaleString('ru-RU') : '—' },
  { name: 'operationType', label: 'Операция', align: 'left', field: 'operationType', sortable: true },
  { name: 'entityType', label: 'Сущность', align: 'left', field: 'entityType', sortable: true },
  { name: 'entityId', label: 'ID сущности', align: 'left', field: 'entityId', sortable: true },
  { name: 'fieldName', label: 'Поле', align: 'left', field: 'fieldName', sortable: true },
  { name: 'oldValue', label: 'Было', align: 'left', field: 'oldValue', sortable: false },
  { name: 'newValue', label: 'Стало', align: 'left', field: 'newValue', sortable: false },
]

const history = ref<History[]>([])
const isLoading = ref(false)
const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

// === Фильтры ===
const filters = ref({
  entityType: '',
  operationType: '',
  entityId: ''
})

function onFilter() {
  pagination.value.page = 1
  loadHistory()
}

// === Загрузка истории ===
async function loadHistory() {
  isLoading.value = true
  try {
    const result = await historyService.getAll(
      pagination.value.page,
      pagination.value.rowsPerPage
    )
    history.value = result.data
    pagination.value.rowsNumber = result.total
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Не удалось загрузить историю',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function onRequestPagination(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  loadHistory()
}

// Загружаем данные при монтировании
onMounted(() => {
  loadHistory()
})
</script>

<style lang="sass" scoped>
// Используем переменные из quasar-variables.sass

// Заголовок страницы
.text-h5
  color: $dark

// Таблица
.q-table
  background-color: $secondary
  color: $dark
  
  thead tr
    background-color: $primary
    
  th
    color: white !important
    font-weight: 600
    
  td
    border-color: $gray-saturated
    
  tbody tr:hover
    background-color: $gray-light !important
</style>