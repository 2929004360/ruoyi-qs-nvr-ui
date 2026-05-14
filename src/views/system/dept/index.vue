<template>
   <div class="app-container page-fade-in">
      <transition name="search-slide">
         <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" class="search-card">
         <el-form-item label="部门名称" prop="deptName">
            <el-input
               v-model="queryParams.deptName"
               placeholder="请输入部门名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="部门状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>
      </transition>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:dept:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Check"
               @click="handleSaveSort"
               v-hasPermi="['system:dept:edit']"
            >保存排序</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Sort"
               @click="toggleExpandAll"
            >展开/折叠</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table
         v-if="refreshTable"
         v-loading="loading"
         :data="deptList"
         row-key="deptId"
         :default-expand-all="isExpandAll"
         :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
         class="dept-table"
      >
         <el-table-column prop="deptName" label="部门名称" width="260"></el-table-column>
         <el-table-column prop="orderNum" label="排序" width="200">
            <template #default="scope">
               <el-input-number v-model="scope.row.orderNum" controls-position="right" :min="0" style="width: 88px" />
            </template>
         </el-table-column>
         <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="200">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
               <template #default="scope">
                  <div class="table-actions">
                     <el-tooltip content="修改">
                        <el-button type="primary" text bg size="small" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="新增">
                        <el-button type="success" text bg size="small" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="删除" v-if="scope.row.parentId !== 0">
                        <el-button type="danger" text bg size="small" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']"></el-button>
                     </el-tooltip>
                  </div>
               </template>
            </el-table-column>
      </el-table>

      <!-- 添加或修改部门对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body draggable destroy-on-close class="glass-dialog dept-dialog">
         <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
            <el-row>
               <el-col :span="24" v-if="form.parentId !== 0">
                  <el-form-item label="上级部门" prop="parentId">
                     <el-tree-select
                        v-model="form.parentId"
                        :data="deptOptions"
                        :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                        value-key="deptId"
                        placeholder="选择上级部门"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="部门名称" prop="deptName">
                     <el-input v-model="form.deptName" placeholder="请输入部门名称" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="显示排序" prop="orderNum">
                     <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="负责人" prop="leader">
                     <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="联系电话" prop="phone">
                     <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="邮箱" prop="email">
                     <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="部门状态">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_normal_disable"
                           :key="dict.value"
                           :value="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup lang="ts" name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, updateDeptSort, listDeptExcludeChild } from "@/api/system/dept"
