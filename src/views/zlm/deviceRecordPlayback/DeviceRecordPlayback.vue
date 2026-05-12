<template>
  <div class="app-container">
    <el-row :gutter="0">
      <splitpanes class="default-theme record-splitpanes">
        <pane size="100">
          <el-col class="player-col">
            <div class="panel-header">
              <div class="header-accent"></div>
              <div class="header-icon-wrap">
                <el-icon><Monitor /></el-icon>
              </div>
              <span>录像播放</span>
              <span v-if="currentDevice" class="device-name">{{ currentDevice.deviceName }}</span>
              <div class="date-panel">
                <el-button :icon="ArrowLeft" @click="prevDay" circle class="date-nav-btn" />
                <el-date-picker
                  :clearable="false"
                  v-model="selectedDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateChange"
                  class="record-date-picker"
                />
                <el-button :icon="ArrowRight" @click="nextDay" circle class="date-nav-btn" />
                <el-button type="primary" @click="handleToday" plain class="today-btn">今天</el-button>
              </div>
            </div>
            <div class="player-area">
              <div id="recordPlayer" class="device-record-wrapper">
                <div class="player-container" :style="'height:' + jessibucaHeight">
                  <div v-if="!currentDevice" class="player-empty-overlay">
                    <div class="empty-content">
                      <div class="empty-icon-wrap">
                        <el-icon size="64"><VideoPlay /></el-icon>
                      </div>
                      <div class="empty-text">
                        {{ !currentDevice ? '加载中...' : '暂无录像数据' }}
                      </div>
                      <div v-if="currentDevice" class="empty-hint">
                        当前设备在所选日期无录像
                      </div>
                    </div>
                  </div>
                  <EasyPlayer
                    v-if="wsUrl && currentDevice"
                    :style="'height:' + jessibucaHeight"
                    :ref="'EasyPlayerRef_' + currentDevice.id"
                    :id="`EasyPlayerRef_${currentDevice.id}`"
                    style="width: 100%"
                    width="100"
                    height="100"
                    @error="easyPlayeError"
                    @play="handlePlaySuccess"
                    :isPercentage="true"
                    :quality="quality"
                    :defaultQuality="defaultQuality"
                    :isPtz="isPtz"
                    :isQuality="isQuality"
                    :hasAudio="false"
                    :isMute="true"
                    :isLive="isLive"
                    :videoUrl="wsUrl"
                  />
                </div>

                <div class="player-option-box" :class="{ 'timeline-disabled': !currentDevice || timeSegments.length === 0 }">
                  <VideoTimeline
                      ref="Timeline"
                      :init-time="initTime"
                      :time-segments="timeSegments"
                      :init-zoom-index="4"
                      :enable-zoom="!!currentDevice && timeSegments.length > 0"
                      :enable-drag="!!currentDevice && timeSegments.length > 0"
                      :show-hover-time="!!currentDevice && timeSegments.length > 0"
                      @timeChange="playTimeChange"
                      @dragTimeChange="playTimeChange"
                      @mousedown="timelineMouseDown"
                      @mouseup="mouseupTimeline"
                  />
                  <div v-if="showTime && playTime && currentDevice && timeSegments.length > 0" class="time-line-show">
                    <span>{{ showTimeValue }}</span>
                  </div>
                </div>

                <div class="player-toolbar" :class="{ 'disabled': !currentDevice || timeSegments.length === 0 }">
                  <div class="player-toolbar-left">
                    <el-tooltip content="截图" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!currentDevice || timeSegments.length === 0" @click="snap">
                        <el-icon><Camera /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="下载" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!currentDevice || timeSegments.length === 0">
                        <el-icon><Download /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>

                  <div class="player-toolbar-center">
                    <el-tooltip :content="playing ? '停止' : '播放'" placement="top">
                      <el-button
                          circle
                          :class="playing ? 'toolbar-btn stop-btn' : 'toolbar-btn play-btn'"
                          :disabled="!currentDevice || timeSegments.length === 0"
                          @click="playing ? stopPlay() : playRecord()"
                      >
                        <el-icon v-if="playing"><VideoPause /></el-icon>
                        <el-icon v-else><VideoPlay /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-dropdown :popper-append-to-body="false" :disabled="!currentDevice || timeSegments.length === 0">
                      <el-button class="toolbar-btn speed-btn" size="small" :disabled="!currentDevice || timeSegments.length === 0">
                        1X
                        <el-icon><ArrowDown /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu class="speed-dropdown-menu">
                          <el-dropdown-item>1X</el-dropdown-item>
                          <el-dropdown-item>2X</el-dropdown-item>
                          <el-dropdown-item>4X</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>

                  <div class="player-toolbar-right">
                    <el-tooltip :content="isFullScreen ? '退出全屏' : '全屏'" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!currentDevice || timeSegments.length === 0" @click="fullScreen">
                        <el-icon v-if="!isFullScreen"><FullScreen /></el-icon>
                        <el-icon v-else><Aim /></el-icon>
                      </el-button>
                    </el-tooltip>
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

