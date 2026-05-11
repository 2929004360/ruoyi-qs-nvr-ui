<template>
  <div id="DeviceTree" class="device-tree-container" style="height: 100%">
    <div v-if="showHeader" class="panel-header">
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
            @change="change"
        />
      </div>
    </div>

    <div class="tree-content">
      <div v-if="!showHeader" class="switch-container">
        <el-switch
            v-model="showRegion"
            active-text="行政区划"
            inactive-text="业务分组"
            @change="change"
        />
      </div>
      <div class="tree-wrapper">
        <RegionTree
            v-if="showRegion"
            ref="regionTree"
            :showIndex="false"
            :showContextmenu="false"
            :hasDevice="true"
            @handleNodeClick="treeNodeClickEvent"
            :isContextmenu="isContextmenu"
            :contextMenu="['playChannel', 'updatePosition']"
            @playChannel="playChannelFun($event,'region')"
            @updatePosition="updatePositionFun($event,'region')"
        />
        <GroupTree
            v-if="!showRegion"
            ref="groupTree"
            :showIndex="false"
            :showContextmenu="false"
            :hasDevice="true"
            @handleNodeClick="treeNodeClickEvent"
            :isContextmenu="isContextmenu"
            :contextMenu="['playChannel', 'updatePosition']"
            @playChannel="playChannelFun($event,'group')"
            @updatePosition="updatePositionFun($event,'group')"
        />
      </div>
    </div>
  </div>
</template>

<script setup name="DeviceTree" lang="ts">
import GroupTree from "@/views/components/common/GroupTree.vue";
import RegionTree from "@/views/components/common/RegionTree.vue";
import { VideoCamera } from '@element-plus/icons-vue';

const {proxy} = getCurrentInstance()
const emit = defineEmits(['clickEvent', ',playChannel', 'updatePosition']);

const props = defineProps({
  device: {
    type: Object,
    default: () => ({})
  },
  isContextmenu: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
})

const showRegion = ref(false)

function treeNodeClickEvent(data) {
  if (data.leaf) {
    emit('clickEvent', data.id);
  }
}

function refresh(id) {
  if (showRegion.value) {
    proxy.$refs["regionTree"].refresh(id)
  } else {
    proxy.$refs["groupTree"].refresh(id)
  }
}

function playChannelFun(data, type) {
  emit('playChannel', data, type);
}

function updatePositionFun(data, type) {
  emit('updatePosition', data, type);
}

function change(){
  emit('change', showRegion.value);
}

defineExpose({
  refresh,
  showRegion
})

</script>

<style scoped>
.device-tree-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden !important;
  background: var(--el-bg-color);
}

/* Panel Header - 参考 DeviceRecordPlayback 的设计 */
.panel-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 13px;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
  flex-shrink: 0;

  .header-accent {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(to bottom, var(--el-color-primary), var(--el-color-primary-light-3));
    flex-shrink: 0;
  }

  .header-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-size: 13px;
  }

  .header-switch {
    margin-left: auto;
  }
}

.switch-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.tree-content {
  flex: 1;
  overflow: hidden !important;
  width: 100%;
  margin: 0;
  padding: 8px;
  position: relative;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
}

.tree-wrapper {
  width: 100%;
  height: 100%;
  min-width: 0;
  position: relative;
}

/* Global fixes for Element UI tree components */
:deep(.el-tree) {
  overflow: visible !important;
  width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
}

:deep(.el-tree-node) {
  width: 100% !important;
  min-width: 0 !important;
  transition: all 0.2s ease;
}

:deep(.el-tree-node__content) {
  width: 100% !important;
  min-width: 0 !important;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin: 2px 0;
}

:deep(.el-tree-node__content:hover) {
  background: rgba(var(--el-color-primary-rgb), 0.08);
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

:deep(.el-tree-node__label) {
  word-break: break-word !important;
  white-space: normal !important;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
  color: var(--el-color-primary);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

:deep(.el-tree-node__expand-icon) {
  cursor: pointer;
  transition: transform 0.2s ease;
}

:deep(.el-tree-node__expand-icon:hover) {
  transform: scale(1.15);
}

/* Fix for any scrollable containers */
[style*="overflow: auto"],
[style*="overflow:auto"],
[style*="overflow: scroll"],
[style*="overflow:scroll"] {
  overflow: visible !important;
}

/* Make sure tree nodes are fully visible */
:deep(.el-tree-node__children) {
  overflow: visible !important;
}

.device-tree-main-box {
  text-align: left;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
  }

  .header-switch {
    width: 100%;
    margin-left: 0;
  }
}

/* ========== 暗黑模式 ========== */
html.dark .panel-header {
  background: rgba(255, 255, 255, 0.02);
  border-bottom-color: var(--el-border-color-darker);
}

html.dark :deep(.el-tree-node__content:hover) {
  background: rgba(var(--el-color-primary-rgb), 0.15);
}

html.dark :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.18) 0%, rgba(64, 158, 255, 0.12) 100%);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

html.dark :deep(.el-tree-node__label) {
  color: var(--el-text-color-regular);
}

html.dark .device-tree-container {
  background: var(--el-bg-color-page);
}

html.dark .panel-header .header-icon-wrap {
  background: rgba(64, 158, 255, 0.15);
}
</style>