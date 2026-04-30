<template>
  <div class="ruoyi-doc-icon" @click="goto">
    <el-icon :size="18"><Document /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'

const url = ref<string>('http://1.12.55.122:5173/')

function goto(): void {
  window.open(url.value)
}
</script>

<style lang="scss" scoped>
.ruoyi-doc-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
