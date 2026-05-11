<template>
  <div class="group-tree-container">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input
        v-model="searchStr"
        placeholder="请输入内容搜索"
        clearable
        class="search-input"
        :prefix-icon="Search"
      >
        <template #append v-if="showIndex">
          <el-tooltip content="显示编号" placement="top">
            <el-checkbox v-model="checked" label="编号" class="index-checkbox" />
          </el-tooltip>
        </template>
        <template #prepend>
          <el-button @click="refresh" class="refresh-btn" :icon="Refresh" title="刷新" />
        </template>
      </el-input>
    </div>

    <!-- 树形组件 -->
    <el-tree
      v-if="!searchStr"
      node-key="id"
      ref="treeRef"
      :data="treeData"
      :props="propsTree"
      @node-click="handleNodeClick"
      lazy
      :load="loadNode"
      :default-expanded-keys="defaultExpandedKeys"
      class="custom-tree"
      highlight-current
      :expand-on-click-node="false"
    >
      <template #default="{ node, data }">
        <div
          v-if="showContextmenu"
          class="custom-tree-node"
          :class="{ 'is-active': chooseId === data.name }"
          @contextmenu="onContextMenu($event, data)"
        >
          <div class="node-icon-wrap" v-if="!data.leaf">
            <el-icon
              class="node-icon folder-icon"
              :class="{ active: chooseId === data.name }"
            >
              <FolderOpened />
            </el-icon>
          </div>

          <div class="node-label" :class="{ active: chooseId === data.name }">
            {{ node.label }}
          </div>

          <div class="node-extra" v-if="data.deviceId && showIndex && checked">
            <span class="device-id-badge">{{ data.deviceId }}</span>
          </div>
        </div>

        <div v-else class="custom-tree-node" :class="{ 'is-active': chooseId === data.name }">
          <div v-if="data.leaf">
            <div
              v-if="isContextmenu"
              @contextmenu="onContextMenu($event, data)"
              class="tree-leaf-row"
            >
              <el-icon
                class="node-icon camera-icon"
                :class="{ online: data.status === 'ON', offline: data.status === 'OFFLINE' }"
              >
                <VideoCamera />
              </el-icon>

              <div class="node-label">{{ node.label }}</div>

              <div class="node-extra" v-if="data.deviceId && showIndex && checked">
                <span class="device-id-badge">{{ data.deviceId }}</span>
              </div>
            </div>

            <div v-else class="tree-leaf-row">
              <el-icon
                class="node-icon camera-icon"
                :class="{ online: data.status === 'ON', offline: data.status === 'OFFLINE' }"
              >
                <VideoCamera />
              </el-icon>

              <div class="node-label">{{ node.label }}</div>

              <div class="node-extra" v-if="data.deviceId && showIndex && checked">
                <span class="device-id-badge">{{ data.deviceId }}</span>
              </div>
            </div>
          </div>

          <div v-else class="tree-folder-row">
            <el-icon
              class="node-icon folder-icon"
              :class="{ active: chooseId === data.name }"
            >
              <FolderOpened />
            </el-icon>

            <div class="node-label" :class="{ active: chooseId === data.name }">
              {{ node.label }}
            </div>

            <div class="node-extra" v-if="data.deviceId && showIndex && checked">
              <span class="device-id-badge">{{ data.deviceId }}</span>
            </div>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- 搜索结果列表 -->
    <div v-else class="search-result-area">
      <div v-if="groupList.length > 0" class="result-list">
        <div
          v-for="(item, index) in groupList"
          :key="item.id"
          class="result-item"
          :class="{ 'is-active': chooseId === item.name }"
          :style="{ animationDelay: index * 0.04 + 's' }"
          @click="handleNodeClick(item)"
        >
          <div class="result-icon-wrap">
            <span
              class="iconfont icon-bianzubeifen3"
              :class="{ active: chooseId === item.name }"
            />
          </div>
          <div class="result-info">
            <div class="result-name">{{ item.name }}</div>
            <div class="result-id" v-if="showIndex && checked">编号：{{ item.deviceId }}</div>
          </div>
          <el-icon class="result-arrow" v-if="chooseId === item.name"><ArrowRight /></el-icon>
        </div>

        <pagination
          layout="total, prev, pager, next"
          v-show="total > 0"
          :total="total"
          v-model:page="queryParamsGroup.pageNum"
          v-model:limit="queryParamsGroup.pageSize"
          @pagination="getQueryForGroupQuery(searchStr)"
          class="tree-pagination"
        />
      </div>

      <el-empty v-else description="暂无搜索结果" class="tree-empty" />
    </div>

    <!-- 右键菜单 -->
    <ContextMenu v-model:show="show" :options="optionsComponent">
      <context-menu-item label="刷新节点" @click="refreshNode" v-if="contextMenu.includes('refresh')">
        <template #icon>
          <el-icon :size="15"><Refresh /></el-icon>
        </template>
      </context-menu-item>
      <context-menu-item label="新增节点" @click="addNode" v-if="contextMenu.includes('add')">
        <template #icon>
          <el-icon :size="15"><Plus /></el-icon>
        </template>
      </context-menu-item>
      <context-menu-item
        label="修改节点"
        :disabled="nodeData.name === '根资源组'"
        @click="updateNode"
        v-if="contextMenu.includes('update')"
      >
        <template #icon>
          <el-icon :size="15"><Edit /></el-icon>
        </template>
      </context-menu-item>
      <context-menu-item
        label="删除节点"
        :disabled="nodeData.name === '根资源组'"
        @click="deleteNode"
        v-if="contextMenu.includes('delete')"
      >
        <template #icon>
          <el-icon :size="15"><Delete /></el-icon>
        </template>
      </context-menu-item>
      <context-menu-item
        label="播放通道"
        :disabled="nodeData.name === '根资源组'"
        @click="playChannel"
        v-if="contextMenu.includes('playChannel')"
      >
        <template #icon>
          <el-icon :size="15"><VideoPlay /></el-icon>
        </template>
      </context-menu-item>
      <context-menu-item
        label="修改位置"
        :disabled="nodeData.name === '根资源组'"
        @click="updatePosition"
        v-if="contextMenu.includes('updatePosition')"
      >
        <template #icon>
          <el-icon :size="15"><Place /></el-icon>
        </template>
      </context-menu-item>
    </ContextMenu>

    <!-- 新增/修改节点对话框 -->
    <el-dialog
      :title="title"
      v-model="openGroup"
      width="500px"
      append-to-body
      draggable
      destroy-on-close
      class="group-dialog"
      align-center
    >
      <el-form
        ref="formGroupRef"
        :model="formGroup"
        :rules="rulesGroup"
        label-width="90px"
        class="group-form"
      >
        <el-form-item label="节点编号" prop="deviceId">
          <el-input v-model="formGroup.deviceId" placeholder="请输入编码" clearable>
            <template #append>
              <el-button @click="buildDeviceIdCode(formGroup.deviceId)" :icon="MagicStick">生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="formGroup.name" clearable placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="行政区划" prop="civilCode">
          <el-input v-model="formGroup.civilCode" clearable placeholder="请选择行政区划">
            <template #append>
              <el-button @click="chooseCivilCodeFun(formGroup.civilCode)" :icon="MapLocation">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel" class="cancel-btn">取 消</el-button>
          <el-button type="primary" @click="submitFormGroup" class="confirm-btn">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <ChannelCode ref="channelCodeRef" @handleOk="handleOk" />
    <ChooseCivilCode ref="chooseCivilCodeRef" @onSubmit="gbCivilCodeOnSubmit" />
  </div>
