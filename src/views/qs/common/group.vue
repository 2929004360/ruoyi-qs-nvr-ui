<template>
  <div class="app-container group-page">
    <el-row :gutter="20">
      <splitpanes class="default-theme custom-splitpanes">
        <pane size="20" min-size="15">
          <div class="tree-card">
            <div class="tree-header">
              <el-icon class="tree-icon"><FolderOpened /></el-icon>
              <span class="tree-title">业务分组</span>
            </div>
            <div class="tree-content">
              <GroupTree
                @handleNodeClick="handleNodeClick"
                :showIndex="true"
                :contextMenu="['refresh', 'add', 'update', 'delete']"
              />
            </div>
          </div>
        </pane>

        <pane size="80">
          <div class="main-content">
            <!-- 分组信息卡片 -->
            <div class="group-info-card" :class="{ 'has-group': groupName }">
              <div class="group-info-content">
                <el-icon class="group-info-icon"><Monitor /></el-icon>
                <div class="group-info-text">
                  <span class="group-info-label">所选业务分组</span>
                  <el-text v-if="groupName" type="primary" class="group-name">{{ groupName }}</el-text>
                  <el-text v-else type="warning" class="group-name empty">未选择业务分组</el-text>
                </div>
              </div>
              <div class="group-info-badge" v-if="groupName">
                <el-tag type="success" effect="light" size="small">已选择</el-tag>
              </div>
            </div>

            <!-- 查询表单 -->
            <el-form
              :model="queryParams"
              ref="queryRef"
              :inline="true"
              v-show="showSearch"
              label-width="80px"
              class="query-form"
            >
              <el-form-item label="设备名称" prop="deviceName">
                <el-input
                  v-model="queryParams.deviceName"
                  placeholder="请输入设备名称"
                  clearable
                  @keyup.enter="handleQuery"
                  prefix-icon="VideoCamera"
                />
              </el-form-item>
              <el-form-item label="IP地址" prop="ipAddress">
                <el-input
                  v-model="queryParams.ipAddress"
                  placeholder="请输入IP地址"
                  clearable
                  @keyup.enter="handleQuery"
                  prefix-icon="MapLocation"
                />
              </el-form-item>
              <el-form-item label="接入类型" prop="type">
                <el-select v-model="queryParams.type" placeholder="请选择直播流接入类型" clearable>
                  <el-option
                    v-for="dict in qs_live_stream_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="设备状态" prop="deviceStatus">
                <el-select v-model="queryParams.deviceStatus" placeholder="请选择设备状态" clearable>
                  <el-option
                    v-for="dict in qs_device_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery" class="search-btn">
                  搜索
                </el-button>
                <el-button icon="Refresh" @click="resetQuery" class="reset-btn">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 操作按钮区 -->
            <el-row :gutter="10" class="mb8 toolbar-row">
              <el-col :span="1.5">
                <el-button
                  type="primary"
                  plain
                  icon="Plus"
                  :disabled="addDisabled"
                  @click="handleAdd"
                  class="action-btn add-btn"
                >
                  新增
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  type="danger"
                  plain
                  icon="Delete"
                  :disabled="addDisabled || multiple"
                  @click="handleDelete"
                  class="action-btn delete-btn"
                >
                  删除
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  type="warning"
                  plain
                  icon="Warning"
                  @click="handleUnusual"
                  class="action-btn unusual-btn"
                >
                  异常挂载设备
                </el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
            </el-row>

            <!-- 数据表格 -->
            <div class="table-wrapper">
              <el-table
                v-loading="loading"
                :data="deviceList"
                @selection-change="handleSelectionChange"
                class="custom-table"
                highlight-current-row
              >
                <el-table-column type="selection" width="55" align="center" fixed />
                <el-table-column label="编号" align="center" prop="id" width="70">
                  <template #default="scope">
                    <span class="id-badge">{{ scope.row.id }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="设备名称" align="center" prop="deviceName" min-width="150">
                  <template #default="scope">
                    <div class="device-name-cell">
                      <el-icon><VideoCamera /></el-icon>
                      <span>{{ scope.row.deviceName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="IP地址" align="center" prop="ipAddress" min-width="140">
                  <template #default="scope">
                    <div class="ip-cell">
                      <el-icon><Connection /></el-icon>
                      <span>{{ scope.row.ipAddress }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="接入类型" align="center" prop="type" width="120">
                  <template #default="scope">
                    <dict-tag :options="qs_live_stream_type" :value="scope.row.type" />
                  </template>
                </el-table-column>
                <el-table-column label="设备状态" align="center" prop="deviceStatus" width="110">
                  <template #default="scope">
                    <dict-tag :options="qs_device_status" :value="scope.row.deviceStatus" />
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  align="center"
                  class-name="small-padding fixed-width"
                  width="120"
                  fixed="right"
                >
                  <template #default="scope">
                    <div class="table-actions">
                      <el-tooltip content="删除">
                        <el-button
                          type="danger"
                          text
                          bg
                          size="small"
                          icon="Delete"
                          :disabled="addDisabled"
                          @click="handleDelete(scope.row)"
                        />
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页 -->
            <pagination
              v-show="total > 0"
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="getList"
              class="custom-pagination"
            />

            <!-- 添加设备对话框 -->
            <el-dialog
              :title="title"
              v-model="open"
              width="1300px"
              append-to-body
              draggable
              destroy-on-close
              class="glass-dialog device-dialog"
              align-center
            >
              <div class="dialog-body">
                <el-form
                  :model="queryParamsSelect"
                  ref="querySelectRef"
                  :inline="true"
                  v-show="showSearchSelect"
                  label-width="80px"
                  class="query-form"
                >
                  <el-form-item label="设备名称" prop="deviceName">
                    <el-input
                      v-model="queryParamsSelect.deviceName"
                      placeholder="请输入设备名称"
                      clearable
                      @keyup.enter="handleSelectQuery"
                      prefix-icon="VideoCamera"
                    />
                  </el-form-item>
                  <el-form-item label="IP地址" prop="ipAddress">
                    <el-input
                      v-model="queryParamsSelect.ipAddress"
                      placeholder="请输入IP地址"
                      clearable
                      @keyup.enter="handleSelectQuery"
                      prefix-icon="MapLocation"
                    />
                  </el-form-item>
                  <el-form-item label="接入类型" prop="type">
                    <el-select v-model="queryParamsSelect.type" placeholder="请选择直播流接入类型" clearable>
                      <el-option
                        v-for="dict in qs_live_stream_type"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="设备状态" prop="deviceStatus">
                    <el-select v-model="queryParamsSelect.deviceStatus" placeholder="请选择设备状态" clearable>
                      <el-option
                        v-for="dict in qs_device_status"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item class="form-actions">
                    <div class="button-group">
                      <el-button type="primary" icon="Search" @click="handleSelectQuery" class="search-btn">
                        搜索
                      </el-button>
                      <el-button icon="Refresh" @click="resetSelectQuery" class="reset-btn">重置</el-button>
                    </div>
                  </el-form-item>
                </el-form>

                <el-row :gutter="10" class="mb8 toolbar-row">
                  <el-col :span="1.5">
                    <el-button
                      type="primary"
                      plain
                      icon="Select"
                      :disabled="multipleSelect"
                      @click="handleSelect"
                      class="action-btn select-btn"
                    >
                      选择
                    </el-button>
                  </el-col>
                  <right-toolbar v-model:showSearch="showSearchSelect" @queryTable="getListDevice" />
                </el-row>

                <div class="table-wrapper">
                  <el-table
                    v-loading="loadingSelect"
                    :data="deviceSelectList"
                    @selection-change="handleSelectionSelectChange"
                    class="custom-table"
                    highlight-current-row
                  >
                    <el-table-column type="selection" width="55" align="center" fixed />
                    <el-table-column label="编号" align="center" prop="id" width="70">
                      <template #default="scope">
                        <span class="id-badge">{{ scope.row.id }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="设备名称" align="center" prop="deviceName" min-width="150">
                      <template #default="scope">
                        <div class="device-name-cell">
                          <el-icon><VideoCamera /></el-icon>
                          <span>{{ scope.row.deviceName }}</span>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="IP地址" align="center" prop="ipAddress" min-width="140">
                      <template #default="scope">
                        <div class="ip-cell">
                          <el-icon><Connection /></el-icon>
                          <span>{{ scope.row.ipAddress }}</span>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="接入类型" align="center" prop="type" width="120">
                      <template #default="scope">
                        <dict-tag :options="qs_live_stream_type" :value="scope.row.type" />
                      </template>
                    </el-table-column>
                    <el-table-column label="设备状态" align="center" prop="deviceStatus" width="110">
                      <template #default="scope">
                        <dict-tag :options="qs_device_status" :value="scope.row.deviceStatus" />
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="操作"
                      align="center"
                      class-name="small-padding fixed-width"
                      width="100"
                      fixed="right"
                    >
                      <template #default="scope">
                        <div class="table-actions">
                          <el-tooltip content="选择">
                            <el-button
                              type="primary"
                              text
                              bg
                              size="small"
                              icon="Select"
                              @click="handleSelect(scope.row)"
                            />
                          </el-tooltip>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <pagination
                  v-show="totalSelect > 0"
                  :total="totalSelect"
                  v-model:page="queryParamsSelect.pageNum"
                  v-model:limit="queryParamsSelect.pageSize"
                  @pagination="getListDevice"
                  class="custom-pagination"
                />
              </div>
            </el-dialog>

            <UnusualGroupDeviceSelect ref="UnusualGroupDeviceSelectRef" />
          </div>
        </pane>
      </splitpanes>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="Group">
import GroupTree from "../../components/common/GroupTree.vue";
import { Pane, Splitpanes } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { addDeviceIdToGroup, deleteDeviceToGroup, listDevice, queryListByParentId } from "@/api/qs/device";
import UnusualGroupDeviceSelect from "../../components/common/UnusualGroupDeviceSelect.vue";
import { Monitor, FolderOpened, VideoCamera, Connection, MapLocation } from "@element-plus/icons-vue";

const { proxy } = getCurrentInstance();
const { qs_live_stream_type, qs_device_status } = proxy.useDict(
  "qs_live_stream_type",
  "qs_device_status"
);

const deviceList = ref([]);
const loading = ref(true);
const total = ref(0);
const showSearch = ref(true);
const groupDeviceId = ref("");
const businessGroup = ref("");
const selectionList = ref([]);
const multiple = ref(true);
const addDisabled = ref(true);
const open = ref(false);
const title = ref("");

const deviceSelectList = ref([]);
const loadingSelect = ref(true);
const totalSelect = ref(0);
const showSearchSelect = ref(true);
const multipleSelect = ref(true);
const selectionSelectList = ref([]);

const groupName = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceName: undefined,
    ipAddress: undefined,
    type: undefined,
    deviceStatus: undefined,
    gbParentId: undefined,
    status: "ENABLE",
  },
  rules: {},

  queryParamsSelect: {
    pageNum: 1,
    pageSize: 10,
    deviceName: undefined,
    ipAddress: undefined,
    type: undefined,
    deviceStatus: undefined,
    gbParentId: undefined,
    status: "ENABLE",
  },
});

const { queryParams, form, rules, queryParamsSelect } = toRefs(data);

function getList() {
  loading.value = true;
  listDevice(queryParams.value)
    .then((res) => {
      deviceList.value = res.rows;
      total.value = res.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleDelete(row) {
  let deviceIds = [];
  if (row.id) {
    deviceIds.push(row.id);
  } else {
    for (let i = 0; i < selectionList.value.length; i++) {
      deviceIds.push(selectionList.value[i].id);
    }
  }
  proxy.$modal
    .confirm("是否删除选择的数据？")
    .then(function () {
      return deleteDeviceToGroup({ deviceIds: deviceIds });
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 选择条数  */
function handleSelectionChange(selection) {
  if (queryParams.value.gbParentId === null) {
    multiple.value = true;
  } else {
    multiple.value = !selection.length;
  }
  selectionList.value = selection;
}

/** 节点单击事件 */
function handleNodeClick(data) {
  if (data.deviceId == null || data.deviceId == undefined) {
    proxy.$modal.msgError("当前为业务分组，挂载设备请选择其下的虚拟组织，如不存在可右键新建");
    return;
  }

  if (data.deviceId != null || data.deviceId != undefined) {
    queryParams.value.gbParentId = data.deviceId;
    addDisabled.value = false;
  } else {
    queryParams.value.gbParentId = null;
    addDisabled.value = true;
  }

  groupName.value = data.name;
  groupDeviceId.value = queryParams.value.gbParentId;
  businessGroup.value = data.businessGroup;
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  if (groupDeviceId.value === "" || groupDeviceId.value === " ") {
    proxy.$modal.msgError("请选择左侧业务分组");
    return;
  }

  title.value = "添加设备";
  open.value = true;

  getListDevice();
}

function getListDevice() {
  loadingSelect.value = true;
  queryListByParentId(queryParamsSelect.value)
    .then((res) => {
      deviceSelectList.value = res.rows;
      totalSelect.value = res.total;
    })
    .finally(() => {
      loadingSelect.value = false;
    });
}

function handleSelectQuery() {
  queryParamsSelect.value.pageNum = 1;
  getListDevice();
}

function resetSelectQuery() {
  proxy.resetForm("querySelectRef");
  handleSelectQuery();
}

function handleSelectionSelectChange(selection) {
  selectionSelectList.value = selection;
  multipleSelect.value = !selection.length;
}

function handleSelect(row) {
  if (row.id) {
    addDeviceToCivilCode(groupDeviceId.value, businessGroup.value, [row]);
  } else {
    addDeviceToCivilCode(groupDeviceId.value, businessGroup.value, selectionSelectList.value);
  }
  proxy.$modal.msgSuccess("选择成功");
  open.value = false;
}

function addDeviceToCivilCode(groupDeviceId, businessGroup, data) {
  let deviceIds = [];
  for (let i = 0; i < data.length; i++) {
    deviceIds.push(data[i].id);
  }
  addDeviceIdToGroup({
    parentId: groupDeviceId,
    businessGroup: businessGroup,
    deviceIds: deviceIds,
  }).then(() => {
    getList();
  });
}

/**
 * 异常挂载设备
 */
function handleUnusual() {
  proxy.$refs["UnusualGroupDeviceSelectRef"].openDialog();
}

getList();
</script>

<style scoped lang="scss">
/* ========== 页面整体布局 ========== */
.group-page {
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

/* ========== Splitpanes 自定义 ========== */
.custom-splitpanes {
  height: calc(100vh - 140px);
  background: transparent;

  :deep(.splitpanes__pane) {
    background: transparent;
    transition: background-color 0.3s;
  }

  :deep(.splitpanes__splitter) {
    background-color: var(--el-border-color-lighter);
    border-left: 1px solid var(--el-border-color-lighter);
    position: relative;
    width: 8px;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--el-color-primary-light-7);
    }

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 3px;
      height: 24px;
      background-color: var(--el-border-color);
      border-radius: 2px;
      transition: background-color 0.3s, height 0.3s;
    }

    &:hover::before {
      background-color: var(--el-color-primary);
      height: 36px;
    }
  }
}

/* ========== 左侧树卡片 ========== */
.tree-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: box-shadow 0.3s, border-color 0.3s;
  animation: slideInLeft 0.5s ease-out;

  &:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    var(--el-bg-color-overlay) 100%
  );
  transition: background 0.3s;
}

.tree-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.tree-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}

.tree-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

/* ========== 右侧主内容区 ========== */
.main-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 8px;
  animation: slideInRight 0.5s ease-out 0.1s both;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ========== 分组信息卡片 ========== */
.group-info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--el-color-warning);
    border-radius: 10px 0 0 10px;
    transition: background 0.3s, width 0.3s;
  }

  &.has-group {
    &::before {
      background: var(--el-color-primary);
      width: 4px;
    }

    .group-info-icon {
      color: var(--el-color-primary);
      animation: rotateIn 0.6s ease-out;
    }
  }

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}

