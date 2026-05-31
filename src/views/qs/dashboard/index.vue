<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-left">
        <div class="logo-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="header-title">
          <h1>智能视频监控大屏</h1>
          <p>Intelligent Video Monitoring Dashboard</p>
        </div>
      </div>
      
      <div class="header-center">
        <div class="stat-card">
          <div class="stat-value">{{ deviceStats.total || 0 }}</div>
          <div class="stat-label">设备总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value online">{{ deviceStats.online || 0 }}</div>
          <div class="stat-label">在线设备</div>
        </div>
        <div class="stat-card">
          <div class="stat-value offline">{{ deviceStats.offline || 0 }}</div>
          <div class="stat-label">离线设备</div>
        </div>
      </div>

      <div class="header-right">
        <div class="current-time">
          <div class="time-date">{{ currentDate }}</div>
          <div class="time-clock">{{ currentTime }}</div>
        </div>
        <div class="header-actions">
          <el-button :icon="Back" @click="goBack" class="action-btn">返回</el-button>
          <el-button :icon="Refresh" @click="refreshData" class="action-btn">刷新</el-button>
          <el-button :icon="FullScreen" @click="toggleFullScreen" class="action-btn">全屏</el-button>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-panel left-panel">
        <div class="panel-card">
          <div class="panel-title">
            <div class="title-icon">
              <el-icon><List /></el-icon>
            </div>
            <span>设备列表</span>
            <div class="panel-tools">
              <el-switch
                v-model="showRegion"
                active-text="行政区划"
                inactive-text="业务分组"
                @change="handleTreeTypeChange"
              />
            </div>
          </div>
          <div class="panel-body device-list">
            <div v-if="showRegion">
              <RegionTree
                ref="regionTreeRef"
                :showIndex="false"
                :showContextmenu="false"
                :hasDevice="true"
                @handleNodeClick="handleDeviceClick"
                :isContextmenu="false"
              />
            </div>
            <div v-else>
              <GroupTree
                ref="groupTreeRef"
                :showIndex="false"
                :showContextmenu="false"
                :hasDevice="true"
                @handleNodeClick="handleDeviceClick"
                :isContextmenu="false"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-panel center-panel">
        <div class="panel-card video-card">
          <div class="panel-title">
            <div class="title-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <span>实时视频预览</span>
            <div class="panel-tools">
              <el-radio-group v-model="splitCount" size="small" @change="handleSplitChange">
                <el-radio-button :value="1">1屏</el-radio-button>
                <el-radio-button :value="4">4屏</el-radio-button>
                <el-radio-button :value="6">6屏</el-radio-button>
                <el-radio-button :value="9">9屏</el-radio-button>
                <el-radio-button :value="12">12屏</el-radio-button>
                <el-radio-button :value="16">16屏</el-radio-button>
                <el-radio-button :value="25">25屏</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="panel-body">
            <div class="video-grid" :style="gridStyle">
              <div
                v-for="i in splitCount"
                :key="i"
                class="video-item"
                :class="{ active: playerIdx === (i-1) }"
                @click="playerIdx = (i-1)"
              >
                <div v-if="!videoUrls[i-1]" class="no-video">
                  <div class="no-video-icon">
                    <el-icon size="40"><VideoCamera /></el-icon>
                  </div>
                  <span>{{ videoTips[i-1] || '选择设备播放' }}</span>
                </div>
                <div v-else class="video-player">
                  <div class="close-btn" @click.stop="deleteClick(i-1)">
                    <el-icon size="16"><Close /></el-icon>
                  </div>
                  <EasyPlayer
                              :ref="`dashboard-player${i-1}`"
                              :id="`dashboard-player${i-1}`"
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
                              :videoUrl="videoUrls[i-1]"
                            />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-panel right-panel">
        <div class="panel-card">
          <div class="panel-title">
            <div class="title-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <span>设备统计</span>
          </div>
          <div class="panel-body">
            <div class="device-stats-wrapper">
              <LeftTop ref="leftTopRef" />
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-title">
            <div class="title-icon">
              <el-icon><Odometer /></el-icon>
            </div>
            <span>系统资源</span>
          </div>
          <div class="panel-body">
            <el-tabs v-model="activeResourceTab" class="resource-tabs" @tab-change="handleResourceTabChange">
              <el-tab-pane label="CPU" name="cpu">
                <div class="resource-item-wrapper" v-if="activeResourceTab === 'cpu'" :key="'cpu-' + tabKey">
                  <RightTop ref="rightTopRef" />
                </div>
              </el-tab-pane>
              <el-tab-pane label="网络" name="net">
                <div class="resource-item-wrapper" v-if="activeResourceTab === 'net'" :key="'net-' + tabKey">
                  <LeftBottom ref="leftBottomRef" />
                </div>
              </el-tab-pane>
              <el-tab-pane label="内存" name="mem">
                <div class="resource-item-wrapper" v-if="activeResourceTab === 'mem'" :key="'mem-' + tabKey">
                  <BottomCenter ref="bottomCenterRef" />
                </div>
              </el-tab-pane>
              <el-tab-pane label="磁盘" name="disk">
                <div class="resource-item-wrapper" v-if="activeResourceTab === 'disk'" :key="'disk-' + tabKey">
                  <RightBottom ref="rightBottomRef" />
                </div>
              </el-tab-pane>
              <el-tab-pane label="媒体服务" name="media">
                <div class="resource-item-wrapper" v-if="activeResourceTab === 'media'" :key="'media-' + tabKey">
                  <TopCenter ref="topCenterRef" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Dashboard">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Monitor, Refresh, FullScreen, DataAnalysis, Odometer, VideoPlay, VideoCamera, List, Back, Close } from '@element-plus/icons-vue'
