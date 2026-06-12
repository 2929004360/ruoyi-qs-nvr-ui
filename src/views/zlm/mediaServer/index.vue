<template>
  <div class="app-container">
    <div class="header-bar">
      <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      <right-toolbar :search="false" @queryTable="getList"></right-toolbar>
    </div>

    <div class="server-grid">
      <TransitionGroup name="card-list" tag="div">
        <div v-for="item in wvpMediaServerList" :key="item.id" class="server-card">
          <div v-if="item.type === 'zlm'" class="card-img-zlm"></div>
          <div v-if="item.type === 'abl'" class="card-img-abl"></div>
          <div class="card-content">
            <div class="card-info">
              <div class="server-id">{{ item.id }}</div>
              <div class="server-ip">{{ item.ip }}</div>
              <div class="server-status">
                <span :class="['status-dot', item.status === 'ON' ? 'online' : 'offline']"></span>
                <span class="status-text">{{ item.status === 'ON' ? '在线' : '离线' }}</span>
              </div>
            </div>

            <div class="card-toolbar">
              <div class="toolbar-actions">
                <el-tooltip content="查看">
                  <el-button
                    type="primary"
                    text
                    bg
                    size="small"
                    icon="View"
                    @click="handleView(item)"
                  />
                </el-tooltip>
                <el-tooltip content="编辑" v-if="!item.defaultServer">
                  <el-button
                    type="success"
                    text
                    bg
                    size="small"
                    icon="Edit"
                    @click="handleUpdate(item)"
                  />
                </el-tooltip>
                <el-tooltip content="移除" v-if="!item.defaultServer">
                  <el-button
                    type="danger"
                    text
                    bg
                    size="small"
                    icon="Delete"
                    @click="handleDelete(item)"
                  />
                </el-tooltip>
                <el-tooltip content="重启">
                  <el-button
                    type="warning"
                    text
                    bg
                    size="small"
                    icon="RefreshRight"
                    @click="handleRestartServer(item)"
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
          <el-icon v-if="item.defaultServer" class="default-icon" color="#67C23A">
            <SuccessFilled/>
          </el-icon>
          <el-tag v-if="item.defaultServer" type="success" class="default-tag">默认</el-tag>
        </div>
      </TransitionGroup>
    </div>

    <el-dialog draggable title="媒体节点详情" v-model="openView" width="720px" append-to-body class="server-detail-dialog">
      <div class="detail-container">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-title">
            <el-icon><InfoFilled /></el-icon>
            <span>基本信息</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">节点ID</span>
              <span class="info-value">{{ rowData.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">服务IP</span>
              <span class="info-value">{{ rowData.ip }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">服务类型</span>
              <el-tag v-if="rowData.type === 'zlm'" type="primary">ZLMediaKit</el-tag>
              <el-tag v-if="rowData.type === 'abl'" type="success">ABLMediaServer</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">自动配置</span>
              <el-tag v-if="rowData.autoConfig" type="success">已启用</el-tag>
              <el-tag v-else type="info">未启用</el-tag>
            </div>
          </div>
        </div>

        <!-- 端口配置 -->
        <div class="detail-section">
          <div class="section-title">
            <el-icon><Connection /></el-icon>
            <span>端口配置</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">HTTP端口</span>
              <span class="info-value">{{ rowData.httpPort }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">HTTPS端口</span>
              <span class="info-value">{{ rowData.httpSslPort }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">RTMP端口</span>
              <span class="info-value">{{ rowData.rtmpPort }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">RTSP端口</span>
              <span class="info-value">{{ rowData.rtspPort }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">录像管理端口</span>
              <span class="info-value">{{ rowData.recordAssistPort }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">收流端口模式</span>
              <el-tag v-if="rowData.rtpEnable" type="warning">多端口</el-tag>
              <el-tag v-else type="info">单端口</el-tag>
            </div>
            <div class="info-item full-width">
              <span class="info-label">收流端口范围</span>
              <span class="info-value">{{ rowData.rtpPortRange }}</span>
            </div>
          </div>
        </div>

        <!-- 网络配置 -->
        <div class="detail-section">
          <div class="section-title">
            <el-icon><Monitor /></el-icon>
            <span>网络配置</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">流IP</span>
              <span class="info-value">{{ rowData.streamIp }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">HOOK IP</span>
              <span class="info-value">{{ rowData.hookIp }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">SDP IP</span>
              <span class="info-value">{{ rowData.sdpIp }}</span>
            </div>
          </div>
        </div>

        <!-- 安全配置 -->
        <div class="detail-section">
          <div class="section-title">
            <el-icon><Lock /></el-icon>
            <span>安全配置</span>
          </div>
          <div class="info-grid">
            <div class="info-item full-width">
              <span class="info-label">SECRET</span>
              <span class="info-value secret-value">{{ rowData.secret }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="MediaServer" lang="ts">
import router from "@/router";
import {delMediaServer, getMediaServerList, restartServer} from "../../../api/qs/zlm.js";
import {MediaServer} from "@/types/api";
import {InfoFilled, Connection, Monitor, Lock, View, Edit, Delete, RefreshRight, SuccessFilled} from '@element-plus/icons-vue';

const {proxy} = getCurrentInstance();

const wvpMediaServerList = ref<MediaServer[]>([]);
const openView = ref(false);

const loading = ref(true);

const rowData = ref({});

/** 查询媒体服务器列表 */
function getList() {
  loading.value = true;
  getMediaServerList().then(response => {
    wvpMediaServerList.value = response.data;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  router.push(`/mediaServer/addMediaServer/index`);
}

/** 修改按钮操作 */
function handleUpdate(row) {
  router.push({
    path: '/mediaServer/updateMediaServer/index',
    query: {id: row.id}
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id
  proxy.$modal.confirm('确认删除此节点？').then(function () {
    return delMediaServer(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/**
 * 查看按钮操作
 *
 * @param row
 */
function handleView(row) {
  openView.value = true
  rowData.value = row;
}

/** 删除按钮操作 */
function handleRestartServer(row) {
  const _ids = row.id
  proxy.$modal.confirm('重启服务器,只有 Daemon 方式才能重启，否则是直接关闭！是否继续？').then(function () {
    return restartServer(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("重启成功")
  }).catch(() => {
  })
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  padding: 16px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.server-grid {
  > div {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.card-list-move {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.server-card {
  position: relative;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s ease forwards;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
    transform: translateY(-4px);
    
    .card-img-zlm,
    .card-img-abl {
      transform: scale(1.05);
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-img-zlm,
.card-img-abl {
  width: 100%;
  height: 160px;
  background: url('../../../assets/images/zlm-logo.png') no-repeat center;
  background-size: contain;
  background-color: #f8fafc;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: logoFadeIn 0.6s ease 0.2s both;
}

@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card-content {
  padding: 16px;
  animation: contentFadeIn 0.5s ease 0.3s both;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-info {
  margin-bottom: 12px;
}

.server-id {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  transition: color 0.3s ease;
}

.server-ip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.server-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  transition: transform 0.3s ease;
  
  &.online {
    background: #67c23a;
    animation: pulse-green 2s ease-in-out infinite;
  }
  
  &.offline {
    background: #f56c6c;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: inherit;
    opacity: 0.4;
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}

@keyframes pulse-green {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(103, 194, 58, 0);
  }
}

.status-text {
  font-size: 13px;
  color: #606266;
  transition: color 0.3s ease;
}

.card-toolbar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f5f7fa;
  opacity: 0;
  transform: translateY(10px);
  animation: actionsFadeIn 0.4s ease 0.4s both;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

@keyframes actionsFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.default-icon {
  position: absolute;
  right: 12px;
  top: 12px;
  font-size: 20px;
  background: white;
  border-radius: 50%;
  padding: 4px;
  animation: bounceIn 0.6s ease 0.5s both;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.default-tag {
  position: absolute;
  left: 12px;
  top: 12px;
  animation: slideInRight 0.5s ease 0.4s both;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ===== 卡片视图按钮样式 - 白色图标 ===== */
/* 操作按钮 - 强制覆盖 text bg 样式 */
.toolbar-actions .el-button--primary,
.toolbar-actions .el-button--primary[text],
.toolbar-actions .el-button--primary[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}

.toolbar-actions .el-button--danger,
.toolbar-actions .el-button--danger[text],
.toolbar-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.toolbar-actions .el-button--success,
.toolbar-actions .el-button--success[text],
.toolbar-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.toolbar-actions .el-button--warning,
.toolbar-actions .el-button--warning[text],
.toolbar-actions .el-button--warning[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-warning) !important;
  border-color: var(--el-color-warning) !important;
}

.toolbar-actions .el-button .el-icon {
  color: #ffffff !important;
}

/* 悬停时稍微浅一点 */
.toolbar-actions .el-button--primary:hover,
.toolbar-actions .el-button--primary[text]:hover,
.toolbar-actions .el-button--primary[text][bg]:hover {
  background-color: var(--el-color-primary-light-3) !important;
  border-color: var(--el-color-primary-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--primary:hover .el-icon {
  color: #ffffff !important;
}

.toolbar-actions .el-button--danger:hover,
.toolbar-actions .el-button--danger[text]:hover,
.toolbar-actions .el-button--danger[text][bg]:hover {
  background-color: var(--el-color-danger-light-3) !important;
  border-color: var(--el-color-danger-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--danger:hover .el-icon {
  color: #ffffff !important;
}

.toolbar-actions .el-button--success:hover,
.toolbar-actions .el-button--success[text]:hover,
.toolbar-actions .el-button--success[text][bg]:hover {
  background-color: var(--el-color-success-light-3) !important;
  border-color: var(--el-color-success-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--success:hover .el-icon {
  color: #ffffff !important;
}

.toolbar-actions .el-button--warning:hover,
.toolbar-actions .el-button--warning[text]:hover,
.toolbar-actions .el-button--warning[text][bg]:hover {
  background-color: var(--el-color-warning-light-3) !important;
  border-color: var(--el-color-warning-light-3) !important;
  color: #ffffff !important;
}

.toolbar-actions .el-button--warning:hover .el-icon {
  color: #ffffff !important;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-descriptions__cell) {
  padding: 14px 16px;
}

:deep(.el-button--text) {
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

/* 详情对话框样式 */
.detail-container {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  .el-icon {
    color: #409eff;
    font-size: 18px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.info-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  word-break: break-all;

  &.secret-value {
    font-family: 'Courier New', monospace;
    color: #f56c6c;
    background: #fef0f0;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
  }
}

/* 暗黑模式适配 */
html.dark {
  .server-card {
    background: var(--el-bg-color-overlay, #1d1e1f);
    border-color: var(--el-border-color-light, #434343);

    &:hover {
      border-color: #409eff;
      box-shadow: 0 8px 24px rgba(64, 158, 255, 0.2);
    }
  }

  .card-img-zlm,
  .card-img-abl {
    background-color: var(--el-bg-color, #141414);
  }

  .server-id {
    color: var(--el-text-color-primary, #ffffff);
  }

  .server-ip {
    color: var(--el-text-color-secondary, #909399);
  }

  .status-text {
    color: var(--el-text-color-regular, #d0d0d0);
  }

  .card-actions {
    border-top-color: var(--el-border-color-lighter, #303030);
  }

  .default-icon {
    background: var(--el-bg-color-overlay, #1d1e1f);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* 详情对话框暗黑模式 */
  .section-title {
    color: var(--el-text-color-primary, #ffffff);
    border-bottom-color: var(--el-border-color-lighter, #303030);
  }

  .info-label {
    color: var(--el-text-color-secondary, #909399);
  }

  .info-value {
    color: var(--el-text-color-primary, #ffffff);

    &.secret-value {
      background: rgba(245, 108, 108, 0.15);
      color: #f56c6c;
    }
  }
}
</style>
