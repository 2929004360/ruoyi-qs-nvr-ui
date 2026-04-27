<template>
  <div class="app-container">
    <el-row :gutter="0">
      <splitpanes class="default-theme">
        <!-- 左侧设备树 -->
        <pane size="20">
          <el-col class="tree-col">
            <div class="panel-header">
              <el-icon>
                <VideoCamera/>
              </el-icon>
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
              <span>录像列表</span>
              <span class="device-name" v-if="currentDevice">{{ currentDevice.deviceName }}</span>
            </div>
            <div class="list-container">
              <!-- 日期选择 -->
              <div class="date-panel">
                <el-button icon="ArrowLeft" @click="prevDay" circle/>
                <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleDateChange"

                />
                <el-button icon="ArrowRight" @click="nextDay" circle/>
                <el-button type="primary" @click="handleToday" plain>今天</el-button>
              </div>

              <!-- 录像列表 -->
              <div class="record-list" v-loading="loading">
                <div v-if="cloudRecordList.length > 0">
                  <div
                      v-for="record in cloudRecordList"
                      :key="record.id"
                      class="record-item"
                      :class="{ active: selectedRecord && selectedRecord.id === record.id }"
                      @click="handleRecordItemClick(record)"
                  >
                    <div class="record-time">
                      <span>{{ formatShortTime(record.startTime) }} - {{ formatShortTime(record.endTime) }}</span>
                    </div>
                    <div class="record-info">
                      <el-tag type="success" size="small">{{ formatTime(record.timeLen) }}</el-tag>
                    </div>
                  </div>
                </div>
                <div v-else class="list-empty">
                  <span>无录像</span>
                </div>
              </div>
            </div>
          </el-col>
        </pane>

        <!-- 右侧播放器 -->
        <pane size="60">
          <el-col class="player-col">
            <div class="panel-header">
              <el-icon>
                <Monitor/>
              </el-icon>
              <span>录像播放</span>
              <span v-if="selectedRecord" class="record-info">{{
                  currentDevice?.deviceName || ''
                }} - {{ formatShortTime(selectedRecord.startTime) }}</span>
            </div>
            <div class="player-area">
              <div id="recordPlayer" class="player-wrapper">
                <div class="player-container" :style="'height:'+ jessibucaHeight">
                  <!-- 空状态提示 -->
                  <div v-if="!selectedRecord" class="player-empty-overlay">
                    <div class="empty-content">
                      <div class="empty-icon">
                        <el-icon size="56">
                          <VideoPlay/>
                        </el-icon>
                      </div>
                      <div class="empty-text">请选择设备和录像文件</div>
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
                  <div class="player-time">
                    {{ showPlayTimeValue }}
                  </div>
                  <div class="player-progress" ref="timeProcess" @click="selectedRecord && timeProcessClick($event)"
                       @mouseenter="selectedRecord && timeProcessMouseEnter($event)" @mousemove="selectedRecord && timeProcessMouseMove($event)"
                       @mouseleave="selectedRecord && timeProcessMouseLeave($event)">
                    <div v-if="streamInfo">
                      <div class="player-progress-bar" :style="playTimeValue"></div>
                      <transition name="el-fade-in-linear">
                        <div v-show="showTimeLeft" class="player-progress-tooltip" :style="playTimeTitleStyle">
                          {{ showPlayTimeTitle }}
                        </div>
                      </transition>
                    </div>
                  </div>
                  <div class="player-time">
                    {{ showPlayTimeTotal }}
                  </div>
                </div>

                <div class="player-toolbar" :class="{ 'disabled': !selectedRecord }">
                  <div class="player-toolbar-left">
                    <el-tooltip content="截图" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="snap()">
                        <el-icon>
                          <Camera/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="刷新" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="refresh()">
                        <el-icon>
                          <Refresh/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="下载" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="download()">
                        <el-icon>
                          <Download/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>

                  <div class="player-toolbar-center">
                    <el-tooltip content="快退五秒" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="seekBackward()">
                        <el-icon>
                          <VideoPause/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="停止" placement="top">
                      <el-button circle size="small" class="toolbar-btn danger" :disabled="!selectedRecord" @click="stopPLay()">
                        <el-icon>
                          <VideoPlay/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="playing ? '暂停' : '播放'" placement="top">
                      <el-button circle size="small" class="toolbar-btn primary"
                                 :disabled="!selectedRecord" @click="playing ? pausePlay() : playRecord()">
                        <el-icon v-if="playing">
                          <VideoPause/>
                        </el-icon>
                        <el-icon v-else>
                          <VideoPlay/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="快进五秒" placement="top">
                      <el-button circle size="small" class="toolbar-btn" :disabled="!selectedRecord" @click="seekForward()">
                        <el-icon>
                          <Right/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-dropdown @command="changePlaySpeed" :popper-append-to-body='false' :disabled="!selectedRecord">
                      <el-button class="toolbar-btn speed-btn" size="small" :disabled="!selectedRecord">
                        {{ playSpeed }}X
                        <el-icon>
                          <ArrowDown/>
                        </el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
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
                        <el-icon v-if="!isFullScreen">
                          <FullScreen/>
                        </el-icon>
                        <el-icon v-else>
                          <Aim/>
                        </el-icon>
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
  Camera,
  Clock,
  Connection,
  Document,
  DocumentCopy,
  Download,
  FullScreen,
  Link,
  Monitor,
  Refresh,
  Right,
  VideoCamera,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import StreamDropdown from "@/components/Channel/streamDropdown.vue";
