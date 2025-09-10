<template>
  <div />
</template>

<script setup>
definePageMeta({
  layout: false
})
// Evitar congelamiento por redirecciones 301 persistentes: usar replace en cliente
await navigateTo('/admin', { replace: true })
</script>


