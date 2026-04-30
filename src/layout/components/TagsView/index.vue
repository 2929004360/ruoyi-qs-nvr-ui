<template>
  <div id="tags-view-container" class="tags-view-container">
    <!-- 左切换箭头 -->
    <span class="tags-nav-btn tags-nav-btn--left" :class="{ disabled: !canScrollLeft }" @click="scrollLeft">
      <el-icon><arrow-left /></el-icon>
    </span>

    <!-- 标签滚动区 -->
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll" @update-arrows="updateArrowState">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="{ 'active': isActive(tag), 'has-icon': tagsIcon }"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <svg-icon v-if="tagsIcon && tag.meta && tag.meta.icon && tag.meta.icon !== '#'" :icon-class="tag.meta.icon" />
        <span class="tag-title">{{ tag.title }}</span>
        <span v-if="!isAffix(tag)" class="tag-close" @click.prevent.stop="closeSelectedTag(tag)">
          <el-icon :size="12"><close /></el-icon>
        </span>
      </router-link>
    </scroll-pane>

    <!-- 右切换箭头 -->
    <span class="tags-nav-btn tags-nav-btn--right" :class="{ disabled: !canScrollRight }" @click="scrollRight">
      <el-icon><arrow-right /></el-icon>
    </span>

    <!-- 下拉操作菜单 -->
    <el-dropdown class="tags-action-dropdown" trigger="click" placement="bottom-end" @command="handleDropdownCommand">
      <span class="tags-action-btn">
        <el-icon><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu class="tags-dropdown-menu">
          <el-dropdown-item v-if="!isAffix(selectedDropdownTag)" command="close">
            <el-icon :size="14"><close /></el-icon>关闭当前
          </el-dropdown-item>
          <el-dropdown-item command="closeOthers">
            <el-icon :size="14"><circle-close /></el-icon>关闭其他
          </el-dropdown-item>
          <el-dropdown-item command="closeLeft" :disabled="isFirstView()">
            <el-icon :size="14"><back /></el-icon>关闭左侧
          </el-dropdown-item>
          <el-dropdown-item command="closeRight" :disabled="isLastView()">
            <el-icon :size="14"><right /></el-icon>关闭右侧
          </el-dropdown-item>
          <el-dropdown-item command="closeAll">
            <el-icon :size="14"><circle-close /></el-icon>全部关闭
          </el-dropdown-item>
          <el-dropdown-item command="fullscreen" divided>
            <template v-if="!isFullscreen">
              <el-icon :size="14"><full-screen /></el-icon>全屏显示
            </template>
            <template v-else>
              <el-icon :size="14"><close /></el-icon>退出全屏
            </template>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 刷新按钮 -->
    <span class="tags-action-btn tags-refresh-btn" title="刷新页面" @click="refreshSelectedTag(selectedDropdownTag)">
      <el-icon><refresh-right /></el-icon> 刷新
    </span>

    <!-- 右键上下文菜单 -->
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        <el-icon :size="14"><refresh-right /></el-icon>刷新页面
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <el-icon :size="14"><close /></el-icon>关闭当前
      </li>
      <li @click="closeOthersTags">
        <el-icon :size="14"><circle-close /></el-icon>关闭其他
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <el-icon :size="14"><back /></el-icon>关闭左侧
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <el-icon :size="14"><right /></el-icon>关闭右侧
      </li>
      <li @click="closeAllTags(selectedTag)">
        <el-icon :size="14"><circle-close /></el-icon>全部关闭
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import ScrollPane from './ScrollPane.vue'
import { getNormalPath } from '@/utils/ruoyi'
import useTagsViewStore from '@/store/modules/tagsView'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const visible = ref<boolean>(false)
const top = ref<number>(0)
const left = ref<number>(0)
const selectedTag = ref<any>({})
const affixTags = ref<any[]>([])
const scrollPaneRef = ref<any>(null)
const canScrollLeft = ref<boolean>(false)
const canScrollRight = ref<boolean>(false)
const isFullscreen = ref<boolean>(false)
const hiddenElements = ref<any>([])

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()

