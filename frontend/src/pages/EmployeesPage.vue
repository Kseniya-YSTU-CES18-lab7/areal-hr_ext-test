<template>
  <q-page class="q-pa-md">
    
    <!-- Заголовок страницы -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-dark">Сотрудники</div>
      </div>
      <div class="col-auto">
        <q-btn 
          label="Создать сотрудника" 
          color="primary" 
          icon="add"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Панель поиска -->
    <q-card class="q-mb-md bg-secondary">
      <q-card-section>
        <div class="row q-gutter-sm">
          <div class="col">
            <q-input
              v-model="searchQuery.surname"
              label="Поиск по фамилии"
              outlined
              dense
              clearable
              @update:model-value="onSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col">
            <q-input
              v-model="searchQuery.firstName"
              label="Поиск по имени"
              outlined
              dense
              clearable
              @update:model-value="onSearch"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Таблица сотрудников -->
    <q-card class="bg-secondary">
      <q-table
        :rows="employees"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        :pagination="pagination"
        @request="onRequestPagination"
        dense
        class="text-dark"
      >
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
            <span>Сотрудники не найдены</span>
          </div>
        </template>

        <!-- Сообщение при загрузке -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- Диалог просмотра/редактирования сотрудника (с вкладками) -->
    <q-dialog v-model="detailDialogOpened" persistent maximized>
      <q-card class="column full-height">
        
        <!-- Шапка диалога -->
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">
            {{ isEditing ? 'Редактировать' : 'Просмотр' }} сотрудника
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <!-- Вкладки -->
        <q-tabs
          v-model="activeTab"
          dense
          class="bg-grey-2 text-primary"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="main" label="Основные данные" />
          <q-tab name="passport" label="Паспорт" />
          <q-tab name="address" label="Адрес" />
          <q-tab name="files" label="Файлы" />
        </q-tabs>

        <!-- Контент вкладок -->
        <q-card-section class="col q-pa-md scroll">
          
          <!-- Вкладка: Основные данные -->
          <div v-if="activeTab === 'main'" class="q-gutter-md">
            <q-form @submit="handleSubmit" class="q-gutter-md">
              
              <div class="row q-gutter-md">
                <div class="col">
                  <q-input
                    v-model="form.surname"
                    label="Фамилия *"
                    outlined
                    :readonly="!isEditing"
                    :rules="surnameRules"
                  />
                </div>
                
                <div class="col">
                  <q-input
                    v-model="form.firstName"
                    label="Имя *"
                    outlined
                    :readonly="!isEditing"
                    :rules="firstNameRules"
                  />
                </div>
                
                <div class="col">
                  <q-input
                    v-model="form.patronymic"
                    label="Отчество"
                    outlined
                    :readonly="!isEditing"
                    :rules="patronymicRules"
                  />
                </div>
              </div>
              
              <!-- Дата рождения -->
              <q-input
                v-model="form.birthDate"
                label="Дата рождения"
                outlined
                :readonly="!isEditing"
                mask="####-##-##"
                fill-mask="#"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="primary">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.birthDate" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Закрыть" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              
              <!-- Кнопки формы (только в режиме редактирования) -->
              <div v-if="isEditing" class="row justify-end q-gutter-sm q-mt-md">
                <q-btn 
                  label="Отмена" 
                  color="grey-7" 
                  text-color="white"
                  @click="detailDialogOpened = false"
                />
                <q-btn 
                  type="submit" 
                  label="Сохранить" 
                  color="primary"
                  :loading="isSubmitting"
                />
              </div>
              
            </q-form>
          </div>

          <!-- Вкладка: Паспортные данные -->
          <div v-if="activeTab === 'passport'" class="q-gutter-md">
            <div v-if="passport" class="q-pa-md bg-white rounded-borders">
              <div class="text-subtitle1 q-mb-md">Паспортные данные</div>
              
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Серия</q-item-label>
                    <q-item-label>{{ passport.series || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Номер</q-item-label>
                    <q-item-label>{{ passport.number || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Дата выдачи</q-item-label>
                    <q-item-label>{{ formatDate(passport.issueDate) || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Кем выдан</q-item-label>
                    <q-item-label>{{ passport.issuedBy || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div v-else class="text-center q-pa-md">
              <q-icon name="info" size="3em" color="grey-7" />
              <div class="q-mt-sm text-grey-7">Паспортные данные не заполнены</div>
            </div>
          </div>

          <!-- Вкладка: Адрес -->
          <div v-if="activeTab === 'address'" class="q-gutter-md">
            <div v-if="address" class="q-pa-md bg-white rounded-borders">
              <div class="text-subtitle1 q-mb-md">Адрес регистрации</div>
              
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Область</q-item-label>
                    <q-item-label>{{ address.region || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Населённый пункт</q-item-label>
                    <q-item-label>{{ address.locality || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Улица</q-item-label>
                    <q-item-label>{{ address.street || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Дом</q-item-label>
                    <q-item-label>{{ address.house || '—' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div v-else class="text-center q-pa-md">
              <q-icon name="info" size="3em" color="grey-7" />
              <div class="q-mt-sm text-grey-7">Адрес не заполнен</div>
            </div>
          </div>

          <!-- Вкладка: Файлы -->
          <div v-if="activeTab === 'files'" class="q-gutter-md">
            <div v-if="files && files.length > 0">
              <q-list bordered separator class="rounded-borders bg-white">
                <q-item v-for="file in files" :key="file.id">
                  <q-item-section avatar>
                    <q-icon :name="getFileIcon(file.mimeType)" color="primary" size="2em" />
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label>{{ file.title }}</q-item-label>
                    <q-item-label caption>
                      {{ formatFileSize(file.sizeBytes) }} • {{ file.mimeType || '—' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div v-else class="text-center q-pa-md">
              <q-icon name="folder_open" size="3em" color="grey-7" />
              <div class="q-mt-sm text-grey-7">Файлы не загружены</div>
            </div>
          </div>

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
            Вы действительно хотите удалить сотрудника "{{ employeeToDelete?.firstName }} {{ employeeToDelete?.surname }}"?
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
import { employeesService } from 'src/services/employees'
import { 
  surnameRules, 
  firstNameRules, 
  patronymicRules 
} from 'src/utils/validationRules'
import type { Employee, Passport, Address, File } from 'src/types/models'

// Получаем экземпляр Quasar
const $q = useQuasar()

// === Состояние таблицы ===
const columns = [
  { name: 'surname', required: true, label: 'Фамилия', align: 'left', field: 'surname', sortable: true },
  { name: 'firstName', label: 'Имя', align: 'left', field: 'firstName', sortable: true },
  { name: 'patronymic', label: 'Отчество', align: 'left', field: 'patronymic', sortable: true },
  { 
    name: 'birthDate', 
    label: 'Дата рождения', 
    align: 'left', 
    field: 'birthDate',
    sortable: true,
    format: (val: string) => val ? new Date(val).toLocaleDateString('ru-RU') : '—'
  },
  { name: 'actions', label: 'Действия', align: 'right', field: 'actions', sortable: false },
]

const employees = ref<Employee[]>([])
const isLoading = ref(false)
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// === Поиск (объект для фильтрации по фамилии и имени) ===
const searchQuery = ref({
  surname: '',
  firstName: ''
})

// === Диалог ===
const detailDialogOpened = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const activeTab = ref('main')

const form = ref({
  id: '' as string,
  surname: '',
  firstName: '',
  patronymic: '',
  birthDate: ''
})

// Данные для вкладок
const passport = ref<Passport | null>(null)
const address = ref<Address | null>(null)
const files = ref<File[]>([])

// === Удаление ===
const deleteDialogOpened = ref(false)
const employeeToDelete = ref<Employee | null>(null)
const isDeleting = ref(false)

// Такой поиск (чтобы не спамить запросами)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadEmployees()
  }, 300)
}

// === Загрузка данных с серверной фильтрацией ===
// === Загрузка данных с серверной фильтрацией ===
async function loadEmployees() {
  isLoading.value = true
  try {
    const result = await employeesService.getAll(
      searchQuery.value.surname || undefined,
      searchQuery.value.firstName || undefined,
      undefined,  // departmentId
      pagination.value.page,
      pagination.value.rowsPerPage
    )
    
    employees.value = result.data
    pagination.value.rowsNumber = result.total
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Не удалось загрузить сотрудников',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function onRequestPagination(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  loadEmployees()
}

// === Диалог ===
function openCreateDialog() {
  isEditing.value = true
  activeTab.value = 'main'
  form.value = { id: '', surname: '', firstName: '', patronymic: '', birthDate: '' }
  passport.value = null
  address.value = null
  files.value = []
  detailDialogOpened.value = true
}

function openEditDialog(employee: any) {
  isEditing.value = true
  activeTab.value = 'main'
  form.value = {
    id: employee.id,
    surname: employee.surname,
    firstName: employee.firstName,
    patronymic: employee.patronymic || '',
    birthDate: employee.birthDate || ''
  }
  passport.value = employee.passport || null
  address.value = employee.address || null
  files.value = employee.files || []
  detailDialogOpened.value = true
}

function openDetailDialog(employee: any) {
  isEditing.value = false
  openEditDialog(employee)
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (isEditing.value && form.value.id) {
      // Обновление
      await employeesService.update(form.value.id, {
        surname: form.value.surname,
        firstName: form.value.firstName,
        patronymic: form.value.patronymic || null,
        birthDate: form.value.birthDate || null
      })
      $q.notify({ color: 'positive', message: 'Сотрудник обновлён', icon: 'check_circle' })
    } else {
      // Создание
      await employeesService.create({
        surname: form.value.surname,
        firstName: form.value.firstName,
        patronymic: form.value.patronymic || null,
        birthDate: form.value.birthDate || null
      })
      $q.notify({ color: 'positive', message: 'Сотрудник создан', icon: 'add_circle' })
    }
    detailDialogOpened.value = false
    await loadEmployees()
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
function confirmDelete(employee: any) {
  employeeToDelete.value = employee
  deleteDialogOpened.value = true
}

async function handleDelete() {
  if (!employeeToDelete.value) return
  isDeleting.value = true
  try {
    await employeesService.delete(employeeToDelete.value.id)
    $q.notify({ color: 'positive', message: 'Сотрудник удалён', icon: 'delete' })
    await loadEmployees()
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при удалении',
      icon: 'error'
    })
  } finally {
    isDeleting.value = false
    deleteDialogOpened.value = false
    employeeToDelete.value = null
  }
}

// === Вспомогательные функции ===
function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '0 Б'
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function getFileIcon(mimeType: string | null): string {
  if (!mimeType) return 'description'
  if (mimeType.includes('image')) return 'image'
  if (mimeType.includes('pdf')) return 'picture_as_pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'description'
  return 'attachment'
}

// Загружаем данные при монтировании
onMounted(() => {
  loadEmployees()
})
</script>

<style lang="sass" scoped>
.text-h5
  color: $dark

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