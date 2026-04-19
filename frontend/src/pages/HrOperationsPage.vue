<template>
  <q-page class="q-pa-md">
    
    <!-- Заголовок страницы -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-dark">Кадровые операции</div>
      </div>
      <div class="col-auto">
        <q-btn 
          label="Создать операцию" 
          color="primary" 
          icon="add"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Панель фильтров -->
    <q-card class="q-mb-md bg-secondary">
      <q-card-section>
        <div class="row q-gutter-sm">
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
              v-model="filters.employeeName"
              label="Поиск по сотруднику"
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

    <!-- Таблица операций -->
    <q-card class="bg-secondary">
      <q-table
        :rows="operations || []"
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

        <!-- Кастомизация колонки "Действия" -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-xs">
              <q-btn
                flat
                dense
                round
                icon="visibility"
                color="primary"
                @click="openDetailDialog(props.row)"
              >
                <q-tooltip>Просмотреть</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Редактировать</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Удалить</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Сообщение, если данных нет -->
        <template v-slot:no-data>
          <div class="full-width row flex flex-center q-gutter-sm">
            <q-icon name="warning" color="warning" size="2em" />
            <span>Кадровые операции не найдены</span>
          </div>
        </template>

        <!-- Сообщение при загрузке -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- Диалог создания/редактирования -->
    <q-dialog v-model="dialogOpened" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Редактировать' : 'Создать' }} кадровую операцию</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            
            <!-- Тип операции -->
            <q-select
              v-model="form.operationType"
              :options="operationTypeOptions"
              label="Тип операции *"
              outlined
              :rules="[val => !!val || 'Тип операции обязателен']"
            />
            
            <!-- Сотрудник -->
            <q-select
              v-model="form.employeeId"
              :options="employeeOptions"
              label="Сотрудник *"
              outlined
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[val => !!val || 'Сотрудник обязателен']"
            />
            
            <!-- Дата операции -->
            <q-input
              v-model="form.operationDate"
              label="Дата операции *"
              outlined
              mask="####-##-##"
              fill-mask="#"
              :rules="[val => !!val || 'Дата обязательна']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form.operationDate" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Закрыть" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            
            <!-- Зарплата (для hire/change_salary) -->
            <q-input
              v-if="['hire', 'change_salary'].includes(form.operationType)"
              v-model.number="form.salary"
              label="Зарплата"
              outlined
              type="number"
              prefix="₽"
            />
            
            <!-- Кнопки формы -->
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn 
                label="Отмена" 
                color="grey-7" 
                text-color="white"
                @click="dialogOpened = false"
              />
              <q-btn 
                type="submit" 
                label="Сохранить" 
                color="primary"
                :loading="isSubmitting"
              />
            </div>
            
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Диалог подтверждения удаления -->
    <q-dialog v-model="deleteDialogOpened" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-dark">Подтвердите удаление</span>
        </q-card-section>

        <q-card-section>
          <div class="text-dark">
            Вы действительно хотите удалить эту кадровую операцию?
            <br><br>
            <span class="text-caption text-grey-7">
              Это мягкое удаление — данные можно будет восстановить.
            </span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            label="Отмена" 
            color="grey-7" 
            text-color="white"
            @click="deleteDialogOpened = false"
          />
          <q-btn 
            label="Удалить" 
            color="negative"
            :loading="isDeleting"
            @click="handleDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { hrOperationsService } from 'src/services/hr-operations'
import { employeesService } from 'src/services/employees'
import type { HrOperation, HrOperationCreateDto, HrOperationUpdateDto, Employee } from 'src/types/models'

const $q = useQuasar()

// === Типы операций ===
const operationTypeOptions = [
  { label: 'Приём на работу', value: 'hire' },
  { label: 'Изменение зарплаты', value: 'change_salary' },
  { label: 'Перевод в отдел', value: 'change_department' },
  { label: 'Увольнение', value: 'dismissal' }
]

function getOperationTypeLabel(value: string): string {
  return operationTypeOptions.find(opt => opt.value === value)?.label || value
}

function getOperationTypeColor(value: string): string {
  const colors: Record<string, string> = {
    hire: 'positive',
    change_salary: 'info',
    change_department: 'warning',
    dismissal: 'negative'
  }
  return colors[value] || 'grey'
}

