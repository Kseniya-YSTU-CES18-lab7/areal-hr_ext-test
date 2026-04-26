import { api } from '../boot/axios';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface UserData {
  id: string;
  surname: string;
  firstName: string;
  patronymic: string | null;
  login: string;
  role: 'admin' | 'manager';
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  /**
   * Аутентификация пользователя
   */
  async login(credentials: LoginCredentials): Promise<UserData> {
    const response = await api.post<UserData>('/auth/login', credentials);
    // Сохраняем данные пользователя
    localStorage.setItem('user_data', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Очищаем данные в любом случае
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token'); // если используете токены
    }
  },

  /**
   * Получение текущего пользователя
   */
  getCurrentUser(): UserData | null {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  /**
   * Проверка, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },

  /**
   * Проверка роли пользователя
   */
  hasRole(role: 'admin' | 'manager'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  },

  /**
   * Проверка, является ли пользователь админом
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  },
};

export default authService;