<template>
  <div class="login">
    <!-- 背景动画层 -->
    <div class="bg-layers">
      <div class="bg-gradient"></div>
      <div class="bg-grid-wrap">
        <div class="bg-grid"></div>
      </div>
      <div class="bg-scanline"></div>
      <div class="bg-scanline-secondary"></div>
      <div class="bg-signals">
        <div class="signal-dot"
             v-for="i in 16"
             :key="i"
             :style="getSignalStyle(i)">
        </div>
      </div>
      <div class="bg-rec">
        <span class="rec-dot"></span>
        <span class="rec-text">REC</span>
        <span class="rec-time">{{ recTime }}</span>
      </div>
      <div class="bg-crosshair">
        <div class="crosshair-h"></div>
        <div class="crosshair-v"></div>
        <div class="crosshair-ring"></div>
      </div>
      <div class="bg-vignette"></div>
    </div>

    <!-- 登录表单 -->
    <div class="form-container">
      <div class="form-content">
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <h3 class="title form-anim" style="animation-delay: 0.1s;">
          {{ title }}
        </h3>
        <el-form-item prop="username" class="form-anim" style="animation-delay: 0.2s;">
          <el-input
            v-model="loginForm.username"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="账号"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" class="form-anim" style="animation-delay: 0.3s;">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled" class="form-anim" style="animation-delay: 0.4s;">
          <el-input
            v-model="loginForm.code"
            size="large"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" class="login-code-img"/>
          </div>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" class="form-anim" style="margin:0px 0px 25px 0px; animation-delay: 0.5s;">记住密码</el-checkbox>
        <el-form-item class="form-anim" style="width:100%; animation-delay: 0.6s;">
          <el-button
            :loading="loading"
            size="large"
            type="primary"
            class="login-btn"
            style="width:100%;"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right;" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form-item>
      </el-form>
      </div>
    </div>

    <!-- 底部 -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'
import type { CaptchaInfoResult } from '@/types/api/login'
import type { LoginForm } from '@/types/api/login'
import { onMounted, onBeforeUnmount } from 'vue'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

// 录制时间
const recTime = ref('00:00:00')
let recTimer: number | null = null

onMounted(() => {
  let seconds = 0
  recTimer = window.setInterval(() => {
    seconds++
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    recTime.value = `${h}:${m}:${s}`
  }, 1000)
})

onBeforeUnmount(() => {
  if (recTimer) clearInterval(recTimer)
})

// 信号点样式
function getSignalStyle(index: number) {
  const positions = [
    [10, 20], [30, 80], [50, 15], [70, 60], [85, 35],
    [15, 50], [40, 10], [60, 85], [80, 45], [25, 65],
    [55, 25], [75, 75], [35, 40], [45, 90], [90, 55], [5, 70]
  ]
  const pos = positions[(index - 1) % positions.length]
  const isRed = index % 5 === 0
  return {
    top: pos[0] + '%',
    left: pos[1] + '%',
    animationDelay: (index * 0.15) + 's',
    animationDuration: (2 + (index % 4) * 0.5) + 's',
    backgroundColor: isRed ? 'rgba(255, 77, 79, 0.6)' : 'rgba(64, 158, 255, 0.5)',
    boxShadow: isRed ? '0 0 6px rgba(255, 77, 79, 0.4)' : '0 0 6px rgba(64, 158, 255, 0.3)'
  }
}

const loginForm = ref<LoginForm>({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false)
const redirect = ref<string | undefined>(undefined)

watch(route, (newRoute: any) => {
    redirect.value = (newRoute.query && newRoute.query.redirect) as string | undefined
}, { immediate: true })

function handleLogin(): void {
  proxy.$refs.loginRef.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc: Record<string, any>, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode(): void {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie(): void {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #070a12;
}

/* ========== 背景动画层 ========== */
.bg-layers {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* 径向渐变背景 */
.bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(64, 158, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(54, 207, 201, 0.04) 0%, transparent 50%),
    #070a12;
}

/* 3D 网格地面 */
.bg-grid-wrap {
  position: absolute;
  bottom: -30%;
  left: -50%;
  width: 200%;
  height: 100%;
  perspective: 800px;
  overflow: hidden;
}

.bg-grid {
  width: 100%;
  height: 200%;
  background-image:
    linear-gradient(rgba(64, 158, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 158, 255, 0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  transform: rotateX(60deg);
  transform-origin: center top;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: rotateX(60deg) translateY(0); }
  100% { transform: rotateX(60deg) translateY(60px); }
}

/* 主扫描线 */
.bg-scanline {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(64, 158, 255, 0.4) 50%, transparent 100%);
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.3), 0 0 60px rgba(64, 158, 255, 0.1);
    animation: scanMove 5s ease-in-out infinite;
  }
}

@keyframes scanMove {
  0%, 100% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* 次扫描线 */
.bg-scanline-secondary {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(64, 158, 255, 0.15) 50%, transparent 100%);
    animation: scanMoveSecondary 8s ease-in-out infinite;
    animation-delay: 2s;
  }
}

