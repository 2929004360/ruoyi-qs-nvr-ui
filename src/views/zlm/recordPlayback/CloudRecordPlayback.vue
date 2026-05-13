<template>
  <div class="app-container">
    <el-row :gutter="0">
      <splitpanes class="default-theme record-splitpanes">
        <!-- 左侧设备树 -->
        <pane size="20">
          <el-col class="tree-col">
            <div class="panel-header">
              <div class="header-accent"></div>
              <div class="header-icon-wrap">
                <el-icon><VideoCamera /></el-icon>
              </div>
              <span>设备列表</span>
              <div class="header-switch">
                <el-switch
                    v-model="showRegion"
                    active-text="行政区划"
                    inactive-text="业务分组"
                    @change="handleTreeTypeChange"
                />
              </div>
            </div>
            <div class="tree-container">
              <div v-if="showRegion">
                <RegionTree
                    ref="regionTree"
                    :showIndex="false"
                    :showContextmenu="false"
                    :hasDevice="true"
                    @handleNodeClick="handleDeviceClick"
                    :isContextmenu="false"
                />
              </div>
              <div v-else>
                <GroupTree
                    ref="groupTree"
                    :showIndex="false"
                    :showContextmenu="false"
                    :hasDevice="true"
                    @handleNodeClick="handleDeviceClick"
                    :isContextmenu="false"
                />
              </div>
            </div>
          </el-col>
        </pane>

        <!-- 录像列表 -->
        <pane size="20">
          <el-col class="list-col">
            <div class="panel-header">
              <div class="header-accent"></div>
              <div class="header-icon-wrap">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <span>录像列表</span>
              <span class="device-name" v-if="currentDevice">{{ currentDevice.deviceName }}</span>
            </div>
            <div class="list-container">
              <!-- 日期选择 -->
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

              <!-- 录像列表 -->
              <div class="record-list" v-loading="loading">
                <div v-if="cloudRecordList.length > 0" class="record-items-wrap">
                  <div
                    v-for="(record, idx) in cloudRecordList"
                    :key="record.id"
                    class="record-item"
                    :class="{ active: selectedRecord && selectedRecord.id === record.id }"
                    :style="{ animationDelay: `${0.05 + idx * 0.04}s` }"
                    @click="handleRecordItemClick(record)"
                  >
                    <div class="record-indicator">
                      <div class="record-dot"></div>
                      <div class="record-line" v-if="idx !== cloudRecordList.length - 1"></div>
                    </div>
                    <div class="record-body">
                      <div class="record-time">
                        <el-icon><Timer /></el-icon>
                        <span>{{ formatShortTime(record.startTime) }} - {{ formatShortTime(record.endTime) }}</span>
                      </div>
                      <div class="record-info">
                        <el-tag type="success" size="small" effect="light" class="duration-tag">
                          {{ formatTime(record.timeLen) }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="list-empty">
                  <div class="empty-animation">
                    <el-icon size="48"><VideoPlay /></el-icon>
                  </div>
                  <span>暂无录像数据</span>
                  <p v-if="currentDevice">当前设备在所选日期无录像</p>
                  <p v-else>请先在左侧选择设备</p>
                </div>
              </div>
            </div>
          </el-col>
        </pane>

        <!-- 右侧播放器 -->
        <pane size="60">
          <el-col class="player-col">
            <div class="panel-header">
              <div class="header-accent"></div>
              <div class="header-icon-wrap">
                <el-icon><Monitor /></el-icon>
              </div>
              <span>录像播放</span>
              <span v-if="selectedRecord" class="record-meta">
                <el-icon size="12"><VideoCamera /></el-icon>
                {{ currentDevice?.deviceName || '' }} · {{ selectedDateText }} · {{ formatShortTime(selectedRecord.startTime) }}
              </span>
            </div>
            <div class="player-area">
              <div id="recordPlayer" class="player-wrapper">
                <div class="player-container" :style="'height:' + jessibucaHeight">
                  <!-- 空状态提示 -->
                  <div v-if="!selectedRecord" class="player-empty-overlay">
                    <div class="empty-content">
                      <div class="empty-icon-wrap">
                        <el-icon size="64"><VideoPlay /></el-icon>
                      </div>
                      <div class="empty-text">请选择设备和录像文件</div>
                      <div class="empty-hint">在左侧设备列表选择设备，再选择录像进行播放</div>
                    </div>
                  </div>
                  <!-- 播放器 -->
                  <EasyPlayer
                    v-else
                    :style="'height:' + jessibucaHeight"
                    :ref="'EasyPlayerRef_' + currentDevice.id"
                    :id="`EasyPlayerRef_${currentDevice.id}`"
                    style="width: 100%"
                    width="100"
                    height="100"
                    @error="easyPlayeError"
                    :isPercentage="true"
                    :quality="quality"
                    :defaultQuality="defaultQuality"
                    :isPtz="isPtz"
                    :isQuality="isQuality"
                    :hasAudio="true"
                    :isMute="true"
                    :isLive="isLive"
                    :videoUrl="wsUrl"
                  />
                </div>

                <div class="player-controls" :class="{ 'disabled': !selectedRecord }">
                  <div class="player-time start-time">{{ showPlayTimeValue }}</div>
                  <div class="player-progress-wrap">
                    <div
                      class="player-progress"
                      ref="timeProcess"
                      @click="selectedRecord && timeProcessClick($event)"
                      @mouseenter="selectedRecord && timeProcessMouseEnter($event)"
                      @mousemove="selectedRecord && timeProcessMouseMove($event)"
                      @mouseleave="selectedRecord && timeProcessMouseLeave($event)"
                    >
                      <div v-if="streamInfo" class="player-progress-track">
                        <div class="player-progress-bar" :style="playTimeValue"></div>
                        <div class="player-progress-glow" :style="playTimeValue"></div>
                      </div>
                      <transition name="el-fade-in-linear">
                        <div v-show="showTimeLeft" class="player-progress-tooltip" :style="playTimeTitleStyle">
                          <div class="tooltip-arrow"></div>
                          {{ showPlayTimeTitle }}
                        </div>
                      </transition>
                    </div>
                  </div>
                  <div class="player-time end-time">{{ showPlayTimeTotal }}</div>
                </div>

                <div class="player-toolbar" :class="{ 'disabled': !selectedRecord }">
                  <div class="player-toolbar-left">
                    <el-tooltip content="截图" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="snap">
                        <el-icon><Camera /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="刷新" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="refresh">
                        <el-icon><Refresh /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="下载" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="download">
                        <el-icon><Download /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>

                  <div class="player-toolbar-center">
                    <el-tooltip content="快退五秒" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="seekBackward">
                        <el-icon><DArrowLeft /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="停止" placement="top">
                      <el-button circle class="toolbar-btn stop-btn" :disabled="!selectedRecord" @click="stopPLay">
                        <el-icon><VideoPause /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="playing ? '暂停' : '播放'" placement="top">
                      <el-button
                        circle
                        class="toolbar-btn play-btn"
                        :disabled="!selectedRecord"
                        @click="playing ? pausePlay() : playRecord()"
                      >
                        <el-icon v-if="playing"><VideoPause /></el-icon>
                        <el-icon v-else><VideoPlay /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="快进五秒" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="seekForward">
                        <el-icon><DArrowRight /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-dropdown @command="changePlaySpeed" :popper-append-to-body="false" :disabled="!selectedRecord">
                      <el-button class="toolbar-btn speed-btn" size="small" :disabled="!selectedRecord">
                        {{ playSpeed }}X
                        <el-icon><ArrowDown /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu class="speed-dropdown-menu">
                          <el-dropdown-item
                            v-for="item in playSpeedRange"
                            :key="item"
                            :command="item"
                            :class="{ 'is-active': playSpeed === item }"
                          >{{ item }}X</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>

                  <div class="player-toolbar-right">
                    <el-tooltip :content="isFullScreen ? '退出全屏' : '全屏'" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="fullScreen">
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

<script setup lang="ts" name="CloudRecordPlayback">
import useClipboard from 'vue-clipboard3'
import screenfull from 'screenfull'
import moment from 'moment'
import EasyPlayer from '@/components/EasyPlayer'
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import RegionTree from '@/views/components/common/RegionTree.vue'
import GroupTree from '@/views/components/common/GroupTree.vue'
import type { CloudRecordQueryParams, ZlmCloudRecord } from '@/types/api/qs/cloudRecord'
import { closeStreams, listAllCloudRecord, loadRecord, seekCloudRecord, setCloudRecordSpeed } from '@/api/qs/cloudRecord'
import momentDurationFormatSetup from 'moment-duration-format'
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
  Timer,
  VideoCamera,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import { getDevice } from '@/api/qs/device'

const { toClipboard } = useClipboard()
momentDurationFormatSetup(moment)
const { proxy } = getCurrentInstance()

// 数据相关
const cloudRecordList = ref<ZlmCloudRecord[]>([])
const loading = ref<boolean>(false)
const currentDevice = ref<any>(null)
const selectedRecord = ref<ZlmCloudRecord | null>(null)
const showRegion = ref(false)

// 日期相关
const selectedDate = ref<string>(moment().format('YYYY-MM-DD'))
const selectedDateText = computed(() => {
  const date = moment(selectedDate.value)
  const today = moment().format('YYYY-MM-DD')
  const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')
  if (selectedDate.value === today) return date.format('YYYY-MM-DD') + ' (今天)'
  if (selectedDate.value === yesterday) return date.format('YYYY-MM-DD') + ' (昨天)'
  return date.format('YYYY-MM-DD') + ' (' + ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.day()] + ')'
})

