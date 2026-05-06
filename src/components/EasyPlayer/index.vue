<template>
  <div
    class="easy-player-wrapper"
    :class="{
      'is-loading': isLoading,
      'is-error': hasError,
      'is-dark': isDarkMode,
      'is-fullscreen': isFullscreen
    }"
    :style="wrapperStyle"
  >
    <!-- 播放器容器 -->
    <div class="player-container">
      <div class="player_box" :id="id ? id : 'player_box'"/>
    </div>

    <!-- 封面图/Poster 层 -->
    <div
      v-if="poster && !isPlaying && !hasError"
      class="player-poster"
      :style="{ backgroundImage: `url(${poster})` }"
    >
      <div class="poster-overlay">
        <div class="play-button" @click="handlePlayClick">
          <el-icon :size="48"><VideoPlay /></el-icon>
        </div>
        <div v-if="videoTitle" class="poster-title">{{ videoTitle }}</div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="player-loading">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loading-text">正在加载视频...</div>
      <div class="loading-sub">{{ loadingProgress }}</div>
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError" class="player-error">
      <div class="error-icon">
        <el-icon :size="40"><WarningFilled /></el-icon>
      </div>
      <div class="error-title">视频加载失败</div>
      <div class="error-desc">请检查网络连接或视频地址是否正确</div>
      <el-button type="primary" class="error-retry" @click="handleRetry">
        <el-icon><RefreshRight /></el-icon>
        重新加载
      </el-button>
    </div>

    <!-- 顶部信息栏 -->
    <div v-if="videoTitle && isPlaying" class="player-info-bar">
      <div class="info-left">
        <el-icon class="info-icon"><VideoCamera /></el-icon>
        <span class="info-title">{{ videoTitle }}</span>
      </div>
      <div class="info-right">
        <span v-if="isLive" class="live-badge">
          <span class="live-dot"></span>
          直播中
        </span>
      </div>
    </div>

    <!-- 底部控制栏覆盖（当播放器原生控制隐藏时使用） -->
    <div v-if="showCustomControls && isPlaying" class="player-controls-overlay">
      <div class="controls-main">
        <el-button text class="control-btn" @click="togglePlay">
          <el-icon :size="18"><VideoPause v-if="isPlayingState" /><VideoPlay v-else /></el-icon>
        </el-button>
        <el-button text class="control-btn" @click="toggleMute">
          <el-icon :size="18"><Mute v-if="isMuted" /><Microphone v-else /></el-icon>
        </el-button>
        <el-button text class="control-btn" @click="handleScreenshot">
          <el-icon :size="18"><Camera /></el-icon>
        </el-button>
        <el-button text class="control-btn" @click="handleFullscreen">
          <el-icon :size="18"><FullScreen /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 网络状态指示 -->
    <div v-if="showNetworkStatus && networkStatus" class="network-status" :class="networkStatus.type">
      <el-icon :size="14"><Connection /></el-icon>
      <span>{{ networkStatus.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  VideoPlay, VideoPause, WarningFilled, RefreshRight,
  VideoCamera, Mute, Microphone, Camera, FullScreen, Connection
} from '@element-plus/icons-vue'
import useSettingsStore from '@/store/modules/settings'

const emit = defineEmits(['error', 'play', 'pause', 'fullscreen', 'screenshot', 'ptz'])

const props = defineProps({
  videoUrl: { type: String },
  width: { type: [Number, String], default: 1000 },
  height: { type: [Number, String], default: 500 },
  isPercentage: { type: Boolean, default: false },
  isLive: { type: Boolean, default: true },
  hasAudio: { type: Boolean, default: true },
  watermark: { type: Object },
  fullWatermark: { type: Object },
  quality: { type: Array, default: () => ['普清', '高清', '超清'] },
  defaultQuality: { type: String, default: '高清' },
  isPtz: { type: Boolean, default: true },
  isQuality: { type: Boolean, default: true },
  poster: { type: String, default: '' },
  isMute: { type: Boolean, default: true },
  id: { type: String },
  videoTitle: { type: String, default: '' },
  showCustomControls: { type: Boolean, default: false },
  showNetworkStatus: { type: Boolean, default: false },
})

const easyplayer = ref<any>(null)
const live = ref('STOP')
const isLoading = ref(false)
const hasError = ref(false)
const isPlaying = ref(false)
const isPlayingState = ref(false)
const isMuted = ref(props.isMute)
const isFullscreen = ref(false)
const loadingProgress = ref('')
const networkStatus = ref<{ type: string; text: string } | null>(null)

const settingsStore = useSettingsStore()
const isDarkMode = computed(() => settingsStore.isDark)

// 容器尺寸样式
const wrapperStyle = computed(() => {
  const w = typeof props.width === 'number' ? `${props.width}px` : props.width
  const h = typeof props.height === 'number' ? `${props.height}px` : props.height
  if (props.isPercentage) {
    return { width: w, height: h }
  }
  return { width: w, height: h }
})

onMounted(() => {
  if (props.videoUrl) {
    isLoading.value = true
    playCreate()
  }
})

onBeforeUnmount(() => {
  if (easyplayer.value) {
    destroy()
  }
})

watch(() => props.videoUrl, (newUrl) => {
  if (newUrl && easyplayer.value) {
    hasError.value = false
    isLoading.value = true
    play(newUrl)
  }
})

const playCreate = () => {
  const container = props.id
    ? document.getElementById(props.id)
    : document.getElementById('player_box')

  if (!container) return

  const config: any = {
    isLive: props.isLive,
    hasAudio: props.hasAudio,
    isMute: props.isMute,
    stretch: false,
    poster: props.poster,
    bufferTime: 0.2,
    loadTimeOut: 10,
    loadTimeReplay: 3,
    MSE: false,
    WCS: false,
    WASM: false,
    WASMSIMD: false,
    gpuDecoder: false,
    isFlv: false,
    webGPU: false,
    canvasRender: false,
    isRtcSRS: false,
    isRtcZLM: false,
    isFlow: false,
    quality: props.quality,
    defaultQuality: props.defaultQuality,
    ptzConfig: { ptz: true, ptzMore: true },
    debug: false,
    isBand: true,
    btns: {
      play: true,
      audio: true,
      record: true,
      zoom: true,
      ptz: props.isPtz,
      quality: props.isQuality,
      stretch: true,
      screenshot: true,
      fullscreen: true,
    }
  }

  if (props.watermark) config.watermark = props.watermark
  if (props.fullWatermark) config.fullWatermark = props.fullWatermark

  try {
    easyplayer.value = new (window as any).EasyPlayerPro(container, config)
    bindEvents()
  } catch (e) {
    console.error('EasyPlayer init failed:', e)
    hasError.value = true
    isLoading.value = false
  }
}

const bindEvents = () => {
  if (!easyplayer.value) return

  easyplayer.value.on('play', (data: any) => {
    isLoading.value = false
    isPlaying.value = true
    isPlayingState.value = true
    emit('play', data)
  })

  easyplayer.value.on('pause', (data: any) => {
    isPlayingState.value = false
    emit('pause', data)
  })

  easyplayer.value.on('fullscreen', (data: any) => {
    isFullscreen.value = data
    emit('fullscreen', data)
  })

  easyplayer.value.on('mute', (data: any) => {
    isMuted.value = data
  })

  easyplayer.value.on('screenshots', (data: any) => {
    emit('screenshot', data)
  })

  easyplayer.value.on('error', (data: any) => {
    isLoading.value = false
    hasError.value = true
    emit('error', data)
  })

  easyplayer.value.on('timeout', () => {
    isLoading.value = false
    hasError.value = true
  })

  easyplayer.value.on('liveEnd', () => {
    isPlayingState.value = false
  })

  // 网络状态
  easyplayer.value.on('kBps', (data: any) => {
    if (!props.showNetworkStatus) return
    const speed = Number(data)
    if (speed > 500) {
      networkStatus.value = { type: 'excellent', text: `网络优秀 ${speed}KB/s` }
    } else if (speed > 200) {
      networkStatus.value = { type: 'good', text: `网络良好 ${speed}KB/s` }
    } else if (speed > 50) {
      networkStatus.value = { type: 'normal', text: `网络一般 ${speed}KB/s` }
    } else {
      networkStatus.value = { type: 'poor', text: `网络较差 ${speed}KB/s` }
    }
  })

  // PTZ 事件
  easyplayer.value.on('ptz', (data: any) => {
    // 不支持左上、左下、右上、右下等组合方向
    const unsupportedCommands = ['leftUp', 'leftdown', 'rightup', 'rightdown', 'upleft', 'downleft', 'upright', 'downright']
    if (unsupportedCommands.includes(data)) {
      console.log('不支持的云台命令:', data)
      return
    }
    emit('ptz', data)
  })
}

const play = (url?: string) => {
  const targetUrl = url || props.videoUrl
  if (!targetUrl) return

  hasError.value = false
  isLoading.value = true

  if (easyplayer.value && live.value === 'STOP') {
    live.value = 'LIVE'
    easyplayer.value.play(targetUrl)
  } else if (easyplayer.value && live.value === 'PAUSE') {
    live.value = 'LIVE'
    easyplayer.value.play(targetUrl)
  } else if (!easyplayer.value) {
    playCreate()
    live.value = 'LIVE'
    easyplayer.value?.play(targetUrl)
  }
}

const playback = (url: string) => {
  if (!url) return

  hasError.value = false
  isLoading.value = true

  if (easyplayer.value) easyplayer.value.playback(url)
}

const pause = () => {
  live.value = 'PAUSE'
  if (easyplayer.value) easyplayer.value.pause()
}

const togglePlay = () => {
  if (isPlayingState.value) {
    pause()
  } else {
    play()
  }
}

const setMute = (mute: boolean) => {
  if (easyplayer.value) easyplayer.value.setMute(mute)
}

const toggleMute = () => {
  setMute(!isMuted.value)
}

const isMuteFn = () => {
  return easyplayer.value ? easyplayer.value.isMute() : false
}

const screenshot = (data?: any) => {
  if (easyplayer.value) easyplayer.value.screenshot(data)
}

const handleScreenshot = () => {
  screenshot({ name: 'screenshot', type: 'png', compress: 0.8, download: 'download' })
}

const setFullscreen = () => {
  if (easyplayer.value) easyplayer.value.setFullscreen()
}

const exitFullscreen = () => {
  if (easyplayer.value) easyplayer.value.exitFullscreen()
}

const handleFullscreen = () => {
  if (isFullscreen.value) {
    exitFullscreen()
  } else {
    setFullscreen()
  }
}

const setQuality = () => {
  if (easyplayer.value) easyplayer.value.setQuality()
}

const setRate = () => {
  if (easyplayer.value) easyplayer.value.setRate()
}

const seekTime = () => {
  if (easyplayer.value) easyplayer.value.seekTime()
}

const getVideoInfo = () => {
  return easyplayer.value ? easyplayer.value.getVideoInfo() : null
}

const getAudioInfo = () => {
  return easyplayer.value ? easyplayer.value.getAudioInfo() : null
}

const setMic = (mic: boolean) => {
  if (easyplayer.value) easyplayer.value.setMic(mic)
}

const destroy = () => {
  if (easyplayer.value) {
    live.value = 'STOP'
    easyplayer.value.destroy()
    easyplayer.value = null
  }
}

const handlePlayClick = () => {
  if (props.videoUrl) {
    play(props.videoUrl)
  }
}

const handleRetry = () => {
  hasError.value = false
  isLoading.value = true
  if (easyplayer.value) {
    destroy()
  }
  playCreate()
  if (props.videoUrl) {
    play(props.videoUrl)
  }
}

defineExpose({
  play, playback, pause, setMute, isMute: isMuteFn,
  screenshot, setFullscreen, exitFullscreen, setQuality,
  setRate, seekTime, getVideoInfo, getAudioInfo, setMic, destroy
})
</script>

<style scoped>
/* ==========================================
   EasyPlayer 现代风格包装
   ========================================== */
.easy-player-wrapper {
  position: relative;
  background-color: #000;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
  transition: box-shadow var(--transition-normal, 250ms) ease;
}

.easy-player-wrapper:hover {
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
}

.easy-player-wrapper.is-fullscreen {
  border-radius: 0;
  box-shadow: none;
}

/* 播放器容器 */
.player-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.player_box {
  width: 100%;
  height: 100%;
}

/* ==========================================
   封面图 / Poster
   ========================================== */
.player-poster {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 10;
  cursor: pointer;
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.play-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms) ease;
}

