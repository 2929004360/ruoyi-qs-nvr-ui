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
                <el-icon><VideoCamera/></el-icon>
              </div>
              <span>设备列表</span>
            </div>
            <div class="tree-container">
              <DeviceTree @clickEvent="handleDeviceClick" :isContextmenu="false"/>
            </div>
          </el-col>
        </pane>

        <!-- 录像列表 -->
        <pane size="20">
          <el-col class="list-col">
            <div class="panel-header">
              <div class="header-accent"></div>
              <div class="header-icon-wrap">
                <el-icon><VideoPlay/></el-icon>
              </div>
              <span>录像列表</span>
              <span class="device-name" v-if="currentDevice">{{ currentDevice.deviceName }}</span>
            </div>
            <div class="list-container">
              <!-- 日期选择 -->
              <div class="date-panel">
                <el-button :icon="ArrowLeft" @click="prevDay" circle class="date-nav-btn"/>
                <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleDateChange"
                    class="record-date-picker"
                />
                <el-button :icon="ArrowRight" @click="nextDay" circle class="date-nav-btn"/>
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
                          <el-icon><Clock /></el-icon>
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
                <el-icon><Monitor/></el-icon>
              </div>
              <span>录像播放</span>
              <span v-if="selectedRecord" class="record-meta">
                <el-icon size="12"><VideoCamera /></el-icon>
                {{ currentDevice?.deviceName || '' }} - {{ formatShortTime(selectedRecord.startTime) }}
              </span>
            </div>
            <div class="player-area">
              <div id="recordPlayer" class="player-wrapper">
                <div class="player-container" :style="'height:'+ jessibucaHeight">
                  <!-- 空状态提示 -->
                  <div v-if="!selectedRecord" class="player-empty-overlay">
                    <div class="empty-content">
                      <div class="empty-icon-wrap">
                        <el-icon size="64"><VideoPlay/></el-icon>
                      </div>
                      <div class="empty-text">请选择设备和录像文件</div>
                      <div class="empty-hint">在左侧设备列表选择设备，再选择录像进行播放</div>
                    </div>
                  </div>
                  <!-- 播放器 -->
                  <EasyPlayer
                      v-else
                      :style="'height:'+ jessibucaHeight"
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
                      :videoUrl="wsUrl"/>
                </div>

                <div class="player-controls" :class="{ 'disabled': !selectedRecord }">
                  <div class="player-time start-time">
                    {{ showPlayTimeValue }}
                  </div>
                  <div class="player-progress-wrap">
                    <div class="player-progress" ref="timeProcess" @click="selectedRecord && timeProcessClick($event)"
                         @mouseenter="selectedRecord && timeProcessMouseEnter($event)" @mousemove="selectedRecord && timeProcessMouseMove($event)"
                         @mouseleave="selectedRecord && timeProcessMouseLeave($event)">
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
                  <div class="player-time end-time">
                    {{ showPlayTimeTotal }}
                  </div>
                </div>

                <div class="player-toolbar" :class="{ 'disabled': !selectedRecord }">
                  <div class="player-toolbar-left">
                    <el-tooltip content="截图" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="snap()">
                        <el-icon><Camera/></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="刷新" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="refresh()">
                        <el-icon><Refresh/></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="下载" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="download()">
                        <el-icon><Download/></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>

                  <div class="player-toolbar-center">
                    <el-tooltip content="快退五秒" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="seekBackward()">
                        <el-icon><DArrowLeft /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="停止" placement="top">
                      <el-button circle class="toolbar-btn stop-btn" :disabled="!selectedRecord" @click="stopPLay()">
                        <el-icon><VideoPause/></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="playing ? '暂停' : '播放'" placement="top">
                      <el-button circle class="toolbar-btn play-btn"
                                 :disabled="!selectedRecord" @click="playing ? pausePlay() : playRecord()">
                        <el-icon v-if="playing"><VideoPause/></el-icon>
                        <el-icon v-else><VideoPlay/></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="快进五秒" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="seekForward()">
                        <el-icon><DArrowRight /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-dropdown @command="changePlaySpeed" :popper-append-to-body='false' :disabled="!selectedRecord">
                      <el-button class="toolbar-btn speed-btn" size="small" :disabled="!selectedRecord">
                        {{ playSpeed }}X
                        <el-icon><ArrowDown/></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu class="speed-dropdown-menu">
                          <el-dropdown-item
                              v-for="item in playSpeedRange"
                              :key="item"
                              :command="item"
                              :class="{ 'is-active': playSpeed === item }"
                          >{{ item }}X
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>

                  <div class="player-toolbar-right">
                    <el-tooltip :content="isFullScreen ? '退出全屏' : '全屏'" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="fullScreen()">
                        <el-icon v-if="!isFullScreen"><FullScreen/></el-icon>
                        <el-icon v-else><Aim/></el-icon>
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

