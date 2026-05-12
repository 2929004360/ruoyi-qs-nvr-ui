<template>
  <div class="record-playback-container">
    <!-- 组件切换 -->
    <CloudRecordPlayback v-if="playbackType === 'cloud'" ref="cloudPlaybackRef" :deviceId="deviceId" />
    <DeviceRecordPlayback v-else ref="devicePlaybackRef" :deviceId="deviceId" />
  </div>
</template>

<script setup lang="ts" name="RecordPlayback">
import CloudRecordPlayback from './CloudRecordPlayback.vue'
import DeviceRecordPlayback from './DeviceRecordPlayback.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const deviceId = ref<number | null>(null)
const playbackType = ref<'cloud' | 'device'>('device')
const cloudPlaybackRef = ref()
const devicePlaybackRef = ref()

// 直接初始化，不要等 onMounted
if (route.query.deviceId) {
  deviceId.value = Number(route.query.deviceId)
}
if (route.query.type === 'cloud') {
  playbackType.value = 'cloud'
} else if (route.query.type === 'device') {
  playbackType.value = 'device'
}
</script>

<style lang="scss" scoped>
.record-playback-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
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
</style>
