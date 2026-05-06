<template>
  <div class="app-container home-dashboard">
    <el-row :gutter="20" class="dashboard-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="glass-card">
          <template #header>
            <div class="card-header">
              <span>设备总览</span>
            </div>
          </template>
          <LeftTop ref="LeftTopRef"/>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="glass-card">
          <template #header>
            <div class="card-header">
              <span>节点统计</span>
            </div>
          </template>
          <TopCenter ref="TopCenterRef"/>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="glass-card">
          <template #header>
            <div class="card-header">
              <span>CPU</span>
            </div>
          </template>
          <RightTop ref="RightTopRef"/>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="dashboard-row" style="margin-top: 20px">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="glass-card">
          <template #header>
            <div class="card-header">
              <span>网络</span>
            </div>
          </template>
          <LeftBottom ref="LeftBottomRef"/>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="glass-card">
          <template #header>
            <div class="card-header">
              <span>内存</span>
            </div>
          </template>
          <BottomCenter ref="BottomCenterRef"/>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="glass-card">
          <template #header>
            <div class="card-header">
              <span>磁盘</span>
            </div>
          </template>
          <RightBottom ref="RightBottomRef"/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="Index">
import LeftTop from "./components/home/left-top.vue"
import TopCenter from "./components/home/top-center.vue"
import RightTop from "./components/home/right-top.vue"
import LeftBottom from "./components/home/left-bottom.vue"
import BottomCenter from "./components/home/bottom-center.vue"
import RightBottom from "./components/home/right-bottom.vue"
import {getDeviceStatistics, getSystemInfo} from "@/api/qs/system";
import {getMediaLoad} from "@/api/qs/zlm";
import useSettingsStore from "@/store/modules/settings";

const settingsStore = useSettingsStore();

const timer = ref({})
const RightTopRef = ref(null)
const LeftBottomRef = ref(null)
const BottomCenterRef = ref(null)
const RightBottomRef = ref(null)
const TopCenterRef = ref(null)
const LeftTopRef = ref(null)

onMounted(() => {
  nextTick(() => {
    serverInfoFun()
    getMediaLoadFun()
    getDeviceStatisticsFun()
    timer.value = setInterval(() => {
      serverInfoFun()
      getMediaLoadFun()
    }, 2000)
  })
})

watch(() => settingsStore.isDark, () => {
  nextTick(() => {
    LeftTopRef.value?.refreshChart?.()
    TopCenterRef.value?.refreshChart?.()
    RightTopRef.value?.refreshChart?.()
    LeftBottomRef.value?.refreshChart?.()
    BottomCenterRef.value?.refreshChart?.()
    RightBottomRef.value?.refreshChart?.()
  })
})

function serverInfoFun() {
  getSystemInfo().then(res => {
    RightTopRef.value.setData(res.data.cpu)
    LeftBottomRef.value.setData(res.data.net)
    BottomCenterRef.value.setData(res.data.mem)
    RightBottomRef.value.setData(res.data.disk)
  })
}

function getMediaLoadFun() {
  getMediaLoad().then(res => {
    TopCenterRef.value.setData(res.data)
  })
}

function getDeviceStatisticsFun(){
  getDeviceStatistics().then(res => {
    LeftTopRef.value.setData(res.data)
  })
}
</script>

<style scoped lang="scss">
.home-dashboard {
  padding: 8px;
}

.dashboard-row {
  margin-bottom: 0;
}

/* 卡片进入动画 */
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 玻璃卡片 */
.glass-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;

  /* 玻璃质感 */
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 8px 16px rgba(0, 0, 0, 0.02);
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.05),
    0 12px 24px rgba(0, 0, 0, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.04);
  border-color: rgba(64, 158, 255, 0.2);
}

/* 覆盖 el-card 内部 */
.glass-card :deep(.el-card__body) {
  background: transparent;
  padding: 16px 20px;
}

.glass-card :deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(64, 158, 255, 0.08);
  padding: 14px 20px;
}

/* 头部装饰 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-header::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, var(--el-color-primary), var(--el-color-primary-light-3));
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

/* 错开进入动画 */
.el-col:nth-child(1) .glass-card { animation-delay: 0.04s; }
.el-col:nth-child(2) .glass-card { animation-delay: 0.12s; }
.el-col:nth-child(3) .glass-card { animation-delay: 0.20s; }

/* 暗黑模式 */
html.dark {
  .glass-card {
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.15),
      0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .glass-card:hover {
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.25),
      0 12px 24px rgba(0, 0, 0, 0.2),
      0 24px 48px rgba(0, 0, 0, 0.15);
    border-color: rgba(64, 158, 255, 0.3);
  }

  .glass-card :deep(.el-card__header) {
    border-bottom-color: rgba(64, 158, 255, 0.12);
  }

  .card-header::before {
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.4);
  }
}
</style>