<script setup lang="ts" name="RecordPlayback">
import useClipboard from "vue-clipboard3";
import screenfull from 'screenfull'
import moment from 'moment'
import EasyPlayer from "@/components/EasyPlayer";
import {Pane, Splitpanes} from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import DeviceTree from "@/components/DeviceTree";
import type {CloudRecordQueryParams, ZlmCloudRecord} from "@/types/api/qs/cloudRecord"
import {closeStreams, listAllCloudRecord, loadRecord, seekCloudRecord, setCloudRecordSpeed} from "@/api/qs/cloudRecord"
import momentDurationFormatSetup from 'moment-duration-format'
import {
  Aim,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  Clock,
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
import {getDevice} from "@/api/qs/device";

const {toClipboard} = useClipboard()
momentDurationFormatSetup(moment)
const {proxy} = getCurrentInstance()

// 数据相关
const cloudRecordList = ref<ZlmCloudRecord[]>([])
const loading = ref<boolean>(false)
const currentDevice = ref<any>(null)
const selectedRecord = ref<ZlmCloudRecord | null>(null)

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
    mediaServerId: undefined,
  } as CloudRecordQueryParams,
})
const {queryParams} = toRefs(data)

// 播放相关
const easyPlayerOpen = ref(false)
const cloudRecordRow = ref({})
const rtcUrl = ref("");
const flvUrl = ref("");
const wsUrl = ref('');
const tabActiveName = ref('media');
const streamInfo = ref({});
const quality = ref(['普清', '高清', '超清']);
const defaultQuality = ref('高清');
const isPtz = ref(true);
const isQuality = ref(true);
const isLive = ref(true);
const currentWidth = ref(0);
const playerTime = ref(0);
const showTimeLeft = ref(0);
const step = ref(0);
const timeLen = ref(null);
const startTime = ref(null);
const playing = ref(false);
const timer = ref(null);
const playSpeed = ref(1);
const isFullScreen = ref(false);
const playSpeedRange = ref([1, 2, 4]);
const jessibucaHeight = ref("500px");
const isPaused = ref(false);


/**
 * 点击设备树节点
 */
