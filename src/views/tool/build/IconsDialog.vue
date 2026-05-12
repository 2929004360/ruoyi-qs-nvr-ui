<template>
  <div class="icon-dialog">
    <el-dialog v-model="value" width="980px" :close-on-click-modal="false" :modal-append-to-body="false" @open="onOpen"
      @close="onClose">
      <template #header="{ close, titleId, titleClass }">
        <div class="dialog-header-custom">
          <span>选择图标</span>
          <el-input v-model="key" size="small" :style="{ width: '260px' }" placeholder="请输入图标名称" prefix-icon="Search"
            clearable />
        </div>
      </template>
      <ul class="icon-ul">
        <li v-for="icon in iconList" :key="icon" :class="active === icon ? 'active-item' : ''" @click="onSelect(icon)">
          <div class="icon-wrap">
            <el-icon :size="30">
              <component :is="icon" />
            </el-icon>
            <div class="icon-name">{{ icon }}</div>
          </div>
        </li>
      </ul>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const iconList = ref<string[]>([])
const originList: string[] = []
const key = ref<string>('')
const active = ref<string>('')
const emit = defineEmits(['select'])
const value = defineModel()
for (const [key] of Object.entries(ElementPlusIconsVue)) {
  iconList.value.push(key)
  originList.push(key)
}

function onOpen(): void { }
function onClose(): void { }
function onSelect(icon: string): void {
  active.value = icon
  emit('select', icon)
  if (value.value !== undefined) {
    value.value = false
  }
}

watch(key, (val: string) => {
  if (val) {
    iconList.value = originList.filter(name => name.indexOf(val) > -1)
  } else {
    iconList.value = originList
  }
})
</script>
<style lang="scss" scoped>
.icon-ul {
  margin: 0;
  padding: 0;
  font-size: 0;
  display: flex;
  flex-wrap: wrap;

  li {
    list-style-type: none;
    text-align: center;
    font-size: 12px;
    display: inline-flex;
    width: 16.66%;
    box-sizing: border-box;
    height: 100px;
    padding: 6px;
    cursor: pointer;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: fadeIn 0.3s ease both;

    @for $i from 1 through 50 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 0.01s;
      }
    }

    .icon-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 6px;
      transition: all 0.25s ease;
    }

    .icon-name {
      margin-top: 6px;
      color: var(--el-text-color-secondary);
      transition: color 0.2s ease;
      word-break: break-all;
      padding: 0 4px;
    }

    &:hover {
      .icon-wrap {
        background: var(--el-fill-color-light);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        transform: scale(1.05);
      }

      .icon-name {
        color: var(--el-color-primary);
      }

      :deep(.el-icon) {
        color: var(--el-color-primary);
      }
    }

    &.active-item {
      .icon-wrap {
        background: var(--el-color-primary-light-9);
        box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.15);
      }

      .icon-name {
        color: var(--el-color-primary);
        font-weight: 600;
      }

      :deep(.el-icon) {
        color: var(--el-color-primary);
      }
    }
  }
}

.icon-dialog {
  :deep() {
    .el-dialog {
      border-radius: 12px;
      margin-bottom: 0;
      margin-top: 4vh !important;
      display: flex;
      flex-direction: column;
      max-height: 92vh;
      overflow: hidden;
      box-sizing: border-box;
      background: var(--el-bg-color-overlay);
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);

      .el-dialog__header {
        padding-top: 14px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--el-border-color-extra-light);
        margin-right: 0;
      }

      .el-dialog__body {
        margin: 0 20px 20px 20px;
        padding: 0;
        overflow: auto;
      }
    }
  }
}

.dialog-header-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);

  .el-input {
    transition: all 0.3s ease;

    &:focus-within {
      transform: scale(1.02);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
