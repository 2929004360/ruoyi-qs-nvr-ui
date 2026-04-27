<template>
  <div class="app-container">
    <div class="search-box">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="应用名" prop="app">
          <el-input
              v-model="queryParams.app"
              placeholder="请输入应用名"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="流id" prop="stream">
          <el-input
              v-model="queryParams.stream"
              placeholder="请输入流id"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="queryStartTime">
          <el-date-picker
              v-model="queryParams.queryStartTime"
              type="datetime"
              style="width: 240px"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="queryEndTime">
          <el-date-picker
              v-model="queryParams.queryEndTime"
              type="datetime"
              style="width: 240px"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="媒体节点" prop="mediaServerId">
          <el-select
              v-model="queryParams.mediaServerId"
              style="width: 240px"
              placeholder="请选择节点选择"
              clearable
          >
            <el-option
                v-for="item in mediaServerList"
                :key="item.id"
                :label="item.id"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
        >删除
        </el-button>
        <el-button
            type="warning"
            plain
            icon="Download"
            :disabled="multiple"
            @click="downloadZip"
        >下载
        </el-button>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </div>
    </div>

    <el-table v-loading="loading" :data="cloudRecordList" @selection-change="handleSelectionChange" class="record-table" border>
      <el-table-column type="selection" width="55" align="center" fixed/>
      <el-table-column label="编号" align="center" prop="id" width="80"/>
      <el-table-column label="应用名" align="center" prop="app" width="120"/>
      <el-table-column label="流id" align="center" prop="stream" min-width="150"/>
      <el-table-column label="开始时间" align="center" width="180">
        <template v-slot:default="scope">
          {{ formatTimeStamp(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" width="180">
        <template v-slot:default="scope">
          {{ formatTimeStamp(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="媒体节点" align="center" prop="mediaServerId" width="120"/>
      <el-table-column label="文件名称" align="center" prop="fileName" min-width="150"/>
      <el-table-column label="大小" align="center" prop="fileSize" width="120">
        <template v-slot:default="scope">
          <el-tag type="info">{{ formatBytes(scope.row.fileSize) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时长" align="center" width="140">
        <template v-slot:default="scope">
          <el-tag type="success">{{ formatTime(scope.row.timeLen) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200" fixed="right">
        <template #default="scope">
          <el-button link
                     type="primary"
                     icon="VideoPlay"
                     @click="handlePlay(scope.row)"
                     :loading="scope.row.loading"
          >
            播放
          </el-button>
          <el-button link type="success" icon="Download" @click="downloadZip(scope.row)">下载</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <el-dialog :title="`录像播放-${cloudRecordRow.fileName}`"
               v-model="easyPlayerOpen"
               width="840px"
               append-to-body
               draggable
               @close="handleCloseStreams"
               class="player-dialog"
    >
      <div id="cloudRecordPlayer">
        <div class="player-container" v-if="easyPlayerOpen" :style="'height:'+ jessibucaHeight">
          <EasyPlayer
              :style="'height:'+ jessibucaHeight"
              ref="EasyPlayerRef"
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

        <div class="player-controls">
          <div class="player-time">
            {{ showPlayTimeValue }}
          </div>
          <div class="player-progress" ref="timeProcess" @click="timeProcessClick($event)"
               @mouseenter="timeProcessMouseEnter($event)" @mousemove="timeProcessMouseMove($event)"
               @mouseleave="timeProcessMouseLeave($event)">
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

        <div class="player-toolbar">
          <div class="player-toolbar-left">
            <el-tooltip content="截图" placement="top">
              <el-button circle size="small" class="toolbar-btn" @click="snap()">
                <el-icon><Camera /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="刷新" placement="top">
              <el-button circle size="small" class="toolbar-btn" @click="refresh()">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="下载" placement="top">
              <el-button circle size="small" class="toolbar-btn" @click="download()">
                <el-icon><Download /></el-icon>
              </el-button>
            </el-tooltip>
          </div>

          <div class="player-toolbar-center">
            <el-tooltip content="快退五秒" placement="top">
              <el-button circle size="small" class="toolbar-btn" @click="seekBackward()">
                <el-icon><VideoPause /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="停止" placement="top">
              <el-button circle size="small" class="toolbar-btn danger" @click="stopPLay()">
                <el-icon><VideoPlay /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="playing ? '暂停' : '播放'" placement="top">
              <el-button circle size="small" class="toolbar-btn primary" @click="playing ? pausePlay() : playRecord()">
                <el-icon v-if="playing"><VideoPause /></el-icon>
                <el-icon v-else><VideoPlay /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="快进五秒" placement="top">
              <el-button circle size="small" class="toolbar-btn" @click="seekForward()">
                <el-icon><Right /></el-icon>
              </el-button>
            </el-tooltip>
            <el-dropdown @command="changePlaySpeed" :popper-append-to-body='false'>
              <el-button class="toolbar-btn speed-btn" size="small">
                {{ playSpeed }}X
                <el-icon><ArrowDown /></el-icon>
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
              <el-button circle size="small" class="toolbar-btn" @click="fullScreen()">
                <el-icon v-if="!isFullScreen"><FullScreen /></el-icon>
                <el-icon v-else><Aim /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="CloudRecord">
import useClipboard from "vue-clipboard3";
import screenfull from 'screenfull'
import moment from 'moment'
import EasyPlayer from "@/components/EasyPlayer";
import type {CloudRecordQueryParams, ZlmCloudRecord} from "@/types/api/qs/cloudRecord"
import {
  closeStreams,
  delCloudRecord,
  listCloudRecord,
  loadRecord,
  seekCloudRecord,
  setCloudRecordSpeed
} from "@/api/qs/cloudRecord"
import momentDurationFormatSetup from 'moment-duration-format'
import {
  DocumentCopy,
  Camera,
  Refresh,
  Download,
  VideoPause,
  VideoPlay,
  Right,
  ArrowDown,
  FullScreen,
  Aim,
  Link,
  Connection,
  Clock
} from '@element-plus/icons-vue'
import StreamDropdown from "@/components/Channel/streamDropdown.vue";
import MediaInfo from "@/components/Channel/mediaInfo.vue";
import {getAllOnlineMediaServe} from "@/api/qs/zlm";

const {toClipboard} = useClipboard()

momentDurationFormatSetup(moment)

const {proxy} = getCurrentInstance()

const cloudRecordList = ref<ZlmCloudRecord[]>([])
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const multiple = ref<boolean>(true)
const total = ref<number>(0)

// 播放
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
const showPlayTime = ref('');
const timeLen = ref(null);
const startTime = ref(null);
const playing = ref(false);
const timer = ref(null);
const playSpeed = ref(1);
const isFullScreen = ref(false);
const lastDiable = ref(true);
const nextDiable = ref(false);
const playData = ref({});
const playSpeedRange = ref([1, 2, 4]);
const jessibucaHeight = ref("400px");
const isPaused = ref(false);


const mediaServerList = ref([]);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    app: undefined,
    stream: undefined,
    callId: undefined,
    queryStartTime: undefined,
    queryEndTime: undefined,
    mediaServerId: undefined,
  } as CloudRecordQueryParams,
})

const {queryParams} = toRefs(data)

/** 查询云端录像列表 */
function getList() {
  loading.value = true
  listCloudRecord(queryParams.value).then(response => {
    cloudRecordList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection: ZlmCloudRecord[]) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

/** 删除按钮操作 */
function handleDelete(row: ZlmCloudRecord) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除云端录像编号为"' + _ids + '"的数据项？').then(function () {
    return delCloudRecord(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {
  })
}

/**
 * 播放
 *
 * @param row
 */
const handlePlay = async (row: ZlmCloudRecord) => {
  // 先停止当前播放
  if (easyPlayerOpen.value) {
    stopPLay()
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

      streamInfo.value = res.data;
      quality.value = []
      defaultQuality.value = ''
      isPtz.value = false
      isQuality.value = false
      isLive.value = true
      cloudRecordRow.value = row
      row.loading = false
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
      easyPlayerOpen.value = true

      await nextTick()
      if (proxy.$refs["EasyPlayerRef"]) {
        proxy.$refs["EasyPlayerRef"].play(wsUrl.value)
      }
    })
  })
}

/**
 * 关闭流文件形成播放地址
 *
 * @param row
 */
const handleCloseStreams = () => {
  streamInfo.value = null
  currentWidth.value = 0
  playerTime.value = 0
  playSpeed.value = 0
  isPaused.value = false
  clearInterval(timer.value); // 停止计时器
  closeStreams(cloudRecordRow.value.id)
}

/**
 * 播放器错误回调
 */
const easyPlayeError = () => {
  clearInterval(timer.value); // 停止计时器
  currentWidth.value = 0
  playerTime.value = 0
  playSpeed.value = 0
  isPaused.value = false
}

/**
 * 复制内容到粘贴板
 *
 * @param text
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
 * 下载
 */
function downloadZip(row: ZlmCloudRecord) {
  let cloudRecordIds = []
  if (row.id) {
    cloudRecordIds.push(row.id)
  } else {
    cloudRecordIds = ids.value
  }

  let idsStr = cloudRecordIds.join(',')
  const link = document.createElement('a')
  link.target = '_blank'
  let baseUri = import.meta.env.VITE_APP_BASE_API
  let downloadUrl = `${location.origin}${baseUri}/zlm/cloudRecord/download/zip?ids=${idsStr}`
  link.href = downloadUrl
  link.click()
}

// 全屏
const fullScreen = () => {
  if (isFullScreen.value) {
    screenfull.exit()
    isFullScreen.value = false
    jessibucaHeight.value = "400px"
    return
  }
  screenfull.request(document.getElementById('cloudRecordPlayer'))
  screenfull.on('change', (event) => {
    isFullScreen.value= screenfull.isFullscreen
  })
  isFullScreen.value = true
  jessibucaHeight.value = "95%"
}

// 倍速播放
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
  }).then((res)=>{

  })
}

// 暂停
const pausePlay = () => {
  proxy.$refs["EasyPlayerRef"].pause()
  playing.value = false
  togglePause()
}

// 播放
const playRecord = () => {
  playing.value = true
  togglePause()
  if (!streamInfo.value) {
    handlePlay(cloudRecordRow.value)
    return
  }
  proxy.$refs["EasyPlayerRef"].play()
}

// 开启/暂停 切换函数
const togglePause = () => {
  isPaused.value = !isPaused.value;
}

/**
 * 停止播放
 */
function stopPLay() {
  // 停止
  if (proxy.$refs["EasyPlayerRef"]) {
    proxy.$refs["EasyPlayerRef"].destroy()
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

// 下载
const download = () => {
  downloadZip(cloudRecordRow.value);
}

// 截图
const snap = () => {
  proxy.$refs["EasyPlayerRef"].screenshot()
}

// 刷新
const refresh = () => {
  proxy.$refs["EasyPlayerRef"].play()
}

/**
 * 播放进度条点击
 *
 * @param event
 */
function timeProcessClick(event) {
  let x = event.offsetX
  let clientWidth = proxy.$refs["timeProcess"].clientWidth
  seekRecord(x / clientWidth * timeLen.value)
}

function seekRecord(playSeekValue) {
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
 *
 * @returns {string|*}
 */
const showPlayTimeValue = computed(() => {
  return streamInfo.value === null ? '--:--:-- --:--:--' : formatTimeStamp(cloudRecordRow.value.startTime)
})

/**
 * 获取播放时间
 *
 * @returns {string|*}
 */
const showPlayTimeTotal = computed(() => {
  if (streamInfo.value === null) {
    return '--:--:-- --:--:--'
  } else {
    return formatTimeStamp(cloudRecordRow.value.endTime)
  }
})

/**
 * 获取播放时间
 *
 * @type {ComputedRef<unknown>}
 */
const showPlayTimeTitle = computed(() => {
  if (showTimeLeft.value) {
    let time = showTimeLeft.value / proxy.$refs["timeProcess"].clientWidth * cloudRecordRow.value.timeLen
    let realTime = timeLen.value / cloudRecordRow.value.timeLen * time + startTime.value
    return `${moment(time + 1000).format('mm:ss')}(${moment(realTime).format('HH:mm:ss')})`
  } else {
    return ''
  }
})

/**
 * 获取播放进度条样式
 *
 * @type {ComputedRef<{left: string}>}
 */
const playTimeTitleStyle = computed(() => {
  return {left: (showTimeLeft.value - 32) + 'px'}
})

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
 *
 * @type {ComputedRef<{width: string}>}
 */
const playTimeValue = computed(() => {
  return {width: currentWidth.value + '%'}
})

/**
 * 格式化时间
 *
 * @param time
 * @returns {*}
 */
function formatTimeStamp(time) {
  return moment.unix(time / 1000).format('yyyy-MM-DD HH:mm:ss')
}

/**
 * 格式化时长
 *
 * @param time
 */
function formatTime(time) {
  const h = parseInt(time / 3600 / 1000)
  const minute = parseInt((time - h * 3600 * 1000) / 60 / 1000)
  let second = Math.ceil((time - h * 3600 * 1000 - minute * 60 * 1000) / 1000)
  if (second < 0) {
    second = 0
  }
  return (h > 0 ? h + `小时` : '') + (minute > 0 ? minute + '分' : '') + (second > 0 ? second + '秒' : '')
}

/**
 * 格式化文件大小
 *
 * @param bytes
 * @param decimals
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 更新全屏状态的函数
const updateFullscreenState = () => {
  isFullScreen.value = !!document.fullscreenElement;
  if (!isFullScreen.value) {
    screenfull.exit()
    isFullScreen.value = false
    jessibucaHeight.value = "400px"
  }
};

/**
 * 获取所有在线媒体服务器
 */
function getAllOnlineMediaServeFun(){
  getAllOnlineMediaServe().then((res) => {
    mediaServerList.value = res.data
  })
}

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('fullscreenchange', updateFullscreenState);
  getList()
  getAllOnlineMediaServeFun()
});

// 组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', updateFullscreenState);
});

</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.record-table {
  margin-bottom: 20px;
}

.player-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.player-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  position: relative;
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
}

.player-toolbar-left,
.player-toolbar-center,
.player-toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  margin-left: 4px;
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
  .player-toolbar {
    background: linear-gradient(to bottom, #0d0d0d, #1a1a1a);
  }

  .url-header {
    .url-label {
      color: var(--el-text-color-primary, #e5eaf3);
    }
  }
}
</style>