</template>

<script setup name="GroupTree" lang="ts">
import ChannelCode from "../../components/common/channelCode.vue";
import ChooseCivilCode from "../../components/common/chooseCivilCode.vue";
import { ContextMenu, ContextMenuItem } from "@imengyu/vue3-context-menu";
import { addGroup, deleteGroup, queryForGroupQuery, queryForGroupTree, updateGroup } from "@/api/qs/group.js";
import {
  Search,
  Refresh,
  FolderOpened,
  VideoCamera,
  Plus,
  Edit,
  Delete,
  VideoPlay,
  Place,
  ArrowRight,
  MagicStick,
  MapLocation,
} from "@element-plus/icons-vue";

const emit = defineEmits(["handleNodeClick", "playChannel", "updatePosition"]);
const { proxy } = getCurrentInstance();
const propsTree = ref({
  label: "name",
  children: "children",
  disabled: "disabled",
});
const searchStr = ref("");
const treeData = ref([]);
const nodeData = ref({});
const groupList = ref([]);
const total = ref(0);
const show = ref(false);
const optionsComponent = ref({
  zIndex: 99999,
  minWidth: 230,
  x: 500,
  y: 200,
});

const title = ref("");
const openGroup = ref(false);
const chooseId = ref("");
const defaultExpandedKeys = ref([]);
const checked = ref(false);

