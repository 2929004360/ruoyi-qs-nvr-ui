<template>
  <div class="record-playback-container">
    <!-- 切换按钮 -->
    <div class="switch-bar">
      <el-radio-group v-model="playbackType" @change="handleTypeChange">
        <el-radio-button value="cloud">
          <el-icon><VideoCamera /></el-icon>
          云端录像
        </el-radio-button>
        <el-radio-button value="device">
          <el-icon><Monitor /></el-icon>
          设备录像
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 组件切换 -->
    <CloudRecordPlayback v-if="playbackType === 'cloud'" ref="cloudPlaybackRef" />
    <DeviceRecordPlayback v-else ref="devicePlaybackRef" />
  </div>
</template>

<script setup lang="ts" name="RecordPlayback">
import CloudRecordPlayback from './CloudRecordPlayback.vue'
import DeviceRecordPlayback from './DeviceRecordPlayback.vue'
import { VideoCamera, Monitor } from '@element-plus/icons-vue'

const playbackType = ref<'cloud' | 'device'>('cloud')
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
  padding: 12px 20px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: center;

  :deep(.el-radio-button__inner) {
    padding: 8px 24px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