// 查询参数
const data = reactive({
  queryParams: {
    app: undefined,
    stream: undefined,
    queryStartTime: undefined,
    queryEndTime: undefined,
    mediaServerId: undefined
  } as CloudRecordQueryParams
})
const { queryParams } = toRefs(data)

// 播放相关
const easyPlayerOpen = ref(false)
const cloudRecordRow = ref({})
const rtcUrl = ref('')
const flvUrl = ref('')
const wsUrl = ref('')
const tabActiveName = ref('media')
const streamInfo = ref<any>({})
const quality = ref(['普清', '高清', '超清'])
const defaultQuality = ref('高清')
const isPtz = ref(true)
const isQuality = ref(true)
const isLive = ref(true)
const currentWidth = ref(0)
const playerTime = ref(0)
const showTimeLeft = ref<number | null>(0)
const step = ref(0)
const timeLen = ref<number | null>(null)
const startTime = ref<number | null>(null)
const playing = ref(false)
const timer = ref<any>(null)
const playSpeed = ref<number>(1)
const isFullScreen = ref(false)
const playSpeedRange = ref([1, 2, 4])
const jessibucaHeight = ref<string>(document.documentElement.clientHeight - 300 + 'px;')
const isPaused = ref(false)

/**
 * 点击设备树节点
 */