// === Состояние таблицы ===
const columns = [
  { name: 'operationDate', required: true, label: 'Дата', align: 'left', field: 'operationDate', sortable: true,
    format: (val: string) => val ? new Date(val).toLocaleDateString('ru-RU') : '—' },
  { name: 'operationType', label: 'Тип', align: 'left', field: 'operationType', sortable: true },
  { name: 'employeeName', label: 'Сотрудник', align: 'left', field: 'employeeName', sortable: true },
  { name: 'salary', label: 'Зарплата', align: 'right', field: 'salary', sortable: true,
    format: (val: number) => val ? `${val.toLocaleString('ru-RU')} ₽` : '—' },
  { name: 'actions', label: 'Действия', align: 'right', field: 'actions', sortable: false },
]

const operations = ref<HrOperation[]>([])
const isLoading = ref(false)
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// === Фильтры ===
const filters = ref({ operationType: '', employeeName: '' })

function onFilter() {
  pagination.value.page = 1
  loadOperations()
}

// === Список сотрудников для выбора ===
const employeeOptions = ref<{ label: string; value: string }[]>([])

async function loadEmployeesForSelect() {
  try {
    const result = await employeesService.getAll(undefined, undefined, undefined, 1, 100)
    employeeOptions.value = result.data.map((emp: Employee) => ({
      label: `${emp.surname} ${emp.firstName} ${emp.patronymic || ''}`.trim(),
      value: emp.id
    }))
  } catch (error) {
    console.error('Failed to load employees:', error)
  }
}

// === Диалог ===
const dialogOpened = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const form = ref<HrOperationCreateDto & { id?: number }>({
  employeeId: '',
  operationType: 'hire',
  operationDate: new Date().toISOString().split('T')[0],
  salary: null,
  departmentId: null,
  positionId: null
})

function openCreateDialog() {
  isEditing.value = false
  form.value = {
    employeeId: '',
    operationType: 'hire',
    operationDate: new Date().toISOString().split('T')[0],
    salary: null,
    departmentId: null,
    positionId: null
  }
  dialogOpened.value = true
}

function openEditDialog(operation: HrOperation) {
  isEditing.value = true
  form.value = {
    id: operation.id,
    employeeId: operation.employeeId,
    operationType: operation.operationType,
    operationDate: operation.operationDate,
    salary: operation.salary,
    departmentId: operation.departmentId,
    positionId: operation.positionId
  }
  dialogOpened.value = true
}

function openDetailDialog(operation: HrOperation) {
  isEditing.value = false
  openEditDialog(operation)
}

// === Загрузка операций ===
async function loadOperations() {
  isLoading.value = true
  try {
    const result = await hrOperationsService.getAll(
      pagination.value.page,
      pagination.value.rowsPerPage
    )
    operations.value = result.data
    pagination.value.rowsNumber = result.total
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Не удалось загрузить операции',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function onRequestPagination(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  loadOperations()
}

// === Сохранение ===
async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (isEditing.value && form.value.id) {
      await hrOperationsService.update(form.value.id, form.value as HrOperationUpdateDto)
      $q.notify({ color: 'positive', message: 'Операция обновлена', icon: 'check_circle' })
    } else {
      await hrOperationsService.create(form.value as HrOperationCreateDto)
      $q.notify({ color: 'positive', message: 'Операция создана', icon: 'add_circle' })
    }
    dialogOpened.value = false
    await loadOperations()
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при сохранении',
      icon: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

// === Удаление ===
const deleteDialogOpened = ref(false)
const operationToDelete = ref<HrOperation | null>(null)
const isDeleting = ref(false)

function confirmDelete(operation: HrOperation) {
  operationToDelete.value = operation
  deleteDialogOpened.value = true
}

async function handleDelete() {
  if (!operationToDelete.value) return
  isDeleting.value = true
  try {
    await hrOperationsService.delete(operationToDelete.value.id)
    $q.notify({ color: 'positive', message: 'Операция удалена', icon: 'delete' })
    await loadOperations()
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при удалении',
      icon: 'error'
    })
  } finally {
    isDeleting.value = false
    deleteDialogOpened.value = false
    operationToDelete.value = null
  }
}

// === Загрузка при монтировании ===
onMounted(async () => {
  await Promise.all([loadEmployeesForSelect(), loadOperations()])
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