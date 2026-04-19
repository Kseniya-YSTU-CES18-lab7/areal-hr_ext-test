// Файл импортируется в: OrganizationsPage.vue, DepartmentsPage.vue, PositionsPage.vue, etc.

import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

// === ХЕЛПЕР: очистка от служебных свойств Vue ===
function cleanVueReactive<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj
  
  const cleaned: any = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    // Пропускаем служебные свойства Vue
    if (key === 'isTrusted' || key === '_vts' || key === '__v_isRef' || key === '__v_isShallow') {
      continue
    }
    cleaned[key] = cleanVueReactive((obj as any)[key])
  }
  
  return cleaned
}

/**
 * Интерфейс для базовой сущности
 */
export interface BaseEntity {
  id: number | string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

/**
 * Интерфейс для сущности с именем (Organization, Department, Position)
 */
export interface NamedEntity extends BaseEntity {
  name: string
}

/**
 * Интерфейс для сущности сотрудника
 */
export interface EmployeeEntity extends BaseEntity {
  surname: string
  firstName: string
  patronymic?: string | null
}

/**
 * Интерфейс для сервисного слоя
 */
export interface CrudService<T, CreateDto, UpdateDto> {
  getAll: (params?: any, page?: number, limit?: number) => Promise<{ data: T[]; total: number; page: number; limit: number }>
  getById: (id: number | string) => Promise<T>
  create: (dto: CreateDto) => Promise<T>
  update: (id: number | string, dto: UpdateDto) => Promise<T>
  delete: (id: number | string) => Promise<void>
  restore?: (id: number | string) => Promise<void>
}

/**
 * Опции для composable
 */
export interface UseCrudPageOptions<T, CreateDto, UpdateDto> {
  service: CrudService<T, CreateDto, UpdateDto>
  entityName: string
  defaultForm?: Partial<T>
  onLoad?: (items: T[]) => void
  onCreate?: (item: T) => void
  onUpdate?: (item: T) => void
  onDelete?: (id: number | string) => void
}

/**
 * Composable для общих CRUD-операций на странице
 */
export function useCrudPage<T extends BaseEntity, CreateDto, UpdateDto>(
  options: UseCrudPageOptions<T, CreateDto, UpdateDto>
) {
  const $q = useQuasar()
  const { service, entityName, defaultForm = {} } = options

  const items = ref<T[]>([])
  const isLoading = ref(false)
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  })

  const dialogOpened = ref(false)
  const isEditing = ref(false)
  const isSubmitting = ref(false)
  const form = ref<Partial<T>>({ ...(defaultForm as Partial<T>) })

  const deleteDialogOpened = ref(false)
  const itemToDelete = ref<T | null>(null)
  const isDeleting = ref(false)

  const searchQuery = ref('')

  // Фильтрация с проверкой наличия полей
  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value
    const query = searchQuery.value.toLowerCase()
    return items.value.filter((item) => {
      const itemAny = item as any
      const name = itemAny.name || 
                   `${itemAny.surname || ''} ${itemAny.firstName || ''}` ||
                   itemAny.title ||
                   ''
      return name.toLowerCase().includes(query)
    })
  })

  async function loadItems(params?: Record<string, any>) {
    isLoading.value = true
    try {
      const result = await service.getAll(
        { ...params, search: searchQuery.value || undefined },
        pagination.value.page,
        pagination.value.rowsPerPage
      )
      items.value = result.data
      pagination.value.rowsNumber = result.total
      
      options.onLoad?.(result.data)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      $q.notify({
        color: 'negative',
        message: err.response?.data?.message || `Не удалось загрузить ${entityName.toLowerCase()}`,
        icon: 'error',
        position: 'top-right',
      })
    } finally {
      isLoading.value = false
    }
  }

  function openCreateDialog(initialData?: Partial<T>) {
    isEditing.value = false
    form.value = { ...(defaultForm as Partial<T>), ...(initialData || {}) }
    dialogOpened.value = true
  }

  function openEditDialog(item: T) {
    isEditing.value = true
    form.value = { ...item }
    dialogOpened.value = true
  }

  function closeDialog() {
    dialogOpened.value = false
    form.value = { ...(defaultForm as Partial<T>) }
  }

  async function handleSubmit(validateFn?: () => boolean) {
  // Безопасная проверка валидации
  if (validateFn && typeof validateFn === 'function') {
    try {
      const isValid = validateFn()
      if (!isValid) {
        $q.notify({
          color: 'warning',
          message: 'Проверьте заполнение формы',
          icon: 'warning',
          position: 'top-right'
        })
        return
      }
    } catch (err) {
      console.warn('Validation error:', err)
    }
  }

  isSubmitting.value = true
  try {
    const dto = cleanVueReactive({ ...form.value }) as unknown as (CreateDto | UpdateDto)
    
    if (isEditing.value) {
      const id = (form.value as any).id
      if (!id) throw new Error('ID не указан')
      await service.update(id, dto as UpdateDto)
      $q.notify({
        color: 'positive',
        message: `${entityName} обновлена`,
        icon: 'check_circle',
        position: 'top-right',
      })
      options.onUpdate?.(await service.getById(id))
      } else {
        await service.create(dto as CreateDto)
        await loadItems()
        $q.notify({
          color: 'positive',
          message: `${entityName} создана`,
          icon: 'add_circle',
          position: 'top-right',
        })
        options.onCreate?.(items.value as any)
      }

      dialogOpened.value = false
      form.value = { ...(defaultForm as Partial<T>) }
    
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || `Ошибка при сохранении`
    $q.notify({
      color: 'negative',
      message,
      icon: 'error',
      position: 'top-right',
    })
  } finally {
    isSubmitting.value = false
  }
}

  function confirmDelete(item: T) {
    itemToDelete.value = item
    deleteDialogOpened.value = true
  }

  async function handleDelete() {
    if (!itemToDelete.value) return
    
    isDeleting.value = true
    try {
      const id = (itemToDelete.value as any).id
      if (!id) throw new Error('ID не указан')
      await service.delete(id)
      $q.notify({
        color: 'positive',
        message: `${entityName} удалена`,
        icon: 'delete',
        position: 'top-right',
      })
      options.onDelete?.(id)
      await loadItems()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Ошибка при удалении'
      $q.notify({
        color: 'negative',
        message,
        icon: 'error',
        position: 'top-right',
      })
    } finally {
      isDeleting.value = false
      deleteDialogOpened.value = false
      itemToDelete.value = null
    }
  }

  function onSearch() {
    pagination.value.page = 1
    loadItems()
  }

  function clearSearch() {
    searchQuery.value = ''
    loadItems()
  }

  function onRequestPagination(props: { pagination: { page: number; rowsPerPage: number } }) {
    pagination.value.page = props.pagination.page
    pagination.value.rowsPerPage = props.pagination.rowsPerPage
    loadItems()
  }

  return {
    items,
    filteredItems,
    isLoading,
    pagination,
    loadItems,
    onRequestPagination,
    
    searchQuery,
    onSearch,
    clearSearch,
    
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
  }
}