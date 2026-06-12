<template>
  <div class="app-container">
    <div class="search-box">
      <!-- 查询表单 -->
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
        class="query-form"
      >
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
        <el-form-item class="form-actions">
          <div class="button-group">
            <el-button type="primary" icon="Search" @click="handleQuery" class="search-btn">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery" class="reset-btn">重置</el-button>
          </div>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区 -->
      <el-row :gutter="10" class="mb8 toolbar-row action-buttons">
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            class="action-btn delete-btn"
          >删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            :disabled="multiple"
            @click="downloadZip"
            class="action-btn download-btn"
          >下载
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" v-model:viewMode="viewMode" :showViewSwitch="true" @queryTable="getList"></right-toolbar>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div v-if="viewMode === 'list'" class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="cloudRecordList"
        @selection-change="handleSelectionChange"
        class="custom-table"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" align="center" fixed/>
        <el-table-column label="编号" align="center" prop="id" width="70">
          <template #default="scope">
            <span class="id-badge">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
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
            <div class="table-actions">
              <el-tooltip content="播放">
                <el-button
                  type="primary"
                  text
                  bg
                  size="small"
                  icon="VideoPlay"
                  @click="handlePlay(scope.row)"
                  :loading="scope.row.loading"
                />
              </el-tooltip>
              <el-tooltip content="下载">
                <el-button
                  type="success"
                  text
                  bg
                  size="small"
                  icon="Download"
                  @click="downloadZip(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="删除">
                <el-button
                  type="danger"
                  text
                  bg
                  size="small"
                  icon="Delete"
                  @click="handleDelete(scope.row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="card-view" v-loading="loading">
      <el-row :gutter="16" v-if="cloudRecordList.length > 0">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in cloudRecordList" :key="item.id">
          <div class="device-card" :class="{ 'is-selected': item.checked }">
            <!-- 头部区域 -->
            <div class="card-header-area">
              <el-checkbox v-model="item.checked" @change="handleCardSelection" class="card-checkbox" />
              <div class="header-content">
                <el-icon class="header-icon"><VideoPlay /></el-icon>
                <h3 class="header-title" :title="item.fileName">{{ item.fileName }}</h3>
              </div>
              <el-tag type="success" size="small" class="header-tag">{{ formatTime(item.timeLen) }}</el-tag>
            </div>

            <!-- 信息区 -->
            <div class="card-info">
              <div class="info-tags">
                <span class="info-tag">
                  <span class="tag-label">ID</span>
                  <span class="tag-val">{{ item.id }}</span>
                </span>
                <span class="info-tag">
                  <span class="tag-label">应用</span>
                  <span class="tag-val">{{ item.app }}</span>
                </span>
                <span class="info-tag">
                  <span class="tag-label">流ID</span>
                  <span class="tag-val">{{ item.stream }}</span>
                </span>
                <el-tag type="info" size="small">{{ formatBytes(item.fileSize) }}</el-tag>
              </div>

              <div class="info-channel">
                <span class="channel-label">媒体节点</span>
                <span class="channel-val">{{ item.mediaServerId }}</span>
              </div>

              <div class="info-footer">
                <span class="time-range">{{ formatTimeStamp(item.startTime) }} ~ {{ formatTimeStamp(item.endTime) }}</span>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="card-toolbar">
              <el-button
                type="primary"
                size="small"
                icon="VideoPlay"
                @click="handlePlay(item)"
                :loading="item.loading"
                class="btn-play"
              >
                播放
              </el-button>
              <div class="toolbar-actions">
                <el-tooltip content="下载">
                  <el-button
                    type="success"
                    text
                    bg
                    size="small"
                    icon="Download"
                    @click="downloadZip(item)"
                  />
                </el-tooltip>
                <el-tooltip content="删除">
                  <el-button
                    type="danger"
                    text
                    bg
                    size="small"
                    icon="Delete"
                    @click="handleDelete(item)"
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-else description="暂无云端录像数据" />
    </div>

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
  Clock,
  List,
  Grid
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
const viewMode = ref<string>('card') // 'list' 或 'card'

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
    cloudRecordList.value = response.rows.map((item: any) => ({
      ...item,
      checked: ids.value.includes(item.id)
    }))
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