<script setup lang="ts" name="DeviceRecordPlayback">
import {getCurrentInstance, nextTick, onMounted, onUnmounted, watch} from 'vue'
import screenfull from 'screenfull'
import { ElLoading, ElMessage } from 'element-plus'
import {Pane, Splitpanes} from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import {
  Aim,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  DArrowLeft,
  DArrowRight,
  Download,
  FullScreen,
  Monitor,
  Refresh,
  VideoCamera,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import {getDevice} from "@/api/qs/device"
import {queryDeviceRecord} from "@/api/qs/gb28181"
import {queryDaHuaRecord} from "@/api/qs/dahua"
import {queryHaiKangRecord} from "@/api/qs/haikang"
import {queryHaiKangIsupRecord} from "@/api/qs/haikang-isup"
import {queryOnvifRecord} from "@/api/qs/onvif"
import {queryJt1078Record} from "@/api/qs/jt1078"
import {rtpPlayback, stopRtpPlayback, onvifPlayback, stopOnvifPlayback, startGb28181Playback, stopGb28181Playback} from "@/api/qs/zlm"
import moment from 'moment'
import VideoTimeline from '@/views/components/common/VideoTimeLine/index.vue'
import EasyPlayer from '@/components/EasyPlayer'

const {proxy} = getCurrentInstance()

// Props
const props = defineProps<{
  deviceId?: number
}>()

const loading = ref<boolean>(false)
const currentDevice = ref<any>(null)
const recordList = ref([]);
const selectedRecord = ref<any>(null);
const isInitialLoading = ref(true);

const initTime = ref(moment().startOf('day').valueOf());
const timeSegments = ref([]);
const showTime = ref(true);
const showTimeValue = ref('');
const jessibucaHeight = ref<string>(document.documentElement.clientHeight - 310 + 'px;')
const quality = ref(['普清', '高清', '超清'])
const defaultQuality = ref('高清')
const isPtz = ref(true)
const isQuality = ref(true)
const isLive = ref(true)
const wsUrl = ref('')

const playing = ref(false)
const isPaused = ref(false)
const playSpeed = ref<number>(1)
const playTime = ref<number | null>(null)
const currentStartTime = ref<any>(null)
const currentEndTime = ref<any>(null)
const isFullScreen = ref(false)

const Timeline = ref()
let lastUpdateTime = 0
let lastTimelineUpdate = 0
let animationFrameId: number | null = null
let isDraggingTimeline = false
let playDebounceTimer: number | null = null
let currentStreamId: string = ''
let loadingInstance: any = null

const selectedDate = ref<string>(moment().format('YYYY-MM-DD'))

const loadDevice = async (deviceId: number) => {
  try {
    const res: any = await getDevice(deviceId)
    const device = res.data
    currentDevice.value = device

    // 检查设备类型是否支持录像功能
    const unsupportedTypes = ['1', '2', '3', '4', '6', '13']
    if (unsupportedTypes.includes(device.type)) {
      ElMessage.warning('该设备类型不支持录像回放功能')
      // 清空之前的状态
      timeSegments.value = []
      recordList.value = []
      selectedRecord.value = null
      return
    }

    await stopPlay()

    getList()
  } catch (e) {
    console.error('获取设备信息失败', e)
  }
}

// 不使用 watch 监听

function getList() {
  const dayStart = moment(selectedDate.value).startOf('day').format('YYYY-MM-DD HH:mm:ss')
  const dayEnd = moment(selectedDate.value).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  loading.value = true
  timeSegments.value = []
  
  if(currentDevice.value && currentDevice.value.type == '12'){
    queryDeviceRecord(
        currentDevice.value.gbDeviceId,
        currentDevice.value.gbChannelId,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data.recordList || []
      if (recordList.value.length > 0) {
        selectedRecord.value = recordList.value[0]
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        updateInitTimeByRecord(time)
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#409EFF',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        nextTick(() => {
          if (Timeline.value && Timeline.value.setTime) {
            Timeline.value.setTime(time)
          }
        })
      }
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  } else if(currentDevice.value && currentDevice.value.type == '9'){
    queryDaHuaRecord(
        currentDevice.value.id,
        currentDevice.value.channel,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      if (recordList.value.length > 0) {
        selectedRecord.value = recordList.value[0]
        let time = new Date(recordList.value[0].start).getTime()
        playTime.value = time
        updateInitTimeByRecord(time)
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].start).getTime(),
            endTime: new Date(recordList.value[i].end).getTime(),
            color: '#409EFF',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        nextTick(() => {
          if (Timeline.value && Timeline.value.setTime) {
            Timeline.value.setTime(time)
          }
        })
      }
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  } else if(currentDevice.value && currentDevice.value.type == '7'){
    queryHaiKangRecord(
        currentDevice.value.id,
        currentDevice.value.channel || 1,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      if (recordList.value.length > 0) {
        selectedRecord.value = recordList.value[0]
        let time = new Date(recordList.value[0].start).getTime()
        playTime.value = time
        updateInitTimeByRecord(time)
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].start).getTime(),
            endTime: new Date(recordList.value[i].end).getTime(),
            color: '#409EFF',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        nextTick(() => {
          if (Timeline.value && Timeline.value.setTime) {
            Timeline.value.setTime(time)
          }
        })
      }
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  } else if(currentDevice.value && currentDevice.value.type == '8'){
    queryHaiKangIsupRecord(
        currentDevice.value.id,
        currentDevice.value.channel || 1,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      if (recordList.value.length > 0) {
        selectedRecord.value = recordList.value[0]
        let time = new Date(recordList.value[0].start).getTime()
        playTime.value = time
        updateInitTimeByRecord(time)
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].start).getTime(),
            endTime: new Date(recordList.value[i].end).getTime(),
            color: '#409EFF',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        nextTick(() => {
          if (Timeline.value && Timeline.value.setTime) {
            Timeline.value.setTime(time)
          }
        })
      }
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  } else if(currentDevice.value && currentDevice.value.type == '5'){
    queryOnvifRecord(
        currentDevice.value.ipAddress || '',
        currentDevice.value.userName || '',
        currentDevice.value.password || '',
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      if (recordList.value.length > 0) {
        selectedRecord.value = recordList.value[0]
        let time = new Date(recordList.value[0].start).getTime()
        playTime.value = time
        updateInitTimeByRecord(time)
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].start).getTime(),
            endTime: new Date(recordList.value[i].end).getTime(),
            color: '#409EFF',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        nextTick(() => {
          if (Timeline.value && Timeline.value.setTime) {
            Timeline.value.setTime(time)
          }
        })
      }
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  } else if(currentDevice.value && currentDevice.value.type == '10'){
    queryJt1078Record(
        currentDevice.value.mobileNo || currentDevice.value.gbDeviceId || '',
        currentDevice.value.channel || 1,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      if (recordList.value.length > 0) {
        selectedRecord.value = recordList.value[0]
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        updateInitTimeByRecord(time)
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#409EFF',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        nextTick(() => {
          if (Timeline.value && Timeline.value.setTime) {
            Timeline.value.setTime(time)
          }
        })
      }
      loading.value = false
    }).catch(() => {
      loading.value = false
    })
  } else {
    loading.value = false
  }
}

