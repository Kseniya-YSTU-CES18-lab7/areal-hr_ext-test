// Методы update, delete, restore не делать — история не изменяется

// Импортируем базовый API-клиент и типы
import { api } from '../boot/axios'
import { 
  History, 
  HistoryCreateDto 
} from '../types/models'

/**
 * Сервис для работы с историей изменений
 * История — лог событий, записи не изменяются и не удаляются
 */
export const historyService = {
  /**
   * Получить список записей истории с пагинацией
   */
  async getAll(
    filters?: {
      entityType?: string;
      operationType?: string;
      entityId?: string;
    },
    page = 1,
    limit = 20
  ): Promise<{ data: History[]; total: number; page: number; limit: number }> {
    const response = await api.get('/history', {
      params: { 
        ...filters,
        page, 
        limit 
      }
    })
    return response.data
  },

  /**
   * Получить историю по типу и ID сущности
   */
  async getByEntity(entityType: string, entityId: string): Promise<History[]> {
    const response = await api.get('/history/by-entity', {
      params: { entityType, entityId }
    })
    return response.data
  },

  /**
   * Получить историю по ID пользователя
   */
  async getByUserId(userId: string): Promise<History[]> {
    const response = await api.get(`/history/by-user/${userId}`)
    return response.data
  },

  /**
   * Получить запись истории по ID
   */
  async getById(id: number): Promise<History> {
    const response = await api.get(`/history/${id}`)
    return response.data
  },

  /**
   * Создать запись в истории (обычно вызывается автоматически на бэкенде)
   */
  async create(dto: HistoryCreateDto): Promise<History> {
    const response = await api.post('/history', dto)
    return response.data
  }

}

export default historyService