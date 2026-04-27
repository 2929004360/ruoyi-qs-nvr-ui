<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes class="default-theme">
        <pane size="20">
          <el-col>
            <DeviceTree @clickEvent="clickEvent"
                        :isContextmenu="false"
            ></DeviceTree>
          </el-col>
        </pane>

        <pane size="80">
          <el-col>
            <div id="live" class="live-container">
              <div v-loading="loading" class="live-content" element-loading-text="拼命加载中">
                <div class="video-container">
                  <div class="control-bar">
                    <div class="split-controls">
                      <span class="split-label">
                        <el-icon><Monitor /></el-icon>
                        分屏
                      </span>
                      <div class="split-grid">
                        <div 
                          v-for="(item, index) in splitOptions" 
                          :key="index"
                          class="split-item"
                          :class="{ active: spiltIndex === index }"
                          @click="handleSplitChange(index)"
                        >
                          <div class="split-preview" :data-split="item.label">
                            <div v-for="i in parseInt(item.label)" :key="i" class="preview-dot"></div>
                          </div>
                          <span class="split-text">{{ item.label }}屏</span>
                        </div>
                      </div>
                    </div>

                    <div class="toolbar-right">
                      <el-tooltip content="一键清空" placement="top">
                        <el-button circle @click="handleClearAll" :icon="Delete" class="toolbar-btn danger" />
                      </el-tooltip>
                      <el-tooltip content="保存布局" placement="top">
                        <el-button circle @click="handleSaveLayout" :icon="Document" class="toolbar-btn" />
                      </el-tooltip>
                      <el-tooltip content="恢复布局" placement="top">
                        <el-button circle @click="handleRestoreLayout" :icon="RefreshLeft" class="toolbar-btn" />
                      </el-tooltip>
                      <el-tooltip content="全屏" placement="top">
                        <el-button circle @click="fullScreen()" :icon="FullScreen" class="toolbar-btn" />
                      </el-tooltip>
                    </div>
                  </div>

                  <div class="player-container">
                    <div
                        ref="playBox"
                        class="play-grid"
                        :style="liveStyle"
                    >
                      <div
                          v-for="i in layout[spiltIndex].spilt"
                          :key="i"
                          class="play-box"
                          :class="{ active: playerIdx === (i-1) }"
                          :style="layout[spiltIndex].style && layout[spiltIndex].style(i-1)"
                          @click="playerIdx = (i-1)"
                      >
                        <div v-if="!videoUrl[i-1]" class="no-signal">
                          <div class="no-signal-icon">
                            <el-icon size="32">
                              <VideoPlay />
                            </el-icon>
                          </div>
                          <span>{{ videoTip[i - 1] ? videoTip[i - 1] : "无信号" }}</span>
                        </div>
                        <div v-else class="player-wrapper">
                          <div class="close-btn" @click.stop="deleteClick(i-1)">
                            <el-icon size="16">
                              <Close />
                            </el-icon>
                          </div>
                          <EasyPlayer
                              :ref="`player${i-1}`"
                              :id="`player${i-1}`"
                              class="easy-player"
                              width="100"
                              height="100"
                              :isPercentage="true"
                              :quality="quality"
                              :defaultQuality="defaultQuality"
                              :isPtz="isPtz"
                              :isQuality="isQuality"
                              :hasAudio="enableAudio[i-1] === '1'"
                              :isMute="enableAudio[i-1] === '1'"
                              :isLive="isLive"
                              :videoUrl="videoUrl[i-1]"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </pane>
      </splitpanes>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="Live">