// 卡片视图多选框选中处理
function handleCardSelection() {
  const selectedItems = cloudRecordList.value.filter(item => item.checked)
  ids.value = selectedItems.map(item => item.id!)
  multiple.value = !selectedItems.length
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
  padding: 16px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-box {
  margin-bottom: 16px;
}

/* ========== 查询表单 ========== */
.query-form {
  padding: 10px 15px;
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 0 !important;
  animation: fadeInUp 0.4s ease-out 0.15s both;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;

  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 0;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
    transition: all 0.3s;

    &:hover,
    &:focus-within {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }

    &:focus-within {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-actions {
  margin-left: auto !important;
  margin-right: 0 !important;
  padding-left: 16px;
  border-left: 1px solid var(--el-border-color-lighter);
  margin-left: 12px !important;
}

.button-group {
  display: flex;
  gap: 12px;
}

.search-btn {
  transition: all 0.3s;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--el-color-primary-light-7);
}

.search-btn:active {
  transform: translateY(0);
}

.reset-btn {
  transition: all 0.3s;
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.reset-btn:active {
  transform: translateY(0);
}

/* ===== 工具栏样式优化 ===== */
.toolbar-row {
  padding: 4px 0;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.action-btn:not(:disabled):active {
  transform: translateY(0);
}

.delete-btn:hover {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.35);
}

.download-btn:hover {
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.35);
}

/* ===== 卡片视图按钮样式 - 白色图标 ===== */
/* 播放按钮 */
.card-toolbar .btn-play {
  color: #ffffff !important;
}

.card-toolbar .btn-play .el-icon {
  color: #ffffff !important;
}

/* 操作按钮 - 强制覆盖 text bg 样式 */
.toolbar-actions .el-button--primary,
.toolbar-actions .el-button--primary[text],
.toolbar-actions .el-button--primary[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}

.toolbar-actions .el-button--danger,
.toolbar-actions .el-button--danger[text],
.toolbar-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.toolbar-actions .el-button--success,
.toolbar-actions .el-button--success[text],
.toolbar-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.toolbar-actions .el-button .el-icon {
  color: #ffffff !important;
}

/* 悬停时稍微浅一点 */
.toolbar-actions .el-button--primary:hover,
.toolbar-actions .el-button--primary[text]:hover,
.toolbar-actions .el-button--primary[text][bg]:hover {
  background-color: var(--el-color-primary-light-3) !important;
  border-color: var(--el-color-primary-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--primary:hover .el-icon {
  color: #ffffff !important;
}

.toolbar-actions .el-button--danger:hover,
.toolbar-actions .el-button--danger[text]:hover,
.toolbar-actions .el-button--danger[text][bg]:hover {
  background-color: var(--el-color-danger-light-3) !important;
  border-color: var(--el-color-danger-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--danger:hover .el-icon {
  color: #ffffff !important;
}

.toolbar-actions .el-button--success:hover,
.toolbar-actions .el-button--success[text]:hover,
.toolbar-actions .el-button--success[text][bg]:hover {
  background-color: var(--el-color-success-light-3) !important;
  border-color: var(--el-color-success-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--success:hover .el-icon {
  color: #ffffff !important;
}

.view-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-switch :deep(.el-radio-group) {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  padding: 2px;
  box-shadow: none;
  border: none;
  display: flex;
}

.view-switch :deep(.el-radio-button) {
  margin: 0;
}

.view-switch :deep(.el-radio-button__inner) {
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  position: relative;
}

.view-switch :deep(.el-radio-button__inner:hover) {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
  transform: translateY(-1px);
}

.view-switch :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.view-switch :deep(.el-icon) {
  font-size: 16px;
  vertical-align: middle;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-switch :deep(.el-radio-button__inner:hover .el-icon) {
  transform: scale(1.1);
}

.view-switch :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner .el-icon) {
  transform: scale(1.15);
}

/* 卡片视图样式 */
.card-view {
  padding: 8px 0;
}

.device-card {
  position: relative;
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardFadeIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(16px);
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 8px rgba(0,0,0,0.04),
    0 8px 16px rgba(0,0,0,0.02);
}

.device-card:nth-child(1) { animation-delay: 0.04s; }
.device-card:nth-child(2) { animation-delay: 0.08s; }
.device-card:nth-child(3) { animation-delay: 0.12s; }
.device-card:nth-child(4) { animation-delay: 0.16s; }
.device-card:nth-child(5) { animation-delay: 0.20s; }
.device-card:nth-child(6) { animation-delay: 0.24s; }
.device-card:nth-child(7) { animation-delay: 0.28s; }
.device-card:nth-child(8) { animation-delay: 0.32s; }

@keyframes cardFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.device-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--el-box-shadow-light);
  border-color: var(--el-color-primary-light-5);
}

.device-card.is-selected {
  border-color: var(--el-color-primary);
  box-shadow: 
    0 0 0 3px var(--el-color-primary-light-9),
    0 8px 24px -4px rgba(var(--el-color-primary-rgb), 0.2),
    0 4px 12px rgba(var(--el-color-primary-rgb), 0.1);
}

/* 头部区域（替代图片区） */
.card-header-area {
  position: relative;
  padding: 16px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-fill-color-lighter) 100%);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 64px;
}

.card-header-area .card-checkbox {
  position: relative;
  top: auto;
  left: auto;
  z-index: 2;
}

.card-header-area .card-checkbox :deep(.el-checkbox__inner) {
  border-radius: 6px;
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.header-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  flex-shrink: 0;
  animation: iconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 4px rgba(var(--el-color-primary-rgb), 0.3));
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.header-tag {
  flex-shrink: 0;
}

/* 信息区 */
.card-info {
  padding: 14px 16px 10px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 11.5px;
  line-height: 1.5;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.info-tag:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.type-tag {
  margin-left: auto;
}

.tag-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.tag-val {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

/* 通道/节点单独一行 */
.info-channel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
  transition: all 0.2s ease;
}

.info-channel:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.channel-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.channel-val {
  color: var(--el-text-color-primary);
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.info-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.time-range {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: right;
}

/* 操作栏 */
.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.card-toolbar .el-button.btn-play {
  flex-shrink: 0;
  min-width: 72px;
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.25) !important;
  transition: all 0.3s ease;
}

.card-toolbar .el-button.btn-play:not(:disabled):hover {
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.4) !important;
  transform: translateY(-1px);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-actions .el-button {
  padding: 7px 10px;
  height: auto;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toolbar-actions .el-button:hover {
  transform: scale(1.08);
}

/* 表格容器优化 */
.table-wrapper {
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out 0.25s both;
  transition: box-shadow 0.3s;
}

.table-wrapper:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
}

.custom-table {
  --el-table-header-bg-color: var(--el-fill-color-light);

  :deep(.el-table__header-wrapper) {
    th {
      background-color: var(--el-fill-color-light) !important;
      color: var(--el-text-color-primary);
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.3px;
      transition: background-color 0.3s;
    }
  }

  :deep(.el-table__body-wrapper) {
    .el-table__row {
      transition: all 0.25s ease;
      animation: rowFadeIn 0.4s ease-out both;

      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.03 + 0.25}s;
        }
      }

      &:hover {
        background-color: var(--el-color-primary-light-9) !important;
        transform: scale(1.002);
      }

      &.current-row {
        background-color: var(--el-color-primary-light-9) !important;
      }
    }
  }

  :deep(.el-table__empty-block) {
    padding: 40px 0;
  }
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 编号徽章 */
.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 11px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;

  .el-table__row:hover & {
    background: var(--el-color-primary-light-8);
    transform: scale(1.05);
  }
}

/* 分页优化 */
:deep(.el-pagination) {
  padding: 12px 0;
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

:deep(.el-pagination__total) {
  color: var(--el-text-color-secondary);
}

:deep(.el-pagination__sizes) .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
}

:deep(.el-pager li) {
  transition: all 0.3s;
}

:deep(.el-pager li:hover:not(.is-active)) {
  color: var(--el-color-primary);
  transform: translateY(-1px);
}

:deep(.el-pager li.is-active) {
  box-shadow: 0 2px 8px var(--el-color-primary-light-5);
}

.player-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    background: var(--el-bg-color-page);
    backdrop-filter: blur(20px);
    border: 1px solid var(--el-border-color-lighter);
    box-shadow: var(--el-box-shadow-light);
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 16px 20px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-dialog__title) {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.el-dialog__headerbtn) {
    top: 14px;
    right: 16px;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  :deep(.el-dialog__headerbtn:hover) {
    background: var(--el-fill-color-light);
  }

  :deep(.el-dialog__close) {
    color: var(--el-text-color-secondary);
    font-size: 18px;
  }

  :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
    color: var(--el-color-primary);
  }

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
  background-color: var(--el-color-primary);
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
    background: var(--el-color-primary);
  }

  &.danger {
    background: rgba(var(--el-color-danger-rgb), 0.2);
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
  .query-form {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .table-wrapper {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .table-wrapper:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3);
  }

  .custom-table :deep(.el-table__header-wrapper th) {
    background-color: var(--el-bg-color-overlay) !important;
  }

  .custom-table :deep(.el-table__row:hover) {
    background-color: #0c2a5e !important;
  }

  .custom-table :deep(.el-table__cell),
  .custom-table :deep(.el-table__cell *),
  .custom-table :deep(.el-link),
  .custom-table :deep(.el-link *),
  .custom-table :deep(.el-text),
  .custom-table :deep(.el-text *) {
    color: #ffffff !important;
  }

  .player-toolbar {
    background: linear-gradient(to bottom, #0d0d0d, #1a1a1a);
  }

  /* 播放器对话框暗黑模式 */
  .player-dialog :deep(.el-dialog) {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .player-dialog :deep(.el-dialog__header) {
    border-bottom-color: var(--el-border-color);
  }

  /* 卡片暗黑增强 */
  .device-card {
    box-shadow: var(--el-box-shadow-dark);
  }

  .device-card:hover {
    box-shadow: 
      0 4px 8px rgba(0,0,0,0.35),
      0 12px 24px rgba(0,0,0,0.3),
      0 24px 48px rgba(0,0,0,0.2);
    border-color: var(--el-color-primary-light-3);
  }

  .device-card.is-selected {
    border-color: var(--el-color-primary);
    box-shadow:
      0 0 0 3px var(--el-color-primary-light-9),
      0 8px 24px -4px rgba(var(--el-color-primary-rgb), 0.25),
      0 4px 12px rgba(var(--el-color-primary-rgb), 0.15);
  }

  .card-header-area {
    background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb), 0.12) 0%, var(--el-fill-color) 100%);
  }

  .info-tag,
  .info-channel {
    background: var(--el-fill-color);
    border-color: var(--el-border-color);
  }

  .info-tag:hover,
  .info-channel:hover {
    border-color: var(--el-color-primary-light-3);
    background: rgba(var(--el-color-primary-rgb), 0.08);
  }

  .card-toolbar {
    border-color: var(--el-border-color);
  }

  .card-toolbar .el-button.btn-play {
    box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.35) !important;
  }

  .card-toolbar .el-button.btn-play:not(:disabled):hover {
    box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.5) !important;
  }
}

