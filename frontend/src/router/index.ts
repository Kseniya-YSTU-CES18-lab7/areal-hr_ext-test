import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from 'src/layouts/MainLayout.vue'

// Объявляем массив маршрутов
const routes: Array<RouteRecordRaw> = [
  {
    // Путь: /login (страница входа без layout)
    path: '/login',
    name: 'Login',
    component: () => import('src/pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    // Путь: / (корень приложения)
    path: '/',
    redirect: '/organizations',
  },
  {
    // Маршруты с MainLayout (основное приложение)
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        // Путь: /organizations
        path: 'organizations',
        name: 'Organizations',
        component: () => import('src/pages/OrganizationsPage.vue'),
      },
      {
        // Путь: /departments
        path: 'departments',
        name: 'Departments',
        component: () => import('src/pages/DepartmentsPage.vue'),
      },
      {
        // Путь: /positions
        path: 'positions',
        name: 'Positions',
        component: () => import('src/pages/PositionsPage.vue'),
      },
      {
        // Путь: /employees
        path: 'employees',
        name: 'Employees',
        component: () => import('src/pages/EmployeesPage.vue'),
      },
      {
        // Путь: /hr-operations
        path: 'hr-operations',
        name: 'HrOperations',
        component: () => import('src/pages/HrOperationsPage.vue'),
      },
      {
        // Путь: /history
        path: 'history',
        name: 'History',
        component: () => import('src/pages/HistoryPage.vue'),
      },
      // Пользователи (только для админов)
      {
        path: 'users',
        name: 'Users',
        component: () => import('src/pages/UsersPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
    ],
  },
  {
    // Catch-all: любой несуществующий путь
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('src/pages/ErrorNotFound.vue'),
  },
]

// Создаём экземпляр роутера
const router = createRouter({
  history: createWebHistory((import.meta as any).env.BASE_URL),
  routes,
})

// Guard: проверка авторизации перед переходом
// Guard: проверка авторизации перед переходом
router.beforeEach((to, _from, next) => {
  const userData = localStorage.getItem('user_data')
  let user: any = null
  if (userData) {
    try {
      user = JSON.parse(userData)
    } catch (e) {}
  }
  
  const isAuthenticated = !!userData
  
  // Проверка авторизации
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // Проверка ролей
  if (to.meta.roles && user) {
    const allowedRoles = to.meta.roles as string[]
    if (!allowedRoles.includes(user.role)) {
      next('/organizations')
      return
    }
  }
  
  // Если на странице логина и пользователь уже авторизован
  if (to.path === '/login' && isAuthenticated) {
    next('/organizations')
    return
  }
  
  next()
})

export default router