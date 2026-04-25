// Импортируем базовый API-клиент и типы
import { api } from './api'
import { 
  Position, 
  PositionCreateDto, 
  PositionUpdateDto 
} from '../types/models'

/**
 * Сервис для работы с должностями
 */
export const positionsService = {
  /**
   * Получить список должностей с пагинацией и поиском
   */
  async getAll(
    params?: { search?: string },
    page = 1,
    limit = 20
  ): Promise<{ data: Position[]; total: number; page: number; limit: number }> {
    const response = await api.get('/positions', {
      params: { 
        search: params?.search, 
        page, 
        limit 
      }
    })
    return response.data
  },

  /**
   * Получить должность по ID
   */
  async getById(id: number): Promise<Position> {
    const response = await api.get(`/positions/${id}`)
    return response.data
  },

  /**
   * Создать должность
   */
  async create(dto: PositionCreateDto): Promise<Position> {
    const response = await api.post('/positions', dto)
    return response.data
  },

  /**
   * Обновить должность
   */
  async update(id: number, dto: PositionUpdateDto): Promise<Position> {
    const response = await api.patch(`/positions/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление должности
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/positions/${id}`)
  },

  /**
   * Восстановить удалённую должность
   */
  async restore(id: number): Promise<void> {
    await api.post(`/positions/${id}/restore`)
  }
}

export default positionsService