@keyframes rotateIn {
  from {
    transform: rotate(-180deg) scale(0.5);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

.group-info-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-info-icon {
  font-size: 24px;
  color: var(--el-color-warning);
  transition: color 0.3s;
}

.group-info-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-info-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.group-name {
  font-size: 15px;
  font-weight: 600;

  &.empty {
    font-weight: 500;
  }
}

.group-info-badge {
  animation: scaleIn 0.4s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
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

/* 按钮区域 */
.form-actions {
  margin-left: auto !important;
  margin-right: 0 !important;
  padding-left: 16px;
  border-left: 1px solid var(--el-border-color-lighter);
  margin-left: 12px !important;

  .button-group {
    display: flex;
    gap: 12px;
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

.search-btn {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--el-color-primary-light-7);
  }

  &:active {
    transform: translateY(0);
  }
}

.reset-btn {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(0);
  }
}

/* ========== 工具栏 ========== */
.toolbar-row {
  padding: 4px 0;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.add-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-primary-light-7);
}

.delete-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-danger-light-7);
}

.unusual-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-warning-light-7);
}

.select-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-success-light-7);
}

/* ========== 表格区域 ========== */
.table-wrapper {
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out 0.25s both;
  transition: box-shadow 0.3s;
  flex: 1;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
  }
}

