<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup lang="ts">
const url = ref<string>('http://1.12.55.122:5173/')

function goto(): void {
  window.open(url.value)
}
</script>