import screenFull from 'screenfull'
import LeftTop from '../../components/home/left-top.vue'
import TopCenter from '../../components/home/top-center.vue'
import RightTop from '../../components/home/right-top.vue'
import LeftBottom from '../../components/home/left-bottom.vue'
import BottomCenter from '../../components/home/bottom-center.vue'
import RightBottom from '../../components/home/right-bottom.vue'
import RegionTree from '@/views/components/common/RegionTree.vue'
import GroupTree from '@/views/components/common/GroupTree.vue'
import EasyPlayer from '@/components/EasyPlayer'
import { getDeviceStatistics, getSystemInfo } from '@/api/qs/system'
import { getMediaLoad } from '@/api/qs/zlm'
import { getDevice } from '@/api/qs/device'
import { streamPullPlay, rtmpPlay, streamPullPush, startGb28181Play, startJt1078Play, loadRecord } from '@/api/qs/zlm'
import type { PullConfig, RTPServerParam } from '@/types/api'

const router = useRouter()

const currentTime = ref('')
const currentDate = ref('')
const splitCount = ref(4)
const videoUrls = ref([])
const videoTips = ref([])
const enableAudio = ref([])
const deviceRows = ref([])
const playerIdx = ref(0)
const currentPlayerIndex = ref(0)
const activeResourceTab = ref('cpu')
const tabKey = ref(0)
const showRegion = ref(false)

// 播放器相关属性
const quality = ref(['普清', '高清', '超清'])
const defaultQuality = ref('高清')
const isPtz = ref(true)
const isQuality = ref(true)
const isLive = ref(true)

const deviceStats = ref({
  total: 0,
  online: 0,
  offline: 0
})

const { proxy } = getCurrentInstance() as any

const gridStyle = computed(() => {
  let columns = '1fr'
  let rows = '1fr'
  
  if (splitCount.value === 4) {
    columns = '1fr 1fr'
    rows = '1fr 1fr'
  } else if (splitCount.value === 6) {
    columns = '1fr 1fr 1fr'
    rows = '1fr 1fr'
  } else if (splitCount.value === 9) {
    columns = '1fr 1fr 1fr'
    rows = '1fr 1fr 1fr'
  } else if (splitCount.value === 12) {
    columns = '1fr 1fr 1fr 1fr'
    rows = '1fr 1fr 1fr'
  } else if (splitCount.value === 16) {
    columns = '1fr 1fr 1fr 1fr'
    rows = '1fr 1fr 1fr 1fr'
  } else if (splitCount.value === 25) {
    columns = '1fr 1fr 1fr 1fr 1fr'
    rows = '1fr 1fr 1fr 1fr 1fr'
  }
  
  return {
    display: 'grid',
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gap: '8px',
    height: '100%'
  }
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  })
}

