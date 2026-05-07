<template>
  <div id="DeviceTree" class="device-tree-container" style="height: 100%">
    <div class="device-tree-header">
      <div class="header-title">
        <span class="title-icon">📹</span>
        <span>设备列表</span>
      </div>
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
}

.device-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 4px;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 30px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
}

.tree-content {
  flex: 1;
  overflow: hidden !important;
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
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
  border-radius: 6px;
  transition: all 0.2s ease;
  margin: 2px 0;
}

:deep(.el-tree-node__content:hover) {
  background: rgba(var(--el-color-primary-rgb), 0.08);
  transform: translateX(2px);
}

:deep(.el-tree-node__label) {
  word-break: break-word !important;
  white-space: normal !important;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(var(--el-color-primary-rgb), 0.12);
  color: var(--el-color-primary);
  font-weight: 600;
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
  .device-tree-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 0;
  }

  .header-switch {
    width: 100%;
    margin-top: 4px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 15px;
  }

  .title-icon {
    font-size: 16px;
  }
}

/* ===== 暗黑模式 ===== */
html.dark .device-tree-header {
  border-bottom-color: var(--el-border-color);
  background: var(--el-bg-color-page);
}

html.dark :deep(.el-tree-node__content:hover) {
  background: rgba(var(--el-color-primary-rgb), 0.15);
}

html.dark :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(var(--el-color-primary-rgb), 0.2);
}

html.dark :deep(.el-tree-node__label) {
  color: var(--el-text-color-regular);
}

html.dark .device-tree-container {
  background: var(--el-bg-color-page);
}
</style>