const data = reactive({
  formGroup: {},
  rulesGroup: {
    name: [{ required: true, message: "请输入节点名称", trigger: "blur" }],
    deviceId: [{ required: true, message: "请选择节点编号", trigger: "change" }],
    civilCode: [{ required: true, message: "请选择行政区划", trigger: "change" }],
  },
  queryParamsGroup: {
    pageNum: 1,
    pageSize: 10,
    query: null,
  },
});

const { formGroup, rulesGroup, queryParamsGroup } = toRefs(data);

const props = defineProps({
  hasDevice: Boolean,
  showIndex: {
    type: Boolean,
    default: true,
  },
  showContextmenu: {
    type: Boolean,
    default: true,
  },
  isContextmenu: {
    type: Boolean,
    default: false,
  },
  contextMenu: {
    type: Array,
    default: ["refresh", "add", "update", "delete"],
  },
});

onMounted(() => {
  chooseId.value = null;
  getQueryForGroupTree();
});

function getQueryForGroupTree() {
  queryForGroupTree({
    query: searchStr.value,
    parent: null,
    hasDevice: props.hasDevice,
  }).then((res) => {
    let data = [
      {
        id: null,
        name: "根资源组",
        children: [],
        disabled: true,
      },
    ];
    data[0].children = proxy.handleTree(res.data, "id");
    treeData.value = data;
    if (res.data && res.data.length > 0) {
      defaultExpandedKeys.value = [];
      res.data.forEach((item) => {
        defaultExpandedKeys.value.push(item.id);
      });
    }
  });
}

function getQueryForGroupQuery(val) {
  queryParamsGroup.value.query = val;
  queryForGroupQuery(queryParamsGroup.value).then((res) => {
    groupList.value = res.rows;
    total.value = res.total;
  });
}

watch(searchStr, (val) => {
  if (val) {
    getQueryForGroupQuery(val);
  }
});

function refresh() {
  if (!searchStr.value) {
    getQueryForGroupTree();
  } else {
    getQueryForGroupQuery(searchStr.value);
  }
}

function handleNodeClick(data) {
  chooseId.value = data.name;
  emit("handleNodeClick", data);
}

function onContextMenu(e, data) {
  e.preventDefault();
  nodeData.value = data;
  show.value = true;
  optionsComponent.value.x = e.x;
  optionsComponent.value.y = e.y;
}

function resetGroup() {
  formGroup.value = {
    deviceId: undefined,
    name: undefined,
    civilCode: undefined,
    businessGroup: "",
  };
  proxy.resetForm("formGroupRef");
}

function buildDeviceIdCode(deviceId) {
  let lockContent = formGroup.value.businessGroup ? "216" : "215";
  proxy.$refs["channelCodeRef"].openDialog(
    (code) => {},
    deviceId,
    5,
    lockContent
  );
}

function handleOk(code) {
  formGroup.value.deviceId = code;
}

function chooseCivilCodeFun() {
  proxy.$refs["chooseCivilCodeRef"].openDialog((code) => {});
}

function gbCivilCodeOnSubmit(data) {
  formGroup.value.civilCode = data;
}

/** 取消按钮 */
function cancel() {
  openGroup.value = false;
  resetGroup();
}

function submitFormGroup() {
  proxy.$refs["formGroupRef"].validate((valid) => {
    if (valid) {
      if (formGroup.value.id) {
        updateGroup(formGroup.value).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          openGroup.value = false;
          getQueryForGroupTree();
        });
      } else {
        addGroup(formGroup.value).then(() => {
          proxy.$modal.msgSuccess("新增成功");
          openGroup.value = false;
          getQueryForGroupTree();
        });
      }
    }
  });
}

