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
                              :videoUrl="videoUrl[i-1]"
                              @ptz="(data) => handlePtz(data, i-1)"/>
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
import {getDevice, getVideoSnapshot, startPtz, endPtz} from "@/api/qs/device";
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

// 云台控制
const controSpeed = ref(5);
const controSpeedMax = ref(10);
const lastPtzCommand = ref('up');
const deviceRows = ref([])  // 保存每个播放器对应的设备信息

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

async function sendDevicePush(id, targetIdx, loadingCounterRef = null) {
  const idxTmp = targetIdx !== undefined ? targetIdx : playerIdx.value
  
  if (loadingCounterRef !== null) {
    loadingCounterRef.count++
    loading.value = true
  } else {
    loading.value = true
  }
  
  videoTip.value[idxTmp] = '正在拉流...'

  try {
    const res = await getDevice(id)
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

      const playRes = await streamPullPlay(data)
      await nextTick(async () => {
        let videoUrl
        if (location.protocol === 'https:') {
          videoUrl = playRes.data.wss_flv
        } else {
          videoUrl = playRes.data.ws_flv
        }

        setPlayUrl(videoUrl, idxTmp)
        setEnableAudio(row.enableAudio, idxTmp)

        quality.value = []
        defaultQuality.value = ''
        isPtz.value = row.type === '5' || row.type === '12'  // ONVIF 和 GB28181 支持云台
        isQuality.value = false
        isLive.value = true
        
        // 保存当前设备信息
        deviceRows.value[idxTmp] = row

        await nextTick()
        const playerRef = proxy.$refs[`player${idxTmp}`]
        if (playerRef && playerRef.length > 0) {
          playerRef[0].play(videoUrl)
        }
      })
    } else if (row.type === '6') {
      const playRes = await loadRecord(row.id)
      await nextTick(async () => {
        let videoUrl
        if (location.protocol === 'https:') {
          videoUrl = playRes.data.wss_flv
        } else {
          videoUrl = playRes.data.ws_flv
        }

        setPlayUrl(videoUrl, idxTmp)
        setEnableAudio(row.enableAudio, idxTmp)

        quality.value = []
        defaultQuality.value = ''
        isPtz.value = row.type === '5' || row.type === '12'  // ONVIF 和 GB28181 支持云台
        isQuality.value = false
        isLive.value = true
        
        // 保存当前设备信息
        deviceRows.value[idxTmp] = row

        await nextTick()
        const playerRef = proxy.$refs[`player${idxTmp}`]
        if (playerRef && playerRef.length > 0) {
          playerRef[0].play(videoUrl)
        }

        getVideoSnapshot(row.id);
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

      const playRes = await rtpPlay(data)
      await nextTick(async () => {
        let videoUrl
        if (location.protocol === 'https:') {
          videoUrl = playRes.data.wss_flv
        } else {
          videoUrl = playRes.data.ws_flv
        }

        setPlayUrl(videoUrl, idxTmp)
        setEnableAudio(row.enableAudio, idxTmp)

        quality.value = []
        defaultQuality.value = ''
        isPtz.value = row.type === '5' || row.type === '12'  // ONVIF 和 GB28181 支持云台
        isQuality.value = false
        isLive.value = true
        
        // 保存当前设备信息
        deviceRows.value[idxTmp] = row

        await nextTick()
        const playerRef = proxy.$refs[`player${idxTmp}`]
        if (playerRef && playerRef.length > 0) {
          playerRef[0].play(videoUrl)
        }
      })
    } else if (row.type === '13') {
      const playRes = await streamPullPush(row.id)
      await nextTick(async () => {
        let videoUrl
        if (location.protocol === 'https:') {
          videoUrl = playRes.data.wss_flv
        } else {
          videoUrl = playRes.data.ws_flv
        }

        setPlayUrl(videoUrl, idxTmp)
        setEnableAudio(row.enableAudio, idxTmp)

        quality.value = []
        defaultQuality.value = ''
        isPtz.value = row.type === '5' || row.type === '12'  // ONVIF 和 GB28181 支持云台
        isQuality.value = false
        isLive.value = true
        
        // 保存当前设备信息
        deviceRows.value[idxTmp] = row

        await nextTick()
        const playerRef = proxy.$refs[`player${idxTmp}`]
        if (playerRef && playerRef.length > 0) {
          playerRef[0].play(videoUrl)
        }
      })
    } else if (row.type === '12') {
      const playRes = await startGb28181Play(row.id)
      await nextTick(async () => {
        let videoUrl
        if (location.protocol === 'https:') {
          videoUrl = playRes.data.wss_flv
        } else {
          videoUrl = playRes.data.ws_flv
        }

        setPlayUrl(videoUrl, idxTmp)
        setEnableAudio(row.enableAudio, idxTmp)

        quality.value = []
        defaultQuality.value = ''
        isPtz.value = row.type === '5' || row.type === '12'  // ONVIF 和 GB28181 支持云台
        isQuality.value = false
        isLive.value = true
        
        // 保存当前设备信息
        deviceRows.value[idxTmp] = row

        await nextTick()
        const playerRef = proxy.$refs[`player${idxTmp}`]
        if (playerRef && playerRef.length > 0) {
          playerRef[0].play(videoUrl)
        }
      })
    } else if (row.type === '14') {
      const playRes = await startJt1078Play(row.id)
      await nextTick(async () => {
        let videoUrl
        if (location.protocol === 'https:') {
          videoUrl = playRes.data.wss_flv
        } else {
          videoUrl = playRes.data.ws_flv
        }

        setPlayUrl(videoUrl, idxTmp)
        setEnableAudio(row.enableAudio, idxTmp)

        quality.value = []
        defaultQuality.value = ''
        isPtz.value = row.type === '5' || row.type === '12'  // ONVIF 和 GB28181 支持云台
        isQuality.value = false
        isLive.value = true
        
        // 保存当前设备信息
        deviceRows.value[idxTmp] = row

        await nextTick()
        const playerRef = proxy.$refs[`player${idxTmp}`]
        if (playerRef && playerRef.length > 0) {
          playerRef[0].play(videoUrl)
        }
      })
    }
  } catch (err) {
    console.error('拉流失败', err)
    videoTip.value[idxTmp] = '播放失败'
  } finally {
    if (loadingCounterRef !== null) {
      loadingCounterRef.count--
      if (loadingCounterRef.count === 0) {
        loading.value = false
      }
    } else {
      loading.value = false
    }
  }
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
        deviceRows.value.splice(index, 1);
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
    deviceRows.value.push(null)
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
        deviceRows.value = Array(total).fill(null)
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
    enableAudio: [...enableAudio.value],
    deviceRows: [...deviceRows.value]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  proxy.$modal.msgSuccess("布局已保存")
}

/**
 * 从本地存储恢复布局
 */
async function handleRestoreLayout() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const config = JSON.parse(saved)
      spiltIndex.value = config.spiltIndex
      
      // 确保数组长度足够
      const targetLength = layout[spiltIndex.value].spilt
      while (videoUrl.value.length < targetLength) {
        videoUrl.value.push('')
        videoTip.value.push('')
        enableAudio.value.push('')
        deviceRows.value.push(null)
      }
      
      // 恢复基础数据
      videoUrl.value = [...config.videoUrl]
      videoTip.value = [...config.videoTip]
      enableAudio.value = [...config.enableAudio]
      deviceRows.value = config.deviceRows ? [...config.deviceRows] : []
      
      proxy.$modal.msgSuccess("布局已恢复")
      
      // 重新拉流播放
      await nextTick()
      await restorePlayStreams()
    } catch (e) {
      console.error('恢复布局失败', e)
    }
  }
}