const handleDeviceClick = async (deviceId: number) => {
  try {
    const res = await getDevice(deviceId)
    const device = res.data
    currentDevice.value = device

    // 设置查询参数
    if (device.type === '1' || device.type === '2' || device.type === '3' || device.type === '4' || device.type === '5') {
      queryParams.value.app = device.type === '1' ? 'rtsp' :
          device.type === '2' ? 'rtmp' :
              device.type === '3' ? 'flv' :
                  device.type === '4' ? 'hls' : 'onvif'
      queryParams.value.stream = device.deviceCode
    } else {
      // 其他类型的设备，暂时不处理
      proxy.$modal.msgWarning('该设备类型暂不支持录像回放')
      return
    }

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
  listAllCloudRecord(queryParams.value).then(response => {
    cloudRecordList.value = response.data || []
    loading.value = false
  }).catch(() => {
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

  await loadRecord(row.id).then(async res => {
    await nextTick(async () => {
      if (location.protocol === "https:") {
        flvUrl.value = res.data.https_flv;
        rtcUrl.value = res.data.rtcs;
        wsUrl.value = res.data.wss_flv;
      } else {
        flvUrl.value = res.data.flv;
        rtcUrl.value = res.data.rtc;
        wsUrl.value = res.data.ws_flv;
      }
      console.log(wsUrl.value)
      selectedRecord.value = row

      streamInfo.value = res.data;
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
      jessibucaHeight.value = "500px"
      step.value = 100 / (cloudRecordRow.value.timeLen / 1000);
      timer.value = setInterval(() => {
        if (isPaused.value) return;
        // 增加进度
        currentWidth.value = currentWidth.value + step.value * playSpeed.value;
        playerTime.value += 1000 * playSpeed.value

        // 判断是否结束
        if (currentWidth.value >= 100) {
          currentWidth.value = 100;
          clearInterval(timer.value); // 停止计时器
        }
      }, 1000)

      timeLen.value = row.timeLen
      startTime.value = row.startTime

      // 调用播放器的 play 方法
      await setTimeout(async ()=>{
        await nextTick();
        if (proxy.$refs['EasyPlayerRef_' + currentDevice.value.id]) {
          proxy.$refs['EasyPlayerRef_' + currentDevice.value.id].play(wsUrl.value)
        }
      },1000)
    })
  }).catch((e) => {
    console.error('加载录像失败', e)
    proxy.$modal.msgError('加载录像失败')
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
    clearInterval(timer.value); // 停止计时器
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
    clearInterval(timer.value); // 停止计时器
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
    proxy.$modal.msgError('内容为空，无法复制');
    return;
  }
  try {
    await toClipboard(text)
    proxy.$modal.msgSuccess('成功拷贝到粘贴板');
  } catch (e) {
    console.error(e)
  }
};

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
    jessibucaHeight.value = "500px"
    return
  }
  screenfull.request(document.getElementById('recordPlayer'))
  screenfull.on('change', (event) => {
    isFullScreen.value = screenfull.isFullscreen
  })
  isFullScreen.value = true
  jessibucaHeight.value = "95%"
}

/**
 * 倍速播放
 */
const changePlaySpeed = (speed) => {
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
  }).then((res) => {
  })
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
  isPaused.value = !isPaused.value;
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
 * 快退5秒
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
 * 快进5秒
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
function timeProcessClick(event) {
  if (!timeLen.value) return
  let x = event.offsetX
  let clientWidth = proxy.$refs["timeProcess"].clientWidth
  seekRecord(x / clientWidth * timeLen.value)
}

/**
 * 定位录像
 */
function seekRecord(playSeekValue) {
  if (!streamInfo.value) return
  seekCloudRecord({
    mediaServerId: streamInfo.value.mediaServerId,
    app: streamInfo.value.app,
    stream: streamInfo.value.stream,
    stamp: playSeekValue,
    schema: 'fmp4'
  }).then((data) => {
    currentWidth.value = playSeekValue / 1000 * step.value
  }).catch((error) => {
    console.log(error)
  })
}

/**
 * 获取播放时间
 */
const showPlayTimeValue = computed(() => {
  return streamInfo.value === null ? '--:--:-- --:--:--' : (selectedRecord.value ? formatTimeStamp(selectedRecord.value.startTime) : '--:--:-- --:--:--')
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
    let time = showTimeLeft.value / proxy.$refs["timeProcess"].clientWidth * timeLen.value
    let realTime = timeLen.value / selectedRecord.value.timeLen * time + selectedRecord.value.startTime
    return `${moment(time + 1000).format('mm:ss')}(${moment(realTime).format('HH:mm:ss')})`
  } else {
    return ''
  }
})

/**
 * 获取播放进度条样式
 */
const playTimeTitleStyle = computed(() => {
  return {left: (showTimeLeft.value - 32) + 'px'}
})

/**
 * 鼠标事件
 */
function timeProcessMouseEnter(event) {
  showTimeLeft.value = event.offsetX
}

function timeProcessMouseMove(event) {
  showTimeLeft.value = event.offsetX
}

function timeProcessMouseLeave(event) {
  showTimeLeft.value = null
}

/**
 * 获取播放进度条值
 */
const playTimeValue = computed(() => {
  return {width: currentWidth.value + '%'}
})

/**
 * 格式化时间戳
 */
function formatTimeStamp(time) {
  if (!time) return ''
  return moment.unix(time / 1000).format('YYYY-MM-DD HH:mm:ss')
}


/**
 * 格式化短时时间
 */
function formatShortTime(time) {
  if (!time) return ''
  return moment.unix(time / 1000).format('HH:mm')
}

/**
 * 格式化时长
 */
