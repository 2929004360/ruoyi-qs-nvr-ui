<template>
  <el-drawer v-model="showSettings" :withHeader="false" :lock-scroll="false" direction="rtl" size="300px">
    <div class="setting-drawer-title">
      <h3 class="drawer-title">菜单导航设置</h3>
    </div>
    <div class="nav-wrap">
      <el-tooltip content="左侧菜单" placement="bottom">
        <div class="item left" @click="handleNavType(1)" :class="{ activeItem: navType == 1 }">
          <b></b><b></b>
        </div>
      </el-tooltip>

      <el-tooltip content="混合菜单" placement="bottom">
        <div class="item mix" @click="handleNavType(2)" :class="{ activeItem: navType == 2 }">
          <b></b><b></b>
        </div>
      </el-tooltip>
      <el-tooltip content="顶部菜单" placement="bottom">
        <div class="item top" @click="handleNavType(3)" :class="{ activeItem: navType == 3 }">
          <b></b><b></b>
        </div>
      </el-tooltip>
    </div>
    <div class="setting-drawer-title">
      <h3 class="drawer-title">主题风格设置</h3>
    </div>
    <div class="setting-drawer-block-checbox">
      <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-dark')">
        <img src="@/assets/images/dark.svg" alt="dark" />
        <div v-if="sideTheme === 'theme-dark'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
          <i aria-label="图标: check" class="anticon anticon-check">
            <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true" focusable="false" class>
              <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" />
            </svg>
          </i>
        </div>
      </div>
      <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-light')">
        <img src="@/assets/images/light.svg" alt="light" />
        <div v-if="sideTheme === 'theme-light'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
          <i aria-label="图标: check" class="anticon anticon-check">
            <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true" focusable="false" class>
              <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" />
            </svg>
          </i>
        </div>
      </div>
    </div>
    <div class="drawer-item">
      <span>主题颜色</span>
      <span class="comp-style">
        <el-color-picker v-model="theme" :predefine="predefineColors" @change="themeChange"/>
      </span>
    </div>
    <el-divider />

    <h3 class="drawer-title">系统布局配置</h3>

    <div class="drawer-item">
      <span>开启 Tags-Views</span>
      <span class="comp-style">
        <el-switch v-model="settingsStore.tagsView" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>持久化标签页</span>
      <span class="comp-style">
        <el-switch v-model="settingsStore.tagsViewPersist" :disabled="!settingsStore.tagsView" @change="tagsViewPersistChange" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>显示页签图标</span>
      <span class="comp-style">
        <el-switch v-model="settingsStore.tagsIcon" :disabled="!settingsStore.tagsView" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>固定 Header</span>
      <span class="comp-style">
        <el-switch v-model="settingsStore.fixedHeader" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>显示 Logo</span>
      <span class="comp-style">
        <el-switch v-model="settingsStore.sidebarLogo" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>动态标题</span>
      <span class="comp-style">
        <el-switch v-model="settingsStore.dynamicTitle" @change="dynamicTitleChange" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>底部版权</span>
      <span class="comp-style">
        <el-switch v-model="settingsStore.footerVisible" class="drawer-switch" />
      </span>
    </div>

    <el-divider />

    <div class="drawer-footer">
      <el-button type="primary" plain icon="DocumentAdd" @click="saveSetting">保存配置</el-button>
      <el-button plain icon="Refresh" @click="resetSetting">重置配置</el-button>
    </div>
  </el-drawer>

</template>

<script setup lang="ts">
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { handleThemeStyle } from '@/utils/theme'

const { proxy } = getCurrentInstance()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const showSettings = ref<boolean>(false)
const navType = ref<number>(settingsStore.navType)
const theme = ref<string>(settingsStore.theme)
const sideTheme = ref<string>(settingsStore.sideTheme)
const tagsViewPersist = ref(settingsStore.tagsViewPersist)
const storeSettings = computed(() => settingsStore)
const predefineColors = ref<string[]>(["#409EFF", "#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#1e90ff", "#c71585"])

/** 是否需要dynamicTitle */
function dynamicTitleChange(): void {
  useSettingsStore().setTitle(useSettingsStore().title)
}

function tagsViewPersistChange(val: boolean): void {
  settingsStore.tagsViewPersist = val
  tagsViewPersist.value = val
}

function themeChange(val: string): void {
  settingsStore.theme = val
  handleThemeStyle(val)
}

function handleTheme(val: string): void {
  settingsStore.sideTheme = val
  sideTheme.value = val
}

function handleNavType(val: number): void {
  settingsStore.navType = val
  navType.value = val
}

/** 菜单导航设置 */
watch(() => navType, (val: any) => {
  if (val.value == 1) {
    appStore.sidebar.opened = true
    appStore.toggleSideBarHide(false)
  }
  if (val.value == 2) {
    appStore.sidebar.opened = true
  }
  if (val.value == 3) {
    appStore.sidebar.opened = false
    appStore.toggleSideBarHide(true)
  }
  if ([1, 3].includes(val.value)) {
      permissionStore.setSidebarRouters(permissionStore.defaultRoutes)
  }
  }, { immediate: true, deep: true }
)

