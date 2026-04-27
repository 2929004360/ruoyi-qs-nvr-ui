<template>
  <div class="media-info">
    <!-- 头部 -->
    <div class="header">
      <span class="title">媒体信息</span>
      <el-button
        icon="RefreshRight"
        circle
        size="small"
        @click="getMediaInfoFun"
        :loading="refreshing"
      ></el-button>
    </div>

    <!-- 概况信息 -->
    <div class="overview">
      <div class="stat-item">
        <span class="label">观看人数</span>
        <span class="value">{{ info.readerCount || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="label">网络速度</span>
        <span class="value">{{ formatByteSpeed() }}</span>
      </div>
      <div class="stat-item">
        <span class="label">持续时间</span>
        <span class="value">{{ formatAliveSecond() }}</span>
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="details" v-if="info.videoCodec || info.audioCodec">
      <!-- 视频信息 -->
      <div class="detail-section" v-if="info.videoCodec">
        <div class="section-title">视频信息</div>
        <div class="section-content">
          <div class="row">
            <span class="row-label">编码</span>
            <span class="row-value">{{ info.videoCodec }}</span>
          </div>
          <div class="row">
            <span class="row-label">分辨率</span>
            <span class="row-value">{{ info.width }}x{{ info.height }}</span>
          </div>
          <div class="row">
            <span class="row-label">FPS</span>
            <span class="row-value">{{ info.fps }}</span>
          </div>
          <div class="row">
            <span class="row-label">丢包率</span>
            <span class="row-value">{{ info.loss }}</span>
          </div>
        </div>
      </div>

      <!-- 音频信息 -->
      <div class="detail-section" v-if="info.audioCodec">
        <div class="section-title">音频信息</div>
        <div class="section-content">
          <div class="row">
            <span class="row-label">编码</span>
            <span class="row-value">{{ info.audioCodec }}</span>
          </div>
          <div class="row">
            <span class="row-label">采样率</span>
            <span class="row-value">{{ info.audioSampleRate }} Hz</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getMediaInfo } from '@/api/qs/zlm';

// 定义 Props
const props = defineProps({
  app: {
    type: String,
    required: true
  },
  stream: {
    type: String,
    required: true
  },
  mediaServerId: {
    type: String,
    required: true
  }
});

// 数据定义
const info = ref({});
const task = ref(null);
const refreshing = ref(false);

// 获取媒体信息
const getMediaInfoFun = async () => {
  refreshing.value = true;
  try {
    const res = await getMediaInfo(props.app, props.stream, props.mediaServerId);
    info.value = res.data;
  } finally {
    refreshing.value = false;
  }
};

// 格式化字节速度
const formatByteSpeed = () => {
  const bytesSpeed = (info.value as any).bytesSpeed || 0;
  const num = 1024.0;

  if (bytesSpeed < num) return `${bytesSpeed} B/S`;
  if (bytesSpeed < Math.pow(num, 2)) return `${(bytesSpeed / num).toFixed(2)} KB/S`;
  if (bytesSpeed < Math.pow(num, 3)) return `${(bytesSpeed / Math.pow(num, 2)).toFixed(2)} MB/S`;
  if (bytesSpeed < Math.pow(num, 4)) return `${(bytesSpeed / Math.pow(num, 3)).toFixed(2)} GB/S`;
  return `${(bytesSpeed / Math.pow(num, 4)).toFixed(2)} TB/S`;
};

// 格式化持续时间
const formatAliveSecond = () => {
  const aliveSecond = (info.value as any).aliveSecond || 0;
  const h = Math.floor(aliveSecond / 3600);
  const minute = Math.floor((aliveSecond / 60) % 60);
  const second = Math.ceil(aliveSecond % 60);

  const hours = h > 0 ? `${h}小时` : '';
  const minutes = minute < 10 ? `0${minute}` : `${minute}`;
  const seconds = second < 10 ? `0${second}` : `${second}`;

  return `${hours}${minutes}分${seconds}秒`;
};

// 启动定时任务
const startTask = () => {
  task.value = setInterval(getMediaInfoFun, 1000);
};

// 停止定时任务
const stopTask = () => {
  if (task.value) {
    clearInterval(task.value);
    task.value = null;
  }
};

// 生命周期钩子
onMounted(() => {
  getMediaInfoFun(); // 初始化时获取数据
  startTask(); // 启动定时任务
});

onUnmounted(() => {
  stopTask();
});
</script>

<style scoped>
.media-info {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 13px;
  color: #909399;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.section-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.row-label {
  font-size: 13px;
  color: #909399;
}

.row-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
</style>
