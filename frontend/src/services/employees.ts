// Импортируем базовый API-клиент и типы
import { api } from '../boot/axios'
import { 
  Employee, 
  EmployeeCreateDto, 
  EmployeeUpdateDto 
} from '../types/models'

/**
 * Сервис для работы с сотрудниками
 * Все CRUD-операции через единый API-клиент
 */
export const employeesService = {
  /**
   * Получить список сотрудников с пагинацией и фильтрами
   */
  async getAll(
    params?: { surname?: string; firstName?: string; departmentId?: number },
    page = 1,
    limit = 20
  ): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {
    const response = await api.get('/employees', {
      params: { 
        surname: params?.surname, 
        firstName: params?.firstName, 
        departmentId: params?.departmentId, 
        page, 
        limit 
      }
    })
    return response.data
  },

  /**
   * Получить сотрудника по ID (UUID)
   */
  async getById(id: string): Promise<Employee> {
    const response = await api.get(`/employees/${id}`)
    return response.data
  },

  /**
   * Создать сотрудника
   */
  async create(dto: EmployeeCreateDto): Promise<Employee> {
    const response = await api.post('/employees', dto)
    return response.data
  },

  /**
   * Обновить сотрудника
   */
  async update(id: string, dto: EmployeeUpdateDto): Promise<Employee> {
    const response = await api.patch(`/employees/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление сотрудника
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`)
  },

  /**
   * Восстановить удалённого сотрудника
   */
  async restore(id: string): Promise<void> {
    await api.post(`/employees/${id}/restore`)
  }
}

// Экспортируем как default для удобного импорта
export default employeesService