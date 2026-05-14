<template>
  <div>
    <el-dialog
      draggable
      title="异常挂载设备"
      width="1300px"
      top="5rem"
      v-model="showDialog"
      :destroy-on-close="true"
      append-to-body
      class="device-dialog"
      align-center
      @close="close()"
    >
      <div class="dialog-body">
        <el-alert title="清除后设备可正常添加到行政区划，添加可以自动添加对应的行政区划节点。" type="success"
          :closable="false" style="margin-bottom: 16px"/>

        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px" class="query-form">
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
          <el-form-item class="form-actions">
            <div class="button-group">
              <el-button type="primary" icon="Search" @click="handleQuery" class="search-btn">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery" class="reset-btn">重置</el-button>
            </div>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8 toolbar-row">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              :disabled="single"
              icon="CircleClose"
              @click="handleClear"
              class="action-btn clear-btn"
            >清除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              :disabled="unusualCivilCodeList.length > 0 ? false : true"
              icon="Delete"
              @click="handleClearAll"
              class="action-btn clear-all-btn"
            >全部清除
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getUnusualCivilCodeListFun"></right-toolbar>
        </el-row>

        <div class="table-wrapper">
          <el-table v-loading="loading" :data="unusualCivilCodeList" @selection-change="handleSelectionChange" class="custom-table" highlight-current-row>
            <el-table-column type="selection" width="55" align="center" fixed/>
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
                <dict-tag :options="qs_live_stream_type" :value="scope.row.type"/>
              </template>
            </el-table-column>
            <el-table-column label="设备状态" align="center" prop="deviceStatus" width="110">
              <template #default="scope">
                <dict-tag :options="qs_device_status" :value="scope.row.deviceStatus"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100" fixed="right">
              <template #default="scope">
                <div class="table-actions">
                  <el-tooltip content="删除">
                    <el-button type="danger" text bg size="small" icon="Delete" @click="handleDelete(scope.row)"></el-button>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getUnusualCivilCodeListFun"
          class="custom-pagination"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="UnusualRegionDeviceSelect">
import {clearDeviceCivilCode, getUnusualCivilCodeList} from "@/api/qs/device.js";
import { VideoCamera, MapLocation, Connection } from "@element-plus/icons-vue";

const {proxy} = getCurrentInstance()
const {
  qs_live_stream_type,
  qs_device_status,
} = proxy.useDict('qs_live_stream_type', 'qs_device_status')


const single = ref(true)
const selectionList = ref([])
const showDialog = ref(false);
const title = ref('');
const unusualCivilCodeList = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceName: undefined,
    ipAddress: undefined,
    type: undefined,
    deviceStatus: undefined,
    status: 'ENABLE',
  },
})

const {queryParams} = toRefs(data)

defineExpose({openDialog})

function getUnusualCivilCodeListFun() {
  loading.value = true
  getUnusualCivilCodeList(queryParams.value).then(res => {
    unusualCivilCodeList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  selectionList.value = selection
  single.value = selection.length != 1
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getUnusualCivilCodeListFun()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleClear() {
  clearDeviceCivilCode({
    deviceIds: selectionList.value.map(item => item.id)
  }).then(res => {
    proxy.$modal.msgSuccess("清除成功");
    getUnusualCivilCodeListFun()
  })
}
const handleDelete = (row) => {
  clearDeviceCivilCode({
    deviceIds: [row.id]
  }).then(res => {
    proxy.$modal.msgSuccess("清除成功");
    getUnusualCivilCodeListFun()
  })
}

function handleClearAll() {
  clearDeviceCivilCode({
    all: true,
    deviceIds: []
  }).then(res => {
    proxy.$modal.msgSuccess("全部清除成功");
    getUnusualCivilCodeListFun()
  })
}

function close() {
  showDialog.value = false;
}

function openDialog() {
  showDialog.value = true;
  getUnusualCivilCodeListFun()
}
</script>

<style scoped lang="scss">
/* ========== 查询表单 ========== */
.query-form {
  padding: 18px 22px;
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 0 !important;
  animation: fadeInUp 0.4s ease-out 0.1s both;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;

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
  padding-left: 32px;
  border-left: 1px solid var(--el-border-color-lighter);
  margin-left: 24px !important;

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
  animation: fadeInUp 0.4s ease-out 0.15s both;
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

.clear-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-danger-light-7);
}

.clear-all-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-danger-light-7);
}

/* ========== 表格区域 ========== */
.table-wrapper {
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out 0.2s both;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
  }
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
          animation-delay: #{$i * 0.03 + 0.2}s;
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
  animation: fadeInUp 0.4s ease-out 0.25s both;

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
</style>