const visitedViews = computed(() => useTagsViewStore().visitedViews)
const routes = computed(() => usePermissionStore().routes)
const theme = computed(() => useSettingsStore().theme)
const tagsIcon = computed(() => useSettingsStore().tagsIcon)
const tagsViewPersist = computed(() => useSettingsStore().tagsViewPersist)

// 下拉菜单针对当前激活的 tag
const selectedDropdownTag = computed(() => visitedViews.value.find((v: any) => isActive(v)) || {})

watch(route, () => {
  addTags()
  moveToCurrentTag()
})

watch(visible, (value: boolean) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

watch(visitedViews, () => {
  nextTick(() => updateArrowState())
})

onMounted(() => {
  initTags()
  addTags()
  window.addEventListener('resize', updateArrowState)
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateArrowState)
  window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(event: KeyboardEvent): void {
  // 当按下Esc键且处于全屏状态时，退出全屏
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

function isActive(r: any): boolean {
  return r.path === route.path
}

function activeStyle(tag: any): Record<string, string> {
  if (!isActive(tag)) return {}
  return {
    "background-color": theme.value,
    "border-color": theme.value
  }
}

function isAffix(tag: any): boolean {
  return tag.meta && tag.meta.affix
}

function isFirstView(): boolean {
  try {
    const tag = selectedTag.value && selectedTag.value.fullPath ? selectedTag.value : selectedDropdownTag.value
    return tag.fullPath === '/index' || tag.fullPath === visitedViews.value[1].fullPath
  } catch (err) {
    return false
  }
}

function isLastView(): boolean {
  try {
    const tag = selectedTag.value && selectedTag.value.fullPath ? selectedTag.value : selectedDropdownTag.value
    return tag.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath
  } catch (err) {
    return false
  }
}

function filterAffixTags(routes: any[], basePath = ''): any[] {
  const tags: any[] = []
  routes.forEach(route => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags.push(...tempTags)
      }
    }
  })
  return tags
}

function initTags(): void {
  if (tagsViewPersist) {
    useTagsViewStore().loadPersistedViews()
  }
  const res = filterAffixTags(routes.value)
  affixTags.value = res
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
       useTagsViewStore().addAffixView(tag)
    }
  }
}

function addTags(): void {
  const { name } = route
  if (name) {
    useTagsViewStore().addView(route)
  }
}

function moveToCurrentTag(): void {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollPaneRef.value?.moveToTarget(r)
        // when query is different then update
        if (r.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route)
        }
      }
    }
  })
}

function scrollLeft(): void {
  if (!canScrollLeft.value) return
  scrollPaneRef.value?.scrollToStart()
}

function scrollRight(): void {
  if (!canScrollRight.value) return
  scrollPaneRef.value?.scrollToEnd()
}

function updateArrowState(): void {
  nextTick(() => {
    if (scrollPaneRef.value) {
      const state = scrollPaneRef.value.getScrollState()
      canScrollLeft.value = state.canLeft
      canScrollRight.value = state.canRight
    }
  })
}

function toggleFullscreen() {
  const mainContainer = document.querySelector('.main-container') as HTMLElement | null
  const navbar = document.querySelector('.navbar') as HTMLElement | null
  const sidebar = document.querySelector('.sidebar-container') as HTMLElement | null
  const tagsActionBtn = document.querySelector<HTMLElement>('.tags-action-btn')
  if (!mainContainer) return

  if (!isFullscreen.value) {
    mainContainer.classList.add('fullscreen-mode')
    document.body.style.overflow = 'hidden'
    const elementsToHide = [{ el: navbar, originalDisplay: navbar?.style.display || '' }, { el: sidebar, originalDisplay: sidebar?.style.display || '' }]
    elementsToHide.forEach((item :any) => {
      if (item.el && item.el.style.display !== 'none') {
        item.originalDisplay = item.el.style.display
        item.el.style.display = 'none'
        hiddenElements.value.push(item)
      }
    })
    isFullscreen.value = true
  } else {
    mainContainer.classList.remove('fullscreen-mode')
    document.body.style.overflow = ''
    hiddenElements.value.forEach((item :any) => {
      if (item.el) {
        item.el.style.display = item.originalDisplay
      }
    })
    hiddenElements.value = ref<any[]>([])
    tagsActionBtn?.blur()
    isFullscreen.value = false
  }
}

