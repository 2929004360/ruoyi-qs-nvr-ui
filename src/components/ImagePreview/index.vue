<template>
  <el-image
    :src="`${realSrc}`"
    fit="cover"
    :style="`width:${realWidth};height:${realHeight};`"
    :preview-src-list="realSrcList"
    preview-teleported
  >
    <template #error>
      <div class="image-slot">
        <el-icon><picture-filled /></el-icon>
      </div>
    </template>
  </el-image>
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    default: ""
  },
  width: {
    type: [Number, String],
    default: ""
  },
  height: {
    type: [Number, String],
    default: ""
  }
})

const realSrc = computed(() => {
  if (!props.src) return undefined

  const real_src = props.src.split(",")[0]
  const separator = real_src.includes('?') ? '&' : '?'

  return `${real_src}${separator}_=${Date.now()}`
})

const realSrcList = computed(() => {
  if (!props.src) {
    return undefined
  }
  const real_src_list = props.src.split(",")
  const srcList: string[] = []
  real_src_list.forEach((item: string) => {
    const separator = item.includes('?') ? '&' : '?'
    srcList.push(`${item}${separator}_=${Date.now()}`)
  })
  return srcList
})

const realWidth = computed(() =>
  typeof props.width == "string" ? props.width : `${props.width}px`
)

const realHeight = computed(() =>
  typeof props.height == "string" ? props.height : `${props.height}px`
)
</script>

<style lang="scss" scoped>
.el-image {
  border-radius: 12px;
  background-color: #f3f4f6;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.3s ease;
  overflow: hidden;
  animation: imageFadeIn 0.4s ease-out;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
  }

  :deep(.el-image__inner) {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
    }
  }

  :deep(.image-slot) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #a0aec0;
    font-size: 30px;
    animation: iconBreathe 2s ease-in-out infinite;
  }
}

@keyframes imageFadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes iconBreathe {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 暗黑模式 */
html.dark {
  .el-image {
    background-color: #2d2d2d;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15);

    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2);
    }
  }

  :deep(.image-slot) {
    color: #4a5568;
  }
}
</style>
