<template>
  <div>
    <el-popover ref="noticePopover" placement="bottom-end" :width="320" trigger="manual" v-model:visible="noticeVisible" popper-class="notice-popover">
      <!-- 弹出内容 -->
      <div class="notice-header">
        <span class="notice-title">通知公告</span>
        <span class="notice-mark-all" @click="markAllRead">全部已读</span>
      </div>
      <div v-if="noticeLoading" class="notice-loading">
        <el-icon class="is-loading"><Loading /></el-icon> 加载中...
      </div>
      <div v-else-if="noticeList.length === 0" class="notice-empty">
        <div class="notice-empty-content">
          <el-icon class="notice-empty-icon"><Postcard /></el-icon>
          <span class="notice-empty-text">暂无公告</span>
        </div>
      </div>
      <div v-else>
        <div v-for="item in noticeList" :key="item.noticeId" class="notice-item" :class="{ 'is-read': item.isRead }" @click="previewNotice(item)">
          <el-tag size="small" :type="item.noticeType === '1' ? 'warning' : 'success'" class="notice-tag">
            {{ item.noticeType === '1' ? '通知' : '公告' }}
          </el-tag>
          <span class="notice-item-title">{{ item.noticeTitle }}</span>
          <span class="notice-item-date">{{ item.createTime }}</span>
        </div>
      </div>

      <!-- 触发器 -->
      <template #reference>
        <div class="right-menu-item hover-effect notice-trigger" @mouseenter="onNoticeEnter" @mouseleave="onNoticeLeave">
          <el-icon :size="18" class="bell-icon"><Bell /></el-icon>
          <span v-if="unreadCount > 0" class="notice-badge">{{ unreadCount }}</span>
        </div>
      </template>
    </el-popover>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" :title="previewTitle" width="680px" append-to-body class="notice-preview-dialog">
      <div class="notice-preview-meta">
        <el-tag size="small" :type="previewNoticeType === '1' ? 'warning' : 'success'">
          {{ previewNoticeType === '1' ? '通知' : '公告' }}
        </el-tag>
        <span class="notice-preview-info">
          <el-icon><User /></el-icon> {{ previewCreateBy }}
        </span>
        <span class="notice-preview-info">
          <el-icon><Timer /></el-icon> {{ previewCreateTime }}
        </span>
      </div>
      <div class="notice-preview-divider"></div>
      <div class="notice-preview-content" v-html="previewContent"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Bell } from '@element-plus/icons-vue'
import { listNoticeTop, markNoticeRead, markNoticeReadAll, getNotice } from '@/api/system/notice'
import type { SysNotice } from '@/types/api/system/notice'

interface PopperElement extends HTMLElement {
  _noticeBound?: boolean
}

const noticePopover = ref<InstanceType<typeof import('element-plus')['ElPopover']> | null>(null)
const noticeList = ref<SysNotice[]>([])
const unreadCount = ref<number>(0)
const noticeLoading = ref<boolean>(false)
const noticeVisible = ref<boolean>(false)
const noticeLeaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const previewVisible = ref<boolean>(false)
const previewTitle = ref<string>('')
const previewContent = ref<string>('')
const previewNoticeType = ref<string>('')
const previewCreateBy = ref<string>('')
const previewCreateTime = ref<string>('')

// 加载顶部公告列表
function loadNoticeTop(): void {
  noticeLoading.value = true
  listNoticeTop().then(res => {
    noticeList.value = res.data || []
    unreadCount.value = res.unreadCount !== undefined ? res.unreadCount : noticeList.value.filter((n: SysNotice) => !n.isRead).length
  }).finally(() => {
    noticeLoading.value = false
  })
}

onMounted(() => loadNoticeTop())

// 鼠标移入铃铛区域
function onNoticeEnter(): void {
  clearTimeout(noticeLeaveTimer.value ?? undefined)
  noticeVisible.value = true
  nextTick(() => {
    const popper = (noticePopover.value as any)?.popperRef?.contentRef as PopperElement | undefined
    if (popper && !popper._noticeBound) {
      popper._noticeBound = true
      popper.addEventListener('mouseenter', () => clearTimeout(noticeLeaveTimer.value ?? undefined))
      popper.addEventListener('mouseleave', () => {
        noticeLeaveTimer.value = setTimeout(() => { noticeVisible.value = false }, 100)
      })
    }
  })
}

// 鼠标离开铃铛区域
function onNoticeLeave(): void {
  noticeLeaveTimer.value = setTimeout(() => { noticeVisible.value = false }, 150)
}

