<template>
  <div class="navbar" :class="'nav' + settingsStore.navType">
    <div class="navbar-left">
      <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
      <breadcrumb v-if="settingsStore.navType == 1" id="breadcrumb-container" class="breadcrumb-container" />
      <top-nav v-if="settingsStore.navType == 2" id="topmenu-container" class="topmenu-container" />
      <template v-if="settingsStore.navType == 3">
        <logo v-show="settingsStore.sidebarLogo" :collapse="false" />
        <top-bar id="topbar-container" class="topbar-container" />
      </template>
    </div>

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item hover-effect" />

        <el-tooltip content="源码地址" effect="dark" placement="bottom">
          <ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="文档地址" effect="dark" placement="bottom">
          <ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
        </el-tooltip>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <div class="theme-icon-wrapper" :class="{ 'is-dark': settingsStore.isDark }">
              <el-icon :size="18" class="theme-icon">
                <Sunny v-if="settingsStore.isDark" />
                <Moon v-else />
              </el-icon>
            </div>
          </div>
        </el-tooltip>

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="消息通知" effect="dark" placement="bottom">
          <header-notice id="header-notice" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item" trigger="hover">
        <div class="avatar-wrapper">
          <div class="avatar-ring">
            <img :src="userStore.avatar" class="user-avatar" />
            <span class="online-status" />
          </div>
          <span class="user-nickname">{{ userStore.nickName }}</span>
          <el-icon class="dropdown-arrow"><arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="navbar-dropdown-menu">
            <router-link to="/user/profile">
              <el-dropdown-item>
                <el-icon><user /></el-icon>
                <span>个人中心</span>
              </el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
              <el-icon><setting /></el-icon>
              <span>布局设置</span>
            </el-dropdown-item>
            <el-dropdown-item command="lockScreen">
              <el-icon><lock /></el-icon>
              <span>锁定屏幕</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><switch-button /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { ArrowDown, User, Setting, Lock, SwitchButton, Sunny, Moon } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import TopNav from '@/components/TopNav/index.vue'
import TopBar from './TopBar/index.vue'
import Logo from './Sidebar/Logo.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import RuoYiGit from '@/components/RuoYi/Git/index.vue'
import RuoYiDoc from '@/components/RuoYi/Doc/index.vue'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useLockStore from '@/store/modules/lock'
import useSettingsStore from '@/store/modules/settings'
import HeaderNotice from './HeaderNotice'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const lockStore = useLockStore()
const settingsStore = useSettingsStore()

function toggleSideBar(): void {
  appStore.toggleSideBar()
}

