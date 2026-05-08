<template>
  <div ref="windowListItem" class="windowListItem" :class="{active: active, 'is-dark': isDark}" @click="onClick">
    <span class="order">{{ index + 1 }}</span>
    <canvas ref="canvas" class="windowListItemCanvas" />
  </div>
</template>

<script>
export default {
  name: 'WindowListItem',
  props: {
    index: {
      type: Number
    },
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    totalMS: {
      type: Number
    },
    startTimestamp: {
      type: Number
    },
    width: {
      type: Number
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      height: 0,
      ctx: null,
      isDark: false
    }
  },
  mounted() {
    this.detectTheme()
    this.init()
    this.drawTimeSegments()
  },
  methods: {
    /**
     * @Author: 王林25
     * @Date: 2020-04-14 09:20:22
     * @Desc: 初始化
     */
    init() {
      const { height } = this.$refs.windowListItem.getBoundingClientRect()
      this.height = height - 1
      this.$refs.canvas.width = this.width
      this.$refs.canvas.height = this.height
      this.ctx = this.$refs.canvas.getContext('2d')
    },

    /**
     * @Author: 王林25
     * @Date: 2020-04-14 15:42:49
     * @Desc: 绘制时间段
     */
    drawTimeSegments(callback, path) {
      if (!this.data.timeSegments || this.data.timeSegments.length <= 0) {
        return
      }
      const PX_PER_MS = this.width / this.totalMS // px/ms，每毫秒占的像素
      this.data.timeSegments.forEach((item) => {
        if (
          item.beginTime <= this.startTimestamp + this.totalMS &&
          item.endTime >= this.startTimestamp
        ) {
          this.ctx.beginPath()
          let x = (item.beginTime - this.startTimestamp) * PX_PER_MS
          let w
          if (x < 0) {
            x = 0
            w = (item.endTime - this.startTimestamp) * PX_PER_MS
          } else {
            w = (item.endTime - item.beginTime) * PX_PER_MS
          }
          const heightStartRatio = item.startRatio === undefined ? 0.6 : item.startRatio
          const heightEndRatio = item.endRatio === undefined ? 0.9 : item.endRatio

          const segX = x
          const segY = this.height * heightStartRatio
          const segW = w
          const segH = this.height * (heightEndRatio - heightStartRatio)
          const radius = Math.min(3, segH / 2, segW / 2)

          if (path) {
            this.drawRoundRect(this.ctx, segX, segY, segW, segH, radius)
          } else {
            this.ctx.save()
            this.ctx.shadowColor = item.color
            this.ctx.shadowBlur = 8
            this.ctx.fillStyle = item.color
            this.drawRoundRect(this.ctx, segX, segY, segW, segH, radius)
            this.ctx.fill()
            this.ctx.restore()
          }
          callback && callback(item)
        }
      })
    },

    /**
     * @Desc: 绘制圆角矩形路径
     */
    drawRoundRect(ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2
      if (h < 2 * r) r = h / 2
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    },

    /**
     * @Author: 王林25
     * @Date: 2020-04-14 14:25:43
     * @Desc: 清除画布
     */
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.width, this.height)
    },

    /**
     * @Author: 王林25
     * @Date: 2021-01-20 19:07:31
     * @Desc: 绘制
     */
    draw() {
      this.$nextTick(() => {
        this.clearCanvas()
        this.drawTimeSegments()
      })
    },

    /**
     * @Author: 王林25
     * @Date: 2021-01-20 19:26:46
     * @Desc: 点击事件
     */
    onClick(e) {
      this.$emit('click', e)
      const { left, top } = this.$refs.windowListItem.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top
      const timeSegments = this.getClickTimeSegments(x, y)
      if (timeSegments.length > 0) {
        this.$emit('click_window_timeSegments', timeSegments, this.index, this.data)
      }
    },

    /**
     * @Author: 王林25
     * @Date: 2021-01-20 16:24:54
     * @Desc: 检测当前是否点击了某个时间段
     */
    getClickTimeSegments(x, y) {
      if (!this.data.timeSegments || this.data.timeSegments.length <= 0) {
        return []
      }
      const inItems = []
      this.drawTimeSegments((item) => {
        if (this.ctx.isPointInPath(x, y)) {
          inItems.push(item)
        }
      }, true)
      return inItems
    },

    /**
     * @Author: 王林25
     * @Date: 2021-01-21 11:25:26
     * @Desc: 获取位置信息
     */
    getRect() {
      return this.$refs.windowListItem ? this.$refs.windowListItem.getBoundingClientRect() : null
    },

    /**
     * @Desc: 检测当前主题
     */
    detectTheme() {
      this.isDark = document.documentElement.classList.contains('dark')
    }
  }
}
</script>

<style scoped>
.windowListItem {
  width: 100%;
  height: 30px;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  user-select: none;
  transition: background-color 0.2s ease;
}
.windowListItem.is-dark {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}
.windowListItem.active {
  background-color: rgba(64, 158, 255, 0.08);
}
.windowListItem.is-dark.active {
  background-color: rgba(64, 158, 255, 0.12);
}
.windowListItem .order {
  position: absolute;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(0, 0, 0, 0.35);
  font-size: 12px;
  font-weight: 500;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}
.windowListItem.is-dark .order {
  color: rgba(255, 255, 255, 0.45);
  border-right-color: rgba(255, 255, 255, 0.06);
}

</style>
