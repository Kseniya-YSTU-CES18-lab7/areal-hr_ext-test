// Этот файл импортируется в: services/organizations.ts, departments.ts, positions.ts

import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios'
import { ApiError } from '../types/models';

/**
 * Создаём экземпляр axios с базовыми настройками
 * Использует proxy из vite.config.ts: /api - http://localhost:3000
 */
export const api: AxiosInstance = axios.create({
  // baseURL: '/api',  // Proxy перенаправит на бэкенд
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  // Таймаут для предотвращения "вечной" загрузки
  timeout: 10000,
})

/**
 * Интерцептор запроса: добавляет токен авторизации
 * Работает для ВСЕХ запросов через этот экземпляр
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    // Логируем ошибки запроса в development
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error)
    }
    return Promise.reject(error)
  }
)

/**
 * Интерцептор ответа: централизованная обработка ошибок
 * Обрабатывает 400, 401, 403, 404, 409, 500
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<ApiError>) => {
    // Логируем в development для отладки
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        status: error.response?.status,
        message: error.response?.data?.message,
        path: error.config?.url
      })
    }
    
    // Обработка 401: токен недействителен - редирект на логин
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      // Используем window.location для надёжного редиректа
      window.location.href = '/login'
    }
    
    // Обработка 409: конфликт (дубликат) — пробрасываем дальше для обработки в компоненте
    // Обработка 400, 403, 404, 500 — пробрасываем для обработки в компоненте
    
    return Promise.reject(error)
  }
)

/**
 * Функция инициализации (вызывается в main.ts)
 * Делает $api доступным в компонентах (опционально)
 */
export function setupAxios(app: any) {
  app.config.globalProperties.$api = api
}

export default api