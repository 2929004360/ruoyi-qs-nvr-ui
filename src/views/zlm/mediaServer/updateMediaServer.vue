<template>
  <div class="app-container">
    <el-form ref="mediaServerFormRef" :model="form" :rules="rules" label-width="140px">
      <!-- 基础配置 -->
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
      </div>

      <!-- 端口配置 -->
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
                <span class="separator">-</span>
                <el-input v-model="rtpPortRange2" placeholder="终止" @change="portRangeChange" clearable
                          :disabled="form.defaultServer"></el-input>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 网络配置 -->
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

      <!-- 操作按钮 -->
      <div class="form-buttons">
        <el-button type="primary" @click="submitForm">
          提 交
        </el-button>
        <el-button @click="cancel">
          取 消
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup name="UpdateMediaServer" lang="ts">
import {getMediaServer, saveMediaServer} from "../../../api/qs/zlm.js";
import {useRoute} from "vue-router";
import {MediaServer} from "@/types/api";
import {InfoFilled, Setting, Monitor} from '@element-plus/icons-vue';

const route = useRoute();
const {proxy} = getCurrentInstance();

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

function cancel() {
  reset();
  proxy.$tab.closeOpenPage({path: "/mediaServer"});
}

function reset() {
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
        proxy.$modal.msgSuccess("保存成功");
        cancel();
      })
    }
  })
}

onMounted(() => {
  let id = route.query && route.query.id;
  reset();
  getMediaServer(id).then(response => {
    form.value = response.data
    if (form.value.rtpPortRange) {
      rtpPortRange1.value = parseInt(form.value.rtpPortRange.split(",")[0])
      rtpPortRange2.value = parseInt(form.value.rtpPortRange.split(",")[1])
    }
  })
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.form-group {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);

  &:last-of-type {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  margin-bottom: 20px;

  .el-icon {
    color: var(--el-color-primary, #409eff);
    font-size: 16px;
  }
}

.port-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.separator {
  color: var(--el-text-color-secondary, #909399);
  font-weight: 500;
}

.form-buttons {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

html.dark {
  .form-group {
    border-bottom-color: var(--el-border-color-lighter, #303030);
  }

  .group-title {
    color: var(--el-text-color-primary, #ffffff);
  }

  .separator {
    color: var(--el-text-color-secondary, #909399);
  }
}
</style>