const findRecordByTime = (time: number) => {
  for (const record of recordList.value) {
    const recStartTime = new Date(record.startTime || record.start).getTime()
    const recEndTime = new Date(record.endTime || record.end).getTime()
    if (time >= recStartTime && time <= recEndTime) {
      return record
    }
  }
  return null
}

const handlePlaySuccess = () => {
  // 播放成功后启动时间轴动画
  lastUpdateTime = performance.now()
  if (currentStartTime.value && currentEndTime.value) {
    startSmoothAnimation(currentStartTime.value, currentEndTime.value)
  }
  // 关闭加载动画
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

const playRecord = async () => {
  // 如果是暂停后恢复播放
  if (isPaused.value && wsUrl.value) {
    playing.value = true
    isPaused.value = false
    if (proxy && proxy.$refs && proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
      proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play()
    }
    handlePlaySuccess()
    return
  }
  
  // 否则是全新播放
  if (loadingInstance) {
    return
  }
  if (!currentDevice.value || timeSegments.value.length === 0) {
    return
  }
  
  if (playing.value) {
    await stopPlay()
  }
  
  // 显示加载动画
  loadingInstance = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  let targetRecord = findRecordByTime(playTime.value || 0)
  
  if (!targetRecord) {
    // 如果当前时间没有匹配的录像，使用第一段录像
    if (recordList.value.length > 0) {
      targetRecord = recordList.value[0]
      playTime.value = new Date(targetRecord.startTime || targetRecord.start).getTime()
    } else {
      loadingInstance.close()
      loadingInstance = null
      return
    }
  }

  // 找到整个录像的最早开始时间和最晚结束时间
  let overallStartTime = Infinity
  let overallEndTime = 0
  for (let i = 0; i < recordList.value.length; i++) {
    const recStartTime = new Date(recordList.value[i].startTime || recordList.value[i].start).getTime()
    const recEndTime = new Date(recordList.value[i].endTime || recordList.value[i].end).getTime()
    if (recStartTime < overallStartTime) overallStartTime = recStartTime
    if (recEndTime > overallEndTime) overallEndTime = recEndTime
  }
  
  selectedRecord.value = targetRecord
  
  const actualStartTimeVal = playTime.value || overallStartTime
  currentStartTime.value = actualStartTimeVal
  currentEndTime.value = overallEndTime

  playTime.value = actualStartTimeVal
  lastUpdateTime = performance.now()

  currentStreamId = `${currentDevice.value.deviceCode}_${Date.now()}`
  
  // GB28181 设备类型处理
  if (currentDevice.value.type == '12') {
    // GB28181 设备回放
    try {
      const res: any = await startGb28181Playback(
        currentDevice.value.id,
        moment(actualStartTimeVal).format('YYYY-MM-DD HH:mm:ss'),
        moment(overallEndTime).format('YYYY-MM-DD HH:mm:ss')
      )
      if (res && res.data) {
        if (location.protocol === 'https:') {
          wsUrl.value = res.data.wssFlv || res.data.wss_flv
        } else {
          wsUrl.value = res.data.wsFlv || res.data.ws_flv
        }
        playing.value = true
        isPaused.value = false

        await nextTick()
        setTimeout(async () => {
          await nextTick()
          if (proxy && proxy.$refs && proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
            proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play()
          }
        }, 1000)
      } else {
        loadingInstance.close()
        loadingInstance = null
      }
    } catch (error) {
      console.error('播放失败', error)
      loadingInstance.close()
      loadingInstance = null
    }
  } else if (currentDevice.value.type == '5') {
    // ONVIF 设备播放
    const onvifParam: any = {
      deviceId: currentDevice.value.id,
      deviceIp: currentDevice.value.ipAddress || '',
      username: currentDevice.value.userName || '',
      password: currentDevice.value.password || '',
      recordingToken: targetRecord.recordingToken || '',
      trackToken: targetRecord.trackToken || '',
      app: 'onvif',
      stream: currentStreamId,
      enableAudio: true,
      rtpType: '0',
      timeOut: 30000
    }
    
    try {
      const res: any = await onvifPlayback(onvifParam)
      if (res && res.data) {
        if (location.protocol === 'https:') {
          wsUrl.value = res.data.wssFlv || res.data.wss_flv
        } else {
          wsUrl.value = res.data.wsFlv || res.data.ws_flv
        }
        playing.value = true
        isPaused.value = false

        await nextTick()
        setTimeout(async () => {
          await nextTick()
          if (proxy && proxy.$refs && proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
            proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play()
          }
        }, 1000)
      } else {
        loadingInstance.close()
        loadingInstance = null
      }
    } catch (error) {
      console.error('播放失败', error)
      loadingInstance.close()
      loadingInstance = null
    }
  } else {
    // 其他设备类型处理
    const param: any = {
      id: currentDevice.value.id,
      app: currentDevice.value.type == '7' ? 'haikang' : currentDevice.value.type == '8' ? 'haikang_isup' : 'dahua',
      streamId: currentStreamId,
      type: currentDevice.value.type,
      tcpMode: 0,
      playback: true,
      channel: currentDevice.value.channel
    }

    // 使用整个录像的时间范围
    if (actualStartTimeVal && overallEndTime) {
      param.startTime = moment(actualStartTimeVal).format('YYYY-MM-DD HH:mm:ss')
      param.endTime = moment(overallEndTime).format('YYYY-MM-DD HH:mm:ss')
    }

    try {
      const res: any = await rtpPlayback(param)
      if (res && res.data) {
        if (location.protocol === 'https:') {
          wsUrl.value = res.data.wssFlv || res.data.wss_flv
        } else {
          wsUrl.value = res.data.wsFlv || res.data.ws_flv
        }
        playing.value = true
        isPaused.value = false

        await nextTick()
        setTimeout(async () => {
          await nextTick()
          if (proxy && proxy.$refs && proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
            proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play()
          }
        }, 1000)
      } else {
        loadingInstance.close()
        loadingInstance = null
      }
    } catch (error) {
      console.error('播放失败', error)
      loadingInstance.close()
      loadingInstance = null
    }
  }
}

const pausePlay = () => {
  if (proxy && proxy.$refs && proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
    proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].pause()
  }
  playing.value = false
  isPaused.value = true
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

let isDraggingStop = false

const stopPlay = async () => {
  // 关闭加载动画
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }

  if (playDebounceTimer) {
    clearTimeout(playDebounceTimer)
    playDebounceTimer = null
  }

  if (currentDevice.value && proxy && proxy.$refs && proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
    proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].destroy()
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (currentDevice.value && currentStreamId) {
    try {
      // GB28181 设备类型处理
      if (currentDevice.value.type == '12') {
        await stopGb28181Playback(currentDevice.value.id)
      } else if (currentDevice.value.type == '5') {
        // ONVIF 设备类型处理
        const onvifParam: any = {
          deviceId: currentDevice.value.id,
          streamKey: currentStreamId,
          mediaServerId: currentDevice.value.playbackMediaServerId || '',
          playback: true
        }
        await stopOnvifPlayback(onvifParam)
      } else {
        // 其他设备类型处理
        const param: any = {
          id: currentDevice.value.id,
          app: currentDevice.value.type == '7' ? 'haikang' : currentDevice.value.type == '8' ? 'haikang_isup' : 'dahua',
          streamId: currentStreamId,
          type: currentDevice.value.type,
          tcpMode: 0,
          playback: true
        }
        await stopRtpPlayback(param)
      }
    } catch (error) {
      console.error('停止播放失败', error)
    }
  }

  playing.value = false
  isPaused.value = false
  wsUrl.value = ''
  
  // 只有不是拖动时才重置播放时间到开始
  if (!isDraggingStop && selectedRecord.value) {
    const startTimeVal = selectedRecord.value.startTime || selectedRecord.value.start
    playTime.value = new Date(startTimeVal).getTime()
    if (Timeline.value && Timeline.value.setTime) {
      Timeline.value.setTime(playTime.value)
    }
  }
  
  isDraggingStop = false
}



