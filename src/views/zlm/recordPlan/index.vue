<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="计划名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入计划名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option label="启用" value="ENABLE"/>
          <el-option label="停用" value="DEACTIVATE"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="2" class="view-switch">
        <el-radio-group v-model="viewMode" size="small">
          <el-tooltip content="列表视图" placement="bottom" :show-after="500">
            <el-radio-button value="list">
              <el-icon><List /></el-icon>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip content="卡片视图" placement="bottom" :show-after="500">
            <el-radio-button value="card">
              <el-icon><Grid /></el-icon>
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="viewMode === 'list'" v-loading="loading" :data="recordPlanList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="编号" align="center" prop="id" width="100"/>
      <el-table-column label="计划名称" align="center" prop="name"/>
      <el-table-column prop="channelCount" label="关联设备" align="center"/>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag type="primary" v-if="scope.row.snap === 'ENABLE'">启用</el-tag>
          <el-tag type="primary" v-if="scope.row.snap === 'DEACTIVATE'">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center"/>
      <el-table-column prop="updateTime" label="更新时间" align="center"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template #default="scope">
          <el-button type="text" @click="handleLink(scope.row)">关联设备</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="card-view" v-loading="loading">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in recordPlanList" :key="item.id">
          <div class="device-card" :class="{ 'is-selected': item.checked }">
            <!-- 头部区域 -->
            <div class="card-header-area">
              <el-checkbox v-model="item.checked" @change="handleCardSelection" class="card-checkbox" />
              <div class="header-content">
                <el-icon class="header-icon"><VideoCamera /></el-icon>
                <h3 class="header-title" :title="item.name">{{ item.name }}</h3>
              </div>
              <el-tag :type="item.snap === 'ENABLE' ? 'success' : 'info'" size="small" class="header-tag">
                {{ item.snap === 'ENABLE' ? '启用' : '停用' }}
              </el-tag>
            </div>

            <!-- 信息区 -->
            <div class="card-info">
              <div class="info-tags">
                <span class="info-tag">
                  <span class="tag-label">ID</span>
                  <span class="tag-val">{{ item.id }}</span>
                </span>
                <span class="info-tag">
                  <span class="tag-label">设备数</span>
                  <span class="tag-val">{{ item.channelCount || 0 }}</span>
                </span>
              </div>

              <div class="info-channel">
                <span class="channel-label">创建时间</span>
                <span class="channel-val">{{ item.createTime }}</span>
              </div>

              <div class="info-footer">
                <span class="time-range">更新于 {{ item.updateTime }}</span>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="card-toolbar">
              <el-button type="primary" size="small" icon="Link" @click="handleLink(item)" class="btn-play">
                关联
              </el-button>
              <div class="toolbar-actions">
                <el-tooltip content="编辑">
                  <el-button type="primary" text bg size="small" icon="Edit" @click="handleUpdate(item)" />
                </el-tooltip>
                <el-tooltip content="删除">
                  <el-button type="danger" text bg size="small" icon="Delete" @click="handleDelete(item)" />
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改录像计划对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body draggable>
      <el-form ref="recordPlanRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入计划名称"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="ENABLE">启用</el-radio>
            <el-radio value="DEACTIVATE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <ByteWeekTimePicker v-model="byteTime" name="name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>


    <el-dialog title="关联设备" v-model="openLink" width="1000px" append-to-body draggable>
      <AssociatedSevice :planId="recordPlanRow.id" v-if="openLink"/>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="RecordPlan">
import type {RecordPlanQueryParams, ZlmRecordPlan} from "@/types/api/qs/recordPlan"
import ByteWeekTimePicker from "./byteWeekTimePicker.vue";
import AssociatedSevice from "./associatedDevice.vue";
import {addRecordPlan, delRecordPlan, getRecordPlan, listRecordPlan, updateRecordPlan} from "@/api/qs/recordPlan"
import {QsDevice} from "@/types/api";
import {List, Grid, VideoCamera} from '@element-plus/icons-vue'

const {proxy} = getCurrentInstance()

const recordPlanList = ref<ZlmRecordPlan[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const byteTime = ref("");
const id = ref(null);
const viewMode = ref<string>('card')


const openLink = ref(false);
const recordPlanRow = ref(null);

const data = reactive({
  form: {} as ZlmRecordPlan,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined,
  } as RecordPlanQueryParams,
  rules: {
    name: [{required: true, message: "请输入名称", trigger: "blur"}],
  }
})

