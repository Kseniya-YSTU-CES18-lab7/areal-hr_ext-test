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
          @update:model-value="onSearch"
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
          :nodes="filteredDepartmentsTree"
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
            
            <!-- Поле: Название (используем nameRules) -->
            <q-input
              v-model="form.name"
              label="Название отдела *"
              outlined
              :rules="nameRules"
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
            
            <!-- Поле: Комментарий (используем commentRules) -->
            <q-input
              v-model="form.comment"
              label="Комментарий"
              outlined
              type="textarea"
              autogrow
              :rules="commentRules"
            />
            
            <!-- Кнопки формы -->
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn 
                label="Отмена" 
                color="grey-7" 
                text-color="white"
                @click="closeDialog"
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
            Вы действительно хотите удалить отдел "{{ itemToDelete?.name }}"?
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
import { computed, onMounted, ref } from 'vue'
import { useCrudPage } from 'src/composables/useCrudPage'
import { departmentsService } from 'src/services/departments'
import type { Department, DepartmentCreateDto, DepartmentUpdateDto } from 'src/types/models'
import { nameRules, commentRules } from 'src/utils/validationRules'

// === Список организаций для выбора (TODO: загрузить из API) ===
const organizations = ref<{ id: number; name: string }[]>([
  { id: 1, name: 'ООО "Ромашка"' },
  { id: 2, name: 'АО "Луч"' },
])

// === Используем composable ===
const {
  items: departments,
  isLoading,
  loadItems,
  searchQuery,
  dialogOpened,
  isEditing,
  isSubmitting,
  form,
  openCreateDialog,
  closeDialog,
  handleSubmit,
  deleteDialogOpened,
  itemToDelete,
  isDeleting,
  confirmDelete,
  handleDelete,
} = useCrudPage<Department, DepartmentCreateDto, DepartmentUpdateDto>({
  service: departmentsService,
  entityName: 'Отдел',
  defaultForm: { name: '', organizationId: 1, parentId: null, comment: '' },
})

// Функция фильтрации для QTree
function filterDepartments(node: Department, filter: string) {
  return true  // Сервер уже отфильтровал данные
}

// === Построение дерева из плоского списка ===
const filteredDepartmentsTree = computed(() => {
  return buildDepartmentTree(departments.value)
})

function buildDepartmentTree(departmentsList: Department[], parentId: number | null = null): any[] {
  return departmentsList
    .filter((dept: Department) => dept.parentId === parentId && !dept.deletedAt)
    .map((dept: Department) => ({
      ...dept,
      children: buildDepartmentTree(departmentsList, dept.id),
      expandable: buildDepartmentTree(departmentsList, dept.id).length > 0
    }))
}

// === Опции для выбора родительского отдела ===
const parentDepartmentOptions = computed(() => {
  return departments.value.filter((dept: Department) => 
    !dept.deletedAt && 
    (!isEditing.value || (dept.id as number) !== (form.value as any).id)
  )
})

// === Переопределяем openEditDialog для установки organizationId ===
function openEditDialog(department: Department) {
  isEditing.value = true
  form.value = {
    ...department,
    organizationId: department.organizationId,
  } as any
  dialogOpened.value = true
}

// Такой поиск (чтобы не спамить запросами)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadItems({ organizationId: 1, search: searchQuery.value || undefined })  // organizationId
  }, 300)
}

// === Загружаем данные при монтировании ===
onMounted(() => {
  loadItems({ organizationId: 1 })
})
</script>

<style lang="sass" scoped>
.text-h5
  color: $dark

:deep(.q-tree__node-header)
  padding: 8px 12px
  border-radius: 4px
  
  &:hover
    background-color: $gray-light

:deep(.q-tree__node-body)
  padding-left: 24px

:deep(.q-badge)
  font-size: 0.75rem
</style>