let timer: number | null = null
let dataTimer: number | null = null

onMounted(() => {
  // 添加 dark 类，确保图表文字颜色适配深色背景
  document.documentElement.classList.add('dark')
  
  updateTime()
  timer = window.setInterval(updateTime, 1000)
  
  loadData()
  // 每 5 秒刷新一次系统资源和设备统计数据
  dataTimer = window.setInterval(loadData, 5000)
  
  // 初始化数组
  while (videoUrls.value.length < splitCount.value) {
    videoUrls.value.push('')
    videoTips.value.push('')
    enableAudio.value.push('')
    deviceRows.value.push(null)
  }
})

onBeforeUnmount(() => {
  // 移除 dark 类
  document.documentElement.classList.remove('dark')
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (dataTimer) {
    clearInterval(dataTimer)
  }
})

function refreshData() {
  loadData()
  ElMessage.success('数据已刷新')
}

function loadData() {
  getSystemInfo().then(res => {
    proxy.$refs.rightTopRef?.setData?.(res.data.cpu)
    proxy.$refs.leftBottomRef?.setData?.(res.data.net)
    proxy.$refs.bottomCenterRef?.setData?.(res.data.mem)
    proxy.$refs.rightBottomRef?.setData?.(res.data.disk)
  })
  
  getDeviceStatistics().then(res => {
    proxy.$refs.leftTopRef?.setData?.(res.data)
    deviceStats.value = {
      total: res.data.totalDeviceCount || 0,
      online: res.data.totalOnlineCount || 0,
      offline: res.data.totalOfflineCount || 0
    }
  })
}

function goBack() {
  router.push('/')
}

function toggleFullScreen() {
  if (screenFull.isEnabled) {
    screenFull.toggle()
  }
}

function handleSplitChange() {
  // 确保所有数组长度足够
  while (videoUrls.value.length < splitCount.value) {
    videoUrls.value.push('')
    videoTips.value.push('')
    enableAudio.value.push('')
    deviceRows.value.push(null)
  }
}

function handleTreeTypeChange() {
  // 切换树形组件类型
}

function handleDeviceClick(data: any) {
  // 检查是否是叶子节点（设备）
  if (!data.leaf) {
    return
  }
  sendDevicePush(data.id)
}

