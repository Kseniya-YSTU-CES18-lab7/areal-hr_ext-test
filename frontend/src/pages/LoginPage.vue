<!-- FILE: src/pages/LoginPage.vue -->
<template>
  <!-- Используем обычный div вместо q-page, т.к. эта страница не внутри q-layout -->
  <div class="login-page flex flex-center bg-dark-page">
    
    <!-- Карточка формы входа -->
    <q-card class="q-pa-lg" style="min-width: 350px; max-width: 90vw">
      
      <!-- Заголовок карточки с иконкой -->
      <q-card-section class="text-center q-pb-md">
        <q-icon name="business_center" size="48px" color="primary" />
        <div class="text-h5 q-mt-sm">Вход в систему</div>
        <div class="text-caption text-grey-7">HR Management System</div>
      </q-card-section>
      
      <!-- Секция с формой -->
      <q-card-section>
        <!-- Форма с валидацией -->
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          
          <!-- Поле логина -->
          <q-input
            v-model="form.login"
            label="Логин"
            type="text"
            outlined
            dense
            :rules="[
              val => !!val || 'Введите логин',
              val => val.length >= 3 || 'Логин должен содержать минимум 3 символа'
            ]"
          >
            <!-- Иконка слева -->
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>
          
          <!-- Поле пароля -->
          <q-input
            v-model="form.password"
            label="Пароль"
            :type="isPasswordVisible ? 'text' : 'password'"
            outlined
            dense
            :rules="[
              val => !!val || 'Введите пароль',
              val => val.length >= 6 || 'Пароль должен содержать минимум 6 символов'
            ]"
          >
            <!-- Иконка слева -->
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            
            <!-- Кнопка показать/скрыть пароль (справа) -->
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="visibility"
                @click="isPasswordVisible = !isPasswordVisible"
                aria-label="Показать пароль"
              >
                <q-tooltip>
                  {{ isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль' }}
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
          
          <!-- Сообщение об ошибке -->
          <div v-if="errorMessage" class="text-negative text-center q-mt-sm">
            <q-icon name="error" class="q-mr-xs" />
            {{ errorMessage }}
          </div>
          
          <!-- Кнопка входа -->
          <q-btn
            type="submit"
            label="Войти"
            color="primary"
            class="full-width q-mt-md"
            :loading="isLoading"
            :disable="isLoading"
          >
            <!-- Иконка загрузки -->
            <template v-slot:loading>
              <q-spinner-dots color="white" size="20px" />
            </template>
          </q-btn>
          
        </q-form>
      </q-card-section>
      
      <!-- Подвал карточки -->
      <q-card-section class="text-center q-pt-md">
        <div class="text-caption text-grey-6">
          © 2026 HR Management System
        </div>
      </q-card-section>
      
    </q-card>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

// Получаем экземпляр роутера для навигации
const router = useRouter()

// Получаем экземпляр Quasar для уведомлений
const $q = useQuasar()

// Реактивная переменная: виден ли пароль
const isPasswordVisible = ref(false)

// Реактивная переменная: идёт ли загрузка
const isLoading = ref(false)

// Реактивная переменная: сообщение об ошибке
const errorMessage = ref('')

// Объект формы с данными
const form = reactive({
  login: '',
  password: ''
})

// Функция обработки входа
async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  
  // Имитация задержки сети (чтобы показать спиннер)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // "Фейковый" токен (без реального запроса к бэкенду)
  localStorage.setItem('auth_token', 'fake-token-for-testing')
  localStorage.setItem('user_data', JSON.stringify({
    id: '1',
    login: form.login,
    role: 'admin'
  }))
  
  $q.notify({
    color: 'positive',
    message: 'Вход выполнен успешно (тестовый режим)',
    icon: 'check_circle',
    position: 'top-right',
    timeout: 2000
  })
  
  // Переход на страницу организаций
  router.push('/organizations')
  
  isLoading.value = false
}
</script>

<style lang="sass" scoped>
// Используем переменные из quasar-variables.sass

// Фон всей страницы входа
.login-page
  min-height: 100vh
  background-color: $dark-page

// Карточка
.q-card
  border-radius: 12px
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)

// Заголовок
.text-h5
  color: $dark

// Иконка в заголовке
.q-icon
  color: $primary

// Сообщение об ошибке
.text-negative
  background-color: $negative
  color: $dark
  padding: 8px 16px
  border-radius: 4px
  font-weight: 500

// Подвал
.text-grey-6
  color: #8f8d8d
</style>