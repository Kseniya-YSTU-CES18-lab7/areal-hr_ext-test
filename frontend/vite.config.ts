import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  // Подключаем плагины
  plugins: [
    // Плагин для поддержки Vue 3
    vue({
      template: { transformAssetUrls } // Настройка для Quasar (обработка путей к картинкам)
    }),
    // Плагин для Quasar UI библиотеки
    quasar({
      // Путь к файлу с переменными цветов и стилей
      sassVariables: fileURLToPath(
        new URL('./src/quasar-variables.sass', import.meta.url)
      )
    })
  ],

  // Настройки сервера для разработки
  server: {
    port: 9000, // Порт для фронтенда (9000, чтобы не конфликтовать с бэкендом на порту 3000)

    // Настройка прокси для запросов к бэкенду
    proxy: {
      // Все запросы, начинающиеся с /api, будут перенаправляться на бэкенд
      '/api': {
        target: 'http://localhost:3000', // Адрес NestJS бэкенда
        changeOrigin: true,              // Меняем origin заголовок (нужно для некоторых серверов)
        secure: false,                  // Отключаем проверку SSL (для локальной разработки)
        
      }
    }
  },

  // Настройки путей (алиасы)
  resolve: {
    alias: {
      // Создаём алиас 'src' для удобного импорта файлов
      src: fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})