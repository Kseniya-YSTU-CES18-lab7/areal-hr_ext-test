// FILE: src/main.ts
import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import { createPinia } from 'pinia'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/dist/quasar.css'

// Import root component
import App from './App.vue'

// Import router
import router from './router'

// Import axios setup
import { setupAxios } from './boot/axios'

// Создаём приложение Vue
const app = createApp(App)

// Подключаем Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Подключаем Quasar с плагинами
app.use(Quasar, {
  plugins: {
    Notify,    // Уведомления
    Dialog,    // Диалоговые окна
    Loading    // Индикатор загрузки
  },
  config: {
    notify: {
      position: 'top-right',    // Позиция уведомлений
      timeout: 3000,            // Время показа (мс)
      textColor: 'white'        // Цвет текста
    }
  }
})

// Подключаем Router
app.use(router)

// Подключаем Axios
setupAxios(app)

// Монтируем приложение в элемент #app
app.mount('#app')