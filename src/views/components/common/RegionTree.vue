<template>
  <div class="region-tree-container">
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
      :props="{ label: 'name', children: 'children' }"
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
      <div v-if="regionList.length > 0" class="result-list">
        <div
          v-for="(item, index) in regionList"
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
          v-model:page="queryParamsRegion.pageNum"
          v-model:limit="queryParamsRegion.pageSize"
          @pagination="getQueryForRegionQuery(searchStr)"
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

    <!-- 新增/修改行政区划对话框 -->
    <el-dialog
      :title="title"
      v-model="openRegion"
      width="1000px"
      append-to-body
      draggable
      destroy-on-close
      class="region-dialog"
      align-center
    >
      <div class="dialog-body">
        <el-tabs
          v-model="activeKeyRegion"
          class="region-tabs"
          @tab-click="getRegionList"
        >
          <el-tab-pane name="0">
            <template #label>
              <div class="tab-label">
                <div class="tab-code">{{ allValRegion[0].val }}</div>
                <div class="tab-meaning">{{ allValRegion[0].meaning }}</div>
              </div>
            </template>
            <div class="radio-group">
              <el-radio
                v-for="item in regionList"
                v-model="allValRegion[0].val"
                :key="item.deviceId"
                :name="item.name"
                :label="item.deviceId"
                @change="deviceChange(item)"
                class="region-radio"
              >
                <span class="radio-name">{{ item.name }}</span>
                <span class="radio-code">{{ item.deviceId }}</span>
              </el-radio>
            </div>
          </el-tab-pane>

          <el-tab-pane name="1">
            <template #label>
              <div class="tab-label">
                <div class="tab-code">{{ allValRegion[1].val ? allValRegion[1].val : "--" }}</div>
                <div class="tab-meaning">{{ allValRegion[1].meaning }}</div>
              </div>
            </template>
            <div class="radio-group">
              <el-radio
                :key="-1"
                v-model="allValRegion[1].val"
                @change="deviceChange"
                label=""
                class="region-radio"
              >
                <span class="radio-name text-muted">不添加</span>
              </el-radio>
              <el-radio
                v-for="item in regionList"
                v-model="allValRegion[1].val"
                @change="deviceChange(item)"
                :key="item.deviceId"
                :label="item.deviceId.substring(2)"
                class="region-radio"
              >
                <span class="radio-name">{{ item.name }}</span>
                <span class="radio-code">{{ item.deviceId.substring(2) }}</span>
              </el-radio>
            </div>
          </el-tab-pane>

          <el-tab-pane name="2">
            <template #label>
              <div class="tab-label">
                <div class="tab-code">{{ allValRegion[2].val ? allValRegion[2].val : "--" }}</div>
                <div class="tab-meaning">{{ allValRegion[2].meaning }}</div>
              </div>
            </template>
            <div class="radio-group">
              <el-radio
                :key="-1"
                label=""
                v-model="allValRegion[2].val"
                @change="deviceChange"
                class="region-radio"
              >
                <span class="radio-name text-muted">不添加</span>
              </el-radio>
              <el-radio
                v-for="item in regionList"
                v-model="allValRegion[2].val"
                @change="deviceChange(item)"
                :key="item.deviceId"
                :label="item.deviceId.substring(4)"
                class="region-radio"
              >
                <span class="radio-name">{{ item.name }}</span>
                <span class="radio-code">{{ item.deviceId.substring(4) }}</span>
              </el-radio>
            </div>
          </el-tab-pane>

          <el-tab-pane name="3">
            <template #label>
              <div class="tab-label">
                <div class="tab-code">{{ allValRegion[3].val ? allValRegion[3].val : "--" }}</div>
                <div class="tab-meaning">{{ allValRegion[3].meaning }}</div>
              </div>
            </template>
            <div class="manual-input-area">
              <div class="input-hint">请手动输入基层接入单位编码，两位数字</div>
              <el-input
                type="text"
                placeholder="例如：01"
                v-model="allValRegion[3].val"
                maxlength="2"
                :disabled="allValRegion[3].lock"
                show-word-limit
                @input="deviceChange"
                class="manual-input"
                clearable
              />
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-divider class="dialog-divider" />

        <el-form
          ref="formRegionRef"
          :model="formRegion"
          :rules="rulesRegion"
          label-width="90px"
          class="region-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="名称" prop="name">
                <el-input v-model="formRegion.name" autocomplete="off" placeholder="请输入名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="编号" prop="deviceId">
                <el-input v-model="formRegion.deviceId" disabled autocomplete="off" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel" class="cancel-btn">取 消</el-button>
          <el-button type="primary" @click="submitFormRegion" class="confirm-btn">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RegionTree" lang="ts">
