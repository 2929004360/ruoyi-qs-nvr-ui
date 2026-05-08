<template>
  <div class="record-playback-container">
    <!-- 切换按钮 -->
    <div class="switch-bar">
      <div class="switch-wrapper">
        <div
          class="switch-indicator"
          :class="playbackType === 'device' ? 'is-left' : 'is-right'"
        />
        <div
          class="switch-item"
          :class="{ active: playbackType === 'device' }"
          @click="handleTypeChange('device')"
        >
          <el-icon><Monitor /></el-icon>
          <span>设备录像</span>
        </div>
        <div
          class="switch-item"
          :class="{ active: playbackType === 'cloud' }"
          @click="handleTypeChange('cloud')"
        >
          <el-icon><VideoCamera /></el-icon>
          <span>云端录像</span>
        </div>
      </div>
    </div>

    <!-- 组件切换 -->
    <transition name="fade-transform" mode="out-in">
      <CloudRecordPlayback v-if="playbackType === 'cloud'" ref="cloudPlaybackRef" />
      <DeviceRecordPlayback v-else ref="devicePlaybackRef" />
    </transition>
  </div>
</template>

<script setup lang="ts" name="RecordPlayback">
import CloudRecordPlayback from './CloudRecordPlayback.vue'
import DeviceRecordPlayback from './DeviceRecordPlayback.vue'
import { VideoCamera, Monitor } from '@element-plus/icons-vue'

const playbackType = ref<'cloud' | 'device'>('device')
const cloudPlaybackRef = ref()
const devicePlaybackRef = ref()

/**
 * 切换类型处理
 */
const handleTypeChange = (type: 'cloud' | 'device') => {
  playbackType.value = type
}
</script>

<style lang="scss" scoped>
.record-playback-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.switch-bar {
  padding: 4px 20px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.switch-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: var(--el-fill-color-light);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.switch-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.04);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 0;

  &.is-left {
    transform: translateX(0);
  }

  &.is-right {
    transform: translateX(calc(100% + 4px));
  }
}

.switch-item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  font-weight: 500;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.3s ease;
  user-select: none;

  &:hover {
    color: var(--el-text-color-primary);
  }

  &.active {
    color: var(--el-color-primary);
  }
}

/* 切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.25s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 暗黑模式适配 */
html.dark {
  .switch-wrapper {
    background: rgba(255, 255, 255, 0.04);
  }

  .switch-indicator {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
  }
}
</style>
