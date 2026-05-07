<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="isValueMatch(item.value)">
        <span
          v-if="(item.elTagType == 'default' || item.elTagType == '') && (item.elTagClass == '' || item.elTagClass == null)"
          :key="item.value"
          :index="index"
          class="dict-text"
          :class="item.elTagClass"
        >{{ item.label + " " }}</span>
        <el-tag
          v-else
          :disable-transitions="true"
          :key="item.value + ''"
          :index="index"
          :type="item.elTagType"
          class="dict-tag"
          :class="item.elTagClass"
        >{{ item.label + " " }}</el-tag>
      </template>
    </template>
    <template v-if="unmatch && showValue">
      {{ unmatchArray | handleArray }}
    </template>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
interface DictOption {
  label: string
  value: string | number
  elTagType?: string
  elTagClass?: string
}

interface Props {
  options?: DictOption[] | null
  value?: number | string | (number | string)[]
  showValue?: boolean
  separator?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: null,
  showValue: true,
  separator: ","
})

// 记录未匹配的项
const unmatchArray = ref<(string | number)[]>([])

const values = computed(() => {
  if (props.value === null || typeof props.value === 'undefined' || props.value === '') return []
  if (typeof props.value === 'number' || typeof props.value === 'boolean') return [props.value]
  return Array.isArray(props.value) ? props.value.map(item => '' + item) : String(props.value).split(props.separator)
})

const unmatch = computed(() => {
  unmatchArray.value = []
  // 没有value不显示
  if (props.value === null || typeof props.value === 'undefined' || props.value === '' || !Array.isArray(props.options) || props.options.length === 0) return false
  // 传入值为数组
  let unmatch = false // 添加一个标志来判断是否有未匹配项
  values.value.forEach(item => {
    if (!props.options?.some(v => v.value == item)) {
      unmatchArray.value.push(item)
      unmatch = true // 如果有未匹配项，将标志设置为true
    }
  })
  return unmatch // 返回标志的值
})

function handleArray(array: (string | number)[]): string {
  if (array.length === 0) return ""
  return array.reduce((pre, cur) => {
    return pre + " " + cur
  }, "")
}

function isValueMatch(itemValue: string | number): boolean {
  return values.value.some(val => val == itemValue)
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}

/* 标签柔和淡入 */
.dict-text,
:deep(.dict-tag) {
  animation: tagFadeIn 0.25s ease-out backwards;
}

/* 文本标签 hover */
.dict-text {
  transition: color 0.2s ease;
  cursor: default;
}

.dict-text:hover {
  color: var(--el-color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* el-tag hover */
:deep(.dict-tag) {
  transition: filter 0.2s ease, box-shadow 0.2s ease;
}

:deep(.dict-tag:hover) {
  filter: brightness(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

@keyframes tagFadeIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 暗黑模式 */
html.dark {
  :deep(.dict-tag:hover) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}
</style>