const startSmoothAnimation = (startTimeVal: number | string, endTimeVal: number | string) => {
  lastTimelineUpdate = performance.now()
  
  // 找到整个录像的最早开始时间和最晚结束时间
  let overallStartTime = Infinity
  let overallEndTime = 0
  for (let i = 0; i < recordList.value.length; i++) {
    const recStartTime = new Date(recordList.value[i].startTime || recordList.value[i].start).getTime()
    const recEndTime = new Date(recordList.value[i].endTime || recordList.value[i].end).getTime()
    if (recStartTime < overallStartTime) overallStartTime = recStartTime
    if (recEndTime > overallEndTime) overallEndTime = recEndTime
  }
  
  const animate = () => {
    if (!playing.value || isPaused.value) {
      animationFrameId = null
      return
    }
    
    const now = performance.now()
    const deltaTime = now - lastUpdateTime
    lastUpdateTime = now
    
    const timeToAdd = deltaTime * playSpeed.value
    playTime.value += timeToAdd
    
    if (now - lastTimelineUpdate >= 100 && Timeline.value && Timeline.value.setTime) {
      Timeline.value.setTime(playTime.value)
      lastTimelineUpdate = now
    }
    
    // 使用整个录像的结束时间
    if (playTime.value >= overallEndTime) {
      playing.value = false
      animationFrameId = null
      return
    }
    
    animationFrameId = requestAnimationFrame(animate)
  }
  
  if (Timeline.value && Timeline.value.setTime) {
    Timeline.value.setTime(playTime.value)
  }
  
  animationFrameId = requestAnimationFrame(animate)
}

