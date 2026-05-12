<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pic-404">
        <img class="pic-404__parent" src="@/assets/404_images/404.png" alt="404">
        <img class="pic-404__child left" src="@/assets/404_images/404_cloud.png" alt="404">
        <img class="pic-404__child mid" src="@/assets/404_images/404_cloud.png" alt="404">
        <img class="pic-404__child right" src="@/assets/404_images/404_cloud.png" alt="404">
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">
          404 错误
        </div>
        <div class="bullshit__headline">
          {{ message }}
        </div>
        <div class="bullshit__info">
          对不起，您正在寻找的页面不存在。尝试检查URL的错误，然后按浏览器上的刷新按钮或尝试在我们的应用程序中找到其他内容。
        </div>
        <router-link to="/index" class="bullshit__return-home">
          <el-icon><HomeFilled /></el-icon>
          <span>返回首页</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'

const message = computed(() => {
  return '找不到网页！'
})
</script>

<style lang="scss" scoped>
.wscn-http404-container {
  --err-primary: var(--el-color-primary, #409eff);
  --err-text-main: var(--el-text-color-primary, #303133);
  --err-text-regular: var(--el-text-color-regular, #606266);
  --err-text-secondary: var(--el-text-color-secondary, #909399);
  --err-transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  transform: translate(-50%, -50%);
  position: absolute;
  top: 42%;
  left: 50%;
  animation: containerFadeIn 0.5s ease-out;
}

.wscn-http404 {
  position: relative;
  width: 1200px;
  padding: 0 50px;
  overflow: hidden;

  .pic-404 {
    position: relative;
    float: left;
    width: 600px;
    overflow: hidden;

    &__parent {
      width: 100%;
      transition: var(--err-transition);

      &:hover {
        transform: scale(1.02);
      }
    }

    &__child {
      position: absolute;

      &.left {
        width: 80px;
        top: 17px;
        left: 220px;
        opacity: 0;
        animation: cloudLeft 2.5s linear forwards;
        animation-delay: 0.8s;
      }

      &.mid {
        width: 46px;
        top: 10px;
        left: 420px;
        opacity: 0;
        animation: cloudMid 2.5s linear forwards;
        animation-delay: 1s;
      }

      &.right {
        width: 62px;
        top: 100px;
        left: 500px;
        opacity: 0;
        animation: cloudRight 2.5s linear forwards;
        animation-delay: 0.8s;
      }
    }
  }

  .bullshit {
    position: relative;
    float: left;
    width: 320px;
    padding: 40px 0;
    overflow: hidden;

    &__oops {
      font-size: 36px;
      font-weight: 800;
      line-height: 44px;
      color: var(--err-primary);
      opacity: 0;
      margin-bottom: 24px;
      letter-spacing: -0.5px;
      animation: slideUp 0.6s ease-out forwards;
    }

    &__headline {
      font-size: 22px;
      line-height: 28px;
      color: var(--err-text-main);
      font-weight: 700;
      opacity: 0;
      margin-bottom: 14px;
      animation: slideUp 0.6s ease-out 0.1s forwards;
    }

    &__info {
      font-size: 14px;
      line-height: 24px;
      color: var(--err-text-secondary);
      opacity: 0;
      margin-bottom: 36px;
      animation: slideUp 0.6s ease-out 0.2s forwards;
    }

    &__return-home {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 130px;
      height: 42px;
      background: var(--err-primary);
      border-radius: 21px;
      text-align: center;
      color: #ffffff;
      opacity: 0;
      font-size: 14px;
      line-height: 42px;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
      animation: slideUp 0.6s ease-out 0.3s forwards;
      transition: var(--err-transition);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        filter: brightness(1.1);
      }

      &:active {
        transform: translateY(-1px);
      }

      .el-icon {
        font-size: 16px;
      }
    }
  }
}

/* 响应式适配 */
@media (max-width: 992px) {
  .wscn-http404 {
    width: auto !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .pic-404 {
      float: none;
      width: 100%;
      max-width: 500px;
    }

    .bullshit {
      float: none;
      width: 100%;
      padding: 30px 0;

      &__return-home {
        margin: 0 auto;
      }
    }
  }
}

@keyframes containerFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes cloudLeft {
  0% {
    top: 17px;
    left: 220px;
    opacity: 0;
  }
  20% {
    top: 33px;
    left: 188px;
    opacity: 1;
  }
  80% {
    top: 81px;
    left: 92px;
    opacity: 1;
  }
  100% {
    top: 97px;
    left: 60px;
    opacity: 0;
  }
}

@keyframes cloudMid {
  0% {
    top: 10px;
    left: 420px;
    opacity: 0;
  }
  20% {
    top: 40px;
    left: 360px;
    opacity: 1;
  }
  70% {
    top: 130px;
    left: 180px;
    opacity: 1;
  }
  100% {
    top: 160px;
    left: 120px;
    opacity: 0;
  }
}

@keyframes cloudRight {
  0% {
    top: 100px;
    left: 500px;
    opacity: 0;
  }
  20% {
    top: 120px;
    left: 460px;
    opacity: 1;
  }
  80% {
    top: 180px;
    left: 340px;
    opacity: 1;
  }
  100% {
    top: 200px;
    left: 300px;
    opacity: 0;
  }
}
</style>