.play-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.08);
}

.play-button:active {
  transform: scale(0.95);
}

.poster-title {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  max-width: 80%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==========================================
   加载状态
   ========================================== */
.player-loading {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--el-color-primary, #409eff);
  animation: spinner-rotate 1s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-duration: 1s;
}

.spinner-ring:nth-child(2) {
  animation-duration: 1.2s;
  inset: 6px;
  border-top-color: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.6);
}

.spinner-ring:nth-child(3) {
  animation-duration: 1.4s;
  inset: 12px;
  border-top-color: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.3);
}

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.loading-sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* ==========================================
   错误状态
   ========================================== */
.player-error {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.error-icon {
  color: var(--el-color-danger, #f56c6c);
}

.error-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.error-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.error-retry {
  margin-top: 8px;
  border-radius: var(--radius-md, 8px);
}

/* ==========================================
   顶部信息栏
   ========================================== */
.player-info-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  padding: 0 16px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-fast, 150ms) ease;
}

.easy-player-wrapper:hover .player-info-bar {
  opacity: 1;
}

.info-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.info-title {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: rgba(var(--el-color-danger-rgb, 245, 108, 108), 0.85);
  border-radius: var(--radius-full, 9999px);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  pointer-events: auto;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  animation: live-pulse 1.5s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

/* ==========================================
   底部控制栏覆盖
   ========================================== */
.player-controls-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  padding: 0 12px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
  display: flex;
  align-items: center;
  z-index: 15;
  opacity: 0;
  transition: opacity var(--transition-fast, 150ms) ease;
}

.easy-player-wrapper:hover .player-controls-overlay {
  opacity: 1;
}

.controls-main {
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-btn {
  color: rgba(255, 255, 255, 0.85) !important;
  padding: 6px !important;
  border-radius: var(--radius-sm, 6px) !important;
}

.control-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

/* ==========================================
   网络状态指示
   ========================================== */
.network-status {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 16;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-sm, 6px);
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.network-status.excellent {
  background: rgba(var(--el-color-success-rgb, 103, 194, 58), 0.85);
  color: #fff;
}

.network-status.good {
  background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.85);
  color: #fff;
}

.network-status.normal {
  background: rgba(var(--el-color-warning-rgb, 230, 162, 60), 0.85);
  color: #fff;
}

.network-status.poor {
  background: rgba(var(--el-color-danger-rgb, 245, 108, 108), 0.85);
  color: #fff;
}
</style>