function playTimeChange(time: number) {
  playTime.value = time
  showTimeValue.value = moment(time).format('YYYY-MM-DD HH:mm:ss')
}

function timelineMouseDown() {
  isDraggingTimeline = true
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

async function mouseupTimeline() {
  // 只有真正拖动过时间轴才执行
  if (!isDraggingTimeline) {
    return
  }
  
  isDraggingTimeline = false
  
  // 找到整个录像的最早开始时间和最晚结束时间
  let overallStartTime = Infinity
  let overallEndTime = 0
  if (recordList.value.length > 0) {
    for (let i = 0; i < recordList.value.length; i++) {
      const recStartTime = new Date(recordList.value[i].startTime || recordList.value[i].start).getTime()
      const recEndTime = new Date(recordList.value[i].endTime || recordList.value[i].end).getTime()
      if (recStartTime < overallStartTime) overallStartTime = recStartTime
      if (recEndTime > overallEndTime) overallEndTime = recEndTime
    }
  }
  
  // 检查是否小于整个录像的开始时间
  if (playTime.value < overallStartTime && recordList.value.length > 0) {
    playTime.value = overallStartTime
    if (Timeline.value && Timeline.value.setTime) {
      Timeline.value.setTime(playTime.value)
    }
  }
  
  // 检查是否大于整个录像的结束时间
  if (playTime.value > overallEndTime && recordList.value.length > 0) {
    playTime.value = overallEndTime
    if (Timeline.value && Timeline.value.setTime) {
      Timeline.value.setTime(playTime.value)
    }
  }
  
  if (playDebounceTimer) {
    clearTimeout(playDebounceTimer)
  }
  
  playDebounceTimer = window.setTimeout(async () => {
    if (playing.value || isPaused.value) {
      isDraggingStop = true
      await stopPlay()
      setTimeout(() => {
        playRecord()
      }, 300)
    } else {
      if (selectedRecord.value || recordList.value.length > 0) {
        playRecord()
      }
    }
  }, 200)
}

const easyPlayeError = () => {
  // 关闭加载动画
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
  // 停止时间轴动画
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  // 重置播放状态
  playing.value = false
  isPaused.value = false
}

const updateInitTimeByRecord = (recordStartTime: any) => {
  const dayStart = moment(selectedDate.value).startOf('day').valueOf()
  const recordTime = moment(recordStartTime).valueOf()

  if (recordTime >= dayStart) {
    initTime.value = recordTime
  } else {
    initTime.value = dayStart
  }
}

const handleDateChange = () => {
  stopPlay()
  getList()
}

const prevDay = () => {
  selectedDate.value = moment(selectedDate.value).subtract(1, 'day').format('YYYY-MM-DD')
  stopPlay()
  getList()
}

const nextDay = () => {
  selectedDate.value = moment(selectedDate.value).add(1, 'day').format('YYYY-MM-DD')
  stopPlay()
  getList()
}

const handleToday = () => {
  selectedDate.value = moment().format('YYYY-MM-DD')
  stopPlay()
  getList()
}

/**
 * 截图
 */
const snap = () => {
  if (proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
    proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].screenshot()
  }
}