function sendDevicePush(id: any) {
  const idxTmp = playerIdx.value
  videoTips.value[idxTmp] = '正在拉流...'

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

          console.log('播放地址:', videoUrl)

          // 更新播放相关属性
          quality.value = []
          defaultQuality.value = ''
          isPtz.value = row.type === '5' || row.type === '12'
          isQuality.value = false
          isLive.value = true

          // 先清空，再设置新的 URL
          videoUrls.value[idxTmp] = ''
          videoTips.value[idxTmp] = ''
          
          await nextTick()
          
          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)
          deviceRows.value[idxTmp] = row

          await nextTick()
          const playerRef = proxy.$refs[`dashboard-player${idxTmp}`]
          console.log('playerRef:', playerRef)
          if (playerRef && playerRef.length > 0) {
            console.log('开始播放')
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        console.error('拉流失败:', err)
        videoTips.value[idxTmp] = '播放失败'
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

          console.log('播放地址:', videoUrl)

          // 更新播放相关属性
          quality.value = []
          defaultQuality.value = ''
          isPtz.value = row.type === '5' || row.type === '12'
          isQuality.value = false
          isLive.value = true

          // 先清空，再设置新的 URL
          videoUrls.value[idxTmp] = ''
          videoTips.value[idxTmp] = ''
          
          await nextTick()
          
          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)
          deviceRows.value[idxTmp] = row

          await nextTick()
          const playerRef = proxy.$refs[`dashboard-player${idxTmp}`]
          console.log('playerRef:', playerRef)
          if (playerRef && playerRef.length > 0) {
            console.log('开始播放')
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        console.error('拉流失败:', err)
        videoTips.value[idxTmp] = '播放失败'
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

          console.log('播放地址:', videoUrl)

          // 更新播放相关属性
          quality.value = []
          defaultQuality.value = ''
          isPtz.value = row.type === '5' || row.type === '12'
          isQuality.value = false
          isLive.value = true

          // 先清空，再设置新的 URL
          videoUrls.value[idxTmp] = ''
          videoTips.value[idxTmp] = ''
          
          await nextTick()
          
          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)
          deviceRows.value[idxTmp] = row

          await nextTick()
          const playerRef = proxy.$refs[`dashboard-player${idxTmp}`]
          console.log('playerRef:', playerRef)
          if (playerRef && playerRef.length > 0) {
            console.log('开始播放')
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        console.error('拉流失败:', err)
        videoTips.value[idxTmp] = '播放失败'
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

          console.log('播放地址:', videoUrl)

          // 更新播放相关属性
          quality.value = []
          defaultQuality.value = ''
          isPtz.value = row.type === '5' || row.type === '12'
          isQuality.value = false
          isLive.value = true

          // 先清空，再设置新的 URL
          videoUrls.value[idxTmp] = ''
          videoTips.value[idxTmp] = ''
          
          await nextTick()
          
          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)
          deviceRows.value[idxTmp] = row

          await nextTick()
          const playerRef = proxy.$refs[`dashboard-player${idxTmp}`]
          console.log('playerRef:', playerRef)
          if (playerRef && playerRef.length > 0) {
            console.log('开始播放')
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        console.error('拉流失败:', err)
        videoTips.value[idxTmp] = '播放失败'
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

          console.log('播放地址:', videoUrl)

          // 更新播放相关属性
          quality.value = []
          defaultQuality.value = ''
          isPtz.value = row.type === '5' || row.type === '12'
          isQuality.value = false
          isLive.value = true

          // 先清空，再设置新的 URL
          videoUrls.value[idxTmp] = ''
          videoTips.value[idxTmp] = ''
          
          await nextTick()
          
          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)
          deviceRows.value[idxTmp] = row

          await nextTick()
          const playerRef = proxy.$refs[`dashboard-player${idxTmp}`]
          console.log('playerRef:', playerRef)
          if (playerRef && playerRef.length > 0) {
            console.log('开始播放')
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        console.error('拉流失败:', err)
        videoTips.value[idxTmp] = '播放失败'
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

          console.log('播放地址:', videoUrl)

          // 更新播放相关属性
          quality.value = []
          defaultQuality.value = ''
          isPtz.value = row.type === '5' || row.type === '12'
          isQuality.value = false
          isLive.value = true

          // 先清空，再设置新的 URL
          videoUrls.value[idxTmp] = ''
          videoTips.value[idxTmp] = ''
          
          await nextTick()
          
          setPlayUrl(videoUrl, idxTmp)
          setEnableAudio(row.enableAudio, idxTmp)
          deviceRows.value[idxTmp] = row

          await nextTick()
          const playerRef = proxy.$refs[`dashboard-player${idxTmp}`]
          console.log('playerRef:', playerRef)
          if (playerRef && playerRef.length > 0) {
            console.log('开始播放')
            playerRef[0].play(videoUrl)
          }
        })
      }).catch(err => {
        console.error('拉流失败:', err)
        videoTips.value[idxTmp] = '播放失败'
      })
    }
  })
}

function setPlayUrl(url: string, idx: number) {
  videoUrls.value[idx] = url
}

function setEnableAudio(audio: string, idx: number) {
  enableAudio.value[idx] = audio
}

