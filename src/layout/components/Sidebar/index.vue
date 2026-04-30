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

  background-color: var(--sidebar-menu-bg);

  .scrollbar-wrapper {
    background-color: var(--sidebar-menu-bg);
  }

  .el-scrollbar__bar.is-vertical {
    width: 4px;

    .el-scrollbar__thumb {
      background: var(--el-text-color-placeholder);
      border-radius: 4px;
      opacity: 0.3;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.5;
      }
    }
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;

    .el-menu-item, .el-sub-menu__title {
      border-radius: 0 8px 8px 0;
      margin: 2px 8px 2px 0;
      width: calc(100% - 8px) !important;
      transition: all 0.25s ease;
      animation: menuItemSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

      @for $i from 1 through 30 {
        &:nth-of-type(#{$i}) {
          animation-delay: #{$i * 0.02}s;
        }
      }

      &:hover {
        background-color: var(--menu-hover, var(--el-fill-color-light)) !important;
      }
    }

    .el-menu-item {
      color: var(--sidebar-menu-text);

      &.is-active {
        color: var(--menu-active-text, var(--el-color-primary));
        background-color: var(--menu-hover, var(--el-fill-color-light)) !important;
      }

      .svg-icon {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      &:hover .svg-icon {
        transform: scale(1.15);
      }
    }

    .el-sub-menu__title {
      color: var(--sidebar-menu-text);

      .svg-icon {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      &:hover .svg-icon {
        transform: scale(1.15);
      }
    }

    .nest-menu .el-menu-item {
      margin-left: 8px;
      width: calc(100% - 16px) !important;
    }
  }
}

@keyframes menuItemSlideIn {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
