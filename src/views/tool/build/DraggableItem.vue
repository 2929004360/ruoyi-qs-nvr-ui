<template>
  <el-col :span="element.span" :class="className" @click.stop="activeItem(element)">
    <el-form-item :label="element.label" :label-width="element.labelWidth ? element.labelWidth + 'px' : null"
      :required="element.required" v-if="element.layout === 'colFormItem'">
      <render :key="element.tag" :conf="element" v-model="element.defaultValue" />
    </el-form-item>
    <el-row :gutter="element.gutter" :class="element.class" @click.stop="activeItem(element)" v-else>
      <span class="component-name"> {{ element.componentName }} </span>
      <draggable group="componentsGroup" :animation="340" :list="element.children" class="drag-wrapper" item-key="label"
        ref="draggableItemRef" :component-data="getComponentData()">
        <template #item="scoped">
          <draggable-item :key="scoped.element.renderKey" :drawing-list="element.children" :element="scoped.element"
            :index="index" :active-id="activeId" :form-conf="formConf" @activeItem="activeItem(scoped.element)"
            @copyItem="copyItem(scoped.element, element.children)"
            @deleteItem="deleteItem(scoped.index, element.children)" />
        </template>
      </draggable>
    </el-row>
    <span class="drawing-item-copy" title="复制" @click.stop="copyItem(element)">
      <el-icon><CopyDocument /></el-icon>
    </span>
    <span class="drawing-item-delete" title="删除" @click.stop="deleteItem(index)">
      <el-icon><Delete /></el-icon>
    </span>
  </el-col>
</template>
<script setup lang="ts" name="DraggableItem">
import draggable from "vuedraggable/dist/vuedraggable.common"
import render from '@/utils/generator/render'

const props = defineProps({
  element: Object,
  index: Number,
  drawingList: Array,
  activeId: {
    type: [String, Number]
  },
  formConf: Object
})
const className = ref('')
const draggableItemRef = ref(null)
const emits = defineEmits(['activeItem', 'copyItem', 'deleteItem'])

function activeItem(item: Element): void {
  emits('activeItem', item)
}
function copyItem(item: Element, parent?: Element[]): void {
  emits('copyItem', item, parent ?? props.drawingList)
}
function deleteItem(item: number | Element, parent?: Element[]): void {
  emits('deleteItem', item, parent ?? props.drawingList)
}

function getComponentData(): Record<string, any> {
  return {
    gutter: props.element.gutter,
    justify: props.element.justify,
    align: props.element.align
  }
}

watch(() => props.activeId, (val: string) => {
  className.value = (props.element.layout === 'rowFormItem' ? 'drawing-row-item' : 'drawing-item') + (val === props.element.formId ? ' active-from-item' : '')
  if (props.formConf.unFocusedComponentBorder) {
    className.value += ' unfocus-bordered'
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.drawing-item,
.drawing-row-item {
  position: relative;
  cursor: move;
  transition: all 0.3s ease;

  &.unfocus-bordered:not(.active-from-item) > div:first-child {
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
      background: var(--el-fill-color-light);
      box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
      animation: pulseGlow 2s infinite;
    }

    .component-name {
      color: var(--el-color-primary);
    }
  }

  &:hover {
    .el-form-item {
      background: var(--el-fill-color-light);
    }
  }
}

.drawing-row-item {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  padding: 0 2px;
  margin-bottom: 15px;

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

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
  }
  50% {
    box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
  }
}
</style>
