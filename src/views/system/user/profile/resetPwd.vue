<template>
  <el-form ref="pwdRef" :model="form" :rules="rules" label-width="90px">
    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" placeholder="请输入旧密码" type="password" show-password />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" placeholder="请输入新密码" type="password" show-password />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" placeholder="请确认新密码" type="password" show-password />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item class="form-actions">
      <el-button type="primary" :icon="Check" @click="submit">保存</el-button>
      <el-button :icon="Close" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref } from 'vue'
import { updateUserPwd } from '@/api/system/user'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance() as any

const pwdRef = ref<any>(null)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const equalToPassword = (rule: any, value: any, callback: any) => {
  if (form.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive({
  oldPassword: [
    { required: true, message: '旧密码不能为空', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

/** 提交按钮 */
function submit() {
  pwdRef.value?.validate((valid: boolean) => {
    if (valid) {
      updateUserPwd(form.oldPassword, form.newPassword).then(() => {
        ElMessage.success('修改成功')
        form.oldPassword = ''
        form.newPassword = ''
        form.confirmPassword = ''
      })
    }
  })
}
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>

<style scoped lang="scss">
.form-actions {
  margin-top: 10px;
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    gap: 10px;
  }
}
</style>