// 预览公告详情
function previewNotice(item: SysNotice): void {
  if (!item.isRead) {
    markNoticeRead(item.noticeId!).catch(() => {})
    const idx = noticeList.value.indexOf(item)
    if (idx !== -1) noticeList.value[idx] = { ...item, isRead: true }
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  getNotice(item.noticeId!).then(res => {
    const notice = res.data as SysNotice
    previewTitle.value = notice.noticeTitle
    previewContent.value = notice.noticeContent
    previewNoticeType.value = notice.noticeType
    previewCreateBy.value = notice.createBy
    previewCreateTime.value = notice.createTime
    previewVisible.value = true
  })
}

// 全部已读
function markAllRead(): void {
  const ids = noticeList.value.map((n: SysNotice) => n.noticeId).join(',')
  if (!ids) return
  markNoticeReadAll(ids).catch(() => {})
  noticeList.value = noticeList.value.map((n: SysNotice) => ({ ...n, isRead: true }))
  unreadCount.value = 0
}
</script>

<style lang="scss" scoped>
.notice-trigger {
  position: relative;

  .bell-icon {
    transform-origin: top center;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  // 有未读消息时，铃铛轻微摇摆
  &:has(.notice-badge) .bell-icon {
    animation: bellIdle 2.5s ease-in-out infinite;
  }

  &:hover {
    .bell-icon {
      animation: bellShake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
      transform: translateY(-2px);
    }
  }

  .notice-badge {
    position: absolute;
    top: -6px;
    right: -8px;
    background: linear-gradient(135deg, #ff6b6b, #f56c6c);
    color: #fff;
    border-radius: 10px;
    font-size: 10px;
    height: 16px;
    line-height: 16px;
    padding: 0 5px;
    min-width: 16px;
    text-align: center;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 2px 6px rgba(245, 108, 108, 0.35);
    animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    z-index: 10;
  }
}

@keyframes bellIdle {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(6deg); }
  20% { transform: rotate(-6deg); }
  30% { transform: rotate(3deg); }
  40% { transform: rotate(0deg); }
}

@keyframes bellShake {
  0% { transform: rotate(0deg); }
  15% { transform: rotate(12deg); }
  30% { transform: rotate(-12deg); }
  45% { transform: rotate(8deg); }
  60% { transform: rotate(-4deg); }
  75% { transform: rotate(2deg); }
  100% { transform: rotate(0deg); }
}

@keyframes badgePop {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

.notice-popover { padding: 0 !important; }

.notice-popover .notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-bg-color-overlay, #f7f9fb);
  border-bottom: 1px solid var(--el-border-color-lighter, #eee);
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary, #333);
}

.notice-popover .notice-mark-all {
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: normal;
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-popover .notice-mark-all:hover {
  color: var(--el-color-primary-light-3);
}

.notice-popover .notice-loading,
.notice-popover .notice-empty {
  padding: 32px 24px;
  text-align: center;
  color: var(--el-text-color-placeholder, #bbb);
  font-size: 13px;
  line-height: 1.8;
}

.notice-popover .notice-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.notice-popover .notice-empty-icon {
  font-size: 24px;
  margin-bottom: 6px;
  display: block;
}

.notice-popover .notice-empty-text {
  display: block;
}

.notice-popover .notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #f5f5f5);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:last-child { border-bottom: none; }
  &:hover {
    background: var(--el-fill-color-light, #f7f9fb);
    transform: translateX(2px);
  }

  &.is-read .notice-tag,
  &.is-read .notice-item-title,
  &.is-read .notice-item-date {
    opacity: 0.45;
    filter: grayscale(1);
    color: var(--el-text-color-placeholder, #999);
  }
}

.notice-popover .notice-tag { flex-shrink: 0; }

.notice-popover .notice-item-title {
  flex: 1;
  font-size: 13px;
  color: var(--el-text-color-primary, #333);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-popover .notice-item-date {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder, #bbb);
}
</style>

<style>
.notice-preview-dialog .el-dialog__body { padding: 0 10px 10px; }

.notice-preview-dialog .notice-preview-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary, #888);
}

.notice-preview-dialog .notice-preview-info { display: flex; align-items: center; gap: 4px; }

.notice-preview-dialog .notice-preview-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--el-border-color, #e2e8f0), transparent);
  margin-bottom: 16px;
}

.notice-preview-dialog .notice-preview-content {
  font-size: 14px;
  line-height: 1.85;
  color: var(--el-text-color-regular, #2d3748);
  word-break: break-word;
}

.notice-preview-dialog .notice-preview-content img { max-width: 100%; border-radius: 4px; }
.notice-preview-dialog .notice-preview-content p { margin: 0 0 1em; }
.notice-preview-dialog .notice-preview-content a { color: var(--el-color-primary); text-decoration: underline; }
</style>