import { ContextMenu, ContextMenuItem } from "@imengyu/vue3-context-menu";
import {
  addRegion,
  updateRegion,
  deleteRegion,
  getAllChild,
  queryForRegionTree,
  queryForRegionQuery,
} from "@/api/qs/region.js";
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
} from "@element-plus/icons-vue";

const emit = defineEmits(["handleNodeClick", "playChannel", "updatePosition"]);
const { proxy } = getCurrentInstance();

const searchStr = ref("");
const treeData = ref([]);

const nodeData = ref({});
const regionList = ref([]);
const total = ref(0);
const show = ref(false);
const optionsComponent = ref({
  zIndex: 99999,
  minWidth: 230,
  x: 500,
  y: 200,
});

const title = ref("");
const openRegion = ref(false);
const chooseId = ref("");
const allValRegion = ref([]);
const activeKeyRegion = ref("0");
const defaultExpandedKeys = ref([]);
const checked = ref(false);

const data = reactive({
  formRegion: {},
  rulesRegion: {
    name: [{ required: true, message: "请输入节点名称", trigger: "blur" }],
    deviceId: [{ required: true, message: "请选择节点编号", trigger: "change" }],
  },
  queryParamsRegion: {
    pageNum: 1,
    pageSize: 10,
    query: null,
  },
});

const { formRegion, rulesRegion, queryParamsRegion } = toRefs(data);

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
  activeKeyRegion.value = "0";
  chooseId.value = null;
  getQueryForRegionTree();
});

