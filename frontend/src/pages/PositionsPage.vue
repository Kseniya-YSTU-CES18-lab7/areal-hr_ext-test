<template>
  <!-- QPage: контейнер страницы с отступами -->
  <q-page class="q-pa-md">
    
    <!-- Заголовок страницы -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-dark">Должности</div>
      </div>
      <div class="col-auto">
        <!-- Кнопка создания должности -->
        <q-btn 
          label="Создать должность" 
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

    <!-- Таблица должностей -->
    <q-card class="bg-secondary">
      <q-table
        :rows="filteredPositions"
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
            <span>Должности не найдены</span>
          </div>
        </template>

        <!-- Сообщение при загрузке -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- Диалог создания/редактирования должности -->
    <q-dialog v-model="dialogOpened" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Редактировать' : 'Создать' }} должность</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            
            <!-- Поле: Название должности -->
            <q-input
              v-model="form.name"
              label="Название должности *"
              outlined
              :rules="[
                val => !!val || 'Название обязательно',
                val => val.length >= 3 || 'Минимум 3 символа',
                val => !isDuplicateName(val) || 'Должность с таким названием уже существует'
              ]"
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
            Вы действительно хотите удалить должность "{{ positionToDelete?.name }}"?
            <br><br>
            <span class="text-caption text-grey-7">
              Это мягкое удаление — данные можно будет восстановить.
              <br>
              <strong>Внимание:</strong> если должность используется в кадровых операциях, 
              она не будет полностью удалена, а только помечена как неактивная.
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

// Получаем экземпляр Quasar для уведомлений
const $q = useQuasar()

// === Состояние таблицы ===

// Колонки таблицы
const columns = [
  { 
    name: 'name', 
    required: true, 
    label: 'Название должности', 
    align: 'left',
    field: 'name',
    sortable: true 
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
    name: 'updatedAt', 
    label: 'Обновлена', 
    align: 'left',
    field: 'updatedAt',
    sortable: true,
    format: (val: string) => val ? new Date(val).toLocaleDateString('ru-RU') : '-'
  },
  { 
    name: 'actions', 
    label: 'Действия', 
    align: 'right',
    field: 'actions',
    sortable: false 
  },
]

// Данные должностей
const positions = ref<any[]>([])

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

// Фильтрованные должности (поиск по названию)
const filteredPositions = computed(() => {
  if (!searchQuery.value) return positions.value
  
  const query = searchQuery.value.toLowerCase()
  return positions.value.filter((pos: any) => 
    pos.name?.toLowerCase().includes(query)
  )
})

// === Проверка на дубликат названия ===

function isDuplicateName(name: string): boolean {
  if (!name) return false
  
  return positions.value.some((pos: any) => 
    pos.name?.toLowerCase() === name.toLowerCase() && 
    (!isEditing.value || pos.id !== form.value.id) &&
    !pos.deletedAt
  )
}

// === Диалог создания/редактирования ===

// Открыт ли диалог
const dialogOpened = ref(false)

// Режим редактирования (true) или создания (false)
const isEditing = ref(false)

// Загрузка при отправке формы
const isSubmitting = ref(false)

// Данные формы
const form = ref({
  id: null as number | null,
  name: ''
})

// Открыть диалог создания
function openCreateDialog() {
  isEditing.value = false
  form.value = { id: null, name: '' }
  dialogOpened.value = true
}

// Открыть диалог редактирования
function openEditDialog(position: any) {
  isEditing.value = true
  form.value = {
    id: position.id,
    name: position.name
  }
  dialogOpened.value = true
}

// Обработка отправки формы
async function handleSubmit() {
  // Проверка на дубликат перед отправкой
  if (isDuplicateName(form.value.name)) {
    $q.notify({
      color: 'negative',
      message: 'Должность с таким названием уже существует',
      icon: 'error',
      position: 'top-right'
    })
    return
  }
  
  isSubmitting.value = true
  
  try {
    if (isEditing.value) {
      // Редактирование
      await api.patch(`/positions/${form.value.id}`, {
        name: form.value.name
      })
      
      $q.notify({
        color: 'positive',
        message: 'Должность обновлена',
        icon: 'check_circle',
        position: 'top-right'
      })
    } else {
      // Создание
      await api.post('/positions', {
        name: form.value.name
      })
      
      $q.notify({
        color: 'positive',
        message: 'Должность создана',
        icon: 'add_circle',
        position: 'top-right'
      })
    }
    
    // Закрыть диалог и обновить список
    dialogOpened.value = false
    await loadPositions()
    
  } catch (error: any) {
    // Обработка ошибки (включая 409 Conflict при дубликате)
    const message = error.response?.status === 409 
      ? 'Должность с таким названием уже существует' 
      : error.response?.data?.message || 'Ошибка при сохранении'
    
    $q.notify({
      color: 'negative',
      message: message,
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

// Должность для удаления
const positionToDelete = ref<any>(null)

// Загрузка при удалении
const isDeleting = ref(false)

// Подтвердить удаление
function confirmDelete(position: any) {
  positionToDelete.value = position
  deleteDialogOpened.value = true
}

// Обработка удаления
async function handleDelete() {
  if (!positionToDelete.value) return
  
  isDeleting.value = true
  
  try {
    // Мягкое удаление
    await api.delete(`/positions/${positionToDelete.value.id}`)
    
    $q.notify({
      color: 'positive',
      message: 'Должность удалена',
      icon: 'delete',
      position: 'top-right'
    })
    
    // Обновить список
    await loadPositions()
    
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
    positionToDelete.value = null
  }
}

// === Загрузка данных ===

// Загрузить список должностей с бэкенда
async function loadPositions() {
  isLoading.value = true
  
  try {
    const response = await api.get('/positions')
    positions.value = response.data
    pagination.value.rowsNumber = response.data.length
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: 'Не удалось загрузить должности',
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    isLoading.value = false
  }
}

// Загрузить данные при монтировании компонента
onMounted(() => {
  loadPositions()
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