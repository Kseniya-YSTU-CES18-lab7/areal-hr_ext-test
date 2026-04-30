<template>
  <q-page class="q-pa-md">
    
    <!-- Заголовок страницы -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-dark">
          {{ showFired ? 'Уволенные сотрудники' : 'Сотрудники' }}
        </div>
      </div>
      <div class="col-auto q-gutter-sm">
        <!-- Переключатель уволенных -->
        <q-toggle
          v-model="showFired"
          label="Показать уволенных"
          @update:model-value="onToggleFired"
          color="negative"
        />
        
        <!-- Кнопка создания (только для активных) -->
        <q-btn 
          v-if="!showFired"
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
          <!-- Одно поле поиска по ФИО -->
          <div class="col-8">
            <q-input
              v-model="searchQuery.fio"
              label="Поиск по ФИО"
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
          
          <!-- Фильтр по отделу -->
          <div class="col-4">
            <q-select
              v-model="searchQuery.departmentId"
              :options="departmentOptions"
              label="Отдел"
              outlined
              :readonly="!isEditing"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              clearable
              @update:model-value="onSearch"
            >
              <template v-slot:prepend>
                <q-icon name="account_tree" color="primary" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <!-- Таблица сотрудников -->
    <q-card class="bg-secondary">
      <q-table
        :rows="employees || []"
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
              <!-- Если сотрудник уволен -->
              <template v-if="props.row.deletedAt">
                <q-btn
                  flat
                  dense
                  round
                  icon="restore"
                  color="positive"
                  @click="confirmRestore(props.row)"
                >
                  <q-tooltip>Восстановить</q-tooltip>
                </q-btn>
                
                <q-btn
                  flat
                  dense
                  round
                  icon="visibility"
                  color="grey-7"
                  @click="openDetailDialog(props.row)"
                >
                  <q-tooltip>Просмотреть (только чтение)</q-tooltip>
                </q-btn>
              </template>
              
              <!-- Если сотрудник активен -->
              <template v-else>
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
              </template>
            </div>
          </q-td>
        </template>

        <!-- Слот для колонки "Статус" -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.deletedAt ? 'negative' : 'positive'">
              {{ props.row.deletedAt ? '❌ Уволен' : '✅ Активен' }}
            </q-badge>
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

              <q-select
                v-model="form.departmentId"
                :options="departmentOptions"
                label="Отдел"
                outlined
                :readonly="!isEditing"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="account_tree" color="primary" />
                </template>
              </q-select>

                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="primary">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date 
                        v-model="form.birthDate" 
                        mask="YYYY-MM-DD"
                        @update:model-value="closeDatePicker"
                      >
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
            <q-form @submit.prevent="savePassport" class="q-gutter-md">
              
              <div class="row q-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model="passportForm.series"
                    label="Серия"
                    outlined
                    :readonly="!isEditing"
                    :rules="passportSeriesRules"
                    mask="####"
                    fill-mask="#"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="passportForm.number"
                    label="Номер *"
                    outlined
                    :readonly="!isEditing"
                    :rules="passportNumberRules"
                    mask="######"
                    fill-mask="#"
                  />
                </div>
              </div>
              
              <q-input
                v-model="passportForm.issueDate"
                label="Дата выдачи"
                outlined
                :readonly="!isEditing"
                mask="####-##-##"
                fill-mask="#"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <q-date v-model="passportForm.issueDate" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Закрыть" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              
              <q-input
                v-model="passportForm.departmentCode"
                label="Код подразделения"
                outlined
                :readonly="!isEditing"
                mask="###-###"
                fill-mask="#"
              />
              
              <q-input
                v-model="passportForm.issuedBy"
                label="Кем выдан *"
                outlined
                :readonly="!isEditing"
                type="textarea"
                :rules="[val => !!val || 'Обязательное поле']"
              />
              
              <!-- Кнопки (только в режиме редактирования) -->
              <div v-if="isEditing" class="row justify-end q-gutter-sm q-mt-md">
                <q-btn 
                  label="Отмена" 
                  color="grey-7" 
                  text-color="white"
                  @click="resetPassportForm"
                />
                <q-btn 
                  type="submit" 
                  :label="passportForm.id ? 'Обновить' : 'Добавить'" 
                  color="primary"
                  :loading="isPassportSubmitting"
                />
              </div>
              
            </q-form>
          </div>

          <!-- Вкладка: Адрес -->
          <div v-if="activeTab === 'address'" class="q-gutter-md">
            <q-form @submit.prevent="saveAddress" class="q-gutter-md">
              
              <q-input
                v-model="addressForm.region"
                label="Область/край *"
                outlined
                :readonly="!isEditing"
                :rules="addressFieldRules"
              />
              
              <q-input
                v-model="addressForm.locality"
                label="Населённый пункт *"
                outlined
                :readonly="!isEditing"
                :rules="addressFieldRules"
              />
              
              <q-input
                v-model="addressForm.street"
                label="Улица *"
                outlined
                :readonly="!isEditing"
                :rules="addressFieldRules"
              />
              
              <div class="row q-gutter-md">
                <div class="col-4">
                  <q-input
                    v-model="addressForm.house"
                    label="Дом *"
                    outlined
                    :readonly="!isEditing"
                    :rules="houseFieldRules"
                  />
                </div>
                <div class="col-4">
                  <q-input
                    v-model="addressForm.building"
                    label="Корпус"
                    outlined
                    :readonly="!isEditing"
                  />
                </div>
                <div class="col-4">
                  <q-input
                    v-model="addressForm.apartment"
                    label="Квартира"
                    outlined
                    :readonly="!isEditing"
                  />
                </div>
              </div>
              
              <!-- Кнопки (только в режиме редактирования) -->
              <div v-if="isEditing" class="row justify-end q-gutter-sm q-mt-md">
                <q-btn 
                  label="Отмена" 
                  color="grey-7" 
                  text-color="white"
                  @click="resetAddressForm"
                />
                <q-btn 
                  type="submit" 
                  :label="addressForm.id ? 'Обновить' : 'Добавить'" 
                  color="primary"
                  :loading="isAddressSubmitting"
                />
              </div>
              
            </q-form>
          </div>

          <!-- Вкладка: Файлы -->         
          <div v-if="activeTab === 'files'" class="q-gutter-md">
            
            <!-- Форма загрузки файла -->
            <q-card class="bg-white">
              <q-card-section>
                <div class="text-subtitle1 q-mb-md">Загрузить файл</div>
                
                <q-file 
                  v-model="selectedFile" 
                  label="Выберите файл"
                  outlined
                  dense
                  @update:model-value="onFileSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                
                <q-input 
                  v-model="fileTitle" 
                  label="Название файла"
                  class="q-mt-md"
                  outlined
                  dense
                  :rules="[val => !!val || 'Название обязательно']"
                />
                
                <q-btn 
                  color="primary" 
                  label="Загрузить" 
                  class="q-mt-md"
                  @click="uploadFile"
                  :loading="isUploading"
                  :disable="!selectedFile || !fileTitle"
                />
              </q-card-section>
            </q-card>

            <!-- Список файлов -->
            <div v-if="files && files.length > 0">
              <div class="text-subtitle1 q-mb-sm">Загруженные файлы</div>
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
                  
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="deleteFile(file.id)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            
            <div v-else class="text-center q-pa-md bg-white rounded-borders">
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

   <!-- Диалог подтверждения восстановления -->
    <q-dialog v-model="restoreDialogOpened" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="restore" color="positive" text-color="white" />
          <span class="q-ml-sm text-dark">Подтвердите восстановление</span>
        </q-card-section>

        <q-card-section>
          <div class="text-dark">
            Вы действительно хотите восстановить сотрудника 
            "{{ employeeToRestore?.firstName }} {{ employeeToRestore?.surname }}"?
            <br><br>
            <span class="text-caption text-grey-7">
              Сотрудник вернётся в список активных и сможет редактироваться.
            </span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            label="Отмена" 
            color="grey-7" 
            text-color="white"
            @click="restoreDialogOpened = false"
          />
          <q-btn 
            label="Восстановить" 
            color="positive"
            :loading="isRestoring"
            @click="handleRestore"
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
import { passportsService } from 'src/services/passports'
import { addressesService } from 'src/services/addresses'
import { filesService } from 'src/services/files'
import { departmentsService } from 'src/services/departments'
import { 
  surnameRules, 
  firstNameRules, 
  patronymicRules,
  passportSeriesRules,
  passportNumberRules,
  addressFieldRules,
  houseFieldRules
} from 'src/utils/validationRules'
import type { Employee, Passport, Address, File as FileEntity } from 'src/types/models'

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
    format: (val: string) => formatDate(val, 'date')
  },
  // Статус
  { 
    name: 'status', 
    label: 'Статус', 
    align: 'left', 
    field: 'deletedAt',
    sortable: true,
  },
  { name: 'actions', label: 'Действия', align: 'right', field: 'actions', sortable: false },
]

