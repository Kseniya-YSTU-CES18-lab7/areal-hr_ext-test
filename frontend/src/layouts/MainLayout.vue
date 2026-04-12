<!-- FILE: src/layouts/MainLayout.vue -->
<template>
  <!-- QLayout: основной контейнер приложения -->
  <!-- view="lHh Lpr lFf" означает:
       l = left drawer (левое меню)
       H = header (шапка)
       h = header is fixed (шапка зафиксирована)
       L = left drawer is fixed (меню зафиксировано)
       p = page container (контейнер страницы)
       r = right padding (правый отступ)
       l = left drawer is overlay (меню поверх контента на мобильных)
       F = footer (подвал)
       f = footer is fixed (подвал зафиксирован)
  -->
  <q-layout view="lHh Lpr lFf">
    
    <!-- q-header: шапка приложения -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        
        <!-- Кнопка гамбургер-меню (видна только на мобильных) -->
        <q-btn 
          flat 
          dense 
          round 
          icon="menu" 
          aria-label="Открыть меню"
          @click="toggleLeftDrawer"
          class="text-white"
        />
        
        <!-- Заголовок с иконкой -->
        <q-toolbar-title>
          <q-icon name="business_center" class="q-mr-sm" />
          HR Management
        </q-toolbar-title>
        
        <!-- Информация о пользователе (справа) -->
        <div v-if="isAuthenticated" class="row items-center q-gutter-sm">
          
          <!-- Бейдж с ролью -->
          <q-badge color="accent" class="text-dark">
            {{ userRole === 'admin' ? 'Админ' : 'Менеджер' }}
          </q-badge>
          
          <!-- Кнопка выхода -->
          <q-btn 
            flat 
            round 
            icon="logout" 
            @click="handleLogout"
            class="text-white"
            aria-label="Выйти"
          >
            <q-tooltip>Выйти</q-tooltip>
          </q-btn>
          
        </div>
        
      </q-toolbar>
    </q-header>

    <!-- q-drawer: боковое меню (слева) -->
    <q-drawer 
      v-model="leftDrawerOpen" 
      show-if-above 
      bordered
      class="bg-dark-page"
    >
      
      <!-- Заголовок меню -->
      <q-list>
        
        <!-- Заголовок раздела -->
        <q-item-label header class="text-accent q-pt-md">
          Навигация
        </q-item-label>
        
        <!-- Пункт меню: Организации -->
        <q-item 
          clickable 
          to="/organizations" 
          exact
          active-class="bg-secondary text-dark"
        >
          <q-item-section avatar>
            <q-icon name="business" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Организации</q-item-label>
          </q-item-section>
        </q-item>
        
        <!-- Пункт меню: Отделы -->
        <q-item 
          clickable 
          to="/departments"
          active-class="bg-secondary text-dark"
        >
          <q-item-section avatar>
            <q-icon name="account_tree" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Отделы</q-item-label>
          </q-item-section>
        </q-item>
        
        <!-- Пункт меню: Должности -->
        <q-item 
          clickable 
          to="/positions"
          active-class="bg-secondary text-dark"
        >
          <q-item-section avatar>
            <q-icon name="work" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Должности</q-item-label>
          </q-item-section>
        </q-item>
        
        <!-- Пункт меню: Сотрудники -->
        <q-item 
          clickable 
          to="/employees"
          active-class="bg-secondary text-dark"
        >
          <q-item-section avatar>
            <q-icon name="people" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Сотрудники</q-item-label>
          </q-item-section>
        </q-item>
        
        <!-- Пункт меню: Кадровые операции -->
        <q-item 
          clickable 
          to="/hr-operations"
          active-class="bg-secondary text-dark"
        >
          <q-item-section avatar>
            <q-icon name="swap_horiz" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Операции</q-item-label>
          </q-item-section>
        </q-item>
        
        <!-- Пункт меню: История изменений -->
        <q-item 
          clickable 
          to="/history"
          active-class="bg-secondary text-dark"
        >
          <q-item-section avatar>
            <q-icon name="history" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>История</q-item-label>
          </q-item-section>
        </q-item>
        
      </q-list>
      
    </q-drawer>

    <!-- q-page-container: контейнер для страниц -->
    <q-page-container>
      <!-- Сюда будут подгружаться компоненты страниц из router -->
      <router-view />
    </q-page-container>
    
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Получаем экземпляр роутера для навигации
const router = useRouter()

// Реактивная переменная: открыто ли левое меню
const leftDrawerOpen = ref(false)

// Вычисляемое свойство: авторизован ли пользователь
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('auth_token')
})

// Вычисляемое свойство: роль пользователя (заглушка)
const userRole = computed(() => {
  // В реальной реализации будем брать из store или токена
  return 'admin'
})

// Функция переключения левого меню
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Функция выхода из системы
function handleLogout() {
  // Удаляем токен из localStorage
  localStorage.removeItem('auth_token')
  
  // Закрываем меню (если открыто)
  leftDrawerOpen.value = false
  
  // Перенаправляем на страницу входа
  router.push('/login')
}
</script>

<style lang="sass" scoped>
// Используем переменные из quasar-variables.sass

// Фон всего макета
.q-layout
  background-color: $dark-page
  color: $dark

// Стили для активного пункта меню
.q-item--active
  background-color: $secondary !important
  color: $dark !important
  
  .q-icon
    color: $primary !important

// Заголовок раздела меню
.q-item-label--header
  color: $accent
  font-weight: 600
</style>