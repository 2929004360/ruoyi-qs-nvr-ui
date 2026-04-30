<template>
  <div class="ruoyi-git-icon" @click="goto">
    <el-icon :size="18"><Link /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@element-plus/icons-vue'

const url = ref<string>('https://gitee.com/tangwenzhaoaini/ruoyi-qs-nvr')

function goto(): void {
  window.open(url.value)
}
</script>

<style lang="scss" scoped>
.ruoyi-git-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
