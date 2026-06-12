<template>
  <div class="app-container">
    <div class="search-box">
      <!-- 查询表单 -->
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
        class="query-form"
      >
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
        <el-form-item class="form-actions">
          <div class="button-group">
            <el-button type="primary" icon="Search" @click="handleQuery" class="search-btn">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery" class="reset-btn">重置</el-button>
          </div>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区 -->
      <el-row :gutter="10" class="mb8 toolbar-row action-buttons">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            class="action-btn add-btn"
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
            class="action-btn edit-btn"
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
            class="action-btn delete-btn"
          >删除
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" v-model:viewMode="viewMode" :showViewSwitch="true" @queryTable="getList"></right-toolbar>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div v-if="viewMode === 'list'" class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="recordPlanList"
        @selection-change="handleSelectionChange"
        class="custom-table"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" align="center" fixed/>
        <el-table-column label="编号" align="center" prop="id" width="70">
          <template #default="scope">
            <span class="id-badge">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计划名称" align="center" prop="name"/>
        <el-table-column prop="channelCount" label="关联设备" align="center"/>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="ENABLE"
              inactive-value="DEACTIVATE"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center"/>
        <el-table-column prop="updateTime" label="更新时间" align="center"/>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <div class="table-actions">
              <el-tooltip content="关联设备">
                <el-button type="success" text bg size="small" icon="Link" @click="handleLink(scope.row)" />
              </el-tooltip>
              <el-tooltip content="修改">
                <el-button type="primary" text bg size="small" icon="Edit" @click="handleUpdate(scope.row)" />
              </el-tooltip>
              <el-tooltip content="删除">
                <el-button type="danger" text bg size="small" icon="Delete" @click="handleDelete(scope.row)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="card-view" v-loading="loading">
      <el-row :gutter="16" v-if="recordPlanList.length > 0">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in recordPlanList" :key="item.id">
          <div class="device-card" :class="{ 'is-selected': item.checked }">
            <!-- 头部区域 -->
            <div class="card-header-area">
              <el-checkbox v-model="item.checked" @change="handleCardSelection" class="card-checkbox" />
              <div class="header-content">
                <el-icon class="header-icon"><VideoCamera /></el-icon>
                <h3 class="header-title" :title="item.name">{{ item.name }}</h3>
              </div>
              <el-switch
                v-model="item.status"
                active-value="ENABLE"
                inactive-value="DEACTIVATE"
                @change="handleStatusChange(item)"
                size="small"
                class="header-switch"
              />
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
      <el-empty v-else description="暂无录像计划数据" />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </div>

    <!-- 添加或修改录像计划对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body draggable destroy-on-close class="glass-dialog record-plan-dialog">
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


    <el-dialog title="关联设备" v-model="openLink" width="1000px" append-to-body draggable destroy-on-close class="glass-dialog link-dialog">
      <AssociatedSevice :planId="recordPlanRow.id" v-if="openLink"/>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="RecordPlan">
import type {RecordPlanQueryParams, ZlmRecordPlan} from "@/types/api/qs/recordPlan"
import ByteWeekTimePicker from "./byteWeekTimePicker.vue"
import AssociatedSevice from "./associatedDevice.vue"
import {addRecordPlan, delRecordPlan, getRecordPlan, listRecordPlan, updateRecordPlan, changeRecordPlanStatus} from "@/api/qs/recordPlan"
import {QsDevice} from "@/types/api"
import {List, Grid, VideoCamera, Link} from '@element-plus/icons-vue'

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

const handleStatusChange = (row: ZlmRecordPlan) => {
  const text = row.status === "ENABLE" ? "启用" : "停用"
  proxy.$modal.confirm('确认要"' + text + '"该录像计划吗?').then(function () {
    return changeRecordPlanStatus(row.id!, row.status!)
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功")
  }).catch(function () {
    row.status = row.status === "DEACTIVATE" ? "ENABLE" : "DEACTIVATE"
  })
};

getList()
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

.form-actions {
  margin-left: auto !important;
  margin-right: 0 !important;
  padding-left: 16px;
  border-left: 1px solid var(--el-border-color-lighter);
  margin-left: 12px !important;
}

