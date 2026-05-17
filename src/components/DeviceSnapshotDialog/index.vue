<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="70%"
    append-to-body
    draggable
    destroy-on-close
    class="glass-dialog"
  >
    <div class="search-box">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" class="query-form">
        <el-form-item label="抓图类型" prop="snapshotType">
          <el-select v-model="queryParams.snapshotType" placeholder="请选择抓图类型" clearable style="width: 200px">
            <el-option label="手动" value="manual" />
            <el-option label="报警" value="alarm" />
            <el-option label="定时" value="schedule" />
            <el-option label="预览" value="preview" />
          </el-select>
        </el-form-item>
        <el-form-item label="抓图时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item class="form-actions">
          <div class="button-group">
            <el-button type="primary" icon="Search" @click="handleQuery" class="search-btn">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery" class="reset-btn">重置</el-button>
          </div>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8 toolbar-row action-buttons">
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            class="action-btn delete-btn"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
          >导出</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </div>

    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="snapshotList"
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
        <el-table-column label="截图预览" align="center" prop="fileUrl">
          <template #default="scope">
            <image-preview v-if="scope.row.fileUrl" :src="scope.row.fileUrl" :width="80" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="SDK类型" align="center" prop="sdkType">
          <template #default="scope">
            <el-tag v-if="scope.row.sdkType === 'hik'" type="danger">海康</el-tag>
            <el-tag v-else-if="scope.row.sdkType === 'hik_isup'" type="danger">海康ISUP</el-tag>
            <el-tag v-else-if="scope.row.sdkType === 'dahua'" type="warning">大华</el-tag>
            <el-tag v-else-if="scope.row.sdkType === 'uniview'" type="success">宇视</el-tag>
            <el-tag v-else-if="scope.row.sdkType === 'tiandy'" type="info">天地伟业</el-tag>
            <el-tag v-else-if="scope.row.sdkType === 'gb28181'" type="primary">国标28181</el-tag>
            <el-tag v-else>其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通道号" align="center" prop="channel"/>
        <el-table-column label="抓图类型" align="center" prop="snapshotType">
          <template #default="scope">
            <el-tag v-if="scope.row.snapshotType === 'manual'" type="success">手动</el-tag>
            <el-tag v-else-if="scope.row.snapshotType === 'alarm'" type="danger">报警</el-tag>
            <el-tag v-else-if="scope.row.snapshotType === 'schedule'" type="warning">定时</el-tag>
            <el-tag v-else-if="scope.row.snapshotType === 'preview'" type="info">预览</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="抓图时间" align="center" prop="captureTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.captureTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" align="center" prop="fileSize">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="文件类型" align="center" prop="fileType" />
        <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-tooltip content="下载">
                <el-button
                  type="success"
                  text
                  bg
                  size="small"
                  icon="Download"
                  @click="handleDownload(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="删除">
                <el-button
                  type="danger"
                  text
                  bg
                  size="small"
                  icon="Delete"
                  @click="handleDeleteOne(scope.row)"
                />
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
      @pagination="getList"
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="DeviceSnapshotDialog">
import { getCurrentInstance, ref, reactive, toRefs } from 'vue'
import { delSnapshot, listSnapshot } from '@/api/qs/snapshot'
import type { QsDeviceSnapshot, SnapshotQueryParams } from '@/types/api/qs/snapshot'

const { proxy } = getCurrentInstance() as any

const visible = ref(false)
const title = ref('')
const deviceId = ref<number | null>(null)
const deviceName = ref('')
const dateRange = ref<string[]>([])
const snapshotList = ref<QsDeviceSnapshot[]>([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceId: undefined,
    snapshotType: undefined,
    beginTime: undefined,
    endTime: undefined
  } as SnapshotQueryParams
})

const { queryParams } = toRefs(data)

function openDialog(id: number, name: string) {
  deviceId.value = id
  deviceName.value = name
  title.value = `${name} - 抓图列表`
  queryParams.value.deviceId = id
  visible.value = true
  getList()
}

function getList() {
  loading.value = true
  listSnapshot(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    snapshotList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    deviceId: deviceId.value,
    snapshotType: undefined,
    beginTime: undefined,
    endTime: undefined
  } as SnapshotQueryParams
  handleQuery()
}

function handleSelectionChange(selection: QsDeviceSnapshot[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function downloadFile(url: string, filename?: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || url.split('/').pop() || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleDownload(row: QsDeviceSnapshot) {
  if (row.fileUrl) {
    downloadFile(row.fileUrl, row.fileName || 'snapshot.jpg')
  }
}

function handleDeleteOne(row: QsDeviceSnapshot) {
  proxy.$modal.confirm('是否确认删除抓图记录？').then(function () {
    return delSnapshot(row.id!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

function handleDelete() {
  proxy.$modal.confirm('是否确认删除选中的抓图记录？').then(function () {
    return delSnapshot(ids.value)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

function handleExport() {
  proxy.download("qs/snapshot/export", {
    ...queryParams.value
  }, `snapshot_${new Date().getTime()}.xlsx`)
}

function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined) return '-'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function handleClose() {
  visible.value = false
  resetQuery()
}

defineExpose({
  openDialog
})
</script>

<style lang="scss" scoped>
.search-box {
  margin-bottom: 16px;
}

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

.toolbar-row {
  padding: 4px 0;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
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

.delete-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-danger-light-7);
}

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

.table-wrapper {
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out 0.25s both;
  transition: box-shadow 0.3s;
}

.table-wrapper:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
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
          animation-delay: #{$i * 0.03 + 0.25}s;
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

.table-actions .el-button--success,
.table-actions .el-button--success[text],
.table-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.table-actions .el-button--danger,
.table-actions .el-button--danger[text],
.table-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

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

:deep(.el-pagination) {
  padding: 12px 0;
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

:deep(.el-pagination__total) {
  color: var(--el-text-color-secondary);
}

:deep(.el-pagination__sizes) .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
}

:deep(.el-pager li) {
  transition: all 0.3s;
}

:deep(.el-pager li:hover:not(.is-active)) {
  color: var(--el-color-primary);
  transform: translateY(-1px);
}

:deep(.el-pager li.is-active) {
  box-shadow: 0 2px 8px var(--el-color-primary-light-5);
}
</style>
