<template>
  <div>
    <el-dialog title="添加选项" v-model="open" width="800px" :close-on-click-modal="false" :modal-append-to-body="false"
      @open="onOpen" @close="onClose" class="tree-node-dialog">
      <el-form ref="treeNodeForm" :model="formData" :rules="rules" label-width="100px">
        <el-col :span="24">
          <el-form-item label="选项名" prop="label">
            <el-input v-model="formData.label" placeholder="请输入选项名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="选项值" prop="value">
            <el-input v-model="formData.value" placeholder="请输入选项值" clearable>
              <template #append>
                <el-select v-model="dataType" :style="{ width: '100px' }">
                  <el-option v-for="(item, index) in dataTypeOptions" :key="index" :label="item.label" :value="item.value"
                    :disabled="item.disabled" />
                </el-select>
              </template>

            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handelConfirm">确 定</el-button>
          <el-button @click="onClose">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
const open = defineModel()
const emit = defineEmits(['commit'])
const formData = ref({
  label: undefined,
  value: undefined
})
const rules = {
  label: [
    {
      required: true,
      message: '请输入选项名',
      trigger: 'blur'
    }
  ],
  value: [
    {
      required: true,
      message: '请输入选项值',
      trigger: 'blur'
    }
  ]
}
const dataType = ref<string>('string')
const dataTypeOptions = ref<any[]>([
  {
    label: '字符串',
    value: 'string'
  },
  {
    label: '数字',
    value: 'number'
  }
])
const id = ref<number>(100)
const treeNodeForm = ref<any>()

function onOpen(): void {
  formData.value = {
    label: undefined,
    value: undefined
  }
}

function onClose(): void {
  if (open.value !== undefined) {
    open.value = false
  }
}

function handelConfirm(): void {
  treeNodeForm.value?.validate((valid: boolean) => {
    if (!valid) return
    if (dataType.value === 'number') {
      formData.value.value = parseFloat(String(formData.value.value))
    }
    formData.value.id = id.value++
    emit('commit', formData.value)
    onClose()
  })
}
</script>

<style lang="scss" scoped>
.tree-node-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    background: var(--el-bg-color-overlay);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);

    .el-dialog__header {
      margin-right: 0;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
    }

    .el-dialog__footer {
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-extra-light);
    }
  }
}
</style>
