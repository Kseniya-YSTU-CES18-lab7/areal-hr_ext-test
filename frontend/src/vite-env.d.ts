// Чтобы исправить прошлые ошибки в других файлах

// Подключаем типы для Vite (чтобы работал import.meta.env)
/// <reference types="vite/client" />

// Объявляем интерфейс для переменных окружения Vite
interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

// Объявляем интерфейс для import.meta
interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Разрешаем импорты .vue файлов
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Разрешаем импорты CSS/SASS файлов
declare module '*.css' {}
declare module '*.sass' {}
declare module '*.scss' {}

// Разрешаем импорты иконок @quasar/extras
declare module '@quasar/extras/*' {}