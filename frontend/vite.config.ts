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
      port: 9000,  // 🔥 ДОБАВЬТЕ ЭТУ СТРОКУ!
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
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