const employees = ref<Employee[]>([])
const isLoading = ref(false)
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })
const searchQuery = ref({ fio: '', departmentId: undefined as number | undefined})
// === Список отделов для фильтра ===
const departmentOptions = ref<{ label: string; value: number }[]>([])

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
  birthDate: '',
  departmentId: undefined as number | undefined   
})

// Данные для вкладок
const passport = ref<Passport | null>(null)
const address = ref<Address | null>(null)
const files = ref<FileEntity[]>([])

// === Формы редактирования паспорта и адреса ===
const passportForm = ref({
  id: null as number | null,
  series: '',
  number: '',
  issueDate: '',
  departmentCode: '',
  issuedBy: ''
})

const addressForm = ref({
  id: null as number | null,
  region: '',
  locality: '',
  street: '',
  house: '',
  building: '',
  apartment: ''
})

const isPassportSubmitting = ref(false)
const isAddressSubmitting = ref(false)

// === Файлы ===
const selectedFile = ref<File | null>(null)
const fileTitle = ref('')
const isUploading = ref(false)

// === Удаление ===
const deleteDialogOpened = ref(false)
const employeeToDelete = ref<Employee | null>(null)
const isDeleting = ref(false)

// === Переключатель уволенных сотрудников ===
const showFired = ref(false)
const restoreDialogOpened = ref(false)
const employeeToRestore = ref<Employee | null>(null)
const isRestoring = ref(false)