import MediaInfo from "@/components/Channel/mediaInfo.vue";
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
      jessibucaHeight.value = "400px"
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
    jessibucaHeight.value = "400px"
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
  padding: 20px;
  height: calc(100vh - 40px);
  box-sizing: border-box;
}

.tree-col,
.list-col,
.player-col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--el-bg-color-page, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  font-size: 14px;
  gap: 8px;

  .device-name {
    margin-left: auto;
    font-weight: normal;
    color: var(--el-text-color-secondary, #909399);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 50%;
  }

  .record-info {
    margin-left: auto;
    font-weight: normal;
    color: var(--el-color-primary, #409eff);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tree-container,
.list-container,
.player-area {
  flex: 1;
  overflow-y: auto;
  background: var(--el-bg-color-overlay, #ffffff);
}

.tree-container {
  padding: 8px;
}

.date-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 10px;
  background: var(--el-bg-color-page, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.record-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;

  .list-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--el-text-color-secondary, #909399);
    font-size: 13px;
  }
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 4px;

  &:hover {
    background: var(--el-bg-color-page, #f5f7fa);
    transform: translateY(-1px);
  }

  &.active {
    background: var(--el-color-primary-light-8, #ecf5ff);
    border-left: 3px solid var(--el-color-primary, #409eff);
  }

  .record-time {
    color: var(--el-text-color-primary, #303133);
    font-size: 13px;
    font-weight: 500;
  }
}

.player-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--el-bg-color-page, #f5f7fa);

  .empty-content {
    text-align: center;
  }

  .empty-icon {
    color: var(--el-text-color-placeholder, #c0c4cc);
    margin-bottom: 20px;
  }

  .empty-text {
    color: var(--el-text-color-primary, #303133);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .empty-hint {
    color: var(--el-text-color-secondary, #909399);
    font-size: 13px;
  }
}

.player-wrapper {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 16px 16px 0;
}

.player-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  position: relative;
}

.player-empty-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .empty-content {
    text-align: center;
  }

  .empty-icon {
    color: var(--el-text-color-placeholder, #c0c4cc);
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .empty-text {
    color: var(--el-text-color-secondary, #909399);
    font-size: 14px;
  }
}

.player-controls {
  height: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 140px auto 140px;
  background-color: rgb(0, 0, 0);
}

.player-progress {
  width: 100%;
  height: 8px;
  margin: 6px 0;
  border-radius: 4px;
  border: 1px solid #505050;
  background-color: rgb(56, 56, 56);
  cursor: pointer;
  position: relative;
}

.player-time {
  color: #FFFFFF;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--el-color-primary, #409eff);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.player-progress-tooltip {
  width: fit-content;
  text-align: center;
  position: absolute;
  top: -35px;
  color: rgb(217, 217, 217);
  font-size: 14px;
  text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
  pointer-events: none;
  white-space: nowrap;
  z-index: 99;
}

.player-toolbar {
  height: 48px;
  background-color: #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 16px;

  &.disabled {
    opacity: 0.5;
  }
}

.player-controls {
  &.disabled {
    opacity: 0.5;
    
    .player-progress {
      cursor: not-allowed;
    }
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
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.primary {
    background: var(--el-color-primary, #409eff);
  }

  &.danger {
    background: rgba(245, 108, 108, 0.2);
  }

  &.speed-btn {
    border-radius: 12px;
    padding: 0 8px;
    height: 24px;
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
  }
}

/* 暗黑模式适配 */
html.dark {
  .panel-header {
    background: var(--el-bg-color-page, #141414);
    border-bottom-color: var(--el-border-color-light, #434343);
    color: var(--el-text-color-primary, #e5eaf3);

    .device-name {
      color: var(--el-text-color-secondary, #a3a6ad);
    }
  }

  .tree-container,
  .list-container,
  .player-area {
    background: var(--el-bg-color-overlay, #1d1e1f);
  }

  .date-panel {
    background: var(--el-bg-color-page, #141414);
    border-bottom-color: var(--el-border-color-lighter, #363637);
  }

  .record-item {
    border-color: var(--el-border-color-lighter, #363637);

    &:hover {
      background: var(--el-bg-color-page, #141414);
    }

    &.active {
      background: rgba(64, 158, 255, 0.15);
    }

    .record-time {
      color: var(--el-text-color-primary, #e5eaf3);
    }
  }

  .player-empty {
    background: var(--el-bg-color-page, #141414);

    .empty-text {
      color: var(--el-text-color-primary, #e5eaf3);
    }

    .empty-hint {
      color: var(--el-text-color-secondary, #a3a6ad);
    }
  }

  .player-wrapper {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  .url-header {
    .url-label {
      color: var(--el-text-color-primary, #e5eaf3);
    }
  }
}
</style>