function deleteClick(index: number) {
  videoUrls.value[index] = ''
  videoTips.value[index] = ''
  enableAudio.value[index] = ''
  deviceRows.value[index] = null
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

function handleResourceTabChange(tabName: string) {
  tabKey.value++
  // 延迟更新数据，确保组件重新渲染后再设置
  setTimeout(() => {
    getSystemInfo().then(res => {
      if (tabName === 'cpu') {
        proxy.$refs.rightTopRef?.setData?.(res.data.cpu)
      } else if (tabName === 'net') {
        proxy.$refs.leftBottomRef?.setData?.(res.data.net)
      } else if (tabName === 'mem') {
        proxy.$refs.bottomCenterRef?.setData?.(res.data.mem)
      } else if (tabName === 'disk') {
        proxy.$refs.rightBottomRef?.setData?.(res.data.disk)
      } else if (tabName === 'media') {
        getMediaLoad().then(res => {
          proxy.$refs.topCenterRef?.setData?.(res.data)
        })
      }
    })
  }, 50)
}
</script>

<style scoped lang="scss">
.dashboard-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  padding: 10px;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: -1;
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 100%);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  margin-bottom: 10px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
  height: 70px;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -1px;
    width: 120px;
    height: 32px;
    border: 2px solid #3b82f6;
  }
  
  &::before {
    left: -1px;
    border-right: none;
    border-bottom: none;
    border-radius: 16px 0 0 0;
  }
  
  &::after {
    right: -1px;
    border-left: none;
    border-bottom: none;
    border-radius: 0 16px 0 0;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  
  .el-icon {
    font-size: 22px;
    color: white;
  }
}

.header-title {
  h1 {
    font-size: 22px;
    font-weight: 700;
    color: white;
    margin: 0;
    letter-spacing: 2px;
    background: linear-gradient(90deg, #60a5fa, #34d399, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    margin: 2px 0 0 0;
    letter-spacing: 2px;
  }
}

.header-center {
  display: flex;
  gap: 12px;
}

.stat-card {
  min-width: 100px;
  text-align: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #10b981, #8b5cf6);
  }
  
  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: white;
    line-height: 1.2;
    
    &.online {
      color: #10b981;
      text-shadow: 0 0 16px rgba(16, 185, 129, 0.5);
    }
    
    &.offline {
      color: #ef4444;
      text-shadow: 0 0 16px rgba(239, 68, 68, 0.5);
    }
  }
  
  .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 2px;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-time {
  text-align: right;
  
  .time-date {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }
  
  .time-clock {
    font-size: 20px;
    font-weight: 700;
    color: white;
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
  }
}

.header-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
  border-radius: 6px;
  padding: 6px 12px;
  transition: all 0.3s;
  font-size: 13px;
  
  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%);
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-1px);
  }
}

.dashboard-content {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1.5fr 320px;
  gap: 10px;
  overflow: hidden;
}

.dashboard-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.panel-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
  }
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  
  .title-icon {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 14px;
      color: #60a5fa;
    }
  }
  
  span {
    font-size: 14px;
    font-weight: 600;
    color: white;
    letter-spacing: 1px;
  }
}

.panel-tools {
  margin-left: auto;
}

.panel-body {
  flex: 1;
  padding: 10px 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.device-stats-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.device-stats-wrapper > div {
  width: 100% !important;
  height: 100% !important;
}

.resource-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  :deep(.el-tabs__header) {
    margin: 0 0 10px 0;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  
  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.5);
    padding: 0 14px;
    height: 32px;
    line-height: 32px;
    font-size: 13px;
    font-weight: 500;
    
    &.is-active {
      color: #60a5fa;
      font-weight: 600;
    }
    
    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #3b82f6, #10b981);
    height: 2px;
    border-radius: 1px;
  }
  
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
    padding: 0;
  }
  
  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.resource-item-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.resource-item-wrapper > div {
  width: 100% !important;
  height: 100% !important;
}

.video-card {
  flex: 1;
}

.video-grid {
  height: 100%;
}

.video-item {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
  border-radius: 12px;
  border: 2px solid rgba(59, 130, 246, 0.15);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
  }
  
  &.active {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 8px 24px rgba(59, 130, 246, 0.3);
  }
}

.no-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.no-video-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(59, 130, 246, 0.1);
  
  .el-icon {
    color: rgba(255, 255, 255, 0.4);
  }
}

.no-video span {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.video-player {
  width: 100%;
  height: 100%;
  position: relative;
}

.easy-player {
  width: 100% !important;
  height: 100% !important;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 100;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  opacity: 0;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
  }
}

.video-item:hover .close-btn {
  opacity: 1;
}