function saveSetting(): void {
  proxy.$modal.loading("正在保存到本地，请稍候...")
  if (!tagsViewPersist.value) {
    proxy.$cache.local.remove('tags-view-visited')
  }
  const layoutSetting = {
    "navType": storeSettings.value.navType,
    "tagsView": storeSettings.value.tagsView,
    "tagsIcon": storeSettings.value.tagsIcon,
    "tagsViewPersist": storeSettings.value.tagsViewPersist,
    "fixedHeader": storeSettings.value.fixedHeader,
    "sidebarLogo": storeSettings.value.sidebarLogo,
    "dynamicTitle": storeSettings.value.dynamicTitle,
    "footerVisible": storeSettings.value.footerVisible,
    "sideTheme": storeSettings.value.sideTheme,
    "theme": storeSettings.value.theme
  }
  localStorage.setItem("layout-setting", JSON.stringify(layoutSetting))
  setTimeout(proxy.$modal.closeLoading(), 1000)
}

function resetSetting(): void {
  proxy.$cache.local.remove('tags-view-visited')
  proxy.$modal.loading("正在清除设置缓存并刷新，请稍候...")
  localStorage.removeItem("layout-setting")
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

function openSetting(): void {
  showSettings.value = true
}

defineExpose({
  openSetting
})
</script>

<style lang='scss' scoped>
.setting-drawer-title {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  .drawer-title {
    font-size: 15px;
    font-weight: 600;
    position: relative;
    padding-left: 12px;
    line-height: 24px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: var(--el-color-primary);
      border-radius: 2px;
    }
  }
}

// 导航模式
.nav-wrap {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
  margin: 12px 0 24px;
  animation: slideInRight 0.45s 0.05s cubic-bezier(0.4, 0, 0.2, 1) both;

  .item {
    position: relative;
    width: 64px;
    height: 52px;
    border-radius: 8px;
    background: var(--el-fill-color-light);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }

    &.activeItem {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-9);

      &::after {
        content: '';
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 14px;
        height: 14px;
        background: var(--el-color-primary);
        border-radius: 50%;
        border: 2px solid var(--el-bg-color-overlay);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        animation: dotPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
    }
  }

  .left {
    b:first-child {
      display: block;
      height: 22%;
      background: var(--el-bg-color);
      border-radius: 4px 4px 0 0;
      margin: 4px 4px 0;
    }
    b:last-child {
      position: absolute;
      width: 28%;
      height: calc(100% - 8px);
      top: 4px;
      left: 4px;
      background: var(--sidebar-bg);
      border-radius: 4px 0 0 4px;
    }
  }

  .mix {
    b:first-child {
      display: block;
      height: 22%;
      background: var(--sidebar-bg);
      border-radius: 4px 4px 0 0;
      margin: 4px 4px 0;
    }
    b:last-child {
      position: absolute;
      width: 28%;
      height: 68%;
      bottom: 4px;
      left: 4px;
      background: var(--sidebar-bg);
      border-radius: 0 0 0 4px;
    }
  }

  .top {
    b:first-child {
      display: block;
      height: 22%;
      background: var(--sidebar-bg);
      border-radius: 4px 4px 0 0;
      margin: 4px 4px 0;
    }
  }
}

// 主题风格选择
.setting-drawer-block-checbox {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
  margin: 12px 0 24px;
  animation: slideInRight 0.5s 0.1s cubic-bezier(0.4, 0, 0.2, 1) both;

  .setting-drawer-block-checbox-item {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    border: 2px solid transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    &:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .setting-drawer-block-checbox-selectIcon {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(2px);
      animation: selectIconFadeIn 0.25s ease both;

      svg {
        width: 22px;
        height: 22px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
      }
    }
  }
}

// 开关项
.drawer-item {
  color: var(--el-text-color-regular);
  padding: 12px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: color 0.3s ease;
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  @for $i from 1 through 10 {
    &:nth-of-type(#{$i}) {
      animation-delay: #{0.15 + $i * 0.04}s;
    }
  }

  .comp-style {
    margin: 0;
  }
}

// 按钮区域
.drawer-footer {
  display: flex;
  gap: 10px;
  animation: slideInRight 0.45s 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;

  :deep(.el-button) {
    flex: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

// 分隔线
:deep(.el-divider) {
  margin: 16px 0;
  border-color: var(--el-border-color-lighter);
  animation: fadeIn 0.5s 0.12s ease both;
}

// 暗黑模式适配
html.dark {
  .nav-wrap .item {
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    &.activeItem {
      box-shadow: 0 0 0 3px var(--el-color-primary-light-9), 0 2px 8px rgba(0, 0, 0, 0.2);

      &::after {
        border-color: var(--el-bg-color);
      }
    }

    .left b:first-child,
    .top b:first-child {
      background: var(--el-bg-color-overlay);
    }
  }

  .setting-drawer-block-checbox-item {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    }

    .setting-drawer-block-checbox-selectIcon {
      background: rgba(0, 0, 0, 0.35);
    }
  }

  .drawer-footer :deep(.el-button):hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  :deep(.el-divider) {
    border-color: var(--el-border-color);
  }
}

// 动画定义
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes dotPop {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes selectIconFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