import { ref, computed, reactive, onMounted, getCurrentInstance, nextTick } from 'vue'
import EasyPlayer from "@/components/EasyPlayer";
import {Pane, Splitpanes} from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import DeviceTree from '@/components/DeviceTree'
import screenFull from 'screenfull'
import {ElMessageBox} from "element-plus";
import {PullConfig, RTPServerParam} from "@/types/api";
import {loadRecord, rtpPlay, streamPullPlay, streamPullPush, startGb28181Play, startJt1078Play} from "@/api/qs/zlm";
import {getDevice, getVideoSnapshot} from "@/api/qs/device";
import {FullScreen, Close, VideoPlay, Delete, Document, RefreshLeft, Monitor} from '@element-plus/icons-vue'

const {proxy} = getCurrentInstance()

// 本地存储键名
const STORAGE_KEY = 'live-layout-config'

// 响应式状态
const enableAudio = ref([''])
const videoUrl = ref([''])
const videoTip = ref([''])
const spiltIndex = ref(1)        // 默认4屏
const playerIdx = ref(0)         // 激活播放器
const count = ref(15)
const total = ref(0)
const loading = ref(false)

const wsUrl = ref('');
const quality = ref(['普清', '高清', '超清']);
const defaultQuality = ref('高清');
const isPtz = ref(true);
const isQuality = ref(true);
const isLive = ref(true);

// 分屏选项 - 带可视化预览数据
const splitOptions = [
  { label: '1', value: 0 },
  { label: '4', value: 1 },
  { label: '6', value: 2 },
  { label: '9', value: 3 },
  { label: '12', value: 4 },
  { label: '16', value: 5 },
  { label: '25', value: 6 }
]

const layout = reactive([
  {
    spilt: 1,
    columns: '1fr',
    rows: '1fr',
    style: () => ({})
  },
  {
    spilt: 4,
    columns: '1fr 1fr',
    rows: '1fr 1fr',
    style: () => ({})
  },
  {
    spilt: 6,
    columns: '1fr 1fr 1fr',
    rows: '1fr 1fr',
    style: () => ({})
  },
  {
    spilt: 9,
    columns: '1fr 1fr 1fr',
    rows: '1fr 1fr 1fr',
    style: () => ({})
  },
  {
    spilt: 12,
    columns: '1fr 1fr 1fr 1fr',
    rows: '1fr 1fr 1fr',
    style: () => ({})
  },
  {
    spilt: 16,
    columns: '1fr 1fr 1fr 1fr',
    rows: '1fr 1fr 1fr 1fr',
    style: () => ({})
  },
  {
    spilt: 25,
    columns: '1fr 1fr 1fr 1fr 1fr',
    rows: '1fr 1fr 1fr 1fr 1fr',
    style: () => ({})
  }
])

// 组件挂载时尝试恢复布局
onMounted(() => {
  handleRestoreLayout()
})

function clickEvent(id) {
  sendDevicePush(id)
}