/**
 * 恢复播放流
 */
async function restorePlayStreams() {
  const loadingCounter = { count: 0 }
  const promises = []
  
  for (let i = 0; i < deviceRows.value.length; i++) {
    const device = deviceRows.value[i]
    if (device && device.id) {
      // 重新拉流，传入明确的索引和 loading 计数器
      videoTip.value[i] = '正在恢复...'
      promises.push(sendDevicePush(device.id, i, loadingCounter))
    }
  }
  
  // 并行执行所有拉流
  await Promise.all(promises)
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

/**
 * 云台方向控制
 * @param command
 * @param idx 播放器索引
 */
const ptzCamera = async (command, idx) => {
  if (!deviceRows.value[idx] || !deviceRows.value[idx].id) {
    proxy.$modal.msgError('请先选择设备')
    return
  }
  
  try {
    if (command !== 'stop') {
      await startPtz(deviceRows.value[idx].id, command, controSpeed.value)
    } else {
      await endPtz(deviceRows.value[idx].id, 'up', controSpeed.value)
    }
  } catch (error) {
    console.error('云台控制失败', error)
    proxy.$modal.msgError('云台控制失败')
  }
}

/**
 * EasyPlayer 云台事件处理
 * @param data 云台数据
 * @param idx 播放器索引
 */
const handlePtz = async (data, idx) => {
  console.log('handlePtz', data, idx)
  if (!deviceRows.value[idx] || !deviceRows.value[idx].id) {
    proxy.$modal.msgError('请先选择设备')
    return
  }
  
  try {
    if (data === 'stop') {
      await endPtz(deviceRows.value[idx].id, lastPtzCommand.value, controSpeed.value)
    } else {
      lastPtzCommand.value = data
      await startPtz(deviceRows.value[idx].id, data, controSpeed.value)
    }
  } catch (error) {
    console.error('云台控制失败', error)
    proxy.$modal.msgError('云台控制失败')
  }
}
</script>

<style scoped lang="scss">
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
  color: var(--el-text-color-primary);
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.split-label .el-icon {
  color: var(--el-color-primary);
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
  background: rgba(var(--el-color-primary-rgb), 0.08);
  transform: translateY(-2px);
}

.split-item.active {
  background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb), 0.15) 0%, rgba(var(--el-color-primary-rgb), 0.1) 100%);
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.25);
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
  background: var(--el-text-color-placeholder);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.split-item.active .preview-dot {
  background: var(--el-color-primary);
  box-shadow: 0 0 8px rgba(var(--el-color-primary-rgb), 0.5);
}

