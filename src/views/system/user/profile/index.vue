<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24" class="profile-left">
        <el-card class="profile-card profile-card--user" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><UserFilled /></el-icon>
                个人信息
              </span>
            </div>
          </template>
          <div class="profile-avatar-wrap">
            <user-avatar />
            <div class="profile-name">{{ state.user.nickName }}</div>
            <div class="profile-role">{{ state.roleGroup }}</div>
          </div>
          <div class="info-list">
            <div class="info-row" v-for="(item, idx) in infoItems" :key="idx" :style="{ animationDelay: `${0.1 + idx * 0.06}s` }">
              <div class="info-icon-wrap" :style="{ background: item.iconBg, color: item.iconColor }">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="info-content">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value" :title="item.value">{{ item.value || '-' }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="18" :xs="24" class="profile-right">
        <el-card class="profile-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><EditPen /></el-icon>
                基本资料
              </span>
            </div>
          </template>
          <el-tabs v-model="activeTab" class="profile-tabs">
            <el-tab-pane label="基本资料" name="userinfo">
              <div class="tab-panel">
                <user-info :user="state.user" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetpwd">
              <div class="tab-panel">
                <reset-pwd />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref, watch } from 'vue'
import UserAvatar from './userAvatar.vue'
import UserInfo from './userInfo.vue'
import ResetPwd from './resetPwd.vue'
import { getUserProfile } from '@/api/system/user'
import { UserFilled, EditPen, User, Phone, Message, OfficeBuilding, Timer } from '@element-plus/icons-vue'

const activeTab = ref('userinfo')
const { proxy } = getCurrentInstance() as any

const state = reactive({
  user: {} as any,
  roleGroup: '',
  postGroup: ''
})

const infoItems = ref<any[]>([])

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data
    state.roleGroup = response.roleGroup
    state.postGroup = response.postGroup
    buildInfoItems()
  })
}

function buildInfoItems() {
  const deptText = state.user.dept ? `${state.user.dept.deptName} / ${state.postGroup}` : state.postGroup
  infoItems.value = [
    { icon: 'User', label: '用户名称', value: state.user.userName, iconBg: 'var(--el-color-primary-light-9)', iconColor: 'var(--el-color-primary)' },
    { icon: 'Phone', label: '手机号码', value: state.user.phonenumber, iconBg: 'var(--el-color-success-light-9)', iconColor: 'var(--el-color-success)' },
    { icon: 'Message', label: '用户邮箱', value: state.user.email, iconBg: 'var(--el-color-warning-light-9)', iconColor: 'var(--el-color-warning)' },
    { icon: 'OfficeBuilding', label: '所属部门', value: deptText, iconBg: 'var(--el-color-info-light-9)', iconColor: 'var(--el-color-info)' },
    { icon: 'UserFilled', label: '所属角色', value: state.roleGroup, iconBg: 'var(--el-color-danger-light-9)', iconColor: 'var(--el-color-danger)' },
    { icon: 'Timer', label: '创建日期', value: state.user.createTime, iconBg: 'var(--el-color-primary-light-9)', iconColor: 'var(--el-color-primary)' },
  ]
}

getUser()
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.profile-card {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  animation: cardFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    min-height: auto;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.profile-left .profile-card {
  animation-delay: 0.05s;
}

.profile-right .profile-card {
  animation-delay: 0.15s;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    .el-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }
}

.profile-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 20px;
  animation: fadeInUp 0.5s 0.1s cubic-bezier(0.4, 0, 0.2, 1) both;

  .profile-name {
    margin-top: 14px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .profile-role {
    margin-top: 6px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  &:hover {
    background: var(--el-fill-color);
    border-color: var(--el-border-color);
    transform: translateX(3px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .info-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    font-size: 16px;
    flex-shrink: 0;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;

    .info-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

html.dark .info-row {
  background: rgba(255, 255, 255, 0.03);

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--el-border-color-darker);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.profile-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background: var(--el-border-color-lighter);
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    transition: color 0.25s ease;

    &:hover {
      color: var(--el-text-color-primary);
    }

    &.is-active {
      color: var(--el-color-primary);
    }
  }

  :deep(.el-tabs__active-bar) {
    border-radius: 2px 2px 0 0;
    height: 3px;
  }
}

.tab-panel {
  animation: fadeIn 0.35s ease;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