async function sendDevicePush(id) {
  loading.value = true
  const idxTmp = playerIdx.value
  videoTip.value[idxTmp] = '正在拉流...'

  getDevice(id).then((res) => {
    let row = res.data

    if (row.type === '1' || row.type === '2' || row.type === '3' || row.type === '4' || row.type === '5') {
      let data = {
        deviceId: row.id,
        app: '',
        stream: row.deviceCode,
        url: row.liveAddress,
        enable_audio: false,
        enable_mp4: false,
        rtp_type: '1',
        timeOut: 10,
      } as PullConfig;

      if (row.type === '1') {
        data.app = "rtsp"
      } else if (row.type === '2') {
        data.app = "rtmp"
      } else if (row.type === '3') {
        data.app = "flv"
      } else if (row.type === '4') {
        data.app = "hls"
      } else if (row.type === '5') {
        data.app = "onvif"
      }

      if (row.type === '3' && row.flvType === 'ws') {
        if (row.liveAddress != null) {
          data.url = convertWsToHttp(row.liveAddress)
        }
      }

      if (row.protocol === 'UDP') {
        data.rtp_type = '0'
      } else if (row.protocol === 'TCP') {
        data.rtp_type = '1'
      }

      if (row.enableAudio === '1') {
        data.enable_audio = true
      }

      if (row.enableMp4 === '1') {
        data.enable_mp4 = true
      }

      streamPullPlay(data).then(async (res: any) => {
        await nextTick(async () => {
          let videoUrl
          if (location.protocol === 'https:') {
            videoUrl = res.data.wss_flv
          } else {
            videoUrl = res.data.ws_flv
          }

          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)

          quality.value = []
          defaultQuality.value = ''
          isPtz.value = false
          isQuality.value = false
          isLive.value = true

          await nextTick()
          const playerRef = proxy.$refs[`player${idxTmp}`]
          if (playerRef && playerRef.length > 0) {
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        videoTip.value[idxTmp] = '播放失败'
      })
          .finally(() => {
            loading.value = false
          })
    } else if (row.type === '6') {
      loadRecord(row.id).then(async (res: any) => {
        await nextTick(async () => {
          let videoUrl
          if (location.protocol === 'https:') {
            videoUrl = res.data.wss_flv
          } else {
            videoUrl = res.data.ws_flv
          }

          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)

          quality.value = []
          defaultQuality.value = ''
          isPtz.value = false
          isQuality.value = false
          isLive.value = true

          await nextTick()
          const playerRef = proxy.$refs[`player${idxTmp}`]
          if (playerRef && playerRef.length > 0) {
            playerRef[0].play(videoUrl)
          }

          getVideoSnapshot(row.id);
        })
      }).catch(err => {
        videoTip.value[idxTmp] = '播放失败'
      })
          .finally(() => {
            loading.value = false
          })
    } else if (row.type === '7' || row.type === '8' || row.type === '9') {
      let data = {
        app: "haikang",
        streamId: row.deviceCode,
        tcpMode: "0",
        type: row.type,
        id: row.id
      } as RTPServerParam;

      if (row.type === '7') {
        data.app = "haikang"
      } else if (row.type === '8') {
        data.app = "haikang_isup"
      } else if (row.type === '9') {
        data.app = "dahua"
      }

      rtpPlay(data).then(async (res: any) => {
        await nextTick(async () => {
          let videoUrl
          if (location.protocol === 'https:') {
            videoUrl = res.data.wss_flv
          } else {
            videoUrl = res.data.ws_flv
          }

          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)

          quality.value = []
          defaultQuality.value = ''
          isPtz.value = false
          isQuality.value = false
          isLive.value = true

          await nextTick()
          const playerRef = proxy.$refs[`player${idxTmp}`]
          if (playerRef && playerRef.length > 0) {
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        videoTip.value[idxTmp] = '播放失败'
      })
          .finally(() => {
            loading.value = false
          })
    } else if (row.type === '13') {
      streamPullPush(row.id).then(async (res: any) => {
        await nextTick(async () => {
          let videoUrl
          if (location.protocol === 'https:') {
            videoUrl = res.data.wss_flv
          } else {
            videoUrl = res.data.ws_flv
          }

          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)

          quality.value = []
          defaultQuality.value = ''
          isPtz.value = false
          isQuality.value = false
          isLive.value = true

          await nextTick()
          const playerRef = proxy.$refs[`player${idxTmp}`]
          if (playerRef && playerRef.length > 0) {
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        videoTip.value[idxTmp] = '播放失败'
      })
          .finally(() => {
            loading.value = false
          })
    } else if (row.type === '12') {
      startGb28181Play(row.id).then(async (res: any) => {
        await nextTick(async () => {
          let videoUrl
          if (location.protocol === 'https:') {
            videoUrl = res.data.wss_flv
          } else {
            videoUrl = res.data.ws_flv
          }

          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)

          quality.value = []
          defaultQuality.value = ''
          isPtz.value = false
          isQuality.value = false
          isLive.value = true

          await nextTick()
          const playerRef = proxy.$refs[`player${idxTmp}`]
          if (playerRef && playerRef.length > 0) {
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        videoTip.value[idxTmp] = '播放失败'
      })
          .finally(() => {
            loading.value = false
          })
    } else if (row.type === '14') {
      startJt1078Play(row.id).then(async (res: any) => {
        await nextTick(async () => {
          let videoUrl
          if (location.protocol === 'https:') {
            videoUrl = res.data.wss_flv
          } else {
            videoUrl = res.data.ws_flv
          }

          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)

          quality.value = []
          defaultQuality.value = ''
          isPtz.value = false
          isQuality.value = false
          isLive.value = true

          await nextTick()
          const playerRef = proxy.$refs[`player${idxTmp}`]
          if (playerRef && playerRef.length > 0) {
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        videoTip.value[idxTmp] = '播放失败'
      })
          .finally(() => {
            loading.value = false
          })
    }
  })
}

function setPlayUrl(url, idx) {
  videoUrl.value[idx] = url
}

function setEnableAudio(url, idx) {
  enableAudio.value[idx] = url
}

function fullScreen() {
  if (screenFull.isEnabled) {
    screenFull.toggle(proxy.$refs["playBox"])
  }
}

const liveStyle = computed(() => {
  const config = layout[spiltIndex.value]
  const gap = config.spilt <= 9 ? '8px' : (config.spilt <= 16 ? '6px' : '4px')
  return {
    display: 'grid',
    gridTemplateColumns: config.columns,
    gridTemplateRows: config.rows,
    gap: gap
  }
})

function getPlayerClass(splitIndex, i) {
  let classStr = 'play-box'
  if (playerIdx.value === (i - 1)) {
    classStr += ' active'
  }
  return classStr
}

/**
 * 删除视频
 */
function deleteClick(index) {
  ElMessageBox.confirm(
      '是否删除该播放端口?',
      '温馨提示！',
      {
        confirmButtonText: '确实',
        cancelButtonText: '取消',
        type: 'warning',
      }
  )
      .then(() => {
        videoUrl.value.splice(index, 1);
        videoTip.value.splice(index, 1);
        proxy.$modal.msgSuccess("删除成功")
      })
      .catch(() => {

      })
}

/**
 * 处理分屏变化
 */
function handleSplitChange(index) {
  spiltIndex.value = index
  // 确保数组长度足够
  const targetLength = layout[index].spilt
  while (videoUrl.value.length < targetLength) {
    videoUrl.value.push('')
    videoTip.value.push('')
    enableAudio.value.push('')
  }
}

/**
 * 一键清空所有分屏
 */
function handleClearAll() {
  ElMessageBox.confirm(
      '确定要清空所有分屏播放吗?',
      '温馨提示！',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  )
      .then(() => {
        const total = layout[spiltIndex.value].spilt
        videoUrl.value = Array(total).fill('')
        videoTip.value = Array(total).fill('')
        enableAudio.value = Array(total).fill('')
        proxy.$modal.msgSuccess("清空成功")
      })
      .catch(() => {

      })
}

/**
 * 保存布局到本地存储
 */
function handleSaveLayout() {
  const config = {
    spiltIndex: spiltIndex.value,
    videoUrl: [...videoUrl.value],
    videoTip: [...videoTip.value],
    enableAudio: [...enableAudio.value]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  proxy.$modal.msgSuccess("布局已保存")
}

/**
 * 从本地存储恢复布局
 */
function handleRestoreLayout() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const config = JSON.parse(saved)
      spiltIndex.value = config.spiltIndex
      videoUrl.value = [...config.videoUrl]
      videoTip.value = [...config.videoTip]
      enableAudio.value = [...config.enableAudio]
      proxy.$modal.msgSuccess("布局已恢复")
    } catch (e) {
      console.error('恢复布局失败', e)
    }
  }
}

const convertWsToHttp = (wsUrl: string) => {
  if (!wsUrl) return wsUrl;
  const regex = /^wss?:\/\//;
  if (regex.test(wsUrl)) {
    if (wsUrl.startsWith('wss://')) {
      return wsUrl.replace(regex, 'https://');
    } else {
      return wsUrl.replace(regex, 'http://');
    }
  }
  return wsUrl;
}
</script>

<style scoped>
.live-container {
  height: calc(100vh - 124px);
  width: 100%;
}

.live-content {
  height: 100%;
  display: flex;
  flex-direction: row;
}

@media (max-width: 768px) {
  .live-content {
    flex-direction: column;
  }
}

.video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  position: relative;
  margin: 0;
}

.control-bar {
  height: auto;
  min-height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  z-index: 10;
  flex-wrap: wrap;
  gap: 16px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.split-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.split-label {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.split-label .el-icon {
  color: #409eff;
}

.split-grid {
  display: flex;
  gap: 6px;
}

.split-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: 2px solid transparent;
}

.split-item:hover {
  background: rgba(64, 158, 255, 0.08);
  transform: translateY(-2px);
}

.split-item.active {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(102, 178, 255, 0.1) 100%);
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.25);
}

.split-preview {
  width: 36px;
  height: 30px;
  display: grid;
  gap: 2px;
  padding: 3px;
}

.split-preview[data-split="1"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.split-preview[data-split="4"] {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.split-preview[data-split="6"] {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.split-preview[data-split="9"] {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

.split-preview[data-split="12"] {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

.split-preview[data-split="16"] {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
}

.split-preview[data-split="25"] {
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
}

.preview-dot {
  background: #94a3b8;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.split-item.active .preview-dot {
  background: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}

.split-text {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  transition: color 0.3s ease;
}

.split-item.active .split-text {
  color: #409eff;
}



.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-btn {
  width: 40px;
  height: 40px;
  color: #409eff;
  background: rgba(64, 158, 255, 0.08);
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-btn:hover {
  background: #409eff;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.toolbar-btn.danger {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.toolbar-btn.danger:hover {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.player-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

.play-grid {
  width: 100%;
  height: 100%;
  display: grid;
}

.play-box {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.play-box:hover {
  border-color: #409eff;
  transform: translateY(-4px);
  z-index: 10;
  box-shadow: 0 16px 48px rgba(64, 158, 255, 0.4),
              0 8px 24px rgba(0, 0, 0, 0.2);
}

.play-box.active {
  border-color: #409eff;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.15), 0 12px 40px rgba(64, 158, 255, 0.25);
  z-index: 5;
}

.no-signal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.no-signal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.no-signal span {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #9ca3af;
}

.player-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  opacity: 0;
}

.play-box:hover .close-btn {
  opacity: 1;
}

.close-btn:hover {
  background: #ef4444;
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
}

.easy-player {
  width: 100%;
  height: 100%;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .control-bar {
    flex-direction: column;
    padding: 16px;
  }

  .split-controls, .toolbar-right {
    width: 100%;
    justify-content: center;
  }

  .split-grid {
    flex-wrap: wrap;
    justify-content: center;
  }

  .player-container {
    padding: 12px;
  }
}
</style>

<!-- 暗黑模式适配 -->
<style>
html.dark {
  .split-item:hover {
    background: rgba(64, 158, 255, 0.15);
  }

  .split-item.active {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.25) 0%, rgba(102, 178, 255, 0.18) 100%);
  }

  .preview-dot {
    background: #64748b;
  }

  .split-item.active .preview-dot {
    background: #409eff;
  }

  .split-text {
    color: #94a3b8;
  }

  .toolbar-btn {
    background: rgba(64, 158, 255, 0.12);
  }

  .toolbar-btn:hover {
    background: #409eff;
  }

  .toolbar-btn.danger {
    background: rgba(239, 68, 68, 0.12);
  }

  .toolbar-btn.danger:hover {
    background: #ef4444;
  }

  .control-bar {
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(36, 36, 36, 0.98) 100%);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .split-label {
    color: #e0e0e0;
  }

  .video-container {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
                0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
</style>