/* 滚动条美化 */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: var(--el-border-color);
  border-radius: 3px;
  transition: background 0.3s;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--el-color-primary-light-5);
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.table-actions .el-button {
  padding: 7px 10px;
  height: auto;
  font-size: 14px;
  transition: all 0.2s ease;
}

.table-actions .el-button:hover {
  transform: scale(1.08);
}

.table-actions .el-button .el-icon {
  color: #ffffff !important;
}

.table-actions .el-button--primary,
.table-actions .el-button--primary[text],
.table-actions .el-button--primary[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}

.table-actions .el-button--success,
.table-actions .el-button--success[text],
.table-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.table-actions .el-button--danger,
.table-actions .el-button--danger[text],
.table-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

/* 悬停效果 - 保持白色图标 */
.table-actions .el-button--primary:hover,
.table-actions .el-button--primary[text]:hover,
.table-actions .el-button--primary[text][bg]:hover {
  background-color: var(--el-color-primary-light-3) !important;
  border-color: var(--el-color-primary-light-3) !important;
  color: #ffffff !important;
}

.table-actions .el-button--primary:hover .el-icon {
  color: #ffffff !important;
}

.table-actions .el-button--success:hover,
.table-actions .el-button--success[text]:hover,
.table-actions .el-button--success[text][bg]:hover {
  background-color: var(--el-color-success-light-3) !important;
  border-color: var(--el-color-success-light-3) !important;
  color: #ffffff !important;
}

.table-actions .el-button--success:hover .el-icon {
  color: #ffffff !important;
}

.table-actions .el-button--danger:hover,
.table-actions .el-button--danger[text]:hover,
.table-actions .el-button--danger[text][bg]:hover {
  background-color: var(--el-color-danger-light-3) !important;
  border-color: var(--el-color-danger-light-3) !important;
  color: #ffffff !important;
}

.table-actions .el-button--danger:hover .el-icon {
  color: #ffffff !important;
}

.table-actions .el-button--primary,
.table-actions .el-button--primary[text],
.table-actions .el-button--primary[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}

.table-actions .el-button--success,
.table-actions .el-button--success[text],
.table-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.table-actions .el-button--danger,
.table-actions .el-button--danger[text],
.table-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}
</style>
