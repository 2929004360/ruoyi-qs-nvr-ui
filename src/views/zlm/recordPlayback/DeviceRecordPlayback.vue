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
            </div>
            <div class="tree-container">
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
              <DeviceTree @clickEvent="handleDeviceClick" :isContextmenu="false"/>
            </div>
          </el-col>
        </pane>

        <!-- 右侧播放器和时间轴 -->
        <pane size="80">
          <el-col class="player-col">
            <div class="panel-header">
              <div class="header-accent"></div>
              <div class="header-icon-wrap">
                <el-icon><Monitor /></el-icon>
              </div>
              <span>录像播放</span>
              <span v-if="currentDevice" class="device-name">{{ currentDevice.deviceName }}</span>
            </div>
            <div class="player-area">
              <div class="player-container" :style="'height:' + jessibucaHeight">
                <!-- 空状态提示 -->
                <div v-if="!currentDevice" class="player-empty-overlay">
                  <div class="empty-content">
                    <div class="empty-icon-wrap">
                      <el-icon size="64"><VideoPlay /></el-icon>
                    </div>
                    <div class="empty-text">
                      {{ !currentDevice ? '请选择设备' : '暂无录像数据' }}
                    </div>
                    <div v-if="currentDevice" class="empty-hint">
                      当前设备在所选日期无录像
                    </div>
                  </div>
                </div>
                <!-- 播放器 -->
                <EasyPlayer
                    v-else-if="currentDevice && timeSegments.length > 0"
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

              <!-- 时间轴 -->
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
                    @mousedown="timelineMouseDown"
                    @mouseup="mouseupTimeline"
                />
                <div v-if="showTime && playTime && currentDevice && timeSegments.length > 0" class="time-line-show">
                  <span>{{ showTimeValue }}</span>
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
import DeviceTree from '@/components/DeviceTree'
import {Pane, Splitpanes} from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import {VideoCamera, Monitor, VideoPlay, ArrowLeft, ArrowRight} from '@element-plus/icons-vue'
import {getDevice} from "@/api/qs/device"
import {queryDeviceRecord} from "@/api/qs/gb28181"
import {queryDaHuaRecord} from "@/api/qs/dahua"
import {queryHaiKangRecord} from "@/api/qs/haikang"
import {queryHaiKangIsupRecord} from "@/api/qs/haikang-isup"
import {queryOnvifRecord} from "@/api/qs/onvif"
import {queryJt1078Record} from "@/api/qs/jt1078"
import moment from 'moment'
import VideoTimeline from '@/views/components/common/VideoTimeLine/index.vue'
import EasyPlayer from '@/components/EasyPlayer'

// 数据相关
const loading = ref<boolean>(false)
const currentDevice = ref<any>(null)
const recordList = ref([]);

const playTime = ref(null);
const initTime = ref(moment().startOf('day').valueOf());
const timeSegments = ref([]);
const showTime = ref(true);
const showTimeValue = ref('');
const jessibucaHeight = ref<string>(document.documentElement.clientHeight - 260 + 'px;')
const quality = ref(['普清', '高清', '超清'])
const defaultQuality = ref('高清')
const isPtz = ref(true)
const isQuality = ref(true)
const isLive = ref(true)
const wsUrl = ref('')

// 时间轴组件引用
const Timeline = ref()

// 日期相关
const selectedDate = ref<string>(moment().format('YYYY-MM-DD'))

onMounted(()=>{
  setTimeout(()=>{
    nextTick(()=>{
      selectedDate.value = moment().format('YYYY-MM-DD')
      timeSegments.value = []
    })
  },300)
})

/**
 * 点击设备树节点
 */
const handleDeviceClick = async (deviceId: number) => {
  try {
    const res: any = await getDevice(deviceId)
    const device = res.data
    currentDevice.value = device

    getList()
  } catch (e) {
    console.error('获取设备信息失败', e)
  }
}

/**
 * 查询录像列表
 */
function getList() {
  // 设置当天的开始和结束时间
  const dayStart = moment(selectedDate.value).startOf('day').format('YYYY-MM-DD HH:mm:ss')
  const dayEnd = moment(selectedDate.value).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  loading.value = true
  // 清空之前的录像片段
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
      console.log(res.data.recordList)
      if (recordList.value.length > 0) {
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#017690',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        // 重新初始化时间轴
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
        currentDevice.value.channel || 1,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      console.log(res.data)
      if (recordList.value.length > 0) {
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#017690',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        // 重新初始化时间轴
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
    // 海康SDK设备
    queryHaiKangRecord(
        currentDevice.value.id,
        currentDevice.value.channel || 1,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      console.log(res.data)
      if (recordList.value.length > 0) {
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#017690',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        // 重新初始化时间轴
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
    // 海康ISUP设备
    queryHaiKangIsupRecord(
        currentDevice.value.id,
        currentDevice.value.channel || 1,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      console.log(res.data)
      if (recordList.value.length > 0) {
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#017690',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        // 重新初始化时间轴
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
    // ONVIF设备
    queryOnvifRecord(
        currentDevice.value.ipAddress || '',
        currentDevice.value.userName || '',
        currentDevice.value.password || '',
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      console.log(res.data)
      if (recordList.value.length > 0) {
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#017690',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        // 重新初始化时间轴
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
    // JT1078设备
    queryJt1078Record(
        currentDevice.value.mobileNo || currentDevice.value.gbDeviceId || '',
        currentDevice.value.channel || 1,
        dayStart,
        dayEnd
    ).then((res: any) => {
      recordList.value = []
      recordList.value = res.data || []
      console.log(res.data)
      if (recordList.value.length > 0) {
        let time = new Date(recordList.value[0].startTime).getTime()
        playTime.value = time
        for (let i = 0; i < recordList.value.length; i++) {
          timeSegments.value.push({
            beginTime: new Date(recordList.value[i].startTime).getTime(),
            endTime: new Date(recordList.value[i].endTime).getTime(),
            color: '#017690',
            startRatio: 0.7,
            endRatio: 0.85,
            index: i
          })
        }
        // 重新初始化时间轴
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

/**
 * 时间轴时间变化
 */
function playTimeChange(time: number) {
  playTime.value = time
  showTimeValue.value = moment(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 时间轴鼠标按下
 */
function timelineMouseDown() {
  // 可以在这里添加鼠标按下时的逻辑
}

/**
 * 时间轴鼠标抬起
 */
function mouseupTimeline() {
  // 可以在这里添加鼠标抬起时的逻辑
}

/**
 * 播放器错误回调
 */
const easyPlayeError = () => {

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
</script>

<style lang="scss" scoped>
@import './style.scss';

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
</style>