function handleCommand(command: string): void {
  switch (command) {
    case "setLayout":
      setLayout()
      break
    case "lockScreen":
      lockScreen()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout(): void {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout(): void {
  emits('setLayout')
}

function lockScreen() {
  const currentPath = route.fullPath
  lockStore.lockScreen(currentPath)
  router.push('/lock')
}

async function toggleTheme(event?: MouseEvent): Promise<void> {
  const x = event?.clientX || window.innerWidth / 2
  const y = event?.clientY || window.innerHeight / 2
  const wasDark = settingsStore.isDark

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isSupported = typeof (document as any).startViewTransition === 'function' && !isReducedMotion

  if (!isSupported) {
    settingsStore.toggleTheme()
    return
  }

  try {
    const transition = document.startViewTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      settingsStore.toggleTheme()
      await nextTick()
    })
    await transition.ready

    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
    document.documentElement.animate(
      {
        clipPath: !wasDark ? [...clipPath].reverse() : clipPath
      }, {
        duration: 650,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
        pseudoElement: !wasDark ? "::view-transition-old(root)" : "::view-transition-new(root)"
      }
    )
    await transition.finished
  } catch (error) {
    console.warn("View transition failed, falling back to immediate toggle:", error)
    settingsStore.toggleTheme()
  }
}
</script>

<style lang='scss' scoped>
.navbar {
  // 局部 CSS 变量，用于精细控制 Navbar 样式
  --navbar-border-color: transparent;
  --navbar-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  --navbar-item-hover-bg: rgba(64, 158, 255, 0.06);
  --navbar-item-active-bg: rgba(64, 158, 255, 0.08);
  --navbar-item-color: #606266;
  --navbar-icon-size: 18px;
  --navbar-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  html.dark & {
    --navbar-border-color: transparent;
    --navbar-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
    --navbar-item-hover-bg: rgba(64, 158, 255, 0.12);
    --navbar-item-active-bg: rgba(64, 158, 255, 0.15);
    --navbar-item-color: #e5e7eb;
  }

  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  border-bottom: 1px solid var(--navbar-border-color);
  box-shadow: var(--navbar-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 6px 0 0;

  .navbar-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 100%;
  }

  .hamburger-container {
    height: 100%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0 12px;
    border-radius: 8px;
    margin: 0 4px;
    transition: var(--navbar-transition);
    color: var(--navbar-item-color);

    &:hover {
      background: var(--navbar-item-hover-bg);
      transform: scale(1.02);
    }
  }

  .breadcrumb-container {
    flex-shrink: 0;
    animation: fadeInLeft 0.5s 0.1s both;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-left: 8px;
  }

  .right-menu {
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 4px;
    padding-right: 12px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      height: 36px;
      min-width: 36px;
      font-size: var(--navbar-icon-size);
      color: var(--navbar-item-color);
      border-radius: 10px;
      position: relative;
      transition: var(--navbar-transition);
      animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

      // 依次入场 stagger
      @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
          animation-delay: #{0.05 + $i * 0.04}s;
        }
      }

      &.hover-effect {
        cursor: pointer;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: var(--navbar-item-hover-bg);
          transform: scale(0.8);
          opacity: 0;
          transition: var(--navbar-transition);
          z-index: 0;
        }

        > * {
          position: relative;
          z-index: 1;
        }

        &:hover {
          color: var(--el-color-primary);

          &::before {
            transform: scale(1);
            opacity: 1;
          }

          .svg-icon,
          .el-icon {
            transform: translateY(-2px);
          }
        }
      }

      .svg-icon,
      .el-icon {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .svg-icon {
        width: var(--navbar-icon-size);
        height: var(--navbar-icon-size);
      }

      &.theme-switch-wrapper {
        .theme-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

          &.is-dark {
            transform: rotate(180deg);
          }
        }

        .theme-icon {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        &:active .theme-icon {
          transform: scale(0.85) rotate(15deg);
        }
      }

      // 通知铃铛动画在 HeaderNotice 组件内部实现
    }

    .avatar-container {
      margin-left: 6px;
      padding: 0 10px;
      border-radius: 10px;
      animation-delay: 0.45s;

      &:hover {
        background: var(--navbar-item-hover-bg);
      }

      .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 100%;
        cursor: pointer;

        .avatar-ring {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

          .user-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid var(--navbar-bg);
            object-fit: cover;
            display: block;
            background: var(--el-fill-color);
            transition: border-color 0.3s ease;
          }

          .online-status {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 10px;
            height: 10px;
            background: #67c23a;
            border: 2px solid var(--navbar-bg);
            border-radius: 50%;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        }

        .user-nickname {
          font-size: 14px;
          font-weight: 600;
          color: var(--navbar-text);
          transition: color 0.3s ease;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &:hover {
          .avatar-ring {
            transform: scale(1.08);
          }

          .dropdown-arrow {
            transform: translateY(2px);
          }
        }
      }
    }
  }
}

// nav3 特殊处理
.navbar.nav3 {
  .hamburger-container {
    display: none !important;
  }
}

// 下拉菜单全局样式增强
:global(.navbar-dropdown-menu.el-dropdown__menu) {
  border-radius: 12px;
  padding: 6px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-light);
  animation: dropdownFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;

  .el-dropdown-menu__item {
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    transition: all 0.2s ease;

    .el-icon {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      transition: color 0.2s ease;
    }

    &:hover {
      .el-icon {
        color: var(--el-color-primary);
      }
    }

    &.el-dropdown-menu__item--divided {
      margin: 6px 0;
      border-top: 1px solid var(--el-border-color-lighter);

      &::before {
        display: none;
      }
    }
  }
}

:global(html.dark .navbar-dropdown-menu.el-dropdown__menu) {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

// 动画定义
@keyframes navbarSlideDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.9);
  }
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