// === Поиск с debounce ===
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Загрузка отделов
async function loadDepartmentOptions() {
  try {
    const result = await departmentsService.getAll({}, 1, 1000)
    departmentOptions.value = (result.data || []).map((dept: any) => ({
      label: dept.name,
      value: Number(dept.id)  
    }))
  } catch (error) {
    console.error('Failed to load departments:', error)
    departmentOptions.value = []
  }
}

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadEmployees()
  }, 300)
}

// === Загрузка сотрудников ===
async function loadEmployees() {
  isLoading.value = true
  try {
    let result
    
    if (showFired.value) {
      // Загружаем уволенных
      const fired = await employeesService.getFired()
      result = { 
        data: fired, 
        total: fired.length, 
        page: 1, 
        limit: fired.length 
      }
    } else {
      // Загружаем активных с фильтрами
      const fioParts = searchQuery.value.fio.trim().split(/\s+/)
      const surname = fioParts[0] || undefined
      const firstName = fioParts[1] || undefined
      
      result = await employeesService.getAll(
        { 
          surname: surname || undefined, 
          firstName: firstName || undefined, 
          departmentId: searchQuery.value.departmentId || undefined 
        },
        pagination.value.page,
        pagination.value.rowsPerPage
      )
    }
    
    employees.value = result?.data || []
    pagination.value.rowsNumber = result?.total || 0
  } catch (error: any) {
    employees.value = []
    pagination.value.rowsNumber = 0
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Не удалось загрузить сотрудников',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function onToggleFired() {
  pagination.value.page = 1
  loadEmployees()
}

function onRequestPagination(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  loadEmployees()
}

// === Открытие диалога ===
function openCreateDialog() {
  isEditing.value = true
  activeTab.value = 'main'
  resetForms()
  detailDialogOpened.value = true
}

function resetForms() {
  form.value = { id: '', surname: '', firstName: '', patronymic: '', birthDate: '', departmentId: undefined }
  passport.value = null
  address.value = null
  files.value = []
  
  passportForm.value = { id: null, series: '', number: '', issueDate: '', departmentCode: '', issuedBy: '' }
  addressForm.value = { id: null, region: '', locality: '', street: '', house: '', building: '', apartment: '' }
  selectedFile.value = null
  fileTitle.value = ''
}

async function openEditDialog(employee: any) {
  // Блокируем редактирование уволенных
  if (employee.deletedAt) {
    $q.notify({
      color: 'warning',
      message: 'Невозможно редактировать уволенного сотрудника. Сначала восстановите его.',
      icon: 'warning',
      position: 'top-right'
    })
    return  
  }
  
  isEditing.value = true
  
  try {
    const fullEmployee = await employeesService.getById(employee.id)
    
    console.log('🔍 DEBUG fullEmployee:', fullEmployee)
    console.log('🔍 DEBUG departmentId from API:', (fullEmployee as any).departmentId)

    form.value = {
      id: fullEmployee.id,
      surname: fullEmployee.surname,
      firstName: fullEmployee.firstName,
      patronymic: fullEmployee.patronymic || '',
      birthDate: fullEmployee.birthDate || '',
      departmentId: (fullEmployee as any).departmentId 
        ? Number((fullEmployee as any).departmentId) 
        : undefined
    }
    
    if (fullEmployee.passport) {
      passport.value = fullEmployee.passport
      passportForm.value = {
        id: fullEmployee.passport.id,
        series: fullEmployee.passport.series || '',
        number: fullEmployee.passport.number,
        issueDate: fullEmployee.passport.issueDate || '',
        departmentCode: fullEmployee.passport.departmentCode || '',
        issuedBy: fullEmployee.passport.issuedBy || ''
      }
    }
    
    if (fullEmployee.address) {
      address.value = fullEmployee.address
      addressForm.value = {
        id: fullEmployee.address.id,
        region: fullEmployee.address.region || '',
        locality: fullEmployee.address.locality || '',
        street: fullEmployee.address.street || '',
        house: fullEmployee.address.house || '',
        building: fullEmployee.address.building || '',
        apartment: fullEmployee.address.apartment || ''
      }
    }
    
    files.value = fullEmployee.files || []
    
  } catch (error) {
    console.error('Failed to load full employee data:', error)
    form.value = {
      id: employee.id,
      surname: employee.surname,
      firstName: employee.firstName,
      patronymic: employee.patronymic || '',
      birthDate: employee.birthDate || ''
    }
  }
  
  detailDialogOpened.value = true
}

function openDetailDialog(employee: any) {
  isEditing.value = false
  openEditDialog(employee)
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    // Создаём payload
    const payload: any = {
      surname: form.value.surname,
      firstName: form.value.firstName,
      patronymic: form.value.patronymic || null,
      birthDate: form.value.birthDate || null,
    }
    
    // Отладка: что отправляем
    console.log('🔍 DEBUG payload before send:', payload)
    console.log('🔍 DEBUG form.departmentId:', form.value.departmentId, 'type:', typeof form.value.departmentId)
    
    // Попробуем так
    const rawDeptId = form.value.departmentId;
    const deptId = typeof rawDeptId === 'object' && rawDeptId !== null && rawDeptId.value !== undefined
      ? rawDeptId.value  
      : rawDeptId;       

    // Если есть валидное число — добавляем в payload
    if (deptId !== undefined && deptId !== null && deptId !== '' && !isNaN(Number(deptId))) {
      payload.departmentId = Number(deptId);
      console.log('✅ Added departmentId to payload:', payload.departmentId);
    } else {
      console.log('⚠️ departmentId NOT added (raw:', rawDeptId, ', extracted:', deptId, ')');
    }
    
    if (isEditing.value && form.value.id) {
      await employeesService.update(form.value.id, payload)
      $q.notify({ color: 'positive', message: 'Сотрудник обновлён', icon: 'check_circle' })
    } else {
      await employeesService.create(payload)
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

// === Сохранение паспорта ===
async function savePassport() {
  if (!form.value.id) {
    $q.notify({ color: 'negative', message: 'Сначала сохраните сотрудника' })
    return
  }
  
  isPassportSubmitting.value = true
  try {
    const dto = {
      employeeId: form.value.id,
      series: passportForm.value.series || null,
      number: passportForm.value.number,
      issueDate: passportForm.value.issueDate || null,
      departmentCode: passportForm.value.departmentCode || null,
      issuedBy: passportForm.value.issuedBy
    }
    
    if (passportForm.value.id) {
      await passportsService.update(passportForm.value.id, dto)
      $q.notify({ color: 'positive', message: 'Паспорт обновлён', icon: 'check_circle' })
    } else {
      await passportsService.create(dto)
      $q.notify({ color: 'positive', message: 'Паспорт добавлен', icon: 'add_circle' })
    }
    
    const updated = await employeesService.getById(form.value.id)
    passport.value = updated.passport || null
    if (updated.passport) {
      passportForm.value = {
        id: updated.passport.id,
        series: updated.passport.series || '',
        number: updated.passport.number,
        issueDate: updated.passport.issueDate || '',
        departmentCode: updated.passport.departmentCode || '',
        issuedBy: updated.passport.issuedBy || ''
      }
    }
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при сохранении паспорта',
      icon: 'error'
    })
  } finally {
    isPassportSubmitting.value = false
  }
}

// === Сохранение адреса ===
async function saveAddress() {
  if (!form.value.id) {
    $q.notify({ color: 'negative', message: 'Сначала сохраните сотрудника' })
    return
  }
  
  isAddressSubmitting.value = true
  try {
    const dto = {
      employeeId: form.value.id,
      region: addressForm.value.region || null,
      locality: addressForm.value.locality || null,
      street: addressForm.value.street || null,
      house: addressForm.value.house || null,
      building: addressForm.value.building || null,
      apartment: addressForm.value.apartment || null
    }
    
    if (addressForm.value.id) {
      await addressesService.update(addressForm.value.id, dto)
      $q.notify({ color: 'positive', message: 'Адрес обновлён', icon: 'check_circle' })
    } else {
      await addressesService.create(dto)
      $q.notify({ color: 'positive', message: 'Адрес добавлен', icon: 'add_circle' })
    }
    
    const updated = await employeesService.getById(form.value.id)
    address.value = updated.address || null
    if (updated.address) {
      addressForm.value = {
        id: updated.address.id,
        region: updated.address.region || '',
        locality: updated.address.locality || '',
        street: updated.address.street || '',
        house: updated.address.house || '',
        building: updated.address.building || '',
        apartment: updated.address.apartment || ''
      }
    }
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при сохранении адреса',
      icon: 'error'
    })
  } finally {
    isAddressSubmitting.value = false
  }
}

