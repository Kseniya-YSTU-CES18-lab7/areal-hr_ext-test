<template>
  <!-- Просто рендерим роутер -->
  <!-- Layout будет определяться в router/routes.ts для каждого маршрута -->
  <router-view />
</template>

<script setup lang="ts">
// Корневой компонент — просто передаёт управление роутеру
// Layout определяется в настройках маршрутов
</script>

<style lang="sass">
// Глобальные стили (без scoped, чтобы применялись ко всему приложению)

body
  background-color: $dark-page
  color: $dark
  margin: 0
  padding: 0
  font-family: 'Roboto', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif
</style>