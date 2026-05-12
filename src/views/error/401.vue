<template>
  <div class="errPage-container">
    <el-button :icon="ArrowLeft" class="pan-back-btn" type="primary" plain @click="back">
      返回
    </el-button>
    <el-row class="content-row" :gutter="40">
      <el-col :xs="24" :sm="12" class="text-col">
        <div class="text-wrapper">
          <h1 class="text-jumbo text-ginormous">
            401 错误
          </h1>
          <h2 class="text-subtitle">您没有访问权限！</h2>
          <p class="text-desc">对不起，您没有访问权限，请不要进行非法操作！您可以返回主页面</p>
          <div class="action-area">
            <router-link to="/">
              <el-button :icon="HomeFilled" type="primary" class="home-btn">
                回首页
              </el-button>
            </router-link>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" class="img-col">
        <div class="img-wrapper">
          <img :src="errGif" alt="无权限访问">
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, HomeFilled } from '@element-plus/icons-vue'
import errImage from "@/assets/401_images/401.gif"

const { proxy } = getCurrentInstance()

const errGif = ref<string>(errImage + "?" + +new Date())

function back(): void {
  if (proxy.$route.query.noGoBack) {
    proxy.$router.push({ path: "/" })
  } else {
    proxy.$router.go(-1)
  }
}
</script>

<style lang="scss" scoped>
.errPage-container {
  --err-primary: var(--el-color-primary, #409eff);
  --err-text-main: var(--el-text-color-primary, #303133);
  --err-text-regular: var(--el-text-color-regular, #606266);
  --err-bg: var(--el-bg-color, #ffffff);
  --err-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  width: 900px;
  max-width: 90%;
  margin: 80px auto;
  animation: fadeIn 0.6s ease-out;

  .pan-back-btn {
    margin-bottom: 40px;
    transition: var(--err-transition);

    &:hover {
      transform: translateX(-4px);
    }
  }

  .content-row {
    align-items: center;
  }

  .text-col {
    animation: slideInLeft 0.6s ease-out 0.1s both;
  }

  .text-wrapper {
    padding: 20px 0;
  }

  .text-jumbo {
    font-size: 72px;
    font-weight: 800;
    color: var(--err-primary);
    line-height: 1.1;
    margin: 0 0 16px;
    letter-spacing: -1px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    animation: pulseScale 2s ease-in-out infinite;
  }

  .text-subtitle {
    font-size: 28px;
    font-weight: 600;
    color: var(--err-text-main);
    margin: 0 0 16px;
    line-height: 1.4;
    animation: slideInLeft 0.5s ease-out 0.2s both;
  }

  .text-desc {
    font-size: 15px;
    line-height: 1.8;
    color: var(--err-text-regular);
    margin: 0 0 32px;
    max-width: 400px;
    animation: slideInLeft 0.5s ease-out 0.3s both;
  }

  .action-area {
    animation: slideInLeft 0.5s ease-out 0.4s both;

    .home-btn {
      height: 42px;
      padding: 0 28px;
      border-radius: 21px;
      font-size: 15px;
      transition: var(--err-transition);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }
    }
  }

  .img-col {
    text-align: center;
    animation: slideInRight 0.6s ease-out 0.2s both;
  }

  .img-wrapper {
    position: relative;

    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      transition: var(--err-transition);

      &:hover {
        transform: scale(1.03) rotate(1deg);
      }
    }
  }
}

@media (max-width: 768px) {
  .errPage-container {
    margin: 40px auto;

    .text-jumbo {
      font-size: 48px;
    }

    .text-subtitle {
      font-size: 22px;
    }

    .img-col {
      margin-top: 30px;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulseScale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
</style>
