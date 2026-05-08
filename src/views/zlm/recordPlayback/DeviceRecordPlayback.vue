<template>
  <div class="app-container">
    <el-row :gutter="0">
      <splitpanes class="default-theme record-splitpanes">
        <!-- 左侧设备树 -->
        <pane size="20">
          <div class="device-tree-wrap">
            <div class="panel-header">
              <div class="header-icon-wrap">
                <el-icon>
                  <VideoCamera/>
                </el-icon>
              </div>
              <span>设备列表</span>
            </div>
            <div class="tree-container">
              <DeviceTree @clickEvent="handleDeviceClick" :isContextmenu="false"/>
            </div>
          </div>
        </pane>

        <!-- 右侧播放器和时间轴 -->
        <pane size="80">
          <div id="playerBox">
            <!-- 播放器 -->
            <div class="playBox">
              <EasyPlayer
                  v-if="currentDevice"
                  :ref="'EasyPlayerRef'"
                  :id="'EasyPlayerRef'"
                  style="width: 100%; height: 100%;"
                  :video-url="videoUrl"
              />
              <div v-else class="player-empty">
                <div class="empty-content">
                  <div class="empty-icon-wrap">
                    <el-icon size="64">
                      <VideoPlay/>
                    </el-icon>
                  </div>
                  <div class="empty-text">请选择设备</div>
                </div>
              </div>
            </div>
          </div>

          <Playbackbar
              initDate="2021-08-20 00:00:00"
              :timeData="[{
                startTime:'2021-08-20 00:00:00',
                endTime:'2021-08-20 1:00:00'
              }]"
          />
        </pane>
      </splitpanes>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="DeviceRecordPlayback">
import DeviceTree from '@/components/DeviceTree'
import {Pane, Splitpanes} from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import EasyPlayer from '@/components/EasyPlayer'
import {VideoCamera, VideoPlay} from '@element-plus/icons-vue'
import Playbackbar from "./playbackbar.vue"
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.record-splitpanes {
  height: 100%;
}

.device-tree-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.header-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

#playerBox {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.playBox {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.player-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #fff;
  opacity: 0.6;
}

.empty-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 16px;
}

.player-option-box {
  height: 50px;
  background: #383838;
}

.time-line-show {
  position: relative;
  color: rgba(250, 249, 249, 0.89);
  left: calc(50% - 85px);
  top: -72px;
  text-shadow: 1px 0 #5f6b7c, -1px 0 #5f6b7c, 0 1px #5f6b7c, 0 -1px #5f6b7c, 1.1px 1.1px #5f6b7c, 1.1px -1.1px #5f6b7c, -1.1px 1.1px #5f6b7c, -1.1px -1.1px #5f6b7c;
}

.record-control-bar {
  height: 40px;
  background-color: #383838;
  display: grid;
  grid-template-columns: 1fr 400px 1fr;
}

.control-left,
.control-right {
  text-align: left;
}

.control-center {
  text-align: center;
}

.control-right {
  text-align: right;
}

.record-play-control {
  height: 32px;
  line-height: 32px;
  display: inline-block;
  width: fit-content;
  padding: 0 10px;
  -webkit-box-shadow: 0 0 10px #262626;
  box-shadow: 0 0 10px #262626;
  background-color: #262626;
  margin: 4px 0;
}

.record-play-control-item {
  display: inline-block;
  padding: 0 10px;
  color: #fff;
  margin-right: 2px;
  cursor: pointer;
}

.record-play-control-item:hover {
  color: #1f83e6;
}

.record-list-container {
  background: #fff;
  padding: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.date-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.record-list-wrapper {
  height: 180px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.record-item-content {
  display: flex;
  align-items: center;
  gap: 5px;
}

.record-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
}

</style>
