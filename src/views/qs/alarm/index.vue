<template>
  <div class="app-container">
    <div class="search-box">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" class="query-form">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input
            v-model="queryParams.deviceName"
            placeholder="请输入设备名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="SDK类型" prop="sdkType">
          <el-select v-model="queryParams.sdkType" placeholder="请选择SDK类型" clearable style="width: 240px">
            <el-option label="海康" value="hik" />
            <el-option label="海康ISUP" value="hik_isup" />
            <el-option label="大华" value="dahua" />
            <el-option label="宇视" value="uniview" />
            <el-option label="天地伟业" value="tiandy" />
            <el-option label="国标28181" value="gb28181" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警类型" prop="alarmType">
          <el-select v-model="queryParams.alarmType" placeholder="请选择告警类型" clearable style="width: 240px">
            <el-option label="动态检测" value="motion" />
            <el-option label="动态检测扩展" value="motion_ex" />
            <el-option label="视频丢失" value="video_loss" />
            <el-option label="视频丢失扩展" value="video_loss_ex" />
            <el-option label="视频遮挡" value="cover" />
            <el-option label="视频遮挡扩展" value="cover_ex" />
            <el-option label="外部报警" value="alarm_in" />
            <el-option label="外部报警扩展" value="alarm_ex" />
            <el-option label="硬盘满" value="disk_full" />
            <el-option label="硬盘错误" value="disk_error" />
            <el-option label="越界检测" value="cross_line" />
            <el-option label="区域入侵" value="enter_area" />
            <el-option label="区域离开" value="leave_area" />
            <el-option label="物品移除" value="object_remove" />
            <el-option label="物品遗留" value="object_leave" />
            <el-option label="人脸检测" value="face_detection" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警级别" prop="alarmLevel">
          <el-select v-model="queryParams.alarmLevel" placeholder="请选择告警级别" clearable style="width: 240px">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态" prop="handled">
          <el-select v-model="queryParams.handled" placeholder="请选择处理状态" clearable style="width: 240px">
            <el-option label="未处理" :value="0" />
            <el-option label="已处理" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警时间">
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
            type="primary"
            plain
            icon="Check"
            :disabled="multiple"
            @click="handleBatchHandle"
            class="action-btn handle-btn"
          >批量处理
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            class="action-btn delete-btn"
          >删除
          </el-button>
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
        :data="alarmList"
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
         <el-table-column label="设备编号" align="center" prop="deviceCode" />
        <el-table-column label="设备名称" align="center" prop="deviceName" :show-overflow-tooltip="true" />
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
        <el-table-column label="告警图片" align="center" prop="imageUrl">
          <template #default="scope">
            <image-preview v-if="scope.row.imageUrl" :src="scope.row.imageUrl" :width="80" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="告警类型" align="center" prop="alarmType">
          <template #default="scope">
            <el-tag v-if="scope.row.alarmType === 'motion'" type="danger">动态检测</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'motion_ex'" type="danger">动态检测扩展</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'video_loss'" type="warning">视频丢失</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'video_loss_ex'" type="warning">视频丢失扩展</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'cover'" type="info">视频遮挡</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'cover_ex'" type="info">视频遮挡扩展</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'alarm_in'" type="danger">外部报警</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'alarm_ex'" type="danger">外部报警扩展</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'disk_full'" type="warning">硬盘满</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'disk_error'" type="danger">硬盘错误</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'cross_line'" type="danger">越界检测</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'enter_area'" type="warning">区域入侵</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'leave_area'" type="info">区域离开</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'object_remove'" type="danger">物品移除</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'object_leave'" type="warning">物品遗留</el-tag>
            <el-tag v-else-if="scope.row.alarmType === 'face_detection'" type="primary">人脸检测</el-tag>
            <el-tag v-else-if="scope.row.alarmType && scope.row.alarmType.startsWith('other_')" type="info">{{ scope.row.alarmType }}</el-tag>
            <el-tag v-else>其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="告警级别" align="center" prop="alarmLevel">
          <template #default="scope">
            <el-tag v-if="scope.row.alarmLevel === 'low'" type="success">低</el-tag>
            <el-tag v-else-if="scope.row.alarmLevel === 'medium'" type="warning">中</el-tag>
            <el-tag v-else-if="scope.row.alarmLevel === 'high'" type="danger">高</el-tag>
            <el-tag v-else-if="scope.row.alarmLevel === 'critical'" type="danger">紧急</el-tag>
            <el-tag v-else>其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理状态" align="center" prop="handled">
          <template #default="scope">
            <el-tag v-if="scope.row.handled === 1" type="success">已处理</el-tag>
            <el-tag v-else type="danger">未处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="告警时间" align="center" prop="alarmTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.alarmTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="告警内容" align="center" prop="alarmContent" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-tooltip v-if="scope.row.handled !== 1" content="处理">
                <el-button
                  type="primary"
                  text
                  bg
                  size="small"
                  icon="Check"
                  @click="handleHandle(scope.row)"
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
  </div>
