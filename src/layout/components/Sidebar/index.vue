<template>
  <div :class="['sidebar-theme-wrapper', {'has-logo':showLogo}, sideTheme]" class="sidebar-container">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="getMenuBackground"
        :text-color="getMenuTextColor"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        mode="vertical"
        :class="sideTheme"
      >
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const showLogo = computed(() => settingsStore.sidebarLogo)
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)

// 获取菜单背景色
const getMenuBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取菜单文字颜色
const getMenuTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)'
  }
  return sideTheme.value === 'theme-dark' ? variables.menuText : variables.menuLightText
})

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  --sidebar-menu-text: v-bind(getMenuTextColor);
  --sidebar-menu-bg: v-bind(getMenuBackground);
  --menu-hover-bg: rgba(64, 158, 255, 0.08);
  --menu-active-bg: rgba(64, 158, 255, 0.18);

  background-color: var(--sidebar-menu-bg);
  backdrop-filter: blur(10px);

  &.theme-dark {
    --menu-hover-bg: rgba(64, 158, 255, 0.15);
    --menu-active-bg: rgba(64, 158, 255, 0.25);
  }

  &.theme-light {
    --menu-hover-bg: rgba(64, 158, 255, 0.08);
    --menu-active-bg: rgba(64, 158, 255, 0.12);
  }

  .scrollbar-wrapper {
    background-color: var(--sidebar-menu-bg);
  }

  .el-scrollbar__bar.is-vertical {
    width: 4px;

    .el-scrollbar__thumb {
      background: var(--el-text-color-placeholder);
      border-radius: 4px;
      opacity: 0.2;
      transition: opacity 0.3s ease;
    }

    &:hover {
      .el-scrollbar__thumb {
        opacity: 0.5;
      }
    }
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;
    padding: 8px 0;

    .el-menu-item, .el-sub-menu__title {
      border-radius: 10px;
      margin: 4px 12px;
      width: calc(100% - 24px) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 46px !important;
      line-height: 46px !important;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(64, 158, 255, 0.15) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      &:hover::after {
        opacity: 1;
        animation: ripple 0.6s ease-out;
      }
    }

    .el-menu-item {
      color: var(--sidebar-menu-text);
      font-weight: 450;
      overflow: visible;

      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 50%;
        transform: translateY(-50%) scaleX(0);
        width: 4px;
        height: 22px;
        background: linear-gradient(180deg, var(--el-color-primary), var(--el-color-primary-light-3));
        border-radius: 0 4px 4px 0;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
      }

      &.is-active {
        color: var(--el-color-primary);
        background-color: var(--menu-active-bg) !important;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
        transform: translateX(2px);

        &::before {
          transform: translateY(-50%) scaleX(1);
        }

        &::after {
          opacity: 1;
        }
      }

      &:hover:not(.is-active) {
        background-color: var(--menu-hover-bg) !important;
        transform: translateX(3px);
      }
    }

    .el-sub-menu__title {
      color: var(--sidebar-menu-text);
      font-weight: 450;

      &:hover {
        background-color: var(--menu-hover-bg) !important;
        transform: translateX(3px);
      }

      .el-sub-menu__icon-arrow {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .el-sub-menu.is-active > .el-sub-menu__title {
      color: var(--el-color-primary);
      font-weight: 550;

      .el-sub-menu__icon-arrow {
        transform: rotate(180deg);
      }
    }

    .nest-menu .el-menu-item {
      margin: 4px 12px 4px 30px;
      width: calc(100% - 42px) !important;
      font-size: 13.5px;

      &::before {
        left: -30px;
        height: 18px;
        width: 3px;
      }
    }

    .nest-menu .el-sub-menu__title {
      margin: 4px 12px 4px 30px;
      width: calc(100% - 42px) !important;
      font-size: 13.5px;
    }

    .el-sub-menu .el-menu {
      padding: 6px 0;
    }
  }
}

:deep(.el-menu--collapse) {
  .el-menu-item,
  .el-sub-menu__title {
    margin: 4px 8px !important;
    width: calc(100% - 16px) !important;
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
</style>
