<template>
  <div class="screenfull-icon" @click="toggle">
    <el-icon :size="18" :class="{ 'is-active': isFullscreen }">
      <FullScreen />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { FullScreen } from '@element-plus/icons-vue'
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, toggle } = useFullscreen()
</script>

<style lang='scss' scoped>
.screenfull-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .el-icon {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-active {
      transform: rotate(180deg);
    }
  }
}
</style>