async function loadNode(node, resolve) {
  if (node.level === 0) {
    return resolve([
      {
        treeId: "",
        deviceId: "",
        name: "根资源组",
        isLeaf: false,
        type: 0,
      },
    ]);
  } else if (node.level > 0) {
    if (node.data.leaf) {
      return resolve([]);
    }
    let res = await queryForGroupTree({
      query: "",
      parent: node.data.id,
      leaf: false,
      hasDevice: props.hasDevice,
    });

    let terr = [...proxy.handleTree(res.data, "id")];
    if (res.data && res.data.length > 0) {
      defaultExpandedKeys.value = [];
      res.data.forEach((item) => {
        defaultExpandedKeys.value.push(item.id);
      });
    }

    resolve(terr);
  } else {
    resolve([]);
  }
}

function addNode() {
  resetGroup();
  formGroup.value.parentId = nodeData.value.id;
  formGroup.value.businessGroup = nodeData.value.businessGroup;
  formGroup.value.parentDeviceId = nodeData.value.deviceId;
  openGroup.value = true;
  title.value = "新增虚拟组织";
}

function updateNode() {
  resetGroup();
  formGroup.value = JSON.parse(JSON.stringify(nodeData.value));
  openGroup.value = true;
  title.value = "修改虚拟组织";
}

function deleteNode() {
  proxy.$modal
    .confirm('是否确认删除名称为"' + nodeData.value.name + '"的数据项?')
    .then(function () {
      deleteGroup(nodeData.value.id).then(() => {
        getQueryForGroupTree();
        proxy.$modal.msgSuccess("删除成功");
      });
    });
}

function refreshNode() {
  refresh();
}

function playChannel() {
  emit("playChannel", nodeData.value);
}

function updatePosition() {
  emit("updatePosition", nodeData.value);
}

defineExpose({
  refresh,
});
</script>

<style scoped lang="scss">
.group-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.35s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 搜索区域 ========== */
.search-area {
  padding: 0 4px 12px;
  flex-shrink: 0;

  .search-input {
    :deep(.el-input__wrapper) {
      border-radius: 8px 0 0 8px;
      box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
      transition: all 0.3s;

      &:focus-within {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
      }
    }

    :deep(.el-input-group__prepend) {
      padding: 0;
      background: transparent;
      border-radius: 8px 0 0 8px;
      overflow: hidden;

      .refresh-btn {
        border: none;
        border-radius: 0;
        margin: 0;
        height: 100%;
        padding: 0 12px;
        background: var(--el-fill-color-light);
        color: var(--el-text-color-regular);
        transition: all 0.3s;

        &:hover {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }
      }
    }

    :deep(.el-input-group__append) {
      padding: 0 10px;
      background: var(--el-fill-color-light);
      border-radius: 0 8px 8px 0;

      .index-checkbox {
        height: 100%;
        display: flex;
        align-items: center;
        margin-right: 0;

        :deep(.el-checkbox__label) {
          font-size: 12px;
          padding-left: 4px;
        }
      }
    }
  }
}

/* ========== 树形组件 ========== */
.custom-tree {
  flex: 1;
  overflow: auto;
  padding: 4px;

  :deep(.el-tree-node__content) {
    height: 36px;
    border-radius: 8px;
    margin: 2px 0;
    padding-right: 8px !important;
    transition: all 0.25s ease;

    &:hover {
      background-color: var(--el-color-primary-light-9) !important;
    }
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: linear-gradient(90deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%) !important;
    box-shadow: 0 0 0 1px var(--el-color-primary-light-7) inset;

    .node-label.active,
    .node-label {
      color: var(--el-color-primary);
      font-weight: 600;
    }

    .folder-icon {
      color: var(--el-color-primary);
      transform: scale(1.1);
    }
  }

  :deep(.el-tree-node__expand-icon) {
    color: var(--el-text-color-secondary);
    transition: all 0.3s;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  :deep(.el-tree-node__loading-icon) {
    color: var(--el-color-primary);
  }
}

/* ========== 自定义树节点 ========== */
.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  font-size: 14px;
  color: var(--el-text-color-primary);
  transition: all 0.25s;

  &.is-active {
    .node-label {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}

.tree-leaf-row,
.tree-folder-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.node-icon-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.node-icon {
  font-size: 18px;
  transition: all 0.3s;
  flex-shrink: 0;

  &.folder-icon {
    color: var(--el-color-warning);

    &.active {
      color: var(--el-color-primary);
    }
  }

  &.camera-icon {
    &.online {
      color: var(--el-color-success);
    }

    &.offline {
      color: var(--el-text-color-disabled);
    }
  }
}

.node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.25s;
}

.node-extra {
  flex-shrink: 0;
}

.device-id-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 20px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  font-family: "Courier New", monospace;
  transition: all 0.3s;
}