.device-list {
  ::v-deep .device-tree-container,
  ::v-deep .region-tree-container,
  ::v-deep .group-tree-container {
    background: transparent;
  }
  ::v-deep .tree-content {
    background: transparent;
  }
  ::v-deep .el-tree {
    background: transparent;
  }
  ::v-deep .el-tree-node__label {
    color: rgba(255, 255, 255, 0.85) !important;
  }
  ::v-deep .el-tree-node__content:hover {
    background: rgba(64, 158, 255, 0.15) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  }
  ::v-deep .el-tree-node.is-current > .el-tree-node__content {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.18) 0%, rgba(64, 158, 255, 0.12) 100%) !important;
    color: #409eff !important;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2) !important;
  }
  ::v-deep .panel-header {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%) !important;
    border-bottom: 1px solid rgba(59, 130, 246, 0.15) !important;
  }
  ::v-deep .switch-container {
    background: transparent !important;
    border-bottom: 1px solid rgba(59, 130, 246, 0.15) !important;
  }
  ::v-deep .panel-header span {
    color: rgba(255, 255, 255, 0.95) !important;
    font-weight: 600 !important;
    letter-spacing: 0.5px !important;
  }
  ::v-deep .header-icon-wrap {
    background: rgba(59, 130, 246, 0.3) !important;
    color: #60a5fa !important;
  }
  ::v-deep .header-accent {
    background: linear-gradient(to bottom, #3b82f6, #10b981) !important;
  }
  ::v-deep .el-switch__label {
    color: rgba(255, 255, 255, 0.6) !important;
  }
  ::v-deep .el-switch__label.is-active {
    color: rgba(255, 255, 255, 0.9) !important;
  }
  ::v-deep .el-tree-node__expand-icon {
    color: rgba(255, 255, 255, 0.5) !important;
  }
  ::v-deep .el-tree-node__expand-icon.is-leaf {
    color: transparent !important;
  }
  /* 搜索框适配 */
  ::v-deep .search-area {
    padding: 0 0 12px;
  }
  ::v-deep .search-input {
    .el-input__wrapper {
      background: rgba(30, 41, 59, 0.8);
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) inset;
      
      &:focus-within {
        box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5) inset, 0 0 0 3px rgba(59, 130, 246, 0.2);
      }
      
      .el-input__inner {
        color: rgba(255, 255, 255, 0.85);
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
      
      .el-input__prefix,
      .el-input__suffix {
        color: rgba(255, 255, 255, 0.6);
      }
    }
    
    .el-input-group__prepend {
      background: rgba(30, 41, 59, 0.8) !important;
      border-color: rgba(59, 130, 246, 0.2) !important;
      
      .refresh-btn {
        background: rgba(30, 41, 59, 0.8) !important;
        color: rgba(255, 255, 255, 0.7) !important;
        
        &:hover {
          background: rgba(59, 130, 246, 0.2) !important;
          color: #60a5fa !important;
        }
      }
    }
    
    .el-input-group__append {
      background: rgba(30, 41, 59, 0.8) !important;
      border-color: rgba(59, 130, 246, 0.2) !important;
      
      .index-checkbox {
        .el-checkbox__label {
          color: rgba(255, 255, 255, 0.7) !important;
        }
      }
    }
  }
  /* 搜索结果适配 */
  ::v-deep .result-item {
    background: rgba(30, 41, 59, 0.6) !important;
    border-color: rgba(59, 130, 246, 0.15) !important;
    
    &:hover {
      background: rgba(59, 130, 246, 0.15) !important;
      border-color: rgba(59, 130, 246, 0.3) !important;
    }
    
    &.is-active {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%) !important;
      border-color: rgba(59, 130, 246, 0.3) !important;
    }
  }
  ::v-deep .result-icon-wrap {
    background: rgba(30, 41, 59, 0.8) !important;
  }
  ::v-deep .device-id-badge {
    background: rgba(59, 130, 246, 0.2) !important;
  }
  ::v-deep .result-name {
    color: rgba(255, 255, 255, 0.85) !important;
  }
  ::v-deep .result-id {
    color: rgba(255, 255, 255, 0.5) !important;
  }
}


</style>