@keyframes scanMoveSecondary {
  0%, 100% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* 信号点 */
.bg-signals {
  position: absolute;
  inset: 0;
}

.signal-dot {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  animation: signalPulse 2s ease-in-out infinite;
}

@keyframes signalPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.8); }
}

/* 录制指示 */
.bg-rec {
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
  font-family: 'Courier New', monospace;

  .rec-dot {
    width: 10px;
    height: 10px;
    background: #ff4d4f;
    border-radius: 50%;
    animation: recPulse 2s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(255, 77, 79, 0.6);
  }

  .rec-text {
    color: rgba(255, 77, 79, 0.8);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  .rec-time {
    color: rgba(255, 255, 255, 0.3);
    font-size: 13px;
    letter-spacing: 1px;
  }
}

@keyframes recPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

/* 十字准星 */
.bg-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  pointer-events: none;
  opacity: 0.06;
  animation: crosshairBreathe 4s ease-in-out infinite;

  .crosshair-h {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.8), transparent);
  }

  .crosshair-v {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgba(64, 158, 255, 0.8), transparent);
  }

  .crosshair-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 1px solid rgba(64, 158, 255, 0.5);
    border-radius: 50%;

    &::before, &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 1px solid rgba(64, 158, 255, 0.3);
      border-radius: 50%;
    }

    &::before { width: 140px; height: 140px; }
    &::after { width: 180px; height: 180px; }
  }
}

@keyframes crosshairBreathe {
  0%, 100% { opacity: 0.04; }
  50% { opacity: 0.1; }
}

/* 暗角 */
.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

/* ========== 登录表单 ========== */
.form-container {
  position: relative;
  z-index: 1;
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.glow-border {
  position: relative;
  border-radius: 18px;
}

@keyframes rotateAngle {
  to { --angle: 360deg; }
}

.form-content {
  position: relative;
  z-index: 1;
  border-radius: 16px;
  width: 400px;
  padding: 40px 35px 25px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.form-glow {
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.5), transparent);
  filter: blur(2px);
}

.login-form {
  width: 100%;
}

.title {
  margin: 0 auto 36px auto;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #e8ecf1;
  letter-spacing: 3px;
}

@keyframes titleDotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

.input-icon {
  height: 39px;
  width: 14px;
  margin-left: 0px;
}

/* 输入框 */
.login-form :deep(.el-input__wrapper) {
  --el-input-bg-color: rgba(255, 255, 255, 0.04);
  --el-input-border-color: rgba(255, 255, 255, 0.08);
  --el-input-hover-border-color: rgba(64, 158, 255, 0.4);
  --el-input-focus-border-color: var(--el-color-primary);
  border-radius: 10px;

  &.is-focus {
    --el-input-bg-color: rgba(255, 255, 255, 0.08);
  }
}

.login-form :deep(.el-input__inner) {
  color: #e2e8f0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
}

/* 表单元素错开入场动画 */
.form-anim {
  opacity: 0;
  animation: formItemEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes formItemEnter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 输入框底部流光 */
.login-form :deep(.el-input) {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--el-color-primary), #36cfc9, transparent);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: translateX(-50%);
    border-radius: 1px;
    pointer-events: none;
    z-index: 2;
  }

  &:hover::after,
  &:has(.el-input__wrapper.is-focus)::after {
    width: 90%;
  }
}

/* 登录按钮 */
.login-form .el-button--primary {
  border-radius: 10px;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  background: var(--el-color-primary);
  border: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.35);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.45);
    filter: brightness(1.1);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  /* loading 时的流光扫描 */
  &.is-loading {
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      animation: btnLoadingScan 1.5s ease-in-out infinite;
    }
  }
}

@keyframes btnLoadingScan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes formEnter {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

:deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.link-type {
  color: var(--el-color-primary);
  font-size: 13px;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.login-code-img {
  height: 40px;
  padding-left: 12px;
  border-radius: 8px;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 2px;
  z-index: 1;
}

/* ========== 暗黑模式适配 ========== */
html.dark {
  .login {
    background: #050810;
  }

  .bg-gradient {
    background:
      radial-gradient(ellipse at 20% 50%, rgba(64, 158, 255, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(54, 207, 201, 0.05) 0%, transparent 50%),
      #050810;
  }

  .bg-grid {
    background-image:
      linear-gradient(rgba(64, 158, 255, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(64, 158, 255, 0.08) 1px, transparent 1px);
  }

  .form-content {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 20px 50px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .glow-border:hover .corner {
    border-color: rgba(64, 158, 255, 0.6);
  }

  .title {
    color: #f1f5f9;
  }

  .login-form :deep(.el-input__wrapper) {
    --el-input-bg-color: rgba(255, 255, 255, 0.03);
    --el-input-border-color: rgba(255, 255, 255, 0.06);

    &.is-focus {
      --el-input-bg-color: rgba(255, 255, 255, 0.06);
      box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 20px rgba(64, 158, 255, 0.2);
    }
  }

  .login-form :deep(.el-input__inner) {
    color: #f1f5f9;

    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.el-checkbox__label) {
    color: rgba(255, 255, 255, 0.4);
  }

  .el-login-footer {
    color: #ffffff;
  }
}
</style>