function getQueryForRegionTree() {
  queryForRegionTree({
    query: searchStr.value,
    parent: null,
    hasDevice: props.hasDevice,
  }).then((res) => {
    let data = [
      {
        name: "根资源组",
        children: [],
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

function getQueryForRegionQuery(val) {
  queryParamsRegion.value.query = val;
  queryForRegionQuery(queryParamsRegion.value).then((res) => {
    regionList.value = res.rows;
    total.value = res.total;
  });
}

watch(searchStr, (val) => {
  if (val) {
    getQueryForRegionQuery(val);
  }
});

function refresh() {
  if (!searchStr.value) {
    getQueryForRegionTree();
  } else {
    getQueryForRegionQuery(searchStr.value);
  }
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
    let res = await queryForRegionTree({
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

function onContextMenu(e, data) {
  e.preventDefault();
  nodeData.value = data;
  show.value = true;
  optionsComponent.value.x = e.x;
  optionsComponent.value.y = e.y;
}

function handleNodeClick(data) {
  chooseId.value = data.name;
  emit("handleNodeClick", data);
}

function resetRegion() {
  formRegion.value = {
    deviceId: undefined,
    name: undefined,
  };
  proxy.resetForm("formRegionRef");
}

function queryChildList(parent) {
  getAllChild({ parent: parent }).then((res) => {
    regionList.value = res.data;
  });
}

function getRegionList() {
  nextTick(() => {
    if (activeKeyRegion.value === "0") {
      queryChildList();
    } else if (activeKeyRegion.value === "1" || activeKeyRegion.value === "2") {
      let parent = "";
      if (activeKeyRegion.value === "1") {
        parent = allValRegion.value[0].val;
      }
      if (activeKeyRegion.value === "2") {
        if (allValRegion.value[1].val === "") {
          parent = "";
        } else {
          parent = allValRegion.value[0].val + allValRegion.value[1].val;
        }
      }

      if (activeKeyRegion.value !== "0" && parent === "") {
        proxy.$modal.msgError("请先选择上级行政区划");
      }
      if (parent !== "") {
        queryChildList(parent);
      } else {
        regionList.value = [];
      }
    }
  });
}

function deviceChange(item) {
  nextTick(() => {
    let code = allValRegion.value[0].val;

    if (allValRegion.value[1].val) {
      code += allValRegion.value[1].val;
      if (allValRegion.value[2].val) {
        code += allValRegion.value[2].val;
        if (allValRegion.value[3].val) {
          code += allValRegion.value[3].val;
        }
      } else {
        allValRegion.value[3].val = "";
      }
    } else {
      allValRegion.value[2].val = "";
      allValRegion.value[3].val = "";
    }
    formRegion.value.deviceId = code;
  });
}

/** 取消按钮 */
function cancel() {
  openRegion.value = false;
  resetRegion();
}

function addNode() {
  resetRegion();
  formRegion.value.parentId = nodeData.value.id;
  if (nodeData.value.deviceId) {
    formRegion.value.deviceId = String(nodeData.value.deviceId).slice(0, -2);
  }
  formRegion.value.parentDeviceId = nodeData.value.deviceId;
  openRegion.value = true;
  title.value = "新增行政区划";
  getRegionList();
  allValRegion.value = [
    {
      id: [1, 2],
      meaning: "省级编码",
      val: "11",
      type: "中心编码",
      lock: false,
    },
    {
      id: [3, 4],
      meaning: "市级编码",
      val: "",
      type: "中心编码",
      lock: false,
    },
    {
      id: [5, 6],
      meaning: "区级编码",
      val: "",
      type: "中心编码",
      lock: false,
    },
    {
      id: [7, 8],
      meaning: "基层接入单位编码",
      val: "",
      type: "中心编码",
      lock: false,
    },
  ];

  activeKeyRegion.value = "0";
  if (formRegion.value.deviceId) {
    if (formRegion.value.deviceId.length >= 2 && allValRegion.value[0]) {
      allValRegion.value[0].val = formRegion.value.deviceId.substring(0, 2);
    }
    if (formRegion.value.deviceId.length >= 4 && allValRegion.value[1]) {
      allValRegion.value[1].val = formRegion.value.deviceId.substring(2, 4);
    }
    if (formRegion.value.deviceId.length >= 6 && allValRegion.value[2]) {
      allValRegion.value[2].val = formRegion.value.deviceId.substring(4, 6);
    }
    activeKeyRegion.value = "3";
  } else {
    if (formRegion.value.parentDeviceId) {
      if (formRegion.value.parentDeviceId.length >= 2) {
        allValRegion.value[0].val = formRegion.value.parentDeviceId.substring(0, 2);
        activeKeyRegion.value = "1";
      }
      if (formRegion.value.parentDeviceId.length >= 4) {
        allValRegion.value[1].val = formRegion.value.parentDeviceId.substring(2, 4);
        activeKeyRegion.value = "2";
      }
    }
  }
}

function submitFormRegion() {
  proxy.$refs["formRegionRef"].validate((valid) => {
    if (valid) {
      if (formRegion.value.id) {
        updateRegion(formRegion.value).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          openRegion.value = false;
          getQueryForRegionTree();
        });
      } else {
        addRegion(formRegion.value).then(() => {
          proxy.$modal.msgSuccess("新增成功");
          openRegion.value = false;
          getQueryForRegionTree();
        });
      }
    }
  });
}

function updateNode() {
  resetRegion();
  formRegion.value = JSON.parse(JSON.stringify(nodeData.value));
  openRegion.value = true;
  title.value = "修改行政区划";
  getRegionList();
  allValRegion.value = [
    {
      id: [1, 2],
      meaning: "省级编码",
      val: "11",
      type: "中心编码",
      lock: false,
    },
    {
      id: [3, 4],
      meaning: "市级编码",
      val: "",
      type: "中心编码",
      lock: false,
    },
    {
      id: [5, 6],
      meaning: "区级编码",
      val: "",
      type: "中心编码",
      lock: false,
    },
    {
      id: [7, 8],
      meaning: "基层接入单位编码",
      val: "",
      type: "中心编码",
      lock: false,
    },
  ];

  activeKeyRegion.value = "0";
  if (formRegion.value.deviceId) {
    if (formRegion.value.deviceId.length >= 2 && allValRegion.value[0]) {
      allValRegion.value[0].val = formRegion.value.deviceId.substring(0, 2);
    }
    if (formRegion.value.deviceId.length >= 4 && allValRegion.value[1]) {
      allValRegion.value[1].val = formRegion.value.deviceId.substring(2, 4);
    }
    if (formRegion.value.deviceId.length >= 6 && allValRegion.value[2]) {
      allValRegion.value[2].val = formRegion.value.deviceId.substring(4, 6);
    }
    if (formRegion.value.deviceId.length === 8 && allValRegion.value[3]) {
      allValRegion.value[3].val = formRegion.value.deviceId.substring(6, 8);
    }
  } else {
    if (formRegion.value.parentDeviceId) {
      if (formRegion.value.parentDeviceId.length >= 2) {
        allValRegion.value[0].val = formRegion.value.parentDeviceId.substring(0, 2);
        activeKeyRegion.value = "1";
      }
      if (formRegion.value.parentDeviceId.length >= 4) {
        allValRegion.value[1].val = formRegion.value.parentDeviceId.substring(2, 4);
        activeKeyRegion.value = "2";
      }
      if (formRegion.value.parentDeviceId.length >= 6) {
        allValRegion.value[2].val = formRegion.value.parentDeviceId.substring(4, 6);
        activeKeyRegion.value = "3";
      }
    }
  }
}

function deleteNode() {
  proxy.$modal
    .confirm('是否确认删除名称为"' + nodeData.value.name + '"的数据项?')
    .then(function () {
      deleteRegion(nodeData.value.id).then(() => {
        getQueryForRegionTree();
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
.region-tree-container {
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

/* ========== 行政区划对话框 ========== */
.region-dialog {
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
    padding: 0;
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

.dialog-body {
  padding: 20px 24px;
}

/* Tabs */
.region-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      height: 1px;
      background: var(--el-border-color-lighter);
    }
  }

  :deep(.el-tabs__item) {
    padding: 0 20px;
    height: 56px;
    transition: all 0.3s;

    &.is-active {
      .tab-code {
        color: var(--el-color-primary);
      }

      .tab-meaning {
        color: var(--el-color-primary);
      }
    }

    &:hover {
      .tab-code {
        color: var(--el-color-primary-light-3);
      }
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  }
}

.tab-label {
  text-align: center;
  line-height: 1.4;

  .tab-code {
    font-size: 20px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    font-family: "Courier New", monospace;
    transition: color 0.3s;
  }

  .tab-meaning {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    transition: color 0.3s;
  }
}

/* 单选组 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--el-color-primary-light-5);
  }
}

.region-radio {
  padding: 8px 12px;
  border-radius: 8px;
  margin-right: 0;
  transition: all 0.25s;

  :deep(.el-radio__label) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 8px;
  }

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.is-checked {
    background: var(--el-color-primary-light-9);

    .radio-name {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}

.radio-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  transition: color 0.25s;

  &.text-muted {
    color: var(--el-text-color-placeholder);
  }
}

.radio-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: "Courier New", monospace;
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.25s;
}

.region-radio.is-checked .radio-code {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

/* 手动输入 */
.manual-input-area {
  padding: 8px 4px;

  .input-hint {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
    padding-left: 4px;
  }

  .manual-input {
    max-width: 300px;

    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
      transition: all 0.3s;

      &:focus-within {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
      }
    }
  }
}

/* 分隔线 */
.dialog-divider {
  margin: 16px 0;
}

/* 表单 */
.region-form {
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
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 20px;

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
  .region-tree-container {
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

    .region-dialog :deep(.el-dialog__header) {
      background: linear-gradient(
        135deg,
        rgba(64, 158, 255, 0.08) 0%,
        var(--el-bg-color-overlay) 60%
      );
    }

    .region-radio {
      &:hover {
        background: var(--el-bg-color-overlay);
      }

      &.is-checked {
        background: rgba(64, 158, 255, 0.1);
      }
    }

    .radio-code {
      background: var(--el-bg-color-overlay);
    }

    .region-radio.is-checked .radio-code {
      background: rgba(64, 158, 255, 0.15);
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
