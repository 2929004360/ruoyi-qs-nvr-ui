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
    width: 3px;

    .el-scrollbar__thumb {
      background: var(--el-text-color-placeholder);
      border-radius: 3px;
      opacity: 0.25;
    }
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;
    padding: 6px 0;

    .el-menu-item, .el-sub-menu__title {
      border-radius: 6px;
      margin: 2px 10px;
      width: calc(100% - 20px) !important;
      transition: all 0.2s ease;
    }

    .el-menu-item {
      color: var(--sidebar-menu-text);
      font-weight: 450;

      &.is-active {
        color: var(--el-color-primary);
        background-color: rgba(64, 158, 255, 0.1) !important;
        font-weight: 500;
      }
    }

    .el-sub-menu__title {
      color: var(--sidebar-menu-text);
    }

    .nest-menu .el-menu-item {
      margin: 2px 10px 2px 22px;
      width: calc(100% - 32px) !important;
    }
  }
}
</style>
