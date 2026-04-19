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
          @update:model-value="onSearch"
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
        :rows="positions"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        :pagination="pagination"
        @update:model-value="onRequestPagination"
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
          <q-form @submit="handleSubmitOverride" class="q-gutter-md">
            
            <!-- Поле: Название должности (используем nameRules + кастомная проверка) -->
            <q-input
              v-model="form.name"
              label="Название должности *"
              outlined
              :rules="[
                ...nameRules,
                val => !isDuplicateName(val) || 'Должность с таким названием уже существует'
              ]"
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
            Вы действительно хотите удалить должность "{{ itemToDelete?.name }}"?
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
import { computed, onMounted } from 'vue'
import { useCrudPage } from 'src/composables/useCrudPage'
import { positionsService } from 'src/services/positions'
import type { Position, PositionCreateDto, PositionUpdateDto } from 'src/types/models'
import { nameRules } from 'src/utils/validationRules'

// === Используем composable ===
const {
  items: positions,
  isLoading,
  pagination,
  loadItems,
  onRequestPagination,
  searchQuery,
  dialogOpened,
  isEditing,
  isSubmitting,
  form,
  openCreateDialog,
  openEditDialog,
  closeDialog,
  handleSubmit,
  deleteDialogOpened,
  itemToDelete,
  isDeleting,
  confirmDelete,
  handleDelete,
} = useCrudPage<Position, PositionCreateDto, PositionUpdateDto>({
  service: positionsService,
  entityName: 'Должность',
  defaultForm: { name: '' },
})

// === Колонки таблицы ===
const columns = [
  { name: 'name', required: true, label: 'Название должности', align: 'left', field: 'name', sortable: true },
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
  { name: 'actions', label: 'Действия', align: 'right', field: 'actions', sortable: false },
]

// positions.value уже содержит отфильтрованные данные с бэкенда
// filteredPositions больше не нужен — используем positions напрямую

// === Проверка на дубликат названия (локальная валидация) ===
function isDuplicateName(name: string): boolean {
  if (!name) return false
  return positions.value.some((pos: Position) => 
    pos.name?.toLowerCase() === name.toLowerCase() && 
    (!isEditing.value || (pos.id as number) !== (form.value as any).id) &&
    !pos.deletedAt
  )
}

// === Переопределяем handleSubmit для проверки дубликата ===
async function handleSubmitOverride() {
  if (isDuplicateName((form.value as any).name)) {
    return
  }
  await handleSubmit()
}

// Такой поиск (чтобы не спамить запросами)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadItems({ search: searchQuery.value || undefined })
  }, 300)
}

// === Загружаем данные при монтировании ===
onMounted(() => {
  loadItems()
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