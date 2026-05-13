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
  --menu-hover-bg: rgba(var(--el-color-primary-rgb), 0.08);
  --menu-active-bg: rgba(var(--el-color-primary-rgb), 0.18);

  background-color: var(--sidebar-menu-bg);
  backdrop-filter: blur(10px);

  &.theme-dark {
    --menu-hover-bg: rgba(var(--el-color-primary-rgb), 0.15);
    --menu-active-bg: rgba(var(--el-color-primary-rgb), 0.25);
  }

  &.theme-light {
    --menu-hover-bg: rgba(var(--el-color-primary-rgb), 0.08);
    --menu-active-bg: rgba(var(--el-color-primary-rgb), 0.12);
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
      border-radius: 12px;
      margin: 4px 10px;
      width: calc(100% - 20px) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 44px !important;
      line-height: 44px !important;
      position: relative;
      overflow: hidden;
      border: 1px solid transparent;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 3px;
        background: linear-gradient(180deg, var(--el-color-primary), var(--el-color-primary-light-3));
        border-radius: 0 2px 2px 0;
        transform: scaleY(0);
        transform-origin: center;
        transition: transform 0.3s ease;
        z-index: 2;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.08), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1;
      }

      &:hover {
        background-color: rgba(var(--el-color-primary-rgb), 0.06) !important;
        border-color: rgba(var(--el-color-primary-rgb), 0.15);

        &::before {
          transform: scaleY(1);
        }

        &::after {
          opacity: 1;
        }
      }
    }

    .el-menu-item {
      color: var(--sidebar-menu-text);
      font-weight: 500;
      overflow: visible;
      position: relative;

      &::after {
        background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.12), rgba(var(--el-color-primary-rgb), 0.06), transparent);
      }

      &::before {
        left: -10px;
        top: 50%;
        transform: translateY(-50%) scaleX(0);
        width: 4px;
        height: 24px;
        background: linear-gradient(180deg, var(--el-color-primary), var(--el-color-primary-light-3));
        border-radius: 0 6px 6px 0;
        box-shadow: 0 0 12px rgba(var(--el-color-primary-rgb), 0.4);
      }

      &.is-active {
        color: var(--el-color-primary);
        background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.20), rgba(var(--el-color-primary-rgb), 0.10)) !important;
        border-color: rgba(var(--el-color-primary-rgb), 0.35);
        font-weight: 600;
        box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        transform: translateX(2px);

        &::before {
          transform: translateY(-50%) scaleX(1);
        }

        &::after {
          opacity: 1;
        }
      }

      &:hover:not(.is-active) {
        background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.14), rgba(var(--el-color-primary-rgb), 0.06)) !important;
        transform: translateX(3px);
      }
    }

    .el-sub-menu__title {
      color: var(--sidebar-menu-text);
      font-weight: 500;

      &::after {
        background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.08), transparent);
      }

      &:hover {
        background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.08), rgba(var(--el-color-primary-rgb), 0.03)) !important;
        border-color: rgba(var(--el-color-primary-rgb), 0.15);
        transform: translateX(3px);
      }

      .el-sub-menu__icon-arrow {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--el-text-color-placeholder);
      }
    }

    .el-sub-menu.is-active > .el-sub-menu__title {
      color: var(--el-color-primary);
      font-weight: 600;
      background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.12), rgba(var(--el-color-primary-rgb), 0.05)) !important;
      border-color: rgba(var(--el-color-primary-rgb), 0.2);

      .el-sub-menu__icon-arrow {
        transform: rotate(180deg);
        color: var(--el-color-primary);
      }
    }

    .nest-menu .el-menu-item {
      margin: 4px 10px 4px 28px;
      width: calc(100% - 38px) !important;
      font-size: 14px;
      height: 40px !important;
      line-height: 40px !important;
      border-radius: 10px;

      &::before {
        left: -28px;
        height: 20px;
        width: 3px;
      }
    }

    .nest-menu .el-sub-menu__title {
      margin: 4px 10px 4px 28px;
      width: calc(100% - 38px) !important;
      font-size: 14px;
      height: 40px !important;
      line-height: 40px !important;
      border-radius: 10px;
    }

    .el-sub-menu .el-menu {
      padding: 6px 0;
      background: rgba(var(--el-color-primary-rgb), 0.02);
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

html.dark,
.theme-dark {
  .sidebar-container {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 1px;
      height: 100%;
      background: linear-gradient(180deg, transparent, var(--el-border-color), transparent);
      opacity: 0.5;
    }

    .el-menu {
      .el-menu-item,
      .el-sub-menu__title {
        &::after {
          background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.20), transparent);
        }
      }

      .el-menu-item {
        &.is-active {
          color: var(--el-color-primary-light-3);
          background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.35), rgba(var(--el-color-primary-rgb), 0.20)) !important;
          border-color: rgba(var(--el-color-primary-rgb), 0.5);
          box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          text-shadow: 0 0 8px rgba(var(--el-color-primary-rgb), 0.6);
        }

        &:hover:not(.is-active) {
          background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.22), rgba(var(--el-color-primary-rgb), 0.10)) !important;
        }

        &::before {
          box-shadow: 0 0 16px rgba(var(--el-color-primary-rgb), 0.6);
          background: linear-gradient(180deg, var(--el-color-primary-light-3), var(--el-color-primary));
        }
      }

      .el-sub-menu__title {
        &:hover {
          background: linear-gradient(90deg, rgba(var(--el-color-primary-rgb), 0.18), rgba(var(--el-color-primary-rgb), 0.08)) !important;
        }

        &.is-active > .el-sub-menu__title {
          color: var(--el-color-primary-light-3);
        }

        .el-sub-menu__icon-arrow {
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>
