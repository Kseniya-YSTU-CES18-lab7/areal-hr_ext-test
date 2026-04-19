import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { App } from 'vue'
import { Notify } from 'quasar'

// Сообщения для HTTP-статусов
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Некорректные данные. Проверьте заполнение формы',
  401: 'Сессия истекла. Пожалуйста, войдите снова',
  403: 'Доступ запрещён. У вас нет прав для этого действия',
  404: 'Ресурс не найден',
  409: 'Конфликт данных. Такая запись уже существует',
  422: 'Ошибка валидации. Проверьте корректность данных',
  500: 'Внутренняя ошибка сервера. Попробуйте позже',
  502: 'Сервер временно недоступен',
  503: 'Сервис временно недоступен. Попробуйте позже',
}

// Создаём экземпляр axios с базовым URL
export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Логируем запросы в development режиме 
    if (import.meta.env.DEV) {
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
      })
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error.message)
    return Promise.reject(error)
  }
)

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Логируем успешные ответы в development
    if (import.meta.env.DEV) {
      console.log('[API Response]', {
        status: response.status,
        url: response.config.url,
      })
    }
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as any
    const message = data?.message || data?.error || STATUS_MESSAGES[status || 500] || 'Произошла неизвестная ошибка'
    
    // Логируем ошибку 
    console.error('[API Error]', {
      status,
      message,
      url: error.config?.url,
    })
    
    // Обработка 401 
    if (status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    
    // Показываем уведомления для всех ошибок 
    Notify.create({
      color: 'negative',
      message: message,
      icon: 'error',
      position: 'top-right',
      timeout: 3000
    })
    
    return Promise.reject(error)
  }
)

// Экспортируем функцию инициализации для main.ts
export function setupAxios(app: App) {
  app.config.globalProperties.$api = api
}

export default api