const handleDeviceClick = async (data: any) => {
  try {
    // 检查是否是叶子节点（设备）
    if (!data.leaf) {
      return
    }
    
    const res = await getDevice(data.id)
    const device = res.data
    currentDevice.value = device

    // 设置查询参数 - 所有设备类型都支持录像回放
    queryParams.value.app =
      device.type === '1'
        ? 'rtsp'
        : device.type === '2'
        ? 'rtmp'
        : device.type === '3'
        ? 'flv'
        : device.type === '4'
        ? 'hls'
        : device.type === '5'
        ? 'onvif'
        : device.type === '7'
        ? 'haikang'
        : device.type === '8'
        ? 'haikang_isup'
        : device.type === '9'
        ? 'dahua'
        : device.type === '12'
        ? 'gb28181'
        : device.type === '13'
        ? 'push'
        : device.type === '14'
        ? 'jt1078'
        : 'live'
    queryParams.value.stream = device.deviceCode

    // 清空已选择的录像
    selectedRecord.value = null
    stopPLay()

    // 查询录像列表
    getList()
  } catch (e) {
    console.error('获取设备信息失败', e)
  }
}

/**
 * 切换树形组件类型
 */
const handleTreeTypeChange = () => {
  // 切换时清空当前选择
  currentDevice.value = null
  selectedRecord.value = null
  cloudRecordList.value = []
  stopPLay()
}

/**
 * 日期变化
 */
const handleDateChange = () => {
  getList()
}

/**
 * 前一天
 */
const prevDay = () => {
  selectedDate.value = moment(selectedDate.value).subtract(1, 'day').format('YYYY-MM-DD')
  getList()
}

/**
 * 后一天
 */
const nextDay = () => {
  selectedDate.value = moment(selectedDate.value).add(1, 'day').format('YYYY-MM-DD')
  getList()
}

/**
 * 今天
 */
const handleToday = () => {
  selectedDate.value = moment().format('YYYY-MM-DD')
  getList()
}

/**
 * 点击录像列表项
 */
const handleRecordItemClick = (record: ZlmCloudRecord) => {
  handlePlay(record)
}

/**
 * 查询录像列表
 */
