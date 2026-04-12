<template>
  <!-- QPage: контейнер страницы с отступами -->
  <q-page class="q-pa-md">
    
    <!-- Заголовок страницы -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-dark">Отделы</div>
      </div>
      <div class="col-auto">
        <!-- Кнопка создания отдела -->
        <q-btn 
          label="Создать отдел" 
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

    <!-- Дерево отделов (QTree) -->
    <q-card class="bg-secondary">
      <q-card-section>
        <q-tree
          :nodes="filteredDepartments"
          node-key="id"
          label-key="name"
          default-expand-all
          :filter="searchQuery"
          :filter-method="filterDepartments"
          class="text-dark"
        >
          <!-- Кастомный шаблон для узла дерева -->
          <template v-slot:default-header="prop">
            <div class="row items-center q-gutter-xs">
              <span>{{ prop.node.name }}</span>
              <q-badge 
                v-if="prop.node.comment" 
                color="grey-4" 
                text-color="dark"
                class="q-ml-xs"
              >
                {{ prop.node.comment }}
              </q-badge>
            </div>
          </template>
          
          <!-- Кнопки действий для каждого узла -->
          <template v-slot:body="prop">
            <div class="row items-center q-gutter-xs q-mt-xs">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                size="sm"
                @click.stop="openEditDialog(prop.node)"
              >
                <q-tooltip>Редактировать</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click.stop="confirmDelete(prop.node)"
              >
                <q-tooltip>Удалить</q-tooltip>
              </q-btn>
            </div>
          </template>
        </q-tree>
      </q-card-section>
    </q-card>

    <!-- Диалог создания/редактирования отдела -->
    <q-dialog v-model="dialogOpened" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Редактировать' : 'Создать' }} отдел</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
            
            <!-- Поле: Название -->
            <q-input
              v-model="form.name"
              label="Название отдела *"
              outlined
              :rules="[
                val => !!val || 'Название обязательно',
                val => val.length >= 3 || 'Минимум 3 символа'
              ]"
            />
            
            <!-- ПОЛЕ: Организация (ОБЯЗАТЕЛЬНОЕ) -->
            <q-select
              v-model="form.organizationId"
              :options="organizations"
              label="Организация *"
              outlined
              option-label="name"
              option-value="id"
              emit-value
              map-options
              :rules="[val => !!val || 'Выберите организацию']"
              :disable="isEditing"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="primary" />
              </template>
            </q-select>
            
            <!-- Поле: Родительский отдел (только отделы ТЕКУЩЕЙ организации) -->
            <q-select
              v-model="form.parentId"
              :options="parentDepartmentOptions"
              label="Родительский отдел"
              outlined
              clearable
              option-label="name"
              option-value="id"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="account_tree" color="primary" />
              </template>
            </q-select>
            
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
            Вы действительно хотите удалить отдел "{{ departmentToDelete?.name }}"?
            <br><br>
            <span class="text-caption text-grey-7">
              Это мягкое удаление — данные можно будет восстановить.
              <br>
              <strong>Внимание:</strong> при удалении родительского отдела, 
              дочерние отделы останутся, но потеряют связь с родителем.
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

// === Данные организаций (для выбора в форме отдела) ===
const organizations = ref<any[]>([])

// Загрузить список организаций
async function loadOrganizations() {
  try {
    const response = await api.get('/organizations')
    organizations.value = response.data
  } catch (error: any) {
    console.error('Failed to load organizations:', error)
  }
}

// Получаем экземпляр Quasar для уведомлений
const $q = useQuasar()

// === Данные отделов ===

// Все отделы (плоский список от бэкенда)
const departments = ref<any[]>([])

// Загрузка данных
const isLoading = ref(false)

// === Поиск ===

// Поисковый запрос
const searchQuery = ref('')

// Функция фильтрации для QTree
function filterDepartments(node: any, filter: string) {
  if (!filter) return true
  const lowerFilter = filter.toLowerCase()
  return node.name?.toLowerCase().includes(lowerFilter) || 
         node.comment?.toLowerCase().includes(lowerFilter)
}

// Фильтрованные отделы (для отображения)
const filteredDepartments = computed(() => {
  return buildDepartmentTree(departments.value)
})

// === Построение дерева из плоского списка ===

function buildDepartmentTree(departmentsList: any[], parentId: number | null = null): any[] {
  return departmentsList
    .filter((dept: any) => dept.parentId === parentId && !dept.deletedAt)
    .map((dept: any) => ({
      ...dept,
      children: buildDepartmentTree(departmentsList, dept.id),
      expandable: buildDepartmentTree(departmentsList, dept.id).length > 0
    }))
}

