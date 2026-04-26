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
        :rows="history || []"
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

// === Форматирование даты и времени ===
function formatDateTime(dateString: string): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// === Форматирование значения (oldValue/newValue) ===
function formatValue(value: any): string {
  // Пустые значения
  if (value === null || value === undefined || value === '' || value === 'null') {
    return '—'
  }
  
  // Если это уже строка
  if (typeof value === 'string') {
    const trimmed = value.trim()
    
    // Проверяем, не объект ли в виде строки
    if (trimmed === '[object Object]' || trimmed === '[Объект]') {
      return '[Объект]'
    }
    
    // Пытаемся распарсить как JSON (для объектов)
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed)
        return formatValue(parsed) // Рекурсивно форматируем
      } catch {
        // Если не распарсилось — возвращаем как есть
      }
    }
    
    // Проверяем, не дата ли это в строковом формате
    // Форматы: "2002-09-27", "2002-09-28T00:00:00.000Z", "2026-04-25T08:03:51.980Z"
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const date = new Date(trimmed)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ru-RU') + 
               (trimmed.includes('T') ? ' ' + date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}) : '')
      }
    }
    
    // Проверяем, не число ли это в строковом формате
    if (!isNaN(Number(trimmed)) && trimmed !== '') {
      const num = Number(trimmed)
      // Если число целое и большое — форматируем с разделителями
      if (Number.isInteger(num) && Math.abs(num) >= 1000) {
        return num.toLocaleString('ru-RU')
      }
      // Если число с копейками (зарплата) — форматируем как валюту
      if (!Number.isInteger(num)) {
        return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽'
      }
      return String(num)
    }
    
    // Обычная строка — возвращаем как есть
    return trimmed
  }
  
  // Если это объект
  if (typeof value === 'object') {
    // Если у объекта есть name (организация, отдел, должность)
    if (value.name) return value.name
    
    // Если это сотрудник (surname + firstName)
    if (value.surname && value.firstName) {
      return `${value.surname} ${value.firstName} ${value.patronymic || ''}`.trim()
    }
    
    // Если это дата
    if (value instanceof Date) {
      return value.toLocaleDateString('ru-RU')
    }
    
    // Если это число
    if (typeof value === 'number') {
      if (Number.isInteger(value) && Math.abs(value) >= 1000) {
        return value.toLocaleString('ru-RU')
      }
      if (!Number.isInteger(value)) {
        return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽'
      }
      return String(value)
    }
    
    // Другие объекты — показываем как JSON
    try {
      return JSON.stringify(value)
    } catch {
      return '[Объект]'
    }
  }
  
  // Число, булево и т.д.
  if (typeof value === 'number') {
    if (Number.isInteger(value) && Math.abs(value) >= 1000) {
      return value.toLocaleString('ru-RU')
    }
    return String(value)
  }
  
  return String(value)
}

// === Состояние таблицы ===
const columns = [
  {
    name: 'createdAt',
    required: true,
    label: 'Дата и время',
    align: 'left',
    field: 'createdAt',
    sortable: true,
    format: (val: string) => {
      if (!val) return '—'
      const date = new Date(val)
      return date.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    }
  },
 
  { 
    name: 'operationType', 
    label: 'Операция', 
    align: 'left', 
    field: 'operationType', 
    sortable: true,
    // Убираем стандартный format, чтобы он не показывал текст, и даём заработать нашему кастомному шаблону
  },
  { name: 'entityType', label: 'Сущность', align: 'left', field: 'entityType', sortable: true },
  { name: 'entityId', label: 'ID сущности', align: 'left', field: 'entityId', sortable: true },
  { name: 'fieldName', label: 'Поле', align: 'left', field: 'fieldName', sortable: true },
  {
    name: 'oldValue',
    label: 'Было',
    align: 'left',
    field: 'oldValue',
    sortable: false,
    format: (val: any) => formatValue(val)
  },
  {
    name: 'newValue',
    label: 'Стало',
    align: 'left',
    field: 'newValue',
    sortable: false,
    format: (val: any) => formatValue(val)
  },
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
    // Передаём фильтры в сервис
    const result = await historyService.getAll({
      entityType: filters.value.entityType || undefined,
      operationType: filters.value.operationType || undefined,
      entityId: filters.value.entityId || undefined,
    }, pagination.value.page, pagination.value.rowsPerPage)
    
    // Защита от undefined
    history.value = result?.data || []
    pagination.value.rowsNumber = result?.total || 0
  } catch (error: any) {
    // При ошибке — пустой массив
    history.value = []
    pagination.value.rowsNumber = 0
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