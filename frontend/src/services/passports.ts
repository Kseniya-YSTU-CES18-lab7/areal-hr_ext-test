// Импортируем базовый API-клиент и типы
import { api } from './api'
import { 
  Passport, 
  PassportCreateDto, 
  PassportUpdateDto 
} from '../types/models'

/**
 * Сервис для работы с паспортными данными
 * Связь с сотрудником: 1:1
 */
export const passportsService = {
  /**
   * Получить список паспортов с пагинацией
   */
  async getAll(
    page = 1,
    limit = 20
  ): Promise<{ data: Passport[]; total: number; page: number; limit: number }> {
    const response = await api.get('/passports', {
      params: { page, limit }
    })
    return response.data
  },

  /**
   * Получить паспорт по ID
   */
  async getById(id: number): Promise<Passport> {
    const response = await api.get(`/passports/${id}`)
    return response.data
  },

  /**
   * Получить паспорт по ID сотрудника
   */
  async getByEmployeeId(employeeId: string): Promise<Passport> {
    const response = await api.get(`/passports/by-employee/${employeeId}`)
    return response.data
  },

  /**
   * Создать паспорт
   */
  async create(dto: PassportCreateDto): Promise<Passport> {
    const response = await api.post('/passports', dto)
    return response.data
  },

  /**
   * Обновить паспорт
   */
  async update(id: number, dto: PassportUpdateDto): Promise<Passport> {
    const response = await api.patch(`/passports/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление паспорта
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/passports/${id}`)
  },

  /**
   * Восстановить удалённый паспорт
   */
  async restore(id: number): Promise<void> {
    await api.post(`/passports/${id}/restore`)
  }
}

export default passportsService