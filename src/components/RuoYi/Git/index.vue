<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup lang="ts">
const url = ref<string>('https://gitee.com/tangwenzhaoaini/ruoyi-qs-nvr')

function goto(): void {
  window.open(url.value)
}
</script>