import type { SysDept, DeptQueryParams } from '@/types/api/system/dept'
import type { TreeSelect } from '@/types/api/common'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const deptList = ref<any[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const title = ref<string>("")
const deptOptions = ref<TreeSelect[]>([])
const isExpandAll = ref<boolean>(true)
const refreshTable = ref<boolean>(true)
const originalOrders = ref<Record<number, number>>({})

const data = reactive({
  form: {} as SysDept,
  queryParams: {
    deptName: undefined,
    status: undefined
  } as DeptQueryParams,
  rules: {
    parentId: [{ required: true, message: "上级部门不能为空", trigger: "blur" }],
    deptName: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询部门列表 */
function getList() {
  loading.value = true
  listDept(queryParams.value).then(response => {
    deptList.value = proxy.handleTree(response.data, "deptId")
    recordOriginalOrders(deptList.value)
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
  }
  proxy.resetForm("deptRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd(row?: SysDept) {
  reset()
  listDept().then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId")
  })
  if (row != undefined) {
    form.value.parentId = row.deptId
  }
  open.value = true
  title.value = "添加部门"
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 修改按钮操作 */
function handleUpdate(row: SysDept) {
  reset()
  listDeptExcludeChild(row.deptId!).then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId")
  })
  getDept(row.deptId!).then(response => {
    form.value = response.data!
    open.value = true
    title.value = "修改部门"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deptRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.deptId != undefined) {
        updateDept(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDept(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 递归记录原始排序 */
function recordOriginalOrders(list: SysDept[]) {
  list.forEach(item => {
    originalOrders.value[item.deptId] = item.orderNum
    if (item.children && item.children.length) {
      recordOriginalOrders(item.children)
    }
  })
}

/** 保存排序 */
function handleSaveSort() {
  const changedDeptIds: number[] = []
  const changedOrderNums: number[] = []
  const collectChanged = (list: SysDept[]) => {
    list.forEach(item => {
      if (String(originalOrders.value[item.deptId!]) !== String(item.orderNum)) {
        changedDeptIds.push(item.deptId!)
        changedOrderNums.push(item.orderNum!)
      }
      if (item.children && item.children.length) {
        collectChanged(item.children)
      }
    })
  }
  collectChanged(deptList.value)
  if (changedDeptIds.length === 0) {
   proxy.$modal.msgWarning("未检测到排序修改")
    return
  }
  updateDeptSort({ deptIds: changedDeptIds.join(","), orderNums: changedOrderNums.join(",") }).then(() => {
   proxy.$modal.msgSuccess("排序保存成功")
    recordOriginalOrders(deptList.value)
  })
}

/** 删除按钮操作 */
function handleDelete(row: SysDept) {
  proxy.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?').then(function() {
    return delDept(row.deptId!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>


<style lang="scss" scoped>
.page-fade-in {
  animation: pageFadeIn 0.5s ease both;
}

.search-card {
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 10px;
  padding: 16px 20px 0;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border-color: var(--el-border-color-light);
  }

  :deep(.el-input__wrapper),
  :deep(.el-select .el-input__wrapper) {
    transition: box-shadow 0.25s ease;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
    }
  }

  .el-button {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: translateY(-2px);

      .el-icon {
        transform: rotate(-10deg) scale(1.1);
      }
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }
  }
}

.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top center;
}

.search-slide-enter-from,
.search-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.mb8 {
  align-items: center;

  .el-button {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }

    &:active {
      transform: translateY(0) scale(0.97);
    }
  }
}

.dept-table {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  :deep(.el-table__row) {
    animation: fadeInUp 0.4s ease both;

    @for $i from 1 through 30 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 0.04s;
      }
    }

    td {
      transition: background-color 0.2s ease;
    }

    &:hover td {
      background-color: var(--el-fill-color-light) !important;
    }
  }

  :deep(.el-table__expand-icon) {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: scale(1.2);
      color: var(--el-color-primary);
    }
  }

  :deep(.el-table__expand-icon--expanded) {
    transform: rotate(90deg);

    &:hover {
      transform: rotate(90deg) scale(1.2);
    }
  }

  :deep(.el-input-number) {
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  :deep(.dict-tag) {
    display: inline-block;
    transition: transform 0.25s ease;

    &:hover {
      transform: scale(1.08);
    }
  }

  .op-btn {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);

      .el-icon {
        transform: rotate(-8deg) scale(1.15);
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .op-btn-del {
    &:hover {
      color: var(--el-color-danger);

      .el-icon {
        animation: shake 0.4s ease both;
      }
    }
  }
}

.dept-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    background: var(--el-bg-color-overlay);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    animation: dialogScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;

    .el-dialog__header {
      margin-right: 0;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      font-weight: 600;
    }

    .el-dialog__body {
      padding: 20px 24px 8px;
    }

    .el-dialog__footer {
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-extra-light);

      .el-button {
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

        &:hover {
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0) scale(0.97);
        }
      }
    }
  }

  :deep(.el-form-item) {
    transition: all 0.2s ease;

    &:hover {
      .el-form-item__label {
        color: var(--el-color-primary);
      }
    }

    .el-input__wrapper,
    .el-textarea__inner {
      transition: box-shadow 0.25s ease;

      &.is-focus,
      &:focus {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
      }
    }
  }
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes dialogScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0);
  }
  20% {
    transform: rotate(-12deg);
  }
  40% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(-8deg);
  }
  80% {
    transform: rotate(6deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
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

.table-actions .el-button--danger,
.table-actions .el-button--danger[text],
.table-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.table-actions .el-button--success,
.table-actions .el-button--success[text],
.table-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}
</style>
