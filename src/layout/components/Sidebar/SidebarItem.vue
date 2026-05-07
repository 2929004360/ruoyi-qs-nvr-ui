<template>
  <div v-if="!item.hidden" class="sidebar-item-wrapper">
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <svg-icon :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" class="menu-icon"/>
          <span class="menu-title">{{ onlyOneChild.meta.title }}</span>
          <div class="menu-indicator">
            <span class="corner corner-tl"></span>
            <span class="corner corner-tr"></span>
            <span class="corner corner-bl"></span>
            <span class="corner corner-br"></span>
          </div>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
      <template v-if="item.meta" #title>
        <svg-icon :icon-class="item.meta && item.meta.icon" class="menu-icon"/>
        <span class="menu-title">{{ item.meta.title }}</span>
        <div class="menu-indicator">
          <span class="corner corner-tl"></span>
          <span class="corner corner-tr"></span>
          <span class="corner corner-bl"></span>
          <span class="corner corner-br"></span>
        </div>
      </template>

      <sidebar-item
        v-for="(child, index) in item.children"
        :key="child.path + index"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { isExternal } from '@/utils/validate'
import AppLink from './Link.vue'
import { getNormalPath } from '@/utils/ruoyi'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})

const onlyOneChild = ref({})

function hasOneShowingChild(children: any[] = [], parent: any) {
  if (!children) {
    children = []
  }
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    }
    onlyOneChild.value = item
    return true
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

function resolvePath(routePath: string, routeQuery?: string): string | { path: string; query: Record<string, any> } {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routeQuery) {
    const query = JSON.parse(routeQuery)
    return { path: getNormalPath(props.basePath + '/' + routePath), query: query }
  }
  return getNormalPath(props.basePath + '/' + routePath)
}
</script>

<style lang="scss" scoped>
.sidebar-item-wrapper {
  .menu-icon {
    margin-right: 10px;
    font-size: 18px;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .menu-title {
    font-size: 14px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all 0.3s ease;
  }

  .el-menu-item,
  .el-sub-menu__title {
    position: relative;
    overflow: visible;
  }

  .menu-indicator {
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border-radius: 10px;
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    z-index: 1;
    
    .corner {
      position: absolute;
      width: 8px;
      height: 8px;
      border: 2px solid var(--el-color-primary);
      transition: all 0.3s ease;
    }
    
    .corner-tl {
      top: 0;
      left: 0;
      border-right: none;
      border-bottom: none;
      border-top-left-radius: 10px;
    }
    
    .corner-tr {
      top: 0;
      right: 0;
      border-left: none;
      border-bottom: none;
      border-top-right-radius: 10px;
    }
    
    .corner-bl {
      bottom: 0;
      left: 0;
      border-right: none;
      border-top: none;
      border-bottom-left-radius: 10px;
    }
    
    .corner-br {
      bottom: 0;
      right: 0;
      border-left: none;
      border-top: none;
      border-bottom-right-radius: 10px;
    }
  }

  .el-menu-item,
  .el-sub-menu__title {
    &:hover .menu-indicator,
    &.is-active .menu-indicator {
      opacity: 1;
      transform: scale(1);
    }

    &.is-active .menu-indicator {
      animation: indicatorPulse 2.5s ease-in-out infinite;
    }
  }

  .el-menu-item {
    &:hover .menu-icon {
      transform: scale(1.1) !important;
      transform-origin: center !important;
    }

    &:hover .menu-title {
      letter-spacing: 0.3px;
    }

    &.is-active {
      .menu-icon {
        transform: scale(1.05) !important;
        transform-origin: center !important;
        filter: drop-shadow(0 0 6px rgba(var(--el-color-primary-rgb), 0.8));
        animation: iconPulse 2s ease-in-out infinite;
      }

      .menu-title {
        font-weight: 600;
        text-shadow: 0 0 8px rgba(var(--el-color-primary-rgb), 0.4);
      }
    }
  }

  .el-sub-menu {
    .el-sub-menu__title {
      &:hover .menu-icon {
        transform: scale(1.1) !important;
        transform-origin: center !important;
      }

      &:hover .menu-title {
        letter-spacing: 0.3px;
      }

      &.is-active {
        .menu-icon {
          transform: scale(1.05) !important;
          transform-origin: center !important;
          filter: drop-shadow(0 0 6px rgba(var(--el-color-primary-rgb), 0.8));
          animation: iconPulse 2s ease-in-out infinite;
        }

        .menu-title {
          font-weight: 600;
          text-shadow: 0 0 8px rgba(var(--el-color-primary-rgb), 0.4);
        }
      }
    }
  }

  .el-sub-menu__icon-arrow {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .nest-menu {
    .el-menu-item {
      padding-left: 48px !important;
    }

    .el-sub-menu__title {
      padding-left: 48px !important;
    }
  }
}

// 收缩状态下的样式
:deep(.el-menu--collapse) {
  .sidebar-item-wrapper {
    .menu-icon {
      margin-right: 0 !important;
      margin-left: 0 !important;
      transform: none !important;
      filter: none !important;
      animation: none !important;
    }
    
    .menu-title {
      display: none !important;
    }
  }
  
  .el-sub-menu__icon-arrow {
    display: none !important;
  }
}

@keyframes indicatorPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
}

@keyframes iconPulse {
  0%,
  100% {
    filter: drop-shadow(0 0 4px rgba(var(--el-color-primary-rgb), 0.6));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(var(--el-color-primary-rgb), 0.9));
  }
}

html.dark,
.theme-dark {
  .sidebar-item-wrapper {
    .menu-icon {
      filter: brightness(1.1);
    }

    .el-menu-item.is-active .menu-icon,
    .el-sub-menu.is-active > .el-sub-menu__title .menu-icon {
      filter: brightness(1.3) drop-shadow(0 0 8px rgba(var(--el-color-primary-rgb), 0.9));
    }

    .el-menu-item.is-active .menu-indicator,
    .el-sub-menu.is-active > .el-sub-menu__title .menu-indicator {
      .corner {
        border-color: var(--el-color-primary-light-3);
      }
    }

    .el-menu-item.is-active .menu-title,
    .el-sub-menu.is-active > .el-sub-menu__title .menu-title {
      text-shadow: 0 0 12px rgba(var(--el-color-primary-rgb), 0.6);
    }
  }
}
</style>
