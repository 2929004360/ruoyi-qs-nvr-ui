<template>
  <el-form ref="userRef" :model="form" :rules="rules" label-width="90px">
    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入用户邮箱" maxlength="50" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
          </el-radio-group>
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
import { getCurrentInstance, reactive, ref, watch } from 'vue'
import { updateUserProfile } from '@/api/system/user'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  user: {
    type: Object
  }
})

const { proxy } = getCurrentInstance() as any

const form = ref<any>({})
const rules = reactive({
  nickName: [
    { required: true, message: '用户昵称不能为空', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phonenumber: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate((valid: boolean) => {
    if (valid) {
      updateUserProfile(form.value).then(() => {
        ElMessage.success('修改成功')
      })
    }
  })
}
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}

// 监听父组件传来的user对象
watch(() => props.user, (val: any) => {
  if (val) {
    form.value = {
      nickName: val.nickName,
      phonenumber: val.phonenumber,
      email: val.email,
      sex: val.sex
    }
  }
}, { immediate: true })
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
