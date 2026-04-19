// Импортируем базовый API-клиент и типы
import { api } from './api'
import { 
  HrOperation, 
  HrOperationCreateDto, 
  HrOperationUpdateDto 
} from '../types/models'

/**
 * Сервис для работы с кадровыми операциями
 * Типы операций: hire, change_salary, change_department, dismissal
 */
export const hrOperationsService = {
  /**
   * Получить список операций с пагинацией
   */
  async getAll(
    page = 1,
    limit = 20
  ): Promise<{ data: HrOperation[]; total: number; page: number; limit: number }> {
    const response = await api.get('/hr-operations', {
      params: { page, limit }
    })
    return response.data
  },

  /**
   * Получить все операции сотрудника
   */
  async getByEmployeeId(employeeId: string): Promise<HrOperation[]> {
    const response = await api.get(`/hr-operations/by-employee/${employeeId}`)
    return response.data
  },

  /**
   * Получить операцию по ID
   */
  async getById(id: number): Promise<HrOperation> {
    const response = await api.get(`/hr-operations/${id}`)
    return response.data
  },

  /**
   * Создать кадровую операцию
   */
  async create(dto: HrOperationCreateDto): Promise<HrOperation> {
    const response = await api.post('/hr-operations', dto)
    return response.data
  },

  /**
   * Обновить операцию
   */
  async update(id: number, dto: HrOperationUpdateDto): Promise<HrOperation> {
    const response = await api.patch(`/hr-operations/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление операции
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/hr-operations/${id}`)
  },

  /**
   * Восстановить удалённую операцию
   */
  async restore(id: number): Promise<void> {
    await api.post(`/hr-operations/${id}/restore`)
  }
}

export default hrOperationsService