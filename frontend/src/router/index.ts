// FILE: src/router/index.ts
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
// _from с подчёркиванием — параметр не используется, чтобы линтер не ругался
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('auth_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/organizations')
  } else {
    next()
  }
})

export default router