function formatTime(time) {
  if (!time) return '0秒'
  const h = parseInt(time / 3600 / 1000)
  const minute = parseInt((time - h * 3600 * 1000) / 60 / 1000)
  let second = Math.ceil((time - h * 3600 * 1000 - minute * 60 * 1000) / 1000)
  if (second < 0) second = 0
  return (h > 0 ? h + `h` : '') + (minute > 0 ? minute + 'm' : '') + (second > 0 ? second + 's' : '')
}

/**
 * 格式化文件大小
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 更新全屏状态
 */
const updateFullscreenState = () => {
  isFullScreen.value = !!document.fullscreenElement;
  if (!isFullScreen.value) {
    screenfull.exit()
    isFullScreen.value = false
    jessibucaHeight.value = "400px"
  }
};

/**
 * 组件挂载
 */
onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState);
});

/**
 * 组件卸载
 */
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState);
  handleCloseStreams()
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 16px;
  height: calc(100vh - 40px);
  box-sizing: border-box;
}

/* splitpanes 基础优化 */
.record-splitpanes {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  animation: panelFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

html.dark .record-splitpanes {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  border-color: var(--el-border-color-darker);
}

/* 三列布局 */
.tree-col,
.list-col,
.player-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
  gap: 10px;
  position: relative;
  animation: slideInDown 0.4s ease both;

  .header-accent {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    background: var(--el-color-primary);
    border-radius: 0 3px 3px 0;
  }

  .header-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-size: 14px;
  }

  .device-name {
    margin-left: auto;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 45%;
    padding: 2px 8px;
    background: var(--el-fill-color-light);
    border-radius: 10px;
  }

  .record-meta {
    margin-left: auto;
    font-weight: 500;
    color: var(--el-color-primary);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

/* 内容区域 */
.tree-container,
.list-container,
.player-area {
  flex: 1;
  overflow: hidden;
  background: var(--el-bg-color);
}

.tree-container {
  padding: 10px;
}

/* 日期面板 */
.date-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 8px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;

  .date-nav-btn {
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.08);
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-5);
    }
  }

  .today-btn {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px var(--el-color-primary-light-8);
    }
  }
}

:deep(.record-date-picker) {
  width: 140px;

  .el-input__wrapper {
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: box-shadow 0.2s ease;

    &:hover, &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
}

/* 录像列表 */
.record-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;

  .record-items-wrap {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .list-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 20px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    text-align: center;
    animation: fadeIn 0.5s ease both;

    .empty-animation {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--el-fill-color-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      color: var(--el-text-color-placeholder);
      animation: emptyPulse 2.5s ease-in-out infinite;
    }

    span {
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 6px;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }
  }
}

.record-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 10px 10px 6px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  border: 1px solid transparent;
  animation: listItemSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  &:hover {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color-lighter);
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .record-dot {
      transform: scale(1.3);
      background: var(--el-color-primary);
    }
  }

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-8), 0 4px 12px var(--el-color-primary-light-8);

    .record-dot {
      background: var(--el-color-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
    }

    .record-time {
      color: var(--el-color-primary);
    }
  }

  .record-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 6px;
    flex-shrink: 0;

    .record-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--el-border-color);
      transition: all 0.3s ease;
    }

    .record-line {
      width: 2px;
      flex: 1;
      min-height: 24px;
      background: var(--el-border-color-lighter);
      margin-top: 4px;
      border-radius: 1px;
    }
  }

  .record-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .record-time {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--el-text-color-primary);
    font-size: 13px;
    font-weight: 600;
    transition: color 0.2s ease;

    .el-icon {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      flex-shrink: 0;
    }
  }

  .record-info {
    display: flex;
    align-items: center;

    .duration-tag {
      font-weight: 500;
      border-radius: 6px;

      .el-icon {
        margin-right: 2px;
        font-size: 12px;
      }
    }
  }
}

/* 播放器区域 */
.player-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  margin: 16px;
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: playerSlideUp 0.55s 0.1s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.player-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  position: relative;
}

/* 播放器空状态 */
.player-empty-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .empty-content {
    text-align: center;
    animation: emptyContentFadeIn 0.6s ease both;
  }

  .empty-icon-wrap {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: rgba(255, 255, 255, 0.25);
    animation: emptyIconPulse 3s ease-in-out infinite;
  }

  .empty-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .empty-hint {
    color: rgba(255, 255, 255, 0.35);
    font-size: 13px;
  }
}