.split-text {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  transition: color 0.3s ease;
}

.split-item.active .split-text {
  color: var(--el-color-primary);
}



.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-btn {
  width: 40px;
  height: 40px;
  color: var(--el-color-primary);
  background: rgba(var(--el-color-primary-rgb), 0.08);
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-btn:hover {
  background: var(--el-color-primary);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
}

.toolbar-btn.danger {
  color: var(--el-color-danger);
  background: rgba(var(--el-color-danger-rgb), 0.08);
}

.toolbar-btn.danger:hover {
  background: var(--el-color-danger);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--el-color-danger-rgb), 0.3);
}

.player-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding-top: 10px;
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
  box-shadow: 0 8px 24px rgba(var(--el-color-primary-rgb), 0.12);
}

.play-box:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-4px);
  z-index: 10;
  box-shadow: 0 16px 48px rgba(var(--el-color-primary-rgb), 0.25),
              0 8px 24px rgba(var(--el-color-primary-rgb), 0.08);
}

.play-box.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 4px rgba(var(--el-color-primary-rgb), 0.12), 0 12px 40px rgba(var(--el-color-primary-rgb), 0.18);
  z-index: 5;
}

.no-signal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-secondary);
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

/* 暗黑模式适配 */
html.dark {
  .control-bar {
    background: var(--el-bg-color-page);
    border-bottom-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .video-container {
    background: var(--el-bg-color-page);
  }

  .play-box {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }

  .play-box:hover {
    border-color: var(--el-color-primary);
  }

  .play-box.active {
    border-color: var(--el-color-primary);
  }

  .no-signal {
    color: var(--el-text-color-secondary);
  }

  .no-signal-icon {
    background: rgba(var(--el-text-color-secondary-rgb), 0.15);
    color: var(--el-text-color-secondary);
  }

  .no-signal span {
    color: var(--el-text-color-placeholder);
  }

  .split-item:hover {
    background: rgba(var(--el-color-primary-rgb), 0.15);
  }

  .split-item.active {
    background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb), 0.25) 0%, rgba(var(--el-color-primary-rgb), 0.18) 100%);
  }

  .split-item.active .preview-dot {
    background: var(--el-color-primary);
    box-shadow: 0 0 8px rgba(var(--el-color-primary-rgb), 0.6);
  }

  .toolbar-btn {
    background: rgba(var(--el-color-primary-rgb), 0.12);
  }

  .toolbar-btn.danger {
    background: rgba(var(--el-color-danger-rgb), 0.12);
  }
}
</style>