</template>

<script setup lang="ts" name="DeviceAlarm">
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from 'vue'
import { delAlarm, listAlarm, exportAlarm, updateAlarm, batchHandleAlarm } from '@/api/qs/alarm'
import type { QsDeviceAlarm, AlarmQueryParams } from '@/types/api/qs/alarm'
import useUserStore from '@/store/modules/user'

import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Search, Delete, Refresh, Check } from '@element-plus/icons-vue'

const instance = getCurrentInstance()
const proxy = instance?.proxy as any
const userStore = useUserStore()

const dateRange = ref<string[]>([])
const alarmList = ref<QsDeviceAlarm[]>([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceName: undefined,
    sdkType: undefined,
    alarmType: undefined,
    alarmLevel: undefined,
    handled: undefined,
    beginTime: undefined,
    endTime: undefined
  } as AlarmQueryParams,
  loading: true,
  showSearch: true,
  ids: [] as number[],
  single: true,
  multiple: true,
  total: 0
})

const { queryParams, loading, showSearch, ids, single, multiple, total } = toRefs(data)

function getList() {
  loading.value = true
  const params = proxy ? proxy.addDateRange(queryParams.value, dateRange.value) : queryParams.value
  listAlarm(params).then(response => {
    alarmList.value = response.rows
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
  if (proxy) {
    proxy.resetForm("queryRef")
  }
  handleQuery()
}

function handleSelectionChange(selection: QsDeviceAlarm[]) {
  ids.value = selection.map(item => item.id!)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleHandle(row: QsDeviceAlarm) {
  const doHandle = () => {
    const updateData: QsDeviceAlarm = {
      id: row.id,
      handled: 1,
      handler: userStore.name,
      handleTime: new Date().toISOString()
    }
    return updateAlarm(updateData)
  }
  
  if (proxy) {
    proxy.$modal.confirm('是否确认处理该告警?').then(() => {
      return doHandle()
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("处理成功")
    }).catch(() => {})
  } else {
    ElMessageBox.confirm('是否确认处理该告警?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      return doHandle()
    }).then(() => {
      getList()
      ElMessage.success("处理成功")
    }).catch(() => {})
  }
}

function handleDeleteOne(row: QsDeviceAlarm) {
  const doDelete = () => delAlarm(row.id!)
  
  if (proxy) {
    proxy.$modal.confirm('是否确认删除告警记录?').then(() => {
      return doDelete()
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {})
  } else {
    ElMessageBox.confirm('是否确认删除告警记录?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      return doDelete()
    }).then(() => {
      getList()
      ElMessage.success("删除成功")
    }).catch(() => {})
  }
}

function handleDelete() {
  const doDelete = () => delAlarm(ids.value)
  
  if (proxy) {
    proxy.$modal.confirm('是否确认删除选中的告警记录?').then(() => {
      return doDelete()
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {})
  } else {
    ElMessageBox.confirm('是否确认删除选中的告警记录?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      return doDelete()
    }).then(() => {
      getList()
      ElMessage.success("删除成功")
    }).catch(() => {})
  }
}

function handleBatchHandle() {
  console.log('=== 批量处理被调用 ===')
  console.log('选中的 ids:', ids.value)
  
  if (!ids.value || ids.value.length === 0) {
    ElMessage.warning('请先选择要处理的告警记录')
    return
  }
  
  const doBatchHandle = () => {
    const data: any = {
      ids: ids.value.map(id => Number(id)),
      handler: userStore.name,
      handleTime: new Date().toISOString()
    }
    console.log('发送的批量处理数据:', data)
    return batchHandleAlarm(data)
  }
  
  if (proxy) {
    proxy.$modal.confirm(`是否确认处理选中的 ${ids.value.length} 条告警记录?`).then(() => {
      return doBatchHandle()
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("批量处理成功")
    }).catch(() => {})
  } else {
    ElMessageBox.confirm(`是否确认处理选中的 ${ids.value.length} 条告警记录?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      return doBatchHandle()
    }).then(() => {
      getList()
      ElMessage.success("批量处理成功")
    }).catch(() => {})
  }
}

function handleExport() {
  if (proxy) {
    proxy.download("qs/alarm/export", {
      ...queryParams.value
    }, `alarm_${new Date().getTime()}.xlsx`)
  } else {
    ElMessage.warning("导出功能暂不可用")
  }
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
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

.handle-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-primary-light-7);
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
