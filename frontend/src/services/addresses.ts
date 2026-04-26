// Импортируем базовый API-клиент и типы
import { api } from '../boot/axios'
import { 
  Address, 
  AddressCreateDto, 
  AddressUpdateDto 
} from '../types/models'

/**
 * Сервис для работы с адресами регистрации
 * Связь с сотрудником: 1:1
 */
export const addressesService = {
  /**
   * Получить список адресов с пагинацией
   */
  async getAll(
    page = 1,
    limit = 20
  ): Promise<{ data: Address[]; total: number; page: number; limit: number }> {
    const response = await api.get('/addresses', {
      params: { page, limit }
    })
    return response.data
  },

  /**
   * Получить адрес по ID
   */
  async getById(id: number): Promise<Address> {
    const response = await api.get(`/addresses/${id}`)
    return response.data
  },

  /**
   * Получить адрес по ID сотрудника
   */
  async getByEmployeeId(employeeId: string): Promise<Address> {
    const response = await api.get(`/addresses/by-employee/${employeeId}`)
    return response.data
  },

  /**
   * Создать адрес
   */
  async create(dto: AddressCreateDto): Promise<Address> {
    const response = await api.post('/addresses', dto)
    return response.data
  },

  /**
   * Обновить адрес
   */
  async update(id: number, dto: AddressUpdateDto): Promise<Address> {
    const response = await api.patch(`/addresses/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление адреса
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/addresses/${id}`)
  },

  /**
   * Восстановить удалённый адрес
   */
  async restore(id: number): Promise<void> {
    await api.post(`/addresses/${id}/restore`)
  }
}

export default addressesService