.custom-table {
  --el-table-header-bg-color: var(--el-fill-color-light);
  flex: 1;
  height: 0;

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

/* 设备名称单元格 */
.device-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  transition: color 0.3s;

  .el-icon {
    color: var(--el-color-primary);
    font-size: 16px;
  }
}

/* IP 单元格 */
.ip-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--el-text-color-regular);
  font-family: "Courier New", monospace;
  font-size: 13px;
  transition: color 0.3s;

  .el-icon {
    color: var(--el-color-info);
    font-size: 14px;
  }
}

/* 操作按钮 */
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
/* 强制保持白色图标 */
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
.table-actions .el-button--danger,
.table-actions .el-button--danger[text],
.table-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

/* ========== 分页 ========== */
.custom-pagination {
  padding: 12px 0;
  animation: fadeInUp 0.4s ease-out 0.3s both;

  :deep(.el-pagination__total) {
    color: var(--el-text-color-regular);
  }

  :deep(.el-pagination__sizes) {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
    }
  }

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

/* ========== 对话框 ========== */
.device-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: dialogEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :deep(.el-dialog__header) {
    padding: 20px 24px;
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
      letter-spacing: 0.5px;
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
    padding: 20px 24px;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ========== 暗黑模式适配 ========== */
html.dark {
  .group-page {
    .tree-card,
    .group-info-card,
    .query-form,
    .table-wrapper {
      border-color: var(--el-border-color);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
    }

    .tree-card:hover,
    .group-info-card:hover,
    .table-wrapper:hover {
      box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3);
    }

    .tree-header {
      background: linear-gradient(
        135deg,
        rgba(64, 158, 255, 0.1) 0%,
        var(--el-bg-color-overlay) 100%
      );
    }

    .custom-table {
      :deep(.el-table__header-wrapper th) {
        background-color: var(--el-bg-color-overlay) !important;
      }

      :deep(.el-table__row) {
        &:hover {
          background-color: #0c2a5e !important;
        }
      }

      :deep(.el-table__cell),
      :deep(.el-table__cell *),
      :deep(.el-link),
      :deep(.el-link *),
      :deep(.el-text),
      :deep(.el-text *) {
        color: #ffffff !important;
      }
    }

    .id-badge {
      background: rgba(64, 158, 255, 0.15);
    }

    .device-dialog :deep(.el-dialog__header) {
      background: linear-gradient(
        135deg,
        rgba(64, 158, 255, 0.08) 0%,
        var(--el-bg-color-overlay) 60%
      );
    }
  }
}

/* ========== 响应式优化 ========== */
@media screen and (max-width: 1400px) {
  .query-form {
    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }
}

@media screen and (max-width: 900px) {
  .query-form {
    .form-actions {
      margin-left: 0 !important;
      padding-left: 0;
      border-left: none;
      width: 100%;
      border-top: 1px solid var(--el-border-color-lighter);
      padding-top: 16px;
      margin-top: 8px;

      .button-group {
        justify-content: flex-end;
      }
    }
  }
}

/* ========== 滚动条美化 ========== */
.tree-content::-webkit-scrollbar,
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

.tree-content::-webkit-scrollbar-thumb,
:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: var(--el-border-color);
  border-radius: 3px;
  transition: background 0.3s;
}

.tree-content::-webkit-scrollbar-thumb:hover,
:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: var(--el-color-primary-light-5);
}

.tree-content::-webkit-scrollbar-track,
:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}
</style>
