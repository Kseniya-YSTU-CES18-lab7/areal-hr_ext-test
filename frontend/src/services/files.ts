// Импортируем базовый API-клиент и типы
import { api } from '../boot/axios'
import { 
  File, 
  FileUpdateDto 
} from '../types/models'

/**
 * Сервис для работы с файлами
 * Связь с сотрудником: N:1 (у одного сотрудника может быть много файлов)
 */
export const filesService = {
  /**
   * Получить список файлов с пагинацией и поиском
   */
  async getAll(
    search?: string,
    page = 1,
    limit = 20
  ): Promise<{ data: File[]; total: number; page: number; limit: number }> {
    const response = await api.get('/files', {
      params: { search, page, limit }
    })
    return response.data
  },

  /**
   * Получить все файлы сотрудника
   */
  async getByEmployeeId(employeeId: string): Promise<File[]> {
    const response = await api.get(`/files/by-employee/${employeeId}`)
    return response.data
  },

  /**
   * Получить файл по ID
   */
  async getById(id: number): Promise<File> {
    const response = await api.get(`/files/${id}`)
    return response.data
  },

  /**
   * Загрузить файл (multipart/form-data)
   */
  async upload(formData: FormData): Promise<File> {
    const response = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Обновить информацию о файле
   */
  async update(id: number, dto: FileUpdateDto): Promise<File> {
    const response = await api.patch(`/files/${id}`, dto)
    return response.data
  },

  /**
   * Мягкое удаление файла
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/files/${id}`)
  },

  /**
   * Восстановить удалённый файл
   */
  async restore(id: number): Promise<void> {
    await api.post(`/files/${id}/restore`)
  }
}

export default filesService