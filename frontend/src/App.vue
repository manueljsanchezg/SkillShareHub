<script setup lang="ts">

</script>

<template>
  <h1>Hello App!</h1>
  <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
  <nav></nav>
  <main>
    <RouterView />
  </main>
  <footer></footer>
</template>

<style scoped>

</style>