function handleDropdownCommand(command: string): void {
  const tag = selectedDropdownTag.value
  selectedTag.value = tag
  switch (command) {
    case 'refresh':     refreshSelectedTag(tag); break
    case 'fullscreen':  toggleFullscreen(); break
    case 'close':       closeSelectedTag(tag); break
    case 'closeOthers': closeOthersTags(); break
    case 'closeLeft':   closeLeftTags(); break
    case 'closeRight':  closeRightTags(); break
    case 'closeAll':    closeAllTags(tag); break
  }
}

function refreshSelectedTag(view: any): void {
  proxy.$tab.refreshPage(view)
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route)
  }
}

function closeSelectedTag(view: any): void {
  proxy.$tab.closePage(view).then(({ visitedViews }: any) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

function closeRightTags(): void {
  proxy.$tab.closeRightPage(selectedTag.value).then((visitedViews: any) => {
    if (!visitedViews.find((i: any) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

function closeLeftTags(): void {
  proxy.$tab.closeLeftPage(selectedTag.value).then((visitedViews: any) => {
    if (!visitedViews.find((i: any) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

function closeOthersTags(): void {
  router.push(selectedTag.value).catch(() => { })
  proxy.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

function closeAllTags(view: any): void {
  proxy.$tab.closeAllPage().then(({ visitedViews }: any) => {
    if (affixTags.value.some((tag: any) => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

function toLastView(visitedViews: any[], view?: any): void {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    if (view && view.name === 'Dashboard') {
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

function openMenu(tag: any, e: MouseEvent): void {
  left.value = e.clientX
  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

function closeMenu(): void {
  visible.value = false
}

function handleScroll(): void {
  closeMenu()
  updateArrowState()
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  // 局部变量
  --tag-bg: var(--tags-item-bg, #fff);
  --tag-border: var(--tags-item-border, #e4e7ed);
  --tag-text: var(--tags-item-text, #606266);
  --tag-hover-bg: var(--tags-item-hover, #f5f7fa);
  --tag-active-text: #fff;
  --tag-radius: 6px;
  --tag-height: 28px;
  --btn-hover-bg: var(--el-fill-color-light, #f0f2f5);
  --btn-color: #333333;
  --btn-disabled: #a8abb2;

  height: 40px;
  width: 100%;
  background: var(--tags-bg, #fff);
  border-bottom: 1px solid var(--tag-border);
  display: flex;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  animation: tagsSlideDown 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;

  .tags-nav-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: 0 2px;
    cursor: pointer;
    color: var(--btn-color);
    font-size: 14px;
    user-select: none;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover:not(.disabled) {
      background: var(--btn-hover-bg);
      color: var(--el-color-primary);
      transform: scale(1.05);
    }

    &:active:not(.disabled) {
      transform: scale(0.95);
    }

    &.disabled {
      color: var(--btn-disabled);
      cursor: not-allowed;
    }

    &--left  { border-right: none; }
    &--right { border-left: none; }
  }

  .tags-view-wrapper {
    flex: 1;
    min-width: 0;
    height: 100%;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: var(--tag-height);
      line-height: var(--tag-height);
      border: 1px solid var(--tag-border);
      color: var(--tag-text);
      background: var(--tag-bg);
      padding: 0 12px;
      font-size: 13px;
      margin-left: 6px;
      border-radius: var(--tag-radius);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: tagFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;

      @for $i from 1 through 20 {
        &:nth-of-type(#{$i}) {
          animation-delay: #{$i * 0.03}s;
        }
      }

      &:first-of-type { margin-left: 8px; }
      &:last-of-type  { margin-right: 12px; }

      &:hover:not(.active) {
        background: var(--tag-hover-bg);
        color: var(--el-color-primary);
        border-color: var(--el-color-primary-light-7);
        transform: translateY(-1px);
      }

      &.active {
        color: var(--tag-active-text);

        &::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          margin-right: 6px;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
          animation: dotPulse 2s ease-in-out infinite;
        }
      }

      &.active.has-icon::before {
        display: none !important;
      }

      .tag-title {
        position: relative;
        top: 0.5px;
      }

      .tag-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 6px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: inherit;

        .el-icon {
          transition: transform 0.3s ease;
        }

        &:hover {
          background-color: var(--tags-close-hover, #b4bccc);
          color: #fff;

          .el-icon {
            transform: rotate(90deg);
          }
        }
      }

      &.active .tag-close:hover {
        background-color: rgba(255, 255, 255, 0.25);
      }
    }
  }

  .tags-action-dropdown {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .tags-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 32px;
    padding: 0 10px;
    margin: 0 2px;
    cursor: pointer;
    color: var(--btn-color);
    font-size: 13px;
    border-radius: 8px;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: var(--btn-hover-bg);
      color: var(--el-color-primary);
    }

    .el-icon {
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &:hover .el-icon {
      transform: scale(1.1);
    }
  }

  .tags-refresh-btn {
    padding: 0 12px;
    font-size: 13px;

    &:hover .el-icon {
      transform: rotate(180deg);
    }
  }

  .contextmenu {
    margin: 0;
    background: var(--el-bg-color-overlay, #fff);
    z-index: 3000;
    position: fixed;
    list-style-type: none;
    padding: 6px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 400;
    color: var(--el-text-color-regular, #333);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--el-border-color-light, #e4e7ed);
    min-width: 160px;
    animation: contextMenuFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;

    li {
      margin: 0;
      padding: 8px 14px;
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--el-fill-color-light, #f5f7fa);
        color: var(--el-color-primary);
      }

      .el-icon {
        color: var(--el-text-color-secondary);
        transition: color 0.2s ease;
        flex-shrink: 0;
      }

      &:hover .el-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

html.dark .tags-view-container {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  .tags-action-btn {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    color: var(--el-text-color-regular);

    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-7);
      color: var(--el-color-primary);
    }
  }

  .contextmenu {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-light);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

    li:hover {
      background: var(--el-fill-color-light);
    }
  }
}

// 下拉菜单全局样式
:global(.tags-dropdown-menu.el-dropdown__menu) {
  border-radius: 12px;
  padding: 8px;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-light);
  animation: dropdownFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;

  .el-dropdown-menu__item {
    border-radius: 8px;
    padding: 9px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3px;
      height: 60%;
      background: var(--el-color-primary);
      border-radius: 0 3px 3px 0;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .el-icon {
      color: var(--el-text-color-secondary);
      transition: color 0.2s ease, transform 0.3s ease;
      flex-shrink: 0;
    }

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);

      &::before {
        transform: translateY(-50%) scaleY(1);
      }

      .el-icon {
        color: var(--el-color-primary);
        transform: scale(1.1);
      }
    }

    &.is-disabled {
      opacity: 0.4;
      cursor: not-allowed;

      &:hover {
        background: transparent;
        color: var(--el-text-color-regular);

        &::before {
          transform: translateY(-50%) scaleY(0);
        }

        .el-icon {
          color: var(--el-text-color-secondary);
          transform: none;
        }
      }
    }

    &.el-dropdown-menu__item--divided {
      margin: 6px 0;
      border-top: 1px solid var(--el-border-color-lighter);
      padding-top: 7px;

      &::before {
        display: none;
      }
    }
  }
}

:global(html.dark .tags-dropdown-menu.el-dropdown__menu) {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

  .el-dropdown-menu__item {
    color: var(--el-text-color-regular);

    .el-icon {
      color: var(--el-text-color-secondary);
    }

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);

      .el-icon {
        color: var(--el-color-primary);
      }
    }

    &.is-disabled:hover {
      background: transparent;
      color: var(--el-text-color-regular);

      .el-icon {
        color: var(--el-text-color-secondary);
      }
    }

    &.el-dropdown-menu__item--divided {
      border-top-color: var(--el-border-color);
    }
  }
}

// 动画定义
@keyframes tagsSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tagFadeIn {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dotPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.85);
  }
}
</style>

<style lang="scss">
/* 页签全屏模式样式 */
.main-container.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-container.fullscreen-mode .fixed-header {
  display: block !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100% !important;
  z-index: 1000;
}

.main-container.fullscreen-mode .fixed-header .navbar {
  display: none !important;
}

.main-container.fullscreen-mode .app-main {
  position: fixed;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 !important;
  padding: 0 !important;
  height: calc(100vh - 40px) !important;
  min-height: calc(100vh - 40px) !important;
  overflow: auto;
}
</style>
