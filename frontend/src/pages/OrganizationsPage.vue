<template>
  <!-- QPage: контейнер страницы с отступами -->
  <q-page class="q-pa-md">
    
    <!-- Заголовок страницы -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-dark">Организации</div>
      </div>
      <div class="col-auto">
        <!-- Кнопка создания организации -->
        <q-btn 
          label="Создать организацию" 
          color="primary" 
          icon="add"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Панель поиска -->
    <q-card class="q-mb-md bg-secondary">
      <q-card-section>
        <q-input
          v-model="searchQuery"
          label="Поиск по названию"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- Таблица организаций -->
    <q-card class="bg-secondary">
      <q-table
        :rows="filteredOrganizations"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        :pagination="pagination"
        dense
        class="text-dark"
      >
        <!-- Кастомизация колонки "Действия" -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-xs">
              <!-- Кнопка редактирования -->
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
              
              <!-- Кнопка удаления -->
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
            <span>Организации не найдены</span>
          </div>
        </template>

        <!-- Сообщение при загрузке -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- Диалог создания/редактирования организации -->
    <q-dialog v-model="dialogOpened" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Редактировать' : 'Создать' }} организацию</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            
            <!-- Поле: Название -->
            <q-input
              v-model="form.name"
              label="Название организации *"
              outlined
              :rules="[
                val => !!val || 'Название обязательно',
                val => val.length >= 3 || 'Минимум 3 символа'
              ]"
            />
            
            <!-- Поле: Комментарий -->
            <q-input
              v-model="form.comment"
              label="Комментарий"
              outlined
              type="textarea"
              autogrow
              :rules="[val => !val || val.length <= 500 || 'Максимум 500 символов']"
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
            Вы действительно хотите удалить организацию "{{ organizationToDelete?.name }}"?
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
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

// Получаем экземпляр Quasar для уведомлений и диалогов
const $q = useQuasar()

// === Состояние таблицы ===

// Колонки таблицы
const columns = [
  { 
    name: 'name', 
    required: true, 
    label: 'Название', 
    align: 'left',
    field: 'name',
    sortable: true 
  },
  { 
    name: 'comment', 
    label: 'Комментарий', 
    align: 'left',
    field: 'comment',
    sortable: false 
  },
  { 
    name: 'createdAt', 
    label: 'Создана', 
    align: 'left',
    field: 'createdAt',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString('ru-RU')
  },
  { 
    name: 'actions', 
    label: 'Действия', 
    align: 'right',
    field: 'actions',
    sortable: false 
  },
]

// Данные организаций
const organizations = ref<any[]>([])

// Загрузка данных
const isLoading = ref(false)

// Пагинация
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// === Поиск ===

// Поисковый запрос
const searchQuery = ref('')

// Фильтрованные организации (поиск по названию)
const filteredOrganizations = computed(() => {
  if (!searchQuery.value) return organizations.value
  
  const query = searchQuery.value.toLowerCase()
  return organizations.value.filter((org: any) => 
    org.name?.toLowerCase().includes(query)
  )
})

// === Диалог создания/редактирования ===

// Открыт ли диалог
const dialogOpened = ref(false)

// Режим редактирования (true) или создания (false)
const isEditing = ref(false)

// Загрузка при отправке формы
const isSubmitting = ref(false)

// Данные формы
const form = ref({
  id: null as string | null,
  name: '',
  comment: ''
})

// Открыть диалог создания
function openCreateDialog() {
  isEditing.value = false
  form.value = { id: null, name: '', comment: '' }
  dialogOpened.value = true
}

// Открыть диалог редактирования
function openEditDialog(organization: any) {
  isEditing.value = true
  form.value = {
    id: organization.id,
    name: organization.name,
    comment: organization.comment || ''
  }
  dialogOpened.value = true
}

// Обработка отправки формы
async function handleSubmit() {
  isSubmitting.value = true
  
  try {
    if (isEditing.value) {
      // Редактирование
      await api.patch(`/organizations/${form.value.id}`, {
        name: form.value.name,
        comment: form.value.comment
      })
      
      $q.notify({
        color: 'positive',
        message: 'Организация обновлена',
        icon: 'check_circle',
        position: 'top-right'
      })
    } else {
      // Создание
      await api.post('/organizations', {
        name: form.value.name,
        comment: form.value.comment
      })
      
      $q.notify({
        color: 'positive',
        message: 'Организация создана',
        icon: 'add_circle',
        position: 'top-right'
      })
    }
    
    // Закрыть диалог и обновить список
    dialogOpened.value = false
    await loadOrganizations()
    
  } catch (error: any) {
    // Обработка ошибки
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при сохранении',
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    isSubmitting.value = false
  }
}

// === Удаление ===

// Открыт ли диалог удаления
const deleteDialogOpened = ref(false)

// Организация для удаления
const organizationToDelete = ref<any>(null)

// Загрузка при удалении
const isDeleting = ref(false)

// Подтвердить удаление
function confirmDelete(organization: any) {
  organizationToDelete.value = organization
  deleteDialogOpened.value = true
}

// Обработка удаления
async function handleDelete() {
  if (!organizationToDelete.value) return
  
  isDeleting.value = true
  
  try {
    // Мягкое удаление
    await api.delete(`/organizations/${organizationToDelete.value.id}`)
    
    $q.notify({
      color: 'positive',
      message: 'Организация удалена',
      icon: 'delete',
      position: 'top-right'
    })
    
    // Обновить список
    await loadOrganizations()
    
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при удалении',
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    isDeleting.value = false
    deleteDialogOpened.value = false
    organizationToDelete.value = null
  }
}

// === Загрузка данных ===

// Загрузить список организаций с бэкенда
async function loadOrganizations() {
  isLoading.value = true
  
  try {
    const response = await api.get('/organizations')
    organizations.value = response.data
    pagination.value.rowsNumber = response.data.length
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: 'Не удалось загрузить организации',
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    isLoading.value = false
  }
}

// Загрузить данные при монтировании компонента
onMounted(() => {
  loadOrganizations()
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
  
  // Стили заголовка таблицы
  thead tr
    background-color: $primary
    
  th
    color: white !important
    font-weight: 600
    
  // Стили ячеек
  td
    border-color: $gray-saturated
    
  // Стили при наведении
  tbody tr:hover
    background-color: $gray-light !important
</style>