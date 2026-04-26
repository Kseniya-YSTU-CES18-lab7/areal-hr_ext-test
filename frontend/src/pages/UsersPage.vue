<!-- frontend/src/pages/UsersPage.vue -->
<template>
  <q-page class="q-pa-md">
    
    <!-- Заголовок -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-dark">Управление пользователями</div>
      </div>
      <div class="col-auto">
        <q-btn 
          label="Создать пользователя" 
          color="primary" 
          icon="add"
          @click="openCreateDialog"
          v-if="isAdmin"
        />
      </div>
    </div>

    <!-- Поиск -->
    <q-card class="q-mb-md bg-secondary">
      <q-card-section>
        <q-input
          v-model="searchQuery"
          label="Поиск по логину или фамилии"
          outlined
          dense
          clearable
          @update:model-value="onSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- Таблица пользователей -->
    <q-card class="bg-secondary">
      <q-table
        :rows="users || []"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        :pagination="pagination"
        @request="onRequestPagination"
        dense
        class="text-dark"
      >
        <!-- Роль -->
        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'admin' ? 'negative' : 'info'">
              {{ props.value === 'admin' ? 'Администратор' : 'Менеджер' }}
            </q-badge>
          </q-td>
        </template>

        <!-- Действия -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-xs">
              <q-btn
                v-if="isAdmin"
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
                v-if="isAdmin"
                flat
                dense
                round
                :icon="props.row.deletedAt ? 'restore' : 'delete'"
                :color="props.row.deletedAt ? 'positive' : 'negative'"
                @click="props.row.deletedAt ? restoreUser(props.row) : confirmDelete(props.row)"
              >
                <q-tooltip>{{ props.row.deletedAt ? 'Восстановить' : 'Удалить' }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Нет данных -->
        <template v-slot:no-data>
          <div class="full-width row flex flex-center q-gutter-sm">
            <q-icon name="warning" color="warning" size="2em" />
            <span>Пользователи не найдены</span>
          </div>
        </template>

        <!-- Загрузка -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- Диалог создания/редактирования -->
    <q-dialog v-model="dialogOpened" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Редактировать' : 'Создать' }} пользователя</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            
            <q-input
              v-model="form.surname"
              label="Фамилия *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
            
            <q-input
              v-model="form.firstName"
              label="Имя *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
            
            <q-input
              v-model="form.patronymic"
              label="Отчество"
              outlined
            />
            
            <q-input
              v-model="form.login"
              label="Логин *"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
            
            <q-input
              v-model="form.password"
              label="Пароль"
              type="password"
              outlined
              :rules="isEditing ? [] : [val => !!val || 'Обязательное поле']"
              :hint="isEditing ? 'Оставьте пустым, чтобы не менять' : ''"
            />
            
            <q-select
              v-model="form.role"
              label="Роль *"
              :options="roleOptions"
              outlined
              :rules="[val => !!val || 'Обязательное поле']"
            />
            
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn 
                label="Отмена" 
                color="grey-7" 
                text-color="white"
                @click="dialogOpened = false"
              />
              <q-btn 
                type="submit" 
                :label="isEditing ? 'Сохранить' : 'Создать'" 
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
            Вы действительно хотите удалить пользователя "{{ userToDelete?.firstName }} {{ userToDelete?.surname }}"?
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
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { authService } from 'src/services/auth'

interface User {
  id: string
  surname: string
  firstName: string
  patronymic: string | null
  login: string
  role: 'admin' | 'manager'
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

const $q = useQuasar()

// === Состояние ===
const users = ref<User[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const dialogOpened = ref(false)
const isEditing = ref(false)
const deleteDialogOpened = ref(false)
const userToDelete = ref<User | null>(null)

const form = ref({
  id: '',
  surname: '',
  firstName: '',
  patronymic: '',
  login: '',
  password: '',
  role: 'manager' as 'admin' | 'manager'
})

const roleOptions = [
  { label: 'Администратор', value: 'admin' },
  { label: 'Менеджер', value: 'manager' }
]

// === Проверка роли админа ===
const isAdmin = computed(() => authService.isAdmin())

// === Колонки таблицы ===
const columns = [
  { name: 'surname', label: 'Фамилия', align: 'left', field: 'surname', sortable: true },
  { name: 'firstName', label: 'Имя', align: 'left', field: 'firstName', sortable: true },
  { name: 'login', label: 'Логин', align: 'left', field: 'login', sortable: true },
  { name: 'role', label: 'Роль', align: 'left', field: 'role', sortable: true },
  { name: 'createdAt', label: 'Создан', align: 'left', field: 'createdAt', sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString('ru-RU') },
  { name: 'actions', label: 'Действия', align: 'right', field: 'actions', sortable: false },
]

// === Загрузка пользователей ===
async function loadUsers() {
  isLoading.value = true
  try {
    const response = await api.get('/users', {
      params: {
        search: searchQuery.value || undefined,
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage
      }
    })
    users.value = response.data.data || []
    pagination.value.rowsNumber = response.data.total || 0
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Не удалось загрузить пользователей',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function onSearch() {
  pagination.value.page = 1
  loadUsers()
}

function onRequestPagination(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  loadUsers()
}

// === Диалоги ===
function openCreateDialog() {
  isEditing.value = false
  form.value = {
    id: '',
    surname: '',
    firstName: '',
    patronymic: '',
    login: '',
    password: '',
    role: 'manager'
  }
  dialogOpened.value = true
}

function openEditDialog(user: User) {
  isEditing.value = true
  form.value = {
    id: user.id,
    surname: user.surname,
    firstName: user.firstName,
    patronymic: user.patronymic || '',
    login: user.login,
    password: '',
    role: user.role
  }
  dialogOpened.value = true
}

function confirmDelete(user: User) {
  userToDelete.value = user
  deleteDialogOpened.value = true
}

// === CRUD операции ===
async function handleSubmit() {
  isSubmitting.value = true
  try {
    const payload = {
      surname: form.value.surname,
      firstName: form.value.firstName,
      patronymic: form.value.patronymic || null,
      login: form.value.login,
      role: form.value.role,
      ...(form.value.password && { password: form.value.password })
    }

    if (isEditing.value && form.value.id) {
      await api.patch(`/users/${form.value.id}`, payload)
      $q.notify({ color: 'positive', message: 'Пользователь обновлён', icon: 'check_circle' })
    } else {
      await api.post('/users', payload)
      $q.notify({ color: 'positive', message: 'Пользователь создан', icon: 'add_circle' })
    }
    
    dialogOpened.value = false
    loadUsers()
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

async function handleDelete() {
  if (!userToDelete.value) return
  isDeleting.value = true
  try {
    await api.delete(`/users/${userToDelete.value.id}`)
    $q.notify({ color: 'positive', message: 'Пользователь удалён', icon: 'delete' })
    loadUsers()
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при удалении',
      icon: 'error'
    })
  } finally {
    isDeleting.value = false
    deleteDialogOpened.value = false
    userToDelete.value = null
  }
}

async function restoreUser(user: User) {
  try {
    await api.post(`/users/${user.id}/restore`)
    $q.notify({ color: 'positive', message: 'Пользователь восстановлен', icon: 'restore' })
    loadUsers()
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Ошибка при восстановлении',
      icon: 'error'
    })
  }
}

onMounted(() => {
  // Проверка прав доступа
  if (!authService.isAdmin()) {
    $q.notify({
      color: 'warning',
      message: 'Доступ запрещён. Только для администраторов.',
      icon: 'warning'
    })
    // Можно сделать редирект: router.push('/organizations')
  }
  loadUsers()
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