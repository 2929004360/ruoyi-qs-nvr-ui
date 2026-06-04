<template>
  <div class="app-container">
    <!-- 步骤条 -->
    <div class="step-bar">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="基础配置" />
        <el-step title="端口配置" />
        <el-step title="网络配置" />
      </el-steps>
    </div>

    <el-form ref="mediaServerFormRef" :model="form" :rules="rules" label-width="140px">
      <!-- 步骤 1：基础配置 -->
      <div class="step-panel" :class="{ 'is-active': activeStep === 0 }">
        <div class="form-group">
          <div class="group-title">
            <el-icon><InfoFilled /></el-icon>
            <span>基础配置</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="服务 IP" prop="ip">
                <el-input v-model="form.ip" placeholder="请输入服务器绑定的 IP 地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="HTTP 端口" prop="httpPort">
                <el-input v-model="form.httpPort" placeholder="请输入HTTP 协议端口" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="密钥" prop="secret">
                <el-input v-model="form.secret" placeholder="请输入密钥" show-password />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="服务类型" prop="type">
                <el-select v-model="form.type" style="width: 100%">
                  <el-option key="zlm" label="ZLMediaKit" value="zlm"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item>
                <el-button type="primary" @click="submitCheckMediaServerForm">
                  测试连接
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="step-actions">
          <el-button type="primary" @click="handleNext" v-if="isConnected">下一步</el-button>
          <el-button type="primary" disabled v-else>请先测试连接</el-button>
        </div>
      </div>

      <!-- 步骤 2：端口配置 -->
      <div class="step-panel" :class="{ 'is-active': activeStep === 1 }">
        <div class="form-group">
          <div class="group-title">
            <el-icon><Setting /></el-icon>
            <span>端口配置</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="RTMP 端口" prop="rtmpPort">
                <el-input v-model="form.rtmpPort" placeholder="请输入 RTMP 端口" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="RTMPS 端口" prop="rtmpSslPort">
                <el-input v-model="form.rtmpSslPort" placeholder="请输入 RTMPS 端口" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="HTTPS 端口" prop="httpSslPort">
                <el-input v-model="form.httpSslPort" placeholder="请输入 HTTPS 端口" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="录像管理端口" prop="recordAssistPort">
                <el-input v-model="form.recordAssistPort" placeholder="请输入录像管理端口" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="RTSP 端口" prop="rtspPort">
                <el-input v-model="form.rtspPort" placeholder="请输入 RTSP 端口" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="RTSPS 端口" prop="rtspSslPort">
                <el-input v-model="form.rtspSslPort" placeholder="请输入 RTSPS 端口" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="收流端口范围">
                <div class="port-range">
                  <el-input v-model="rtpPortRange1" placeholder="起始" @change="portRangeChange" clearable
                            :disabled="form.defaultServer"></el-input>
                  <span class="separator"></span>
                  <el-input v-model="rtpPortRange2" placeholder="终止" @change="portRangeChange" clearable
                            :disabled="form.defaultServer"></el-input>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="step-actions">
          <el-button @click="handlePrev">上一步</el-button>
          <el-button type="primary" @click="handleNext">下一步</el-button>
        </div>
      </div>

      <!-- 步骤 3：网络配置 -->
      <div class="step-panel" :class="{ 'is-active': activeStep === 2 }">
        <div class="form-group">
          <div class="group-title">
            <el-icon><Monitor /></el-icon>
            <span>网络配置</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="流 IP" prop="streamIp">
                <el-input v-model="form.streamIp" placeholder="请输入流 IP" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="HOOK IP" prop="hookIp">
                <el-input v-model="form.hookIp" placeholder="请输入 HOOK IP" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="SDP IP" prop="sdpIp">
                <el-input v-model="form.sdpIp" placeholder="请输入 SDP IP" clearable
                          :disabled="form.defaultServer"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="自动配置媒体服务">
                <el-switch v-model="form.autoConfig" :disabled="form.defaultServer"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="step-actions">
          <el-button @click="handlePrev">上一步</el-button>
          <el-button type="primary" @click="submitForm">提 交</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup name="AddMediaServer" lang="ts">
import {checkMediaServer, saveMediaServer} from "../../../api/qs/zlm.js";
import {MediaServer} from "@/types/api";
import {InfoFilled, Setting, Monitor} from '@element-plus/icons-vue';
import {nextTick} from "vue";