/* ========== 搜索结果区域 ========== */
.search-result-area {
  flex: 1;
  overflow: auto;
  padding: 0 4px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInLeft 0.35s ease-out both;

  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

    .result-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &.is-active {
    background: linear-gradient(90deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px var(--el-color-primary-light-7);

    .result-name {
      color: var(--el-color-primary);
      font-weight: 600;
    }

    .iconfont {
      color: var(--el-color-primary);
    }
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.result-icon-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition: all 0.3s;

  .iconfont {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    transition: color 0.3s;

    &.active {
      color: var(--el-color-primary);
    }
  }
}

.result-item:hover .result-icon-wrap {
  background: var(--el-color-primary-light-8);
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  transition: color 0.25s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-id {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-family: "Courier New", monospace;
}

.result-arrow {
  flex-shrink: 0;
  color: var(--el-color-primary);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s;
}

/* 分页 */
.tree-pagination {
  margin-top: 12px;
  padding: 8px 0;

  :deep(.el-pager li) {
    transition: all 0.3s;

    &:hover:not(.is-active) {
      color: var(--el-color-primary);
      transform: translateY(-1px);
    }

    &.is-active {
      box-shadow: 0 2px 8px var(--el-color-primary-light-5);
    }
  }
}

/* 空状态 */
.tree-empty {
  padding: 40px 0;
}

/* ========== 对话框 ========== */
.group-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: dialogEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :deep(.el-dialog__header) {
    padding: 18px 24px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: linear-gradient(
      135deg,
      var(--el-color-primary-light-9) 0%,
      var(--el-bg-color-overlay) 60%
    );

    .el-dialog__title {
      font-weight: 600;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }

    .el-dialog__headerbtn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: var(--el-color-danger-light-9);

        .el-dialog__close {
          color: var(--el-color-danger);
        }
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.group-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  :deep(.el-input__wrapper) {
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

  :deep(.el-input-group__append) {
    padding: 0;
    overflow: hidden;

    .el-button {
      border: none;
      border-radius: 0;
      margin: 0;
      height: 100%;
      padding: 0 14px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-regular);
      transition: all 0.3s;

      &:hover {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .cancel-btn {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
  }

  .confirm-btn {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px var(--el-color-primary-light-7);
    }
  }
}

/* ========== 暗黑模式适配 ========== */
html.dark {
  .group-tree-container {
    .search-input {
      :deep(.el-input-group__prepend .refresh-btn) {
        background: var(--el-bg-color-overlay);
      }

      :deep(.el-input-group__append) {
        background: var(--el-bg-color-overlay);
      }
    }

    .custom-tree {
      :deep(.el-tree-node.is-current > .el-tree-node__content) {
        background: rgba(64, 158, 255, 0.1) !important;
        box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2) inset;
      }

      :deep(.el-tree-node__content:hover) {
        background-color: rgba(64, 158, 255, 0.08) !important;
      }
    }

    .result-item {
      &:hover {
        background: rgba(64, 158, 255, 0.08);
        border-color: rgba(64, 158, 255, 0.2);
      }

      &.is-active {
        background: linear-gradient(90deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.15) 100%);
        border-color: rgba(64, 158, 255, 0.25);
      }
    }

    .result-icon-wrap {
      background: var(--el-bg-color-overlay);
    }

    .device-id-badge {
      background: rgba(64, 158, 255, 0.15);
    }

    .group-dialog :deep(.el-dialog__header) {
      background: linear-gradient(
        135deg,
        rgba(64, 158, 255, 0.08) 0%,
        var(--el-bg-color-overlay) 60%
      );
    }
  }
}

/* ========== 滚动条美化 ========== */
.custom-tree::-webkit-scrollbar,
.search-result-area::-webkit-scrollbar {
  width: 5px;
}

.custom-tree::-webkit-scrollbar-thumb,
.search-result-area::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

.custom-tree::-webkit-scrollbar-thumb:hover,
.search-result-area::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-primary-light-5);
}

.custom-tree::-webkit-scrollbar-track,
.search-result-area::-webkit-scrollbar-track {
  background: transparent;
}
</style>
