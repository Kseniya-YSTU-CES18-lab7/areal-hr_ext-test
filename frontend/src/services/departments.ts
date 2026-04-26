// Импортируем базовый API-клиент и типы
import { api } from '../boot/axios'
import { 
  Department, 
  DepartmentCreateDto, 
  DepartmentUpdateDto 
} from '../types/models'

/**
 * Сервис для работы с отделами
 * Включая метод для получения дерева отделов
 */
export const departmentsService = {
  /**
   * Получить список отделов с пагинацией и фильтрами
   */
  async getAll(
    params?: { organizationId?: number; search?: string },
    page = 1,
    limit = 20
  ): Promise<{ data: Department[]; total: number; page: number; limit: number }> {
    // Формируем плоский объект параметров вручную
    const queryParams: Record<string, any> = {}
    
    if (params?.organizationId !== undefined && params?.organizationId !== null) {
      queryParams.organizationId = params.organizationId
    }
    if (params?.search) {
      queryParams.search = params.search
    }
    if (page) queryParams.page = page
    if (limit) queryParams.limit = limit
    
    const response = await api.get('/departments', { params: queryParams })
    return response.data
  },

  /**
   * Получить дерево отделов для организации
   */
  async getTree(organizationId: number): Promise<Department[]> {
    const response = await api.get('/departments/tree', {
      params: { organizationId }
    })
    return response.data
  },

  /**
   * Получить отдел по ID
   */
  async getById(id: number): Promise<Department> {
    const response = await api.get(`/departments/${id}`)
    return response.data
  },

  /**
   * Создать отдел
   */
  async create(dto: DepartmentCreateDto): Promise<Department> {
    const response = await api.post('/departments', dto)
    return response.data
  },

  /**
   * Обновить отдел
   */
  async update(id: number, dto: DepartmentUpdateDto): Promise<Department> {
    const response = await api.patch(`/departments/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление отдела
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/departments/${id}`)
  },

  /**
   * Восстановить удалённый отдел
   */
  async restore(id: number): Promise<void> {
    await api.post(`/departments/${id}/restore`)
  }
}

export default departmentsService