.button-group {
  display: flex;
  gap: 12px;
}

.search-btn {
  transition: all 0.3s;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--el-color-primary-light-7);
}

.search-btn:active {
  transform: translateY(0);
}

.reset-btn {
  transition: all 0.3s;
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.reset-btn:active {
  transform: translateY(0);
}

/* ===== 工具栏样式优化 ===== */
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
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.action-btn:not(:disabled):active {
  transform: translateY(0);
}

.add-btn:hover {
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.35);
}

.edit-btn:hover {
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.35);
}

.delete-btn:hover {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.35);
}

/* ===== 卡片视图按钮样式 - 白色图标 ===== */
/* 操作按钮 - 强制覆盖 text bg 样式 */
.toolbar-actions .el-button--primary,
.toolbar-actions .el-button--primary[text],
.toolbar-actions .el-button--primary[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}

.toolbar-actions .el-button--danger,
.toolbar-actions .el-button--danger[text],
.toolbar-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.toolbar-actions .el-button .el-icon {
  color: #ffffff !important;
}

/* 悬停时稍微浅一点 */
.toolbar-actions .el-button--primary:hover,
.toolbar-actions .el-button--primary[text]:hover,
.toolbar-actions .el-button--primary[text][bg]:hover {
  background-color: var(--el-color-primary-light-3) !important;
  border-color: var(--el-color-primary-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--primary:hover .el-icon {
  color: #ffffff !important;
}

.toolbar-actions .el-button--danger:hover,
.toolbar-actions .el-button--danger[text]:hover,
.toolbar-actions .el-button--danger[text][bg]:hover {
  background-color: var(--el-color-danger-light-3) !important;
  border-color: var(--el-color-danger-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--danger:hover .el-icon {
  color: #ffffff !important;
}

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
  background: var(--el-fill-color-light);
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

.header-switch {
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

/* 表格容器优化 */
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

/* 分页优化 */
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

.pagination-wrapper {
  margin-top: 16px;
  padding: 8px 0;
}

/* ========== 表格操作按钮 ========== */
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

/* 悬停效果 - 保持白色图标 */
.table-actions .el-button--primary:hover,
.table-actions .el-button--primary[text]:hover,
.table-actions .el-button--primary[text][bg]:hover {
  background-color: var(--el-color-primary-light-3) !important;
  border-color: var(--el-color-primary-light-3) !important;
  color: #ffffff !important;
}

.table-actions .el-button--primary:hover .el-icon {
  color: #ffffff !important;
}

.table-actions .el-button--success:hover,
.table-actions .el-button--success[text]:hover,
.table-actions .el-button--success[text][bg]:hover {
  background-color: var(--el-color-success-light-3) !important;
  border-color: var(--el-color-success-light-3) !important;
  color: #ffffff !important;
}

.table-actions .el-button--success:hover .el-icon {
  color: #ffffff !important;
}

.table-actions .el-button--danger:hover,
.table-actions .el-button--danger[text]:hover,
.table-actions .el-button--danger[text][bg]:hover {
  background-color: var(--el-color-danger-light-3) !important;
  border-color: var(--el-color-danger-light-3) !important;
  color: #ffffff !important;
}

.table-actions .el-button--danger:hover .el-icon {
  color: #ffffff !important;
}

/* 暗黑模式适配 */
html.dark {
  .query-form {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .table-wrapper {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .table-wrapper:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3);
  }

  .custom-table :deep(.el-table__header-wrapper th) {
    background-color: var(--el-bg-color-overlay) !important;
  }

  .custom-table :deep(.el-table__row:hover) {
    background-color: #0c2a5e !important;
  }

  .custom-table :deep(.el-table__cell),
  .custom-table :deep(.el-table__cell *),
  .custom-table :deep(.el-link),
  .custom-table :deep(.el-link *),
  .custom-table :deep(.el-text),
  .custom-table :deep(.el-text *) {
    color: #ffffff !important;
  }

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

/* ========== 玻璃对话框效果 ========== */
:deep(.glass-dialog.record-plan-dialog .el-dialog),
:deep(.glass-dialog.link-dialog .el-dialog) {
  border-radius: 20px;
  background: var(--el-bg-color-page);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: var(--el-box-shadow-lighter);
  overflow: hidden;
  animation: dialogEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 头部 */
:deep(.glass-dialog.record-plan-dialog .el-dialog__header),
:deep(.glass-dialog.link-dialog .el-dialog__header) {
  padding: 20px 24px 16px;
  margin-right: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
}

:deep(.glass-dialog.record-plan-dialog .el-dialog__header::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
  border-radius: 2px;
  opacity: 0.6;
}

:deep(.glass-dialog.record-plan-dialog .el-dialog__title),
:deep(.glass-dialog.link-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.3px;
}

:deep(.glass-dialog.record-plan-dialog .el-dialog__headerbtn),
:deep(.glass-dialog.link-dialog .el-dialog__headerbtn) {
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.glass-dialog.record-plan-dialog .el-dialog__headerbtn .el-dialog__close),
:deep(.glass-dialog.link-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: var(--el-text-color-secondary);
  font-size: 18px;
  transition: all 0.2s ease;
}

:deep(.glass-dialog.record-plan-dialog .el-dialog__headerbtn:hover),
:deep(.glass-dialog.link-dialog .el-dialog__headerbtn:hover) {
  background: var(--el-fill-color-light);
  transform: rotate(90deg) scale(1.1);
}

:deep(.glass-dialog.record-plan-dialog .el-dialog__headerbtn:hover .el-dialog__close),
:deep(.glass-dialog.link-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: var(--el-color-primary);
}

/* 内容区 */
:deep(.glass-dialog.record-plan-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.glass-dialog.link-dialog .el-dialog__body) {
  padding: 20px 24px;
}

/* 底部 */
:deep(.glass-dialog.record-plan-dialog .el-dialog__footer),
:deep(.glass-dialog.link-dialog .el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 表单内容 stagger 入场动画 */
:deep(.glass-dialog.record-plan-dialog .el-form-item) {
  animation: formItemEnter 0.35s ease-out backwards;
}
:deep(.glass-dialog.record-plan-dialog .el-form-item:nth-child(1)) { animation-delay: 0.06s; }
:deep(.glass-dialog.record-plan-dialog .el-form-item:nth-child(2)) { animation-delay: 0.12s; }
:deep(.glass-dialog.record-plan-dialog .el-form-item:nth-child(3)) { animation-delay: 0.18s; }

@keyframes formItemEnter {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 按钮效果 */
:deep(.glass-dialog.record-plan-dialog .dialog-footer .el-button),
:deep(.glass-dialog.link-dialog .dialog-footer .el-button) {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 80px;
}

:deep(.glass-dialog.record-plan-dialog .dialog-footer .el-button:hover),
:deep(.glass-dialog.link-dialog .dialog-footer .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.25);
}

:deep(.glass-dialog.record-plan-dialog .dialog-footer .el-button:active),
:deep(.glass-dialog.link-dialog .dialog-footer .el-button:active) {
  transform: translateY(0) scale(0.97);
}

/* ========== 暗黑模式对话框 ========== */
html.dark :deep(.glass-dialog.record-plan-dialog .el-dialog),
html.dark :deep(.glass-dialog.link-dialog .el-dialog) {
  background: var(--el-bg-color-page);
  border-color: var(--el-border-color);
  box-shadow: var(--el-box-shadow-dark);
}

html.dark :deep(.glass-dialog.record-plan-dialog .el-dialog__header),
html.dark :deep(.glass-dialog.link-dialog .el-dialog__header) {
  border-bottom-color: var(--el-border-color);
}

html.dark :deep(.glass-dialog.record-plan-dialog .el-dialog__header::after) {
  opacity: 0.8;
}

html.dark :deep(.glass-dialog.record-plan-dialog .el-dialog__footer),
html.dark :deep(.glass-dialog.link-dialog .el-dialog__footer) {
  border-top-color: var(--el-border-color);
}

html.dark :deep(.glass-dialog.record-plan-dialog .el-dialog__headerbtn:hover),
html.dark :deep(.glass-dialog.link-dialog .el-dialog__headerbtn:hover) {
  background: var(--el-fill-color);
}
</style>