const {proxy} = getCurrentInstance();

const activeStep = ref(0);
const isConnected = ref(false);
const isUpdatingForm = ref(false); // 添加标志位

const rtpPortRange1 = ref(30000)
const rtpPortRange2 = ref(30500)
const sendRtpPortRange1 = ref(50000)
const sendRtpPortRange2 = ref(60000)

const isValidIp = (rule, value, callback) => {
  var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  if (!reg.test(value)) {
    return callback(new Error('请输入有效的IP地址'))
  } else {
    callback()
  }
  return true
}
const isValidPort = (rule, value, callback) => {
  var reg = /^(([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5]))$/
  if (!reg.test(value)) {
    return callback(new Error('请输入有效的端口号'))
  } else {
    callback()
  }
  return true
}

const data = reactive({
  form: {},
  rules: {
    ip: [{required: true, validator: isValidIp, message: '请输入有效的IP地址', trigger: 'blur'}],
    httpPort: [{required: true, validator: isValidPort, message: '请输入有效的端口号', trigger: 'blur'}],
    secret: [{required: true, message: "请输入secret", trigger: "blur"}],
  },
});

const {form, rules} = toRefs(data);

// 当 IP、端口或密钥发生变化时，重置连接状态
watch(() => form.value.ip, () => { 
  if (!isUpdatingForm.value) {
    isConnected.value = false; 
  }
});
watch(() => form.value.httpPort, () => { 
  if (!isUpdatingForm.value) {
    isConnected.value = false; 
  }
});
watch(() => form.value.secret, () => { 
  if (!isUpdatingForm.value) {
    isConnected.value = false; 
  }
});

function cancel() {
  reset();
  proxy.$tab.closeOpenPage({path: "/mediaServer"});
}

function reset() {
  activeStep.value = 0;
  isConnected.value = false;
  form.value = {
    id: null,
    ip: '',
    httpPort: '',
    secret: '',
    type: 'zlm',
    autoConfig: true,
    hookIp: null,
    sdpIp: null,
    streamIp: null,
    httpSslPort: null,
    recordAssistPort: null,
    rtmpPort: null,
    rtmpSslPort: null,
    rtpEnable: true,
    rtpPortRange: null,
    sendRtpPortRange: null,
    rtpProxyPort: null,
    rtspPort: null,
    rtspSslPort: null,
  } as MediaServer;
  rtpPortRange1.value = 30000
  rtpPortRange2.value = 30500
  sendRtpPortRange1.value = 50000
  sendRtpPortRange2.value = 60000
  proxy.resetForm("mediaServerFormRef");
}

const handleNext = () => {
  if (activeStep.value === 0) {
    proxy.$refs["mediaServerFormRef"].validateField(['ip', 'httpPort', 'secret']).then(() => {
      if (!isConnected.value) {
        proxy.$modal.msgWarning("请先测试连接");
        return;
      }
      activeStep.value++
    }).catch(() => {})
  } else if (activeStep.value < 2) {
    activeStep.value++
  }
}

const handlePrev = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

const submitCheckMediaServerForm = () => {
  proxy.$refs["mediaServerFormRef"].validateField(['ip', 'httpPort', 'secret']).then(() => {
    checkMediaServer(
        form.value.ip,
        form.value.httpPort,
        form.value.secret,
        form.value.type,
    ).then(response => {
      let httpPort = form.value.httpPort;
      
      // 设置标志位，防止 watch 重置 isConnected
      isUpdatingForm.value = true;
      
      // 使用 Object.assign 而不是直接替换整个对象
      Object.assign(form.value, response.data)
      form.value.httpPort = httpPort
      form.value.autoConfig = true
      form.value.rtpEnable = true
      rtpPortRange1.value = 30000
      rtpPortRange2.value = 30500
      sendRtpPortRange1.value = 50000
      sendRtpPortRange2.value = 60000
      // 确保设置 isConnected.value 为 true
      isConnected.value = true;
      
      // 延迟重置标志位，确保 watch 响应完成
      nextTick(() => {
        isUpdatingForm.value = false;
      });
      
      proxy.$modal.msgSuccess("该ZLMediaKit可用");
    }).catch(error => {
      console.error("测试连接失败:", error);
      proxy.$modal.msgError("测试连接失败，请检查配置");
    });
  }).catch(() => {
    // 表单验证失败，不做处理
  });
}