function getList() {
  if (!queryParams.value.app || !queryParams.value.stream) {
    cloudRecordList.value = []
    return
  }

  // 设置当天的开始和结束时间
  const dayStart = moment(selectedDate.value).startOf('day').format('YYYY-MM-DD HH:mm:ss')
  const dayEnd = moment(selectedDate.value).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  queryParams.value.queryStartTime = dayStart
  queryParams.value.queryEndTime = dayEnd

  loading.value = true
  listAllCloudRecord(queryParams.value)
    .then((response) => {
      cloudRecordList.value = response.data || []
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/**
 * 播放录像
 */
const handlePlay = async (row: ZlmCloudRecord) => {
  // 先停止当前播放
  if (selectedRecord.value) {
    await stopPLay()
  }

  await loadRecord(row.id).then(async (res) => {
    await nextTick(async () => {
      if (location.protocol === 'https:') {
        flvUrl.value = res.data.https_flv
        rtcUrl.value = res.data.rtcs
        wsUrl.value = res.data.wss_flv
      } else {
        flvUrl.value = res.data.flv
        rtcUrl.value = res.data.rtc
        wsUrl.value = res.data.ws_flv
      }
      console.log(wsUrl.value)
      selectedRecord.value = row

      streamInfo.value = res.data
      quality.value = []
      defaultQuality.value = ''
      isPtz.value = false
      isQuality.value = false
      isLive.value = true
      cloudRecordRow.value = row
      playing.value = true

      currentWidth.value = 0
      playerTime.value = 0
      playSpeed.value = 1
      isFullScreen.value = false

      jessibucaHeight.value = document.documentElement.clientHeight - 300 + 'px;'
      step.value = 100 / (cloudRecordRow.value.timeLen / 1000)
      timer.value = setInterval(() => {
        if (isPaused.value) return
        // 增加进度
        currentWidth.value = currentWidth.value + step.value * playSpeed.value
        playerTime.value += 1000 * playSpeed.value

        // 判断是否结束
        if (currentWidth.value >= 100) {
          currentWidth.value = 100
          clearInterval(timer.value) // 停止计时器
        }
      }, 1000)

      timeLen.value = row.timeLen
      startTime.value = row.startTime

      // 调用播放器的 play 方法
      await setTimeout(async () => {
        await nextTick()
        if (proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
          proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play(wsUrl.value)
        }
      }, 1000)
    })
  })
}

/**
 * 关闭流
 */
const handleCloseStreams = () => {
  streamInfo.value = null
  currentWidth.value = 0
  playerTime.value = 0
  playSpeed.value = 0
  isPaused.value = false
  if (timer.value) {
    clearInterval(timer.value) // 停止计时器
  }
  if (selectedRecord.value) {
    closeStreams(selectedRecord.value.id)
  }
}

/**
 * 播放器错误回调
 */
const easyPlayeError = () => {
  if (timer.value) {
    clearInterval(timer.value) // 停止计时器
  }
  currentWidth.value = 0
  playerTime.value = 0
  playSpeed.value = 0
  isPaused.value = false
}

/**
 * 复制内容到粘贴板
 */
const handleCopy = async (text: string) => {
  if (!text) {
    proxy.$modal.msgError('内容为空，无法复制')
    return
  }
  try {
    await toClipboard(text)
    proxy.$modal.msgSuccess('成功拷贝到粘贴板')
  } catch (e) {
    console.error(e)
  }
}

/**
 * 下载录像
 */
function download() {
  if (!selectedRecord.value) {
    return
  }
  const link = document.createElement('a')
  link.target = '_blank'
  let baseUri = import.meta.env.VITE_APP_BASE_API
  let downloadUrl = `${location.origin}${baseUri}/zlm/cloudRecord/download/zip?ids=${selectedRecord.value.id}`
  link.href = downloadUrl
  link.click()
}

/**
 * 全屏
 */
const fullScreen = () => {
  if (isFullScreen.value) {
    screenfull.exit()
    isFullScreen.value = false
    jessibucaHeight.value = document.documentElement.clientHeight - 300 + 'px;'
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
 * 倍速播放
 */
const changePlaySpeed = (speed: number) => {
  if (!streamInfo.value) {
    return
  }
  playSpeed.value = speed
  setCloudRecordSpeed({
    mediaServerId: streamInfo.value.mediaServerId,
    app: streamInfo.value.app,
    stream: streamInfo.value.stream,
    key: streamInfo.value.key,
    speed: playSpeed.value,
    schema: 'ts'
  }).then((res) => {})
}

/**
 * 暂停
 */
const pausePlay = () => {
  if (proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
    proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].pause()
  }
  playing.value = false
  togglePause()
}

/**
 * 播放
 */
const playRecord = () => {
  playing.value = true
  togglePause()
  if (!streamInfo.value && selectedRecord.value) {
    handlePlay(selectedRecord.value)
    return
  }
  if (proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
    proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play()
  }
}

/**
 * 开启/暂停 切换函数
 */
const togglePause = () => {
  isPaused.value = !isPaused.value
}

/**
 * 停止播放
 */
function stopPLay() {
  if (proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
    proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].destroy()
  }
  playing.value = false
  playSpeed.value = 1
  handleCloseStreams()
}

/**
 * 快退五秒
 */
const seekBackward = () => {
  if (!streamInfo.value) {
    return
  }
  const newVal = (playerTime.value || 0) - 5 * 1000
  playerTime.value = newVal < 0 ? 0 : newVal
  seekRecord(playerTime.value)
}

/**
 * 快进五秒
 */
const seekForward = () => {
  if (!streamInfo.value) {
    return
  }
  playerTime.value = playerTime.value + 5 * 1000
  seekRecord(playerTime.value)
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
 * 播放进度条点击
 */
function timeProcessClick(event: MouseEvent) {
  if (!timeLen.value) return
  let x = event.offsetX
  let clientWidth = (proxy.$refs['timeProcess'] as HTMLElement).clientWidth
  seekRecord((x / clientWidth) * timeLen.value)
}

/**
 * 定位录像
 */
function seekRecord(playSeekValue: number) {
  if (!streamInfo.value) return
  seekCloudRecord({
    mediaServerId: streamInfo.value.mediaServerId,
    app: streamInfo.value.app,
    stream: streamInfo.value.stream,
    stamp: playSeekValue,
    schema: 'fmp4'
  }).then((data) => {
    currentWidth.value = (playSeekValue / 1000) * step.value
  })
}

/**
 * 获取播放时间
 */
const showPlayTimeValue = computed(() => {
  return streamInfo.value === null ? '--:--:-- --:--:--' : selectedRecord.value ? formatTimeStamp(selectedRecord.value.startTime) : '--:--:-- --:--:--'
})

/**
 * 获取播放时间
 */
const showPlayTimeTotal = computed(() => {
  if (streamInfo.value === null || !selectedRecord.value) {
    return '--:--:-- --:--:--'
  } else {
    return formatTimeStamp(selectedRecord.value.endTime)
  }
})

/**
 * 获取播放时间提示
 */
const showPlayTimeTitle = computed(() => {
  if (showTimeLeft.value && timeLen.value && selectedRecord.value) {
    let time = (showTimeLeft.value / (proxy.$refs['timeProcess'] as HTMLElement).clientWidth) * timeLen.value
    let realTime = (timeLen.value / selectedRecord.value.timeLen) * time + selectedRecord.value.startTime
    return `${moment(time + 1000).format('mm:ss')}(${moment(realTime).format('HH:mm:ss')})`
  } else {
    return ''
  }
})

/**
 * 获取播放进度条样式
 */
const playTimeTitleStyle = computed(() => {
  return { left: (showTimeLeft.value || 0) - 32 + 'px' }
})

/**
 * 鼠标事件
 */
function timeProcessMouseEnter(event: MouseEvent) {
  showTimeLeft.value = event.offsetX
}

function timeProcessMouseMove(event: MouseEvent) {
  showTimeLeft.value = event.offsetX
}

function timeProcessMouseLeave(event: MouseEvent) {
  showTimeLeft.value = null
}

/**
 * 获取播放进度条样式
 */
const playTimeValue = computed(() => {
  return { width: currentWidth.value + '%' }
})

/**
 * 格式化时间戳
 */
function formatTimeStamp(time: number) {
  if (!time) return ''
  return moment.unix(time / 1000).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 格式化短时时间
 */
function formatShortTime(time: number) {
  if (!time) return ''
  return moment.unix(time / 1000).format('HH:mm')
}

/**
 * 格式化时长
 */
function formatTime(time: number) {
  if (!time) return '0秒'
  const h = parseInt(String(time / 3600 / 1000))
  const minute = parseInt(String((time - h * 3600 * 1000) / 60 / 1000))
  let second = Math.ceil((time - h * 3600 * 1000 - minute * 60 * 1000) / 1000)
  if (second < 0) second = 0
  return (h > 0 ? h + 'h' : '') + (minute > 0 ? minute + 'm' : '') + (second > 0 ? second + 's' : '')
}

/**
 * 更新全屏状态
 */
const updateFullscreenState = () => {
  isFullScreen.value = !!document.fullscreenElement
  if (!isFullScreen.value) {
    screenfull.exit()
    isFullScreen.value = false
    jessibucaHeight.value = document.documentElement.clientHeight - 300 + 'px;'
  }
}

/**
 * 组件挂载
 */
onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState)
})

/**
 * 组件卸载
 */
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState)
  handleCloseStreams()
})
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
