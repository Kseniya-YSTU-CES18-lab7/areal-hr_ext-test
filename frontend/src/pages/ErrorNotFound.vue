<template>
  <! QPage: центрируем контент >
  <q-page class="flex flex-center">
    
    <! Блок с ошибкой 404 >
    <div class="text-center">
      <! Код ошибки >
      <div class="text-h4 q-mb-md">404</div>
      
      <! Сообщение >
      <p>Страница не найдена</p>
      
      <! Кнопка возврата на главную >
      <q-btn label="На главную" color="primary" @click="$router.push('/')" />
    </div>
    
  </q-page>
</template>

<script setup lang="ts">
// Страница ошибки 404 (заглушка)
</script>