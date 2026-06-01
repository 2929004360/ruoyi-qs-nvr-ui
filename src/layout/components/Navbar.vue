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

        <el-tooltip content="大屏展示" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect" @click="goToDashboard">
            <el-icon :size="18">
              <Monitor />
            </el-icon>
          </div>
        </el-tooltip>

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
          <header-notice id="header-notice" class="right-menu-item hover-effect" style="margin-top: 4px"/>
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
import { ArrowDown, User, Setting, Lock, SwitchButton, Sunny, Moon, Monitor } from '@element-plus/icons-vue'
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

function goToDashboard(): void {
  window.open('/dashboard/index', '_blank')
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
    padding: 0 10px;
    border-radius: 6px;
    margin: 0 2px;
    transition: var(--navbar-transition);
    color: var(--navbar-item-color);

    &:hover {
      background: var(--navbar-item-hover-bg);
    }
  }

  .breadcrumb-container {
    flex-shrink: 0;
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
    margin-left: 6px;
  }

  .right-menu {
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 2px;
    padding-right: 8px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      height: 32px;
      min-width: 32px;
      font-size: var(--navbar-icon-size);
      color: var(--navbar-item-color);
      border-radius: 6px;
      position: relative;
      transition: var(--navbar-transition);

      &.hover-effect {
        cursor: pointer;

        &:hover {
          background: var(--navbar-item-hover-bg);
          color: var(--el-color-primary);
        }
      }

      &.theme-switch-wrapper {
        .theme-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;

          &.is-dark {
            transform: rotate(180deg);
          }
        }
      }
    }

    .avatar-container {
      margin-left: 4px;
      padding: 0 8px;
      border-radius: 6px;

      &:hover {
        background: var(--navbar-item-hover-bg);
      }

      .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 100%;
        cursor: pointer;

        .avatar-ring {
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--el-fill-color-light);

          .user-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            background: var(--el-fill-color);
          }

          .online-status {
            position: absolute;
            bottom: -1px;
            right: -1px;
            width: 9px;
            height: 9px;
            background: #67c23a;
            border: 2px solid var(--navbar-bg);
            border-radius: 50%;
          }
        }

        .user-nickname {
          font-size: 13px;
          font-weight: 500;
          color: var(--navbar-item-color);
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          font-size: 10px;
          color: var(--el-text-color-placeholder);
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
  border-radius: 8px;
  padding: 4px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-light);

  .el-dropdown-menu__item {
    border-radius: 6px;
    padding: 7px 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;

    .el-icon {
      font-size: 15px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
