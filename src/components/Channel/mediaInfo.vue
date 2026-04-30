<template>
  <div class="media-info">
    <!-- 头部 -->
    <div class="header">
      <div class="header-left">
        <el-icon class="header-icon"><DataLine /></el-icon>
        <span class="title">媒体信息</span>
      </div>
      <el-button
        :icon="RefreshRight"
        circle
        size="small"
        text
        @click="getMediaInfoFun"
        :loading="refreshing"
        class="refresh-btn"
      />
    </div>

    <!-- 统计行 -->
    <div class="stats-row" v-if="info.videoCodec || info.audioCodec">
      <div class="stat-item">
        <el-icon class="stat-icon readers"><User /></el-icon>
        <span class="stat-label">观看</span>
        <span class="stat-value">{{ info.readerCount || 0 }}</span>
      </div>
      <el-divider direction="vertical" />
      <div class="stat-item">
        <el-icon class="stat-icon speed"><Position /></el-icon>
        <span class="stat-label">速度</span>
        <span class="stat-value">{{ formatByteSpeed() }}</span>
      </div>
      <el-divider direction="vertical" />
      <div class="stat-item">
        <el-icon class="stat-icon duration"><Timer /></el-icon>
        <span class="stat-label">时长</span>
        <span class="stat-value">{{ formatAliveSecond() }}</span>
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="detail-section" v-if="info.videoCodec || info.audioCodec">
      <!-- 视频信息 -->
      <div class="detail-block" v-if="info.videoCodec">
        <div class="block-label">
          <el-icon class="label-icon video"><VideoCamera /></el-icon>
          <span>视频</span>
          <el-tag size="small" type="success" effect="plain">{{ info.videoCodec }}</el-tag>
        </div>
        <div class="block-content">
          <span class="tag">{{ info.width }}×{{ info.height }}</span>
          <span class="tag">{{ info.fps }} FPS</span>
          <span class="tag" :class="getLossClass(info.loss)">
            丢包 {{ info.loss || '0%' }}
          </span>
        </div>
      </div>

      <!-- 音频信息 -->
      <div class="detail-block" v-if="info.audioCodec">
        <div class="block-label">
          <el-icon class="label-icon audio"><Headset /></el-icon>
          <span>音频</span>
          <el-tag size="small" type="primary" effect="plain">{{ info.audioCodec }}</el-tag>
        </div>
        <div class="block-content">
          <span class="tag">{{ info.audioSampleRate }} Hz</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="暂无媒体信息" :image-size="50" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getMediaInfo } from '@/api/qs/zlm';
import {
  RefreshRight,
  DataLine,
  User,
  Position,
  Timer,
  VideoCamera,
  Headset
} from '@element-plus/icons-vue';

const props = defineProps({
  app: { type: String, required: true },
  stream: { type: String, required: true },
  mediaServerId: { type: String, required: true }
});

const info = ref<Record<string, any>>({});
const task = ref<ReturnType<typeof setInterval> | null>(null);
const refreshing = ref(false);

const getMediaInfoFun = async () => {
  refreshing.value = true;
  try {
    const res = await getMediaInfo(props.app, props.stream, props.mediaServerId);
    info.value = res.data || {};
  } finally {
    refreshing.value = false;
  }
};

const formatByteSpeed = () => {
  const bytesSpeed = info.value.bytesSpeed || 0;
  const num = 1024.0;
  if (bytesSpeed < num) return `${bytesSpeed} B/s`;
  if (bytesSpeed < Math.pow(num, 2)) return `${(bytesSpeed / num).toFixed(2)} KB/s`;
  if (bytesSpeed < Math.pow(num, 3)) return `${(bytesSpeed / Math.pow(num, 2)).toFixed(2)} MB/s`;
  if (bytesSpeed < Math.pow(num, 4)) return `${(bytesSpeed / Math.pow(num, 3)).toFixed(2)} GB/s`;
  return `${(bytesSpeed / Math.pow(num, 4)).toFixed(2)} TB/s`;
};

const formatAliveSecond = () => {
  const aliveSecond = info.value.aliveSecond || 0;
  const h = Math.floor(aliveSecond / 3600);
  const minute = Math.floor((aliveSecond / 60) % 60);
  const second = Math.ceil(aliveSecond % 60);
  const hours = h > 0 ? `${h}:` : '';
  const minutes = minute < 10 ? `0${minute}` : `${minute}`;
  const seconds = second < 10 ? `0${second}` : `${second}`;
  return `${hours}${minutes}:${seconds}`;
};

const getLossClass = (loss?: string | number) => {
  if (!loss) return 'success';
  const val = parseFloat(String(loss));
  if (isNaN(val)) return 'success';
  if (val >= 5) return 'danger';
  if (val >= 1) return 'warning';
  return 'success';
};

const startTask = () => {
  task.value = setInterval(getMediaInfoFun, 1000);
};

const stopTask = () => {
  if (task.value) {
    clearInterval(task.value);
    task.value = null;
  }
};

onMounted(() => {
  getMediaInfoFun();
  startTask();
});

onUnmounted(() => {
  stopTask();
});
</script>

<style scoped>
.media-info {
  padding: 12px 16px;
  background: var(--el-bg-color);
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-icon {
  font-size: 14px;
  color: var(--el-color-primary);
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.refresh-btn {
  transition: transform 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
}

/* 统计行 */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.stat-icon {
  font-size: 13px;
}

.stat-icon.readers {
  color: var(--el-color-primary);
}

.stat-icon.speed {
  color: var(--el-color-success);
}

.stat-icon.duration {
  color: var(--el-color-warning);
}

.stat-label {
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

/* 详情区域 */
.detail-section {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 8px;
}

.detail-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
}

.block-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.label-icon {
  font-size: 13px;
}

.label-icon.video {
  color: var(--el-color-primary);
}

.label-icon.audio {
  color: var(--el-color-success);
}

.block-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  white-space: nowrap;
}

.tag.success {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-8);
}

.tag.warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-8);
}

.tag.danger {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-8);
}

.empty-state {
  padding: 16px 0;
}

/* 响应式 */
@media (max-width: 480px) {
  .media-info {
    padding: 10px 12px;
  }

  .detail-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
