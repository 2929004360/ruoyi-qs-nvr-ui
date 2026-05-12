<template>
  <div class="container">
    <div class="left-board">
      <div class="logo-wrapper">
        <div class="logo">
          <img :src="logo" alt="logo"> Form Generator
        </div>
      </div>
      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div class="components-title">
            <svg-icon icon-class="component" />输入型组件
          </div>
          <draggable class="components-draggable" :list="inputComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }" :clone="cloneComponent"
            draggable=".components-item" :sort="false" @end="onEnd" item-key="label">
            <template #item="{ element, index }">
              <div :key="index" class="components-item" @click="addComponent(element)">
                <div class="components-body">
                  <svg-icon :icon-class="element.tagIcon" />
                  {{ element.label }}
                </div>
              </div>
            </template>
          </draggable>
          <div class="components-title">
            <svg-icon icon-class="component" />选择型组件
          </div>
          <draggable class="components-draggable" :list="selectComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }" :clone="cloneComponent"
            draggable=".components-item" :sort="false" @end="onEnd" item-key="label">
            <template #item="{ element, index }">
              <div :key="index" class="components-item" @click="addComponent(element)">
                <div class="components-body">
                  <svg-icon :icon-class="element.tagIcon" />
                  {{ element.label }}
                </div>
              </div>
            </template>
          </draggable>
          <div class="components-title">
            <svg-icon icon-class="component" /> 布局型组件
          </div>
          <draggable class="components-draggable" :list="layoutComponents"
            :group="{ name: 'componentsGroup', pull: 'clone', put: false }" :clone="cloneComponent"
            draggable=".components-item" :sort="false" @end="onEnd" item-key="label">
            <template #item="{ element, index }">
              <div :key="index" class="components-item" @click="addComponent(element)">
                <div class="components-body">
                  <svg-icon :icon-class="element.tagIcon" />
                  {{ element.label }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </el-scrollbar>
    </div>
    <div class="center-board">
      <div class="action-bar">
        <el-button icon="Download" type="primary" text @click="download">
          导出vue文件
        </el-button>
        <el-button class="copy-btn-main" icon="DocumentCopy" type="primary" text @click="copy">
          复制代码
        </el-button>
        <el-button class="delete-btn" icon="Delete" text @click="empty" type="danger">
          清空
        </el-button>
      </div>
      <el-scrollbar class="center-scrollbar">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form :size="formConf.size" :label-position="formConf.labelPosition" :disabled="formConf.disabled"
            :label-width="formConf.labelWidth + 'px'">
            <draggable class="drawing-board" :list="drawingList" :animation="340" group="componentsGroup"
              item-key="label">
              <template #item="{ element, index }">
                <draggable-item :key="element.renderKey" :drawing-list="drawingList" :element="element" :index="index"
                  :active-id="activeId" :form-conf="formConf" @activeItem="activeFormItem" @copyItem="drawingItemCopy"
                  @deleteItem="drawingItemDelete" />
              </template>
            </draggable>
            <div v-show="!drawingList.length" class="empty-info">
              <svg-icon icon-class="drag" style="font-size: 48px; margin-bottom: 12px; opacity: 0.4;" />
              <div>从左侧拖入或点选组件进行表单设计</div>
            </div>
          </el-form>
        </el-row>
      </el-scrollbar>
    </div>
    <right-panel :active-data="activeData" :form-conf="formConf" :show-field="!!drawingList.length"
      @tag-change="tagChange" />

    <code-type-dialog v-model="dialogVisible" title="选择生成类型" :showFileName="showFileName" @confirm="generate" />
    <input id="copyNode" type="hidden">
  </div>
</template>

<script setup lang="ts">
import draggable from "vuedraggable/dist/vuedraggable.common"
import ClipboardJS from 'clipboard'
//@ts-ignore
import beautifier from 'js-beautify'
import logo from '@/assets/logo/logo.png'
import { inputComponents, selectComponents, layoutComponents, formConf as formConfData } from '@/utils/generator/config'
import { beautifierConf } from '@/utils/index'
import { drawingDefaultValue, initDrawingDefaultValue, cleanDrawingDefaultValue } from '@/utils/generator/drawingDefault'
import { makeUpHtml, vueTemplate, vueScript, cssStyle } from '@/utils/generator/html'
import { makeUpJs } from '@/utils/generator/js'
import { makeUpCss } from '@/utils/generator/css'
import Download from '@/plugins/download'
import { ElNotification } from 'element-plus'
import DraggableItem from './DraggableItem.vue'
import RightPanel from './RightPanel.vue'
import CodeTypeDialog from './CodeTypeDialog.vue'

initDrawingDefaultValue()

const drawingList = ref<any[]>(drawingDefaultValue)
const { proxy } = getCurrentInstance()
const dialogVisible = ref<boolean>(false)
const showFileName = ref<boolean>(false)
const operationType = ref<string>('')
const idGlobal = ref<number>(100)
const activeData = ref<any>(drawingDefaultValue[0])
const activeId = ref<number>(drawingDefaultValue[0].formId)
const generateConf = ref<any | null>(null)
const formData = ref<FormData>({} as FormData)
const formConf = ref<any>(formConfData)
let oldActiveId: number
let tempActiveData: any

function activeFormItem(element: any): void {
  activeData.value = element
  activeId.value = element.formId
}
function copy(): void {
  dialogVisible.value = true
  showFileName.value = false
  operationType.value = 'copy'
}
function download(): void {
  dialogVisible.value = true
  showFileName.value = true
  operationType.value = 'download'
}
function empty(): void {
  proxy.$modal.confirm('确定要清空所有组件吗？', '提示', { type: 'warning' }).then(() => {
    idGlobal.value = 100
    drawingList.value = []
    cleanDrawingDefaultValue()
  })
}

function onEnd(obj: any): void {
  if (obj.from !== obj.to) {
    activeData.value = tempActiveData
    activeId.value = idGlobal.value
  }
}

function addComponent(item: any): void {
  const clone = cloneComponent(item)
  drawingList.value.push(clone)
  activeFormItem(clone)
}

function cloneComponent(origin: any): any {
  const clone = JSON.parse(JSON.stringify(origin)) as any
  clone.formId = ++idGlobal.value
  clone.span = formConf.value.span
  clone.renderKey = +new Date() // 改变renderKey后可以实现强制更新组件
  if (!clone.layout) clone.layout = 'colFormItem'
  if (clone.layout === 'colFormItem') {
    clone.vModel = `field${idGlobal.value}`
    if (clone.placeholder !== undefined) {
      clone.placeholder += clone.label
    }
    tempActiveData = clone
  } else if (clone.layout === 'rowFormItem') {
    delete clone.label
    clone.componentName = `row${idGlobal.value}`
    clone.gutter = formConf.value.gutter
    tempActiveData = clone
  }
  return tempActiveData
}

function drawingItemCopy(item: any, parent: any[]): void {
  let clone = JSON.parse(JSON.stringify(item))
  clone = createIdAndKey(clone)
  parent.push(clone)
  activeFormItem(clone)
}

function createIdAndKey(item: any): any {
  item.formId = ++idGlobal.value
  item.renderKey = +new Date()
  if (item.layout === 'colFormItem') {
    item.vModel = `field${idGlobal.value}`
  } else if (item.layout === 'rowFormItem') {
    item.componentName = `row${idGlobal.value}`
  }
  if (Array.isArray(item.children)) {
    item.children = item.children.map((childItem: any) => createIdAndKey(childItem))
  }
  return item
}

function drawingItemDelete(index: number, parent: any[]): void {
  parent.splice(index, 1)
  nextTick(() => {
    const len = drawingList.value.length
    if (len) {
      activeFormItem(drawingList.value[len - 1])
    }
  })
}

function tagChange(newTag: any): void {
  let clonedTag = cloneComponent(newTag)
  clonedTag.vModel = activeData.value.vModel
  clonedTag.formId = activeId.value
  clonedTag.span = activeData.value.span
  delete activeData.value.tag
  delete activeData.value.tagIcon
  delete activeData.value.document
  Object.keys(clonedTag).forEach(key => {
    if (activeData.value[key] !== undefined
      && typeof activeData.value[key] === typeof clonedTag[key]) {
      clonedTag[key] = activeData.value[key]
    }
  })
  activeData.value = clonedTag
  updateDrawingList(clonedTag, drawingList.value)
}

function updateDrawingList(newTag: any, list: any[]): void {
  const index = list.findIndex(item => item.formId === activeId.value)
  if (index > -1) {
    list.splice(index, 1, newTag)
  } else {
    list.forEach(item => {
      if (Array.isArray(item.children)) updateDrawingList(newTag, item.children)
    })
  }
}
function generate(data: any): void {
  generateConf.value = data
  nextTick(() => {
    switch (operationType.value) {
      case 'copy':
        execCopy()
        break
      case 'download':
        execDownload(data)
        break
      default:
        break
    }
  })
}

function execDownload(data: any): void {
  const codeStr = generateCode()
  const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' })
  Download.saveAs(blob, data.fileName!)
}

function execCopy(): void {
  const copyNode = document.getElementById('copyNode') as HTMLElement
  if (copyNode) {
    copyNode.click()
  }
}
function AssembleFormData(): void {
  formData.value = { fields: JSON.parse(JSON.stringify(drawingList.value)), ...formConf.value }
}
function generateCode(): string {
  if (!generateConf.value) return ''
  const { type } = generateConf.value
  AssembleFormData()
  const script = vueScript(makeUpJs(formData.value, type))
  const html = vueTemplate(makeUpHtml(formData.value, type))
  const css = cssStyle(makeUpCss(formData.value))
  return beautifier.html(html + script + css, beautifierConf.html)
}
watch(() => activeData.value.label, (val: string, oldVal: string) => {
  if (
    activeData.value.placeholder === undefined
    || !activeData.value.tag
    || oldActiveId !== activeId.value
  ) {
    return
  }
  activeData.value.placeholder = activeData.value.placeholder.replace(oldVal, '') + val
})
watch(activeId, (val: number) => {
  oldActiveId = val
}, { immediate: true })

let clipboard: ClipboardJS | null = null
onMounted(() => {
  clipboard = new ClipboardJS('#copyNode', {
    text: (trigger: Element) => {
      const codeStr = generateCode()
      ElNotification({ title: '成功', message: '代码已复制到剪切板，可粘贴。', type: 'success' })
      return codeStr
    }
  })
  clipboard.on('error', () => {
    proxy.$modal.msgError('代码复制失败')
  })
})
onUnmounted(() => {
  clipboard?.destroy()
})
</script>

<style lang='scss'>
.container {
  position: relative;
  width: 100%;
  background-color: var(--el-bg-color-overlay);
  height: calc(100vh - 50px - 40px);
  overflow: hidden;

  .left-board {
    width: 260px;
    position: absolute;
    left: 0;
    top: 0;
    height: calc(100vh - 50px - 40px);
    background-color: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-extra-light);
    transition: background-color 0.3s ease, border-color 0.3s ease;

    .logo-wrapper {
      position: relative;
      height: 42px;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      box-sizing: border-box;
      transition: border-color 0.3s ease;

      .logo {
        position: absolute;
        left: 12px;
        top: 6px;
        line-height: 30px;
        color: var(--el-color-primary);
        font-weight: 600;
        font-size: 17px;
        white-space: nowrap;
        transition: color 0.3s ease;

        >img {
          width: 30px;
          height: 30px;
          vertical-align: top;
          margin-right: 6px;
        }
      }
    }

    .left-scrollbar {
      .el-scrollbar__wrap {
        box-sizing: border-box;
        overflow-x: hidden !important;
        margin-bottom: 0 !important;

        .components-list {
          padding: 8px;
          box-sizing: border-box;
          height: 100%;

          .components-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin: 14px 2px 8px;
            padding-left: 8px;
            position: relative;
            display: flex;
            align-items: center;
            transition: color 0.3s ease;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 14px;
              background: var(--el-color-primary);
              border-radius: 2px;
              transition: height 0.3s ease;
            }

            &:hover::before {
              height: 18px;
            }

            .svg-icon {
              font-size: 16px;
              margin-right: 6px;
              color: var(--el-color-primary);
              transition: transform 0.3s ease;
            }

            &:hover .svg-icon {
              transform: rotate(-10deg) scale(1.1);
            }
          }

          .components-draggable {
            padding-bottom: 20px;

            .components-item {
              display: inline-block;
              width: 48%;
              margin: 1%;
              transition: transform 0ms !important;
              animation: fadeInUp 0.4s ease both;

              @for $i from 1 through 20 {
                &:nth-child(#{$i}) {
                  animation-delay: $i * 0.02s;
                }
              }

              .components-body {
                padding: 8px 10px;
                background: var(--el-fill-color-light);
                font-size: 12px;
                cursor: move;
                border: 1px dashed transparent;
                border-radius: 6px;
                color: var(--el-text-color-regular);
                display: flex;
                align-items: center;
                transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

                .svg-icon {
                  font-size: 15px;
                  margin-right: 5px;
                  color: var(--el-text-color-secondary);
                  transition: color 0.25s ease;
                }

                &:hover {
                  border-color: var(--el-color-primary-light-5);
                  color: var(--el-color-primary);
                  background: var(--el-color-primary-light-9);
                  transform: scale(1.03);
                  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.12);

                  .svg-icon {
                    color: var(--el-color-primary);
                  }
                }

                &:active {
                  transform: scale(0.98);
                }
              }
            }
          }
        }
      }
    }
  }

  .center-board {
    height: calc(100vh - 50px - 40px);
    width: auto;
    margin: 0 350px 0 260px;
    box-sizing: border-box;

    .action-bar {
      position: relative;
      height: 42px;
      padding: 0 15px;
      box-sizing: border-box;
      border: 1px solid var(--el-border-color-extra-light);
      border-top: none;
      border-left: none;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background-color: var(--el-bg-color-overlay);
      transition: background-color 0.3s ease, border-color 0.3s ease;

      .el-button {
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-1px);
        }
      }

      .delete-btn {
        color: var(--el-color-danger);

        &:hover {
          color: var(--el-color-danger);
        }
      }
    }

    .center-scrollbar {
      height: calc(100vh - 50px - 40px - 42px);
      overflow: hidden;
      border-left: 1px solid var(--el-border-color-extra-light);
      border-right: 1px solid var(--el-border-color-extra-light);
      box-sizing: border-box;
      background-color: var(--el-bg-color-page);
      transition: background-color 0.3s ease;

      .el-scrollbar__view {
        overflow-x: hidden;
      }

      .center-board-row {
        padding: 12px 12px 15px 12px;
        box-sizing: border-box;

        &>.el-form {
          height: calc(100vh - 50px - 40px - 69px);
          flex: 1;

          .drawing-board {
            height: 100%;
            position: relative;
            min-height: 120px;

            .components-body {
              padding: 0;
              margin: 0;
              font-size: 0;
            }

            .sortable-ghost {
              position: relative;
              display: block;
              overflow: hidden;
              border-radius: 6px;

              &::before {
                content: " ";
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                height: 3px;
                background: var(--el-color-primary);
                z-index: 2;
                animation: shimmer 1.5s infinite;
              }
            }

            .components-item.sortable-ghost {
              width: 100%;
              height: 60px;
              background: var(--el-fill-color-light);
              border-radius: 6px;
            }

            .active-from-item {
              &>.el-form-item {
                background: var(--el-fill-color-light);
                border-radius: 6px;
                transition: background-color 0.3s ease;
              }

              &>.drawing-item-copy,
              &>.drawing-item-delete {
                display: initial;
                opacity: 1;
                transform: scale(1);
              }

              &>.component-name {
                color: var(--el-color-primary);
              }

              .el-input__wrapper {
                box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
              }
            }

            .el-form-item {
              margin-bottom: 15px;
            }
          }

          .drawing-item {
            position: relative;
            cursor: move;
            transition: all 0.3s ease;
            animation: fadeInUp 0.35s ease both;

            &.unfocus-bordered:not(.activeFromItem)>div:first-child {
              border: 1px dashed var(--el-border-color);
              border-radius: 6px;
              transition: border-color 0.3s ease;
            }

            .el-form-item {
              padding: 12px 10px;
              border-radius: 6px;
              transition: background-color 0.3s ease, box-shadow 0.3s ease;
            }

            &.active-from-item {
              .el-form-item {
                box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
                animation: pulseGlow 2s infinite;
              }
            }
          }

          .drawing-row-item {
            position: relative;
            cursor: move;
            box-sizing: border-box;
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            padding: 0 2px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
            animation: fadeInUp 0.35s ease both;

            .drawing-row-item {
              margin-bottom: 2px;
            }

            .el-col {
              margin-top: 22px;
            }

            .el-form-item {
              margin-bottom: 0;
            }

            .drag-wrapper {
              min-height: 80px;
              flex: 1;
              display: flex;
              flex-wrap: wrap;
            }

            &.active-from-item {
              border: 1px dashed var(--el-color-primary);
              box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
              animation: pulseGlow 2s infinite;
            }

            .component-name {
              position: absolute;
              top: 0;
              left: 0;
              font-size: 12px;
              color: var(--el-text-color-secondary);
              display: inline-block;
              padding: 0 6px;
              transition: color 0.3s ease;
            }
          }

          .drawing-item,
          .drawing-row-item {
            &:hover {
              &>.el-form-item {
                background: var(--el-fill-color-light);
                border-radius: 6px;
              }

              &>.drawing-item-copy,
              &>.drawing-item-delete {
                display: initial;
                opacity: 1;
                transform: scale(1);
              }
            }

            &>.drawing-item-copy,
            &>.drawing-item-delete {
              display: none;
              position: absolute;
              top: -10px;
              width: 22px;
              height: 22px;
              line-height: 22px;
              text-align: center;
              border-radius: 50%;
              font-size: 12px;
              border: 1px solid;
              cursor: pointer;
              z-index: 10;
              opacity: 0;
              transform: scale(0.5);
              transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }

            &>.drawing-item-copy {
              right: 56px;
              border-color: var(--el-color-primary);
              color: var(--el-color-primary);
              background: var(--el-bg-color-overlay);

              &:hover {
                background: var(--el-color-primary);
                color: var(--el-color-white);
                transform: scale(1.15) rotate(-10deg);
              }
            }

            &>.drawing-item-delete {
              right: 24px;
              border-color: var(--el-color-danger);
              color: var(--el-color-danger);
              background: var(--el-bg-color-overlay);

              &:hover {
                background: var(--el-color-danger);
                color: var(--el-color-white);
                transform: scale(1.15) rotate(10deg);
              }
            }
          }

          .empty-info {
            position: absolute;
            top: 46%;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 16px;
            color: var(--el-text-color-secondary);
            letter-spacing: 2px;
            animation: float 3s ease-in-out infinite, fadeIn 0.6s ease both;
            pointer-events: none;
          }

        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
  }
  50% {
    box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
  }
}

@keyframes shimmer {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