function portRangeChange() {
  if (form.value.rtpEnable) {
    form.value.rtpPortRange = rtpPortRange1.value + "," + rtpPortRange2.value
    form.value.sendRtpPortRange = sendRtpPortRange1.value + "," + sendRtpPortRange2.value
  }
}

function submitForm() {
  proxy.$refs["mediaServerFormRef"].validate(valid => {
    if (valid) {
      saveMediaServer(form.value).then(response => {
        proxy.$modal.msgSuccess("新增成功");
        cancel();
      })
    }
  })
}

onMounted(() => {
  reset();
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  animation: pageEnter 0.5s ease-out;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 步骤条 ===== */
.step-bar {
  margin-bottom: 24px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.03),
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.02);
  animation: cardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.step-bar :deep(.el-step__head.is-success),
.step-bar :deep(.el-step__title.is-success) {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.step-bar :deep(.el-step__head.is-process) {
  color: #fff;
  border-color: var(--el-color-primary);
}

.step-bar :deep(.el-step__head.is-process .el-step__icon) {
  background: var(--el-color-primary);
  box-shadow: 0 0 10px rgba(var(--el-color-primary-rgb), 0.4);
}

.step-bar :deep(.el-step__line-inner) {
  border-color: var(--el-color-primary);
  transition: all 0.3s ease;
}

/* ===== 步骤面板 ===== */
.step-panel {
  display: none;
  opacity: 0;
  transform: translateY(12px);
}

.step-panel.is-active {
  display: block;
  animation: stepEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes stepEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 玻璃卡片 ===== */
.form-group {
  margin-bottom: 0;
  padding: 24px 28px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.03),
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.02);
  animation: cardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s backwards;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.form-group:hover {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 16px 48px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== 分组标题 ===== */
.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  letter-spacing: 0.3px;

  .el-icon {
    color: var(--el-color-primary, #409eff);
    font-size: 18px;
    filter: drop-shadow(0 0 4px rgba(var(--el-color-primary-rgb), 0.25));
    animation: iconPulse 2.5s ease-in-out infinite;
  }
}

.group-title::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, var(--el-color-primary), #36cfc9);
  border-radius: 1px;
  opacity: 0.7;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 4px rgba(var(--el-color-primary-rgb), 0.2));
  }
  50% {
    transform: scale(1.15);
    filter: drop-shadow(0 0 8px rgba(var(--el-color-primary-rgb), 0.4));
  }
}

/* ===== 端口范围 ===== */
.port-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.separator {
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, var(--el-color-primary-light-5), var(--el-color-primary));
  border-radius: 1px;
  position: relative;
  flex-shrink: 0;
}

.separator::before,
.separator::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--el-color-primary);
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.separator::before { left: -1px; }
.separator::after { right: -1px; }

/* ===== 输入框 focus 光晕 ===== */
:deep(.el-input__wrapper) {
  transition: all 0.25s ease;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 10px rgba(var(--el-color-primary-rgb), 0.12);
}

/* ===== 步骤操作按钮 ===== */
.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
  animation: stepEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
}

.step-actions .el-button {
  min-width: 100px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 36px;
}

.step-actions .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.35);
}

.step-actions .el-button--primary:active {
  transform: translateY(0) scale(0.97);
}

.step-actions .el-button:not(.el-button--primary):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* ===== 测试连接按钮 ===== */
:deep(.el-form-item .el-button--primary) {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.el-form-item .el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.25);
}

/* ===== switch 优化 ===== */
:deep(.el-switch__core) {
  transition: all 0.3s ease;
}

/* ===== 暗黑模式 ===== */
html.dark {
  .step-bar {
    background: rgba(30, 30, 40, 0.55);
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    background: rgba(30, 30, 40, 0.55);
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .form-group:hover {
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.25),
      0 8px 24px rgba(0, 0, 0, 0.2),
      0 16px 48px rgba(0, 0, 0, 0.15);
  }

  .group-title {
    color: var(--el-text-color-primary, #e5eaf3);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .group-title::after {
    opacity: 0.9;
  }

  .separator {
    background: linear-gradient(90deg, var(--el-color-primary-light-3), var(--el-color-primary));
  }

  .separator::before,
  .separator::after {
    background: var(--el-color-primary-light-3);
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 12px rgba(var(--el-color-primary-rgb), 0.2);
  }
}
</style>