/**
 * 刷新
 */
const refresh = () => {
  if (proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
    proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play()
  }
}

/**
 * 全屏
 */
const fullScreen = () => {
  if (isFullScreen.value) {
    screenfull.exit()
    isFullScreen.value = false
    jessibucaHeight.value = document.documentElement.clientHeight - 310 + 'px;'
    return
  }
  screenfull.request(document.getElementById('recordPlayer'))
  screenfull.on('change', (event) => {
    isFullScreen.value = screenfull.isFullscreen
  })
  isFullScreen.value = true
  jessibucaHeight.value = '100%'
}

/**
 * 更新全屏状态
 */
const updateFullscreenState = () => {
  isFullScreen.value = !!document.fullscreenElement
  if (!isFullScreen.value) {
    screenfull.exit()
    isFullScreen.value = false
    jessibucaHeight.value = document.documentElement.clientHeight - 310 + 'px;'
  }
}

/**
 * 组件挂载
 */
onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState)
  // 初始加载设备
  if (props.deviceId) {
    loadDevice(props.deviceId)
  }
})

/**
 * 组件卸载
 */
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState)
  // 关闭加载动画
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
})
</script>

<style lang="scss" scoped>
@import './style.scss';

.device-record-wrapper {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.player-option-box {
  height: 60px
}

.time-line-show {
  position: relative;
  color: rgba(250, 249, 249, 0.89);
  left: calc(50% - 85px);
  top: -72px;
  z-index: 99;
  text-shadow: 1px 0 #5f6b7c, -1px 0 #5f6b7c, 0 1px #5f6b7c, 0 -1px #5f6b7c, 1.1px 1.1px #5f6b7c, 1.1px -1.1px #5f6b7c, -1.1px 1.1px #5f6b7c, -1.1px -1.1px #5f6b7c;
}

.player-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
}
</style>