// === Опции для выбора родительского отдела (только для ТЕКУЩЕЙ организации) ===

const parentDepartmentOptions = computed(() => {
  if (!form.value.organizationId) return []
  
  return departments.value.filter((dept: any) => 
    !dept.deletedAt && 
    dept.organizationId === form.value.organizationId && // ← ТОЛЬКО отделы текущей организации
    (!isEditing.value || dept.id !== form.value.id)
  )
})

// === Диалог создания/редактирования ===

// Открыт ли диалог
const dialogOpened = ref(false)

// Режим редактирования
const isEditing = ref(false)

// Загрузка при отправке
const isSubmitting = ref(false)

// Данные формы
const form = ref({
  id: null as number | null,
  name: '',
  organizationId: null as number | null,
  parentId: null as number | null,
  comment: ''
})

// Открыть диалог создания
function openCreateDialog(parentId?: number | null, organizationId?: number | null) {
  isEditing.value = false
  form.value = { 
    id: null, 
    name: '', 
    organizationId: organizationId ?? organizations.value[0]?.id ?? null,
    parentId: parentId ?? null, 
    comment: '' 
  }
  dialogOpened.value = true
}

// Открыть диалог редактирования
function openEditDialog(department: any) {
  isEditing.value = true
  form.value = {
    id: department.id,
    name: department.name,
    organizationId: department.organizationId,
    parentId: department.parentId,
    comment: department.comment || ''
  }
  dialogOpened.value = true
}

// Обработка отправки формы
async function handleSubmit() {
  isSubmitting.value = true
  
  try {
    if (isEditing.value) {
      // === РЕДАКТИРОВАНИЕ (organizationId не меняем) ===
      const payload: any = {
        name: form.value.name,
        comment: form.value.comment
      }
      if (form.value.parentId !== undefined && form.value.parentId !== null) {
        payload.parentId = form.value.parentId
      }
      await api.patch(`/departments/${form.value.id}`, payload)
      
      $q.notify({
        color: 'positive',
        message: 'Отдел обновлён',
        icon: 'check_circle',
        position: 'top-right'
      })
    } else {
      // === СОЗДАНИЕ (organizationId ОБЯЗАТЕЛЬНО) ===
      const payload: any = {
        name: form.value.name,
        organizationId: form.value.organizationId, // ← ОБЯЗАТЕЛЬНОЕ ПОЛЕ
        comment: form.value.comment
      }
      if (form.value.parentId !== undefined && form.value.parentId !== null) {
        payload.parentId = form.value.parentId
      }
      await api.post('/departments', payload)
      
      $q.notify({
        color: 'positive',
        message: 'Отдел создан',
        icon: 'add_circle',
        position: 'top-right'
      })
    }
    
    dialogOpened.value = false
    await loadDepartments()
    
  } catch (error: any) {
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

// Диалог удаления
const deleteDialogOpened = ref(false)
const departmentToDelete = ref<any>(null)
const isDeleting = ref(false)

function confirmDelete(department: any) {
  departmentToDelete.value = department
  deleteDialogOpened.value = true
}

async function handleDelete() {
  if (!departmentToDelete.value) return
  
  isDeleting.value = true
  
  try {
    await api.delete(`/departments/${departmentToDelete.value.id}`)
    
    $q.notify({
      color: 'positive',
      message: 'Отдел удалён',
      icon: 'delete',
      position: 'top-right'
    })
    
    await loadDepartments()
    
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
    departmentToDelete.value = null
  }
}

// === Загрузка данных ===

async function loadDepartments() {
  isLoading.value = true
  
  try {
    const response = await api.get('/departments')
    // Убеждаемся, что organizationId есть в ответе
    departments.value = response.data.map((dept: any) => ({
      ...dept,
      organizationId: dept.organizationId ?? dept.organization_id
    }))
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: 'Не удалось загрузить отделы',
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    isLoading.value = false
  }
}

// Загрузить при монтировании
onMounted(() => {
  loadOrganizations()
  loadDepartments()
})
</script>

<style lang="sass" scoped>
// Используем переменные из quasar-variables.sass

// Заголовок
.text-h5
  color: $dark

// Дерево отделов
:deep(.q-tree__node-header)
  padding: 8px 12px
  border-radius: 4px
  
  &:hover
    background-color: $gray-light

:deep(.q-tree__node-body)
  padding-left: 24px

// Бейдж комментария
:deep(.q-badge)
  font-size: 0.75rem
</style>