/* 播放控制条 */
.player-controls {
  height: 36px;
  width: 100%;
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  align-items: center;
  background: linear-gradient(180deg, #141414 0%, #0f0f0f 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0 12px;
  transition: opacity 0.3s ease;

  &.disabled {
    opacity: 0.4;

    .player-progress {
      cursor: not-allowed;
    }
  }
}

.player-time {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-size: 12px;
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 500;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.start-time {
    justify-content: flex-start;
  }

  &.end-time {
    justify-content: flex-end;
  }
}

.player-progress-wrap {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.player-progress {
  width: 100%;
  height: 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;
  transition: height 0.2s ease;

  &:hover {
    height: 8px;
  }
}

.player-progress-track {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  overflow: hidden;
}

.player-progress-bar {
  height: 100%;
  background: var(--el-color-primary);
  border-radius: 3px;
  transition: width 0.1s linear;
  position: relative;
  z-index: 1;
}

.player-progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  border-radius: 3px;
  opacity: 0.3;
  filter: blur(4px);
  transition: width 0.1s linear;
  z-index: 0;
}

.player-progress-tooltip {
  width: fit-content;
  text-align: center;
  position: absolute;
  top: -44px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  white-space: nowrap;
  z-index: 99;
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  .tooltip-arrow {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background: rgba(30, 30, 30, 0.85);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transform: translateX(-50%) rotate(45deg);
  }
}

/* 播放器工具栏 */
.player-toolbar {
  height: 52px;
  background: linear-gradient(180deg, #1a1a1a 0%, #141414 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  transition: opacity 0.3s ease;

  &.disabled {
    opacity: 0.35;
  }
}

.player-toolbar-left,
.player-toolbar-center,
.player-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.12);
    color: #fff;
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &.play-btn {
    width: 40px;
    height: 40px;
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: #fff;
    font-size: 18px;

    &:hover:not(:disabled) {
      background: var(--el-color-primary-light-3);
      border-color: var(--el-color-primary-light-3);
      box-shadow: 0 0 16px var(--el-color-primary-light-5);
      transform: scale(1.12);
    }
  }

  &.stop-btn {
    width: 36px;
    height: 36px;
    background: rgba(245, 108, 108, 0.15);
    border-color: rgba(245, 108, 108, 0.2);
    color: #f56c6c;

    &:hover:not(:disabled) {
      background: rgba(245, 108, 108, 0.25);
      border-color: rgba(245, 108, 108, 0.35);
      box-shadow: 0 0 12px rgba(245, 108, 108, 0.2);
    }
  }

  &.speed-btn {
    border-radius: 10px;
    padding: 0 12px;
    height: 30px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
    background: rgba(255, 255, 255, 0.06);
  }
}

/* 速度下拉菜单 */
.speed-dropdown-menu {
  border-radius: 10px;
  padding: 6px;
  min-width: 80px;

  :deep(.el-dropdown-menu__item) {
    border-radius: 6px;
    padding: 7px 12px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}

/* ========== 动画定义 ========== */
@keyframes panelFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.995);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes listItemSlideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes emptyPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.8;
  }
}

@keyframes emptyIconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.05);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 16px rgba(255, 255, 255, 0);
  }
}

@keyframes emptyContentFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes playerSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 暗黑模式适配 ========== */
html.dark {
  .panel-header {
    background: rgba(255, 255, 255, 0.02);
    border-bottom-color: var(--el-border-color-darker);
    color: var(--el-text-color-primary);

    .header-icon-wrap {
      background: var(--el-color-primary-light-5);
    }

    .device-name {
      background: rgba(255, 255, 255, 0.04);
    }
  }

  .tree-container,
  .list-container,
  .player-area {
    background: var(--el-bg-color);
  }

  .date-panel {
    background: rgba(255, 255, 255, 0.02);
    border-bottom-color: var(--el-border-color-darker);
  }

  .record-item {
    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--el-border-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    &.active {
      background: var(--el-color-primary-light-5);
      border-color: var(--el-color-primary-light-3);
      box-shadow: 0 0 0 1px var(--el-color-primary-light-3), 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }

  .record-list .list-empty {
    .empty-animation {
      background: rgba(255, 255, 255, 0.04);
    }
  }

  .player-wrapper {
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
}
</style>
