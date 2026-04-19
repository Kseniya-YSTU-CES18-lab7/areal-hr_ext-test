// Этот файл импортирует: types/models.ts (Шаг 1) и services/api.ts
// Этот файл импортируется в: OrganizationsPage.vue

import { api } from './api'  
import { 
  Organization, 
  OrganizationCreateDto, 
  OrganizationUpdateDto,
  PaginatedResponse 
} from '../types/models'

/**
 * Сервис для работы с организациями
 * Все методы возвращают типизированные данные
 */
export const organizationsService = {
  /**
   * Получить список организаций с пагинацией и поиском
   * Используется в: OrganizationsPage.vue для загрузки таблицы
   */
  async getList(
    search?: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Organization>> {
    const response = await api.get<PaginatedResponse<Organization>>('/organizations', {
      params: { search, page, limit }
    })
    return response.data
  },

  /**
   * Получить организацию по ID
   * Используется в: OrganizationsPage.vue для редактирования
   */
  async getById(id: number): Promise<Organization> {
    const response = await api.get<Organization>(`/organizations/${id}`)
    return response.data
  },

  /**
   * Создать организацию
   * Используется в: OrganizationsPage.vue при создании
   */
  async create(dto: OrganizationCreateDto): Promise<Organization> {
    const response = await api.post<Organization>('/organizations', dto)
    return response.data
  },

  /**
   * Обновить организацию
   * Используется в: OrganizationsPage.vue при редактировании
   */
  async update(id: number, dto: OrganizationUpdateDto): Promise<Organization> {
    const response = await api.patch<Organization>(`/organizations/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление организации
   * Используется в: OrganizationsPage.vue при удалении
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/organizations/${id}`)
  },

  /**
   * Восстановить удалённую организацию
   * Используется в: (будущий функционал администратора)
   */
  async restore(id: number): Promise<void> {
    await api.post(`/organizations/${id}/restore`)
  }
}

// Экспортируем как default для удобного импорта в компонентах
export default organizationsService