// === Сброс форм ===
function resetPassportForm() {
  passportForm.value = {
    id: null,
    series: '',
    number: '',
    issueDate: '',
    departmentCode: '',
    issuedBy: ''
  }
  passport.value = null
}

function resetAddressForm() {
  addressForm.value = {
    id: null,
    region: '',
    locality: '',
    street: '',
    house: '',
    building: '',
    apartment: ''
  }
  address.value = null
}

// === Удаление сотрудника ===
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

// === Работа с файлами ===
function onFileSelected(file: File | null) {
  if (file) {
    fileTitle.value = file.name
  }
}

// === Восстановление уволенного сотрудника ===
function confirmRestore(employee: Employee) {
  employeeToRestore.value = employee
  restoreDialogOpened.value = true
}

async function handleRestore() {
  if (!employeeToRestore.value) return
  isRestoring.value = true
  try {
    await employeesService.restore(employeeToRestore.value.id)
    $q.notify({ color: 'positive', message: 'Сотрудник восстановлен', icon: 'restore' })
    await loadEmployees()
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при восстановлении',
      icon: 'error'
    })
  } finally {
    isRestoring.value = false
    restoreDialogOpened.value = false
    employeeToRestore.value = null
  }
}

async function uploadFile() {
  if (!selectedFile.value || !form.value.id) {
    $q.notify({ color: 'negative', message: 'Выберите файл и сохраните сотрудника' })
    return
  }
  
  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('employeeId', form.value.id)
    formData.append('title', fileTitle.value)
    
    await filesService.upload(formData)
    $q.notify({ color: 'positive', message: 'Файл загружен', icon: 'upload' })
    
    const updated = await filesService.getByEmployeeId(form.value.id)
    files.value = updated
    
    selectedFile.value = null
    fileTitle.value = ''
  } catch (error: any) {
    $q.notify({ 
      color: 'negative', 
      message: error.response?.data?.message || 'Ошибка загрузки файла',
      icon: 'error'
    })
  } finally {
    isUploading.value = false
  }
}

async function deleteFile(fileId: number) {
  try {
    await filesService.delete(fileId)
    $q.notify({ color: 'positive', message: 'Файл удалён', icon: 'delete' })
    const updated = await filesService.getByEmployeeId(form.value.id)
    files.value = updated
  } catch (error: any) {
    $q.notify({ 
      color: 'negative', 
      message: error.response?.data?.message || 'Ошибка при удалении файла',
      icon: 'error'
    })
  }
}

// === Вспомогательные функции ===
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

function formatDate(dateString: string | null, type: 'date' | 'datetime' = 'date'): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  
  if (type === 'datetime') {
    return date.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }
  return date.toLocaleDateString('ru-RU')
}

function closeDatePicker() {
  if (form.value.birthDate instanceof Date) {
    const date = form.value.birthDate
    form.value.birthDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

onMounted(() => {
  loadDepartmentOptions()
  loadEmployees()
})
</script>