const {queryParams, form, rules} = toRefs(data)

/** 查询录像计划列表 */
function getList() {
  loading.value = true
  listRecordPlan(queryParams.value).then(response => {
    recordPlanList.value = response.rows.map((item: any) => ({
      ...item,
      checked: ids.value.includes(item.id)
    }))
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  byteTime.value = ""
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    snap: "ENABLE",
    name: null,
    status: "ENABLE",
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("recordPlanRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection: ZlmRecordPlan[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 卡片视图多选框选中处理
function handleCardSelection() {
  const selectedItems = recordPlanList.value.filter(item => item.checked)
  ids.value = selectedItems.map(item => item.id!)
  single.value = selectedItems.length !== 1
  multiple.value = !selectedItems.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  byteTime.value = "";
  title.value = "添加录像计划"
}

/** 修改按钮操作 */
function handleUpdate(row: ZlmRecordPlan) {
  reset()
  const _id = row.id || ids.value[0]
  byteTime.value = "";
  getRecordPlan(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改录像计划"
    nextTick(() => {
      byteTime.value = plan2Byte(response.data.planItemList)
    })
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordPlanRef"].validate((valid: boolean) => {
    if (valid) {
      form.value.planItemList = byteTime2PlanList()
      if (form.value.id != null) {
        updateRecordPlan(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRecordPlan(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: ZlmRecordPlan) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除录像计划编号为"' + _ids + '"的数据项？').then(function () {
    return delRecordPlan(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {
  })
}

/**
 * 关联设备
 *
 * @param planList
 */
const handleLink = (row: QsDevice) => {
  recordPlanRow.value = row
  openLink.value = true
}

const byteTime2PlanList = () => {
  if (byteTime.value.length === 0) {
    return;
  }

  const DayTimes = 24 * 2;
  let planList = [];
  let week = 1;

  // 把 336 长度的 list 分成 7 组，每组 48 个
  for (let i = 0; i < byteTime.value.length; i += DayTimes) {
    let planArray = byteTime2Plan(byteTime.value.slice(i, i + DayTimes));
    if (!planArray || planArray.length === 0) {
      week++;
      continue;
    }
    for (let j = 0; j < planArray.length; j++) {
      planList.push({
        planId: id.value,
        start: planArray[j].start,
        stop: planArray[j].stop,
        weekDay: week,
      });
    }
    week++;
  }
  return planList;
};

const byteTime2Plan = (weekItem) => {
  let start = null;
  let stop = null;
  let result = [];

  for (let i = 0; i < weekItem.length; i++) {
    let item = weekItem[i];
    if (item === '1') { // 表示选中
      stop = i;
      if (start === null) {
        start = i;
      }
      if (i === weekItem.length - 1 && start != null && stop != null) {
        result.push({
          start: start,
          stop: stop,
        });
      }
    } else {
      if (stop !== null) {
        result.push({
          start: start,
          stop: stop,
        });
        start = null;
        stop = null;
      }
    }
  }
  return result;
};

const plan2Byte = (planList) => {
  let byte = "";
  let indexArray = {};

  for (let i = 0; i < planList.length; i++) {
    let weekDay = planList[i].weekDay;
    let index = planList[i].start;
    let endIndex = planList[i].stop;
    for (let j = index; j <= endIndex; j++) {
      indexArray["key_" + (j + (weekDay - 1) * 48)] = 1;
    }
  }

  for (let i = 0; i < 336; i++) {
    if (indexArray["key_" + i]) {
      byte += "1";
    } else {
      byte += "0";
    }
  }
  return byte;
};

getList()
</script>

<style lang="scss" scoped>
.view-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-switch :deep(.el-radio-group) {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  padding: 2px;
  box-shadow: none;
  border: none;
  display: flex;
}

.view-switch :deep(.el-radio-button) {
  margin: 0;
}

.view-switch :deep(.el-radio-button__inner) {
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  position: relative;
}

.view-switch :deep(.el-radio-button__inner:hover) {
  color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.08);
  transform: translateY(-1px);
}

.view-switch :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.view-switch :deep(.el-icon) {
  font-size: 16px;
  vertical-align: middle;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-switch :deep(.el-radio-button__inner:hover .el-icon) {
  transform: scale(1.1);
}

.view-switch :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner .el-icon) {
  transform: scale(1.15);
}

/* 卡片视图样式 */
.card-view {
  padding: 8px 0;
}

.device-card {
  position: relative;
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardFadeIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(16px);
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 8px rgba(0,0,0,0.04),
    0 8px 16px rgba(0,0,0,0.02);
}

.device-card:nth-child(1) { animation-delay: 0.04s; }
.device-card:nth-child(2) { animation-delay: 0.08s; }
.device-card:nth-child(3) { animation-delay: 0.12s; }
.device-card:nth-child(4) { animation-delay: 0.16s; }
.device-card:nth-child(5) { animation-delay: 0.20s; }
.device-card:nth-child(6) { animation-delay: 0.24s; }
.device-card:nth-child(7) { animation-delay: 0.28s; }
.device-card:nth-child(8) { animation-delay: 0.32s; }

@keyframes cardFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.device-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.05),
    0 12px 24px rgba(0,0,0,0.06),
    0 24px 48px rgba(0,0,0,0.04);
  border-color: rgba(64, 158, 255, 0.25);
}

.device-card.is-selected {
  border-color: rgba(64, 158, 255, 0.5);
  box-shadow: 
    0 0 0 3px rgba(64, 158, 255, 0.1),
    0 8px 24px -4px rgba(64, 158, 255, 0.2),
    0 4px 12px rgba(64, 158, 255, 0.1);
}

/* 头部区域（替代图片区） */
.card-header-area {
  position: relative;
  padding: 16px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-fill-color-lighter) 100%);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 64px;
}

.card-header-area .card-checkbox {
  position: relative;
  top: auto;
  left: auto;
  z-index: 2;
}

.card-header-area .card-checkbox :deep(.el-checkbox__inner) {
  border-radius: 6px;
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.header-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  flex-shrink: 0;
  animation: iconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 4px rgba(64, 158, 255, 0.3));
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.header-tag {
  flex-shrink: 0;
}

/* 信息区 */
.card-info {
  padding: 14px 16px 10px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 11.5px;
  line-height: 1.5;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.info-tag:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.type-tag {
  margin-left: auto;
}

.tag-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.tag-val {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

/* 通道/节点单独一行 */
.info-channel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
  transition: all 0.2s ease;
}

.info-channel:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.channel-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.channel-val {
  color: var(--el-text-color-primary);
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.info-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.time-range {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: right;
}

/* 操作栏 */
.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.btn-play {
  flex-shrink: 0;
  min-width: 72px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
  transition: all 0.3s ease;
}

.btn-play:not(:disabled):hover {
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-actions .el-button {
  padding: 7px 10px;
  height: auto;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toolbar-actions .el-button:hover {
  transform: scale(1.08);
}

/* 暗黑模式适配 */
html.dark {
  /* 卡片暗黑增强 */
  .device-card {
    box-shadow:
      0 1px 2px rgba(0,0,0,0.3),
      0 4px 8px rgba(0,0,0,0.25),
      0 8px 16px rgba(0,0,0,0.2);
  }

  .device-card:hover {
    box-shadow:
      0 4px 8px rgba(0,0,0,0.35),
      0 12px 24px rgba(0,0,0,0.3),
      0 24px 48px rgba(0,0,0,0.2);
    border-color: rgba(64, 158, 255, 0.35);
  }

  .device-card.is-selected {
    border-color: rgba(64, 158, 255, 0.6);
    box-shadow:
      0 0 0 3px rgba(64, 158, 255, 0.15),
      0 8px 24px -4px rgba(64, 158, 255, 0.25),
      0 4px 12px rgba(64, 158, 255, 0.15);
  }

  .card-header-area {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.12) 0%, var(--el-fill-color) 100%);
  }

  .info-tag,
  .info-channel {
    background: var(--el-fill-color);
    border-color: var(--el-border-color);
  }

  .info-tag:hover,
  .info-channel:hover {
    border-color: var(--el-color-primary-light-3);
    background: rgba(64, 158, 255, 0.08);
  }

  .card-toolbar {
    border-color: var(--el-border-color);
  }
}
</style>
