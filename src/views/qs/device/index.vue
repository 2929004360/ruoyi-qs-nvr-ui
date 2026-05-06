<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
            v-model="queryParams.deviceName"
            placeholder="请输入设备名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="IP地址" prop="ipAddress">
        <el-input
            v-model="queryParams.ipAddress"
            placeholder="请输入IP地址"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接入类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择直播流接入类型" clearable>
          <el-option
              v-for="dict in qs_live_stream_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
              v-for="dict in qs_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备状态" prop="deviceStatus">
        <el-select v-model="queryParams.deviceStatus" placeholder="请选择设备状态" clearable>
          <el-option
              v-for="dict in qs_device_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="2" class="view-switch">
        <el-radio-group v-model="viewMode" size="small">
          <el-tooltip content="列表视图" placement="bottom" :show-after="500">
            <el-radio-button value="list">
              <el-icon><List /></el-icon>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip content="卡片视图" placement="bottom" :show-after="500">
            <el-radio-button value="card">
              <el-icon><Grid /></el-icon>
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="viewMode === 'list'" v-loading="loading" :data="deviceList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" fixed/>
      <el-table-column label="编号" align="center" prop="id" width="60" fixed/>
      <el-table-column label="设备名称" align="center" prop="deviceName" fixed/>
      <el-table-column label="IP地址" align="center" prop="ipAddress"/>
      <el-table-column label="接入类型" align="center" prop="type" width="100">
        <template #default="scope">
          <dict-tag :options="qs_live_stream_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="直播流地址" align="center" prop="liveAddress" min-width="180">
        <template #default="scope">
          <div v-if="scope.row.liveAddress">
            <span>{{ scope.row.liveAddress }}</span>
            <el-button link type="primary" @click="handleCopy(scope.row.liveAddress)">复制</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="通道号" align="center" width="150">
        <template #default="scope">
          <div v-if="scope.row.channel">
            {{scope.row.channel}}
          </div>
          <div v-else>
            {{scope.row.gbChannelId}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="截图" align="center" prop="snap" width="150">
        <template #default="scope">
          <image-preview v-if="scope.row.snap" :src="scope.row.snap" :width="100" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              active-value="ENABLE"
              inactive-value="DEACTIVATE"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="设备状态" align="center" prop="deviceStatus" width="100">
        <template #default="scope">
          <dict-tag :options="qs_device_status" :value="scope.row.deviceStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200" fixed="right">
        <template #default="scope">
          <el-button link
                     type="primary"
                     icon="VideoPlay"
                     @click="handlePlay(scope.row)"
                     :loading="scope.row.loading"
                     v-if="scope.row.deviceStatus === 'ON'"
          >
            播放
          </el-button>
          <el-button link
                     v-if="scope.row.streamStatus === '1' && scope.row.type !== '13'"
                     type="danger"
                     icon="SwitchButton"
                     @click="handleStopPlay(scope.row)"
          >
            停止
          </el-button>
          <el-button link type="primary"
                     icon="Position"
                     @click="handleAccessAddress(scope.row)"
                     v-if="scope.row.type === '13'">
            接入地址
          </el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">
            修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 卡片视图 -->
    <div v-else class="card-view" v-loading="loading">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in deviceList" :key="item.id">
          <div class="device-card" :class="{ 'is-selected': item.checked, 'is-online': item.deviceStatus === 'ON' }">
            <!-- 媒体区 -->
            <div class="card-media">
              <div class="media-inner">
                <image-preview v-if="item.snap" :src="item.snap" :width="'100%'" :height="'100%'" />
                <div v-else class="snapshot-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>暂无截图</span>
                </div>
              </div>
              
              <!-- 左上角复选框 -->
              <el-checkbox v-model="item.checked" @change="handleCardSelection" class="card-checkbox" />
              
              <!-- 底部玻璃信息条 -->
              <div class="media-glass-bar">
                <h3 class="bar-device-name" :title="item.deviceName">{{ item.deviceName }}</h3>
                <div class="status-indicator" :class="item.deviceStatus === 'ON' ? 'online' : 'offline'">
                  <span class="status-dot" :class="item.deviceStatus === 'ON' ? 'pulse' : 'breathe'"></span>
                  <span class="status-text">{{ item.deviceStatus === 'ON' ? '在线' : '离线' }}</span>
                </div>
              </div>
            </div>

            <!-- 信息区 -->
            <div class="card-info">
              <div class="info-tags">
                <span class="info-tag">
                  <span class="tag-label">ID</span>
                  <span class="tag-val">{{ item.id }}</span>
                </span>
                <span class="info-tag">
                  <span class="tag-label">IP</span>
                  <span class="tag-val">{{ item.ipAddress || '-' }}</span>
                </span>
                <dict-tag :options="qs_live_stream_type" :value="item.type" size="small" class="type-tag" />
              </div>

              <div class="info-channel">
                <span class="channel-label">通道</span>
                <span class="channel-val">{{ item.channel || item.gbChannelId || '-' }}</span>
              </div>

              <div class="info-footer">
                <el-switch
                  v-model="item.status"
                  active-value="ENABLE"
                  inactive-value="DEACTIVATE"
                  @change="handleStatusChange(item)"
                  size="small"
                />
                <span class="remark" v-if="item.remark" :title="item.remark">{{ item.remark }}</span>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="card-toolbar">
              <el-button
                type="primary"
                size="small"
                icon="VideoPlay"
                @click="handlePlay(item)"
                :loading="item.loading"
                :disabled="item.deviceStatus !== 'ON'"
                class="btn-play"
              >
                播放
              </el-button>
              <div class="toolbar-actions">
                <el-tooltip content="停止" v-if="item.streamStatus === '1' && item.type !== '13'">
                  <el-button
                    type="danger"
                    text
                    bg
                    size="small"
                    icon="SwitchButton"
                    @click="handleStopPlay(item)"
                  />
                </el-tooltip>
                <el-tooltip content="接入地址" v-if="item.type === '13'">
                  <el-button
                    type="success"
                    text
                    bg
                    size="small"
                    icon="Position"
                    @click="handleAccessAddress(item)"
                  />
                </el-tooltip>
                <el-tooltip content="编辑">
                  <el-button
                    type="primary"
                    text
                    bg
                    size="small"
                    icon="Edit"
                    @click="handleUpdate(item)"
                  />
                </el-tooltip>
                <el-tooltip content="删除">
                  <el-button
                    type="danger"
                    text
                    bg
                    size="small"
                    icon="Delete"
                    @click="handleDelete(item)"
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改视频监控设备对话框 -->
    <el-dialog :title="title" v-model="open" width="960px" append-to-body draggable>
      <el-form ref="deviceRef" :model="form" :rules="rules" label-width="110px">
        <!-- 基础信息分组 -->
        <el-card class="form-card" body-style="padding: 16px 20px;">
          <template #header>
            <div class="card-header">
              <span style="font-weight: 500; color: #303133; font-size: 14px;">基础信息</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="接入类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择接入类型" @change="liveStreamChange" filterable style="width: 100%;">
                  <el-option
                    v-for="dict in qs_live_stream_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备名称" prop="deviceName">
                <el-input v-model="form.deviceName" placeholder="请输入设备名称" :maxlength="100" show-word-limit/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 连接配置分组 -->
        <el-card class="form-card" body-style="padding: 16px 20px;">
          <template #header>
            <div class="card-header">
              <span style="font-weight: 500; color: #303133; font-size: 14px;">连接配置</span>
            </div>
          </template>
          
          <!-- 通用流地址 -->
          <el-form-item label="流地址"
                      prop="liveAddress"
                      v-if="form.type === '1' || form.type === '2' || form.type === '3' || form.type === '4'"
          >
            <el-input v-model="form.liveAddress" placeholder="请输入流地址" :maxlength="1024" show-word-limit/>
          </el-form-item>
          
          <!-- 视频文件 -->
          <el-form-item label="视频文件" prop="liveAddress"
                        v-if="form.type === '6'"
          >
            <file-upload
                v-model="form.liveAddress"
                :fileType="['mp4']"
                :limit="1"
                :fileSize="1204"
            />
          </el-form-item>

          <!-- 上线类型 -->
          <el-form-item label="上线类型" prop="onlineType" v-if="form.type === '9'">
            <el-radio-group v-model="form.onlineType" @change="onlineTypeChange">
              <el-radio
                  v-for="dict in qs_online_type"
                  :key="dict.value"
                  :label="dict.value"
              >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- IP/端口/用户名/密码 -->
          <el-row :gutter="20" v-if="form.type === '7' || form.type === '5' || form.type === '9'">
            <el-col :span="12">
              <el-form-item label="IP地址" prop="ipAddress"
                            v-if="form.type === '7' || (form.type === '9' && form.onlineType === '1')">
                <el-input v-model="form.ipAddress" placeholder="请输入IP地址" :maxlength="50" show-word-limit/>
              </el-form-item>
              <el-form-item label="设备IP" prop="ipAddress"
                            v-if="form.type === '5'">
                <el-select v-model="form.ipAddress" @change="onvifDeviceCodeChange" placeholder="请选择设备IP"
                          filterable style="width: 100%;">
                  <el-option
                    v-for="item in onvifDeviceList"
                    :key="item.ip"
                    :label="item.ip"
                    :value="item.ip"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="端口" prop="port"
                            v-if="form.type === '7' || (form.type === '9' && form.onlineType === '1')">
                <el-input v-model="form.port" placeholder="请输入端口" disabled :maxlength="10" show-word-limit/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="form.type === '7' || form.type === '5' || form.type === '9'">
            <el-col :span="12">
              <el-form-item label="用户名" prop="userName">
                <el-input v-model="form.userName" placeholder="请输入用户名" :maxlength="64" show-word-limit/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" placeholder="请输入密码" :maxlength="128" show-word-limit type="password" show-password/>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 海康ISUP设备ID -->
          <el-form-item label="设备ID" prop="deviceCode" v-if="form.type === '8'">
            <el-select v-model="form.deviceCode" @change="haikangIsupDeviceCodeChange" placeholder="请选择设备"
                       filterable style="width: 100%;">
              <el-option
                v-for="item in haiKangIsupDeviceList"
                :key="item.deviceId"
                :label="item.deviceId"
                :value="item.deviceId"
              >
                <div style="display: flex; justify-content: space-between;">
                  <span>{{ item.deviceId }}</span>
                  <span style="color: #909399; font-size: 12px;">{{ item.ip }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 大华设备ID -->
          <el-form-item label="设备ID" prop="deviceCode" v-if="form.type === '9' && form.onlineType === '2'">
            <el-select v-model="form.deviceCode" @change="dahuaDeviceCodeChange" placeholder="请选择设备"
                       filterable style="width: 100%;">
              <el-option
                v-for="item in dahuaDeviceList"
                :key="item.deviceId"
                :label="item.deviceId"
                :value="item.deviceId"
              >
                <div style="display: flex; justify-content: space-between;">
                  <span>{{ item.deviceId }}</span>
                  <span style="color: #909399; font-size: 12px;">{{ item.ip }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 通道号/码流类型 -->
          <el-row :gutter="20" v-if="form.type === '7' || form.type === '8' || form.type === '9'">
            <el-col :span="12">
              <el-form-item label="通道号" prop="channel">
                <el-input v-model="form.channel" placeholder="请输入通道号" @input="handleNumberInput" :maxlength="5"
                          show-word-limit/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="码流类型" prop="streamType">
                <el-radio-group v-model="form.streamType">
                  <el-radio
                    v-for="dict in qs_stream_type"
                    :key="dict.value"
                    :label="dict.value"
                  >{{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- ONVIF验证 -->
          <el-form-item label="验证类型" prop="onvifAuth"
                        v-if="form.type === '5'">
            <el-radio-group v-model="form.onvifAuth">
              <el-radio
                v-for="dict in qs_onvif_auth"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.type === '5'" style="margin: -8px 0 0 110px;">
            <el-button type="primary" @click="onvifAuthLogin" size="small">认证</el-button>
          </el-form-item>

          <!-- ONVIF直播流地址 -->
          <el-form-item label="流地址"
                        prop="liveAddress"
                        v-if="form.type === '5'"
          >
            <el-select v-model="form.liveAddress" placeholder="请选择流地址" filterable style="width: 100%;">
              <el-option
                v-for="item in streamUris"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>

          <!-- 国标28181配置 -->
          <template v-if="form.type === '12'">
            <el-form-item label="国标设备" prop="gbDeviceId">
              <el-select v-model="form.gbDeviceId" placeholder="请选择国标设备" @change="gbDeviceChange" filterable style="width: 100%;">
                <el-option
                  v-for="item in gb28181DeviceList"
                  :key="item.deviceId"
                  :label="item.name"
                  :value="item.deviceId"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 2px 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span
                        :style="{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: item.onLine ? '#67C23A' : '#909399'
                        }"
                      ></span>
                      <span style="font-weight: 500;">{{ item.name }}</span>
                    </div>
                    <span style="color: #909399; font-size: 12px; font-family: 'Courier New', monospace;">{{ item.deviceId }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="国标通道" prop="gbChannelId">
              <el-select v-model="form.gbChannelId" placeholder="请选择国标通道" @change="gbChannelChange" filterable :disabled="!form.gbDeviceId" style="width: 100%;">
                <el-option
                  v-for="item in gb28181ChannelList"
                  :key="item.gbDeviceId || item.deviceId"
                  :label="item.gbName || item.name"
                  :value="item.gbDeviceId || item.deviceId"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 2px 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span
                        :style="{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: (item.gbStatus || item.status) === 'ON' ? '#67C23A' : '#909399'
                        }"
                      ></span>
                      <span style="font-weight: 500;">{{ item.gbName || item.name }}</span>
                    </div>
                    <span style="color: #909399; font-size: 12px; font-family: 'Courier New', monospace;">{{ item.gbDeviceId || item.deviceId }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="传输模式" prop="streamMode">
              <el-radio-group v-model="form.streamMode">
                <el-radio label="UDP">UDP</el-radio>
                <el-radio label="TCP-ACTIVE">TCP主动</el-radio>
                <el-radio label="TCP-PASSIVE">TCP被动</el-radio>
              </el-radio-group>
            </el-form-item>
          </template>

          <!-- JT1078 配置 -->
          <template v-if="form.type === '14'">
            <el-form-item label="JT1078 设备" prop="deviceCode">
              <el-select v-model="form.deviceCode" placeholder="请选择 JT1078 设备" @change="jt1078DeviceChange" filterable style="width: 100%;">
                <el-option
                  v-for="item in jt1078DeviceList"
                  :key="item.deviceId"
                  :value="item.deviceId"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 2px 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span
                        :style="{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: item.online ? '#67C23A' : '#909399'
                        }"
                      ></span>
                      <span style="font-weight: 500;">{{ item.plateNo || item.deviceId }}</span>
                    </div>
                    <span style="color: #909399; font-size: 12px; font-family: 'Courier New', monospace;">{{ item.mobileNo }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="通道号" prop="channel">
              <el-input v-model="form.channel" placeholder="请输入通道号" @input="handleNumberInput" :maxlength="5" show-word-limit/>
            </el-form-item>

            <el-form-item label="手机号" prop="jtMobileNo">
              <el-input v-model="form.jtMobileNo" placeholder="请输入手机号" :maxlength="20" show-word-limit disabled/>
            </el-form-item>

            <el-form-item label="车牌号" prop="jtPlateNo">
              <el-input v-model="form.jtPlateNo" placeholder="请输入车牌号" :maxlength="20" show-word-limit disabled/>
            </el-form-item>

            <el-form-item label="车牌颜色" prop="jtPlateColor">
              <el-select v-model="form.jtPlateColor" placeholder="请选择车牌颜色" disabled style="width: 100%;">
                <el-option label="蓝牌" :value="1" />
                <el-option label="黄牌" :value="2" />
                <el-option label="黑牌" :value="3" />
                <el-option label="白牌" :value="4" />
                <el-option label="绿牌" :value="5" />
                <el-option label="黄绿牌" :value="6" />
              </el-select>
            </el-form-item>

            <el-form-item label="传输模式" prop="streamMode">
              <el-radio-group v-model="form.streamMode">
                <el-radio label="UDP">UDP</el-radio>
                <el-radio label="TCP-ACTIVE">TCP主动</el-radio>
                <el-radio label="TCP-PASSIVE">TCP被动</el-radio>
              </el-radio-group>
            </el-form-item>
          </template>
        </el-card>

        <!-- 功能配置分组 -->
        <el-card class="form-card" body-style="padding: 16px 20px;">
          <template #header>
            <div class="card-header">
              <span style="font-weight: 500; color: #303133; font-size: 14px;">功能配置</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="音频" prop="enableAudio">
                <el-radio-group v-model="form.enableAudio">
                  <el-radio label="0">关闭</el-radio>
                  <el-radio label="1">开启</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="MP4录制" prop="enableMp4">
                <el-radio-group v-model="form.enableMp4">
                  <el-radio label="0">关闭</el-radio>
                  <el-radio label="1">开启</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="传输协议" prop="protocol" v-if="form.type !== '12' && form.type !== '14'">
            <el-radio-group v-model="form.protocol">
              <el-radio
                v-for="dict in qs_protocol"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="无人观看" prop="enableDisableNoneReader">
            <el-radio-group v-model="form.enableDisableNoneReader">
              <el-radio label="0">不处理</el-radio>
              <el-radio label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-card>

        <!-- 位置信息分组 -->
        <el-card class="form-card" body-style="padding: 16px 20px;">
          <template #header>
            <div class="card-header">
              <span style="font-weight: 500; color: #303133; font-size: 14px;">设备信息</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="经度" prop="longitude">
                <el-input v-model="form.longitude" placeholder="请输入经度" :maxlength="20"
                          show-word-limit>
                  <template #append>
                    <el-button @click="selectMapPositionFun">
                      选择
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="纬度" prop="latitude">
                <el-input v-model="form.latitude" placeholder="请输入纬度" :maxlength="20"
                          show-word-limit>
                  <template #append>
                    <el-button @click="selectMapPositionFun">
                      选择
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="form.type !== '12'">
            <el-col :span="12">
              <el-form-item label="国标编码" prop="gbCode">
                <el-input v-model="form.gbCode" placeholder="请输入国标编码" @input="handleNumberInput" :maxlength="100"
                          show-word-limit>
                  <template #append>
                    <el-button @click="handleChannelCode">选择</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产厂商" prop="manufacturer">
                <el-input v-model="form.manufacturer" placeholder="请输入生产厂商" :maxlength="100" show-word-limit/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="生产厂商" prop="manufacturer" v-if="form.type === '12'">
            <el-input v-model="form.manufacturer" placeholder="请输入生产厂商" :maxlength="100" show-word-limit/>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="摄像机类型" prop="ptzType">
                <el-select v-model="form.ptzType" placeholder="请选择摄像机类型" clearable style="width: 100%;">
                  <el-option label="球机" :value="1"/>
                  <el-option label="半球" :value="2"/>
                  <el-option label="固定枪机" :value="3"/>
                  <el-option label="遥控枪机" :value="4"/>
                  <el-option label="遥控半球" :value="5"/>
                  <el-option label="全景/拼接通道" :value="6"/>
                  <el-option label="分割通道" :value="7"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="安装地址" prop="address">
                <el-input v-model="form.address" placeholder="请输入安装地址" type="textarea" :maxlength="200" show-word-limit :rows="1"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in qs_status"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" :maxlength="255" show-word-limit :rows="2"/>
          </el-form-item>
        </el-card>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="`视频播放-${deviceRow.deviceName}`"
               v-model="easyPlayerOpen"
               width="840px"
               append-to-body
               draggable
               @close="getList"
    >
      <div style="width: 100%;height: 100%;display: flex;justify-content: center" v-if="easyPlayerOpen">
        <EasyPlayer
            ref="EasyPlayerRef"
            style="width: 800px;height: 400px;"
            width="100"
            height="100"
            :isPercentage="true"
            :quality="quality"
            :defaultQuality="defaultQuality"
            :isPtz="isPtz"
            :isQuality="isQuality"
            :hasAudio="deviceRow.enableAudio === '1'"
            :isMute="deviceRow.enableAudio === '1'"
            :isLive="isLive"
            :videoUrl="wsUrl"
            @ptz="handlePtz"/>
      </div>

      <el-tabs v-model="tabActiveName"
               type="card"
               :stretch="true"
               v-if="easyPlayerOpen"
               style="margin-top: 10px;">
        <el-tab-pane label="实时视频" name="media">
          <el-row :gutter="10">
            <el-col :span="3"><span style="width: 80px; line-height: 40px; text-align: right;">播放地址：</span></el-col>
            <el-col :span="21">
              <el-input v-model="flvUrl" :disabled="true">
                <template #prepend>flv地址</template>
                <template #append>
                  <el-button type="primary" :icon="DocumentCopy" @click="handleCopy(flvUrl)"/>
                </template>
              </el-input>
            </el-col>
          </el-row>

          <el-row :gutter="10" style="margin-top: 10px">
            <el-col :span="3"><span style="width: 80px; line-height: 40px; text-align: right;">iframe：</span></el-col>
            <el-col :span="21">
              <el-input v-model="sharedIframe" :disabled="true">
                <template #prepend>iframe：</template>
                <template #append>
                  <el-button type="primary" :icon="DocumentCopy" @click="handleCopy(sharedIframe)"/>
                </template>
              </el-input>
            </el-col>
          </el-row>

          <el-row :gutter="10" style="margin-top: 10px">
            <el-col :span="3"><span style="width: 80px; line-height: 40px; text-align: right;">资源地址：</span></el-col>
            <el-col :span="21">
              <el-input v-model="rtcUrl" :disabled="true">
                <template #prepend>
                  <StreamDropdown :stream-info="streamInfo"/>
                </template>
                <template #append>
                  <el-button type="primary" :icon="DocumentCopy" @click="handleCopy(wsUrl)"/>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="编码信息" name="codec">
          <MediaInfo v-if="tabActiveName === 'codec' && streamInfo" ref="mediaInfo" :app="streamInfo.app"
                     :stream="streamInfo.stream" :mediaServerId="streamInfo.mediaServerId"></MediaInfo>
        </el-tab-pane>
        <el-tab-pane label="云台控制" name="control">
          <div v-if="!isPtz" style="text-align: center; padding: 40px; color: #909399;">
            <el-icon style="font-size: 48px; margin-bottom: 16px;"><InfoFilled/></el-icon>
            <p>当前设备不支持云台控制</p>
          </div>
          <div v-else style="display: grid; grid-template-columns: 240px auto; height: 180px; overflow: auto" v-if="tabActiveName === 'control'">
            <!-- 左侧控制区域 -->
            <div style="display: grid; grid-template-columns: 100px auto;">
              <!-- 方向控制 -->
              <div class="control-wrapper">
                <div class="control-btn control-top" @mousedown="ptzCamera('up')" @mouseup="ptzCamera('stop')">
                  <el-icon class="icon">
                    <CaretTop/>
                  </el-icon>
                  <div class="control-inner-btn control-inner"></div>
                </div>
                <div class="control-btn control-left" @mousedown="ptzCamera('left')" @mouseup="ptzCamera('stop')">
                  <el-icon class="icon">
                    <CaretLeft/>
                  </el-icon>
                  <div class="control-inner-btn control-inner"></div>
                </div>
                <div class="control-btn control-bottom" @mousedown="ptzCamera('down')" @mouseup="ptzCamera('stop')">
                  <el-icon class="icon">
                    <CaretBottom/>
                  </el-icon>
                  <div class="control-inner-btn control-inner"></div>
                </div>
                <div class="control-btn control-right" @mousedown="ptzCamera('right')" @mouseup="ptzCamera('stop')">
                  <el-icon class="icon">
                    <CaretRight/>
                  </el-icon>
                  <div class="control-inner-btn control-inner"></div>
                </div>
                <div class="control-round">
                  <div class="control-round-inner"><i class="fa fa-pause-circle"></i></div>
                </div>
                <!-- 速度控制 -->
                <div class="contro-speed" style="position: absolute; left: 4px; top: 112px; width: 100px;">
                  <el-slider v-model="controSpeed" :min="1" :max="controSpeedMax"></el-slider>
                </div>
              </div>
              <!-- 变倍、聚焦、光圈控制 -->
              <div>
                <div class="ptz-btn-box">
                  <div @mousedown="ptzCamera('zoomin')" @mouseup="ptzCamera('stop')" title="变倍+">
                    <el-icon class="control-zoom-btn" style="font-size: 24px;">
                      <ZoomIn/>
                    </el-icon>
                  </div>
                  <div @mousedown="ptzCamera('zoomout')" @mouseup="ptzCamera('stop')" title="变倍-">
                    <el-icon class="control-zoom-btn" style="font-size: 24px;">
                      <ZoomOut/>
                    </el-icon>
                  </div>
                </div>
                <div class="ptz-btn-box">
                  <div @mousedown="ptzCamera('near')" @mouseup="ptzCamera('stop')" title="聚焦+">
                    <i class="iconfont icon-bianjiao-fangda control-zoom-btn" style="font-size: 24px;"></i>
                  </div>
                  <div @mousedown="ptzCamera('far')" @mouseup="ptzCamera('stop')" title="聚焦-">
                    <i class="iconfont icon-bianjiao-suoxiao control-zoom-btn" style="font-size: 24px;"></i>
                  </div>
                </div>
                <div class="ptz-btn-box">
                  <div @mousedown="ptzCamera('in')" @mouseup="ptzCamera('stop')" title="光圈+">
                    <i class="iconfont icon-guangquan control-zoom-btn" style="font-size: 24px;"></i>
                  </div>
                  <div @mousedown="ptzCamera('out')" @mouseup="ptzCamera('stop')" title="光圈-">
                    <i class="iconfont icon-guangquan- control-zoom-btn" style="font-size: 24px;"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧功能选择区域 -->
            <div v-if="isPtz" class="ptz-function-panel">
              <el-tabs type="card" class="ptz-tabs">
                <!-- 预置点管理 -->
                <el-tab-pane v-if="isPresetSupported" label="预置点">
                  <div class="preset-panel">
                    <el-select v-model="selectedPresetIndex" placeholder="选择预置点" class="preset-select" clearable @change="handlePresetSelect">
                      <el-option v-for="preset in presetList" :key="preset.index" :label="preset.name || `预置点${preset.index}`" :value="preset.index" />
                    </el-select>
                    <div class="preset-buttons">
                      <el-button type="primary" size="small" @click="handleGotoPreset" :disabled="!selectedPresetIndex">
                        调用
                      </el-button>
                      <el-button type="success" size="small" @click="openSetPresetDialog">
                        设置
                      </el-button>
                      <el-button type="danger" size="small" @click="handleDeletePreset" :disabled="!selectedPresetIndex">
                        删除
                      </el-button>
                    </div>
                    <el-button type="primary" link @click="loadPresetList" class="refresh-btn">
                      <el-icon><Refresh /></el-icon>
                      刷新
                    </el-button>
                  </div>
                </el-tab-pane>
                
                <!-- 灯光控制 -->
                <el-tab-pane label="灯光">
                  <div class="control-panel">
                    <el-button type="success" @click="handleLightControl(true)" class="control-btn-on">
                      开灯
                    </el-button>
                    <el-button type="danger" @click="handleLightControl(false)" class="control-btn-off">
                      关灯
                    </el-button>
                  </div>
                </el-tab-pane>
                
                <!-- 雨刷控制 -->
                <el-tab-pane label="雨刷">
                  <div class="control-panel">
                    <el-button type="success" @click="handleWiperControl(true)" class="control-btn-on">
                      开雨刷
                    </el-button>
                    <el-button type="danger" @click="handleWiperControl(false)" class="control-btn-off">
                      关雨刷
                    </el-button>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
            <!-- 对于不支持云台的设备，显示提示信息 -->
            <div v-else style="text-align: center; padding: 20px; color: #909399;">
              <p>该设备暂不支持云台控制及相关功能</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog :title="`接入地址-${deviceRow.deviceName}`" v-model="accessAddressOpen" width="600px" append-to-body
               draggable>
      <el-form :model="streamPushAddressForm" label-width="100px">
        <el-form-item label="rtsp地址">
          <el-input v-model="streamPushAddressForm.rtsp" placeholder="请输入rtsp地址" disabled>
            <template #append>
              <el-button type="primary" :icon="DocumentCopy" @click="handleCopy(streamPushAddressForm.rtsp)" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="rtmp地址" prop="rtmp">
          <el-input v-model="streamPushAddressForm.rtmp" placeholder="请输入rtmp地址" disabled>
            <template #append>
              <el-button type="primary" :icon="DocumentCopy" @click="handleCopy(streamPushAddressForm.rtmp)" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 设置预置点对话框 -->
    <el-dialog title="设置预置点" v-model="presetDialogVisible" width="400px" append-to-body>
      <el-form ref="presetFormRef" :model="presetForm" :rules="presetRules" label-width="80px">
        <el-form-item label="编号" prop="index">
          <el-input-number v-model="presetForm.index" :min="1" :max="255" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="presetForm.name" placeholder="请输入预置点名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="presetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSetPreset">确定</el-button>
      </template>
    </el-dialog>

    <SelectMapPosition ref="selectMapPositionRef" @onSubmit="selectMapPositionSubmit"/>
    <ChannelCode ref="channelCodeRef" @handleOk="channelCodeOk"/>
  </div>
</template>

<script setup lang="ts" name="Device">
import {onUnmounted, watch, nextTick, reactive, ref, getCurrentInstance, toRefs} from "vue";
import useClipboard from "vue-clipboard3";
import EasyPlayer from "@/components/EasyPlayer";
import type {DeviceQueryParams, QsDevice} from "@/types/api/qs/device"
import {
  addDevice,
  changeDeviceStatus,
  delDevice,
  getDevice,
  getVideoSnapshot,
  listDevice,
  updateDevice,
  startPtz,
  endPtz,
  getPresetList,
  setPreset,
  gotoPreset,
  deletePreset,
  controlLight,
  controlWiper
} from "@/api/qs/device"
import {listHaiKangIsupDevice} from "@/api/qs/haikang-isup";
import {HaikangIsupDevice, PullConfig, RTPServerParam, WSDiscoveryDevice, WSOnvifDevice} from "@/types/api";
import {DaHuaDevice} from "@/types/api/qs/dahua";
import {listDaHusDevice} from "@/api/qs/dahua";
import {
  closeStreams,
  getStreamPushAddress,
  loadRecord,
  rtpPlay,
  stopRtpPlay,
  stopStreamPullPlay,
  streamPullPlay, streamPullPush,
  startGb28181Play, stopGb28181Play,
  startJt1078Play, stopJt1078Play
} from "@/api/qs/zlm";
import {DocumentCopy, InfoFilled, Refresh, Sunny, Moon, SwitchButton, CircleClose, Position, Plus, Delete, WindPower, List, Grid, CircleCheck, Picture} from '@element-plus/icons-vue'
import StreamDropdown from "@/components/Channel/streamDropdown.vue";
import MediaInfo from "@/components/Channel/mediaInfo.vue";
import SelectMapPosition from '@/components/SelectMapPosition';
import ChannelCode from '@/views/components/common/channelCode.vue';
import {getOnvifDeviceList, onvifLogin} from "@/api/qs/onvif";
import {getAllDevices, getChannelsByDeviceId} from "@/api/qs/gb28181";
import type {Gb28181Device, Gb28181Channel} from "@/types/api/qs/gb28181";
import {getAllDevice} from "@/api/qs/jt1078";
import type {Jt1078Device} from "@/types/api/qs/jt1078";
import {ElMessageBox} from "element-plus";

const {toClipboard} = useClipboard()

const {proxy} = getCurrentInstance()
const {
  qs_status,
  qs_live_stream_type,
  qs_stream_type,
  qs_protocol,
  qs_device_status,
  qs_online_type,
  qs_onvif_auth,
} = proxy.useDict('qs_status', 'qs_live_stream_type', 'qs_stream_type', 'qs_protocol', 'qs_device_status', 'qs_online_type', 'qs_onvif_auth')

const deviceList = ref<QsDevice[]>([])
const viewMode = ref<string>('card') // 'list' 或 'card'
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const haiKangIsupDeviceList = ref<HaikangIsupDevice[]>([])
const dahuaDeviceList = ref<DaHuaDevice[]>([])
const onvifDeviceList = ref<WSDiscoveryDevice[]>([])
const streamUris = ref<string>([])
const gb28181DeviceList = ref<Gb28181Device[]>([])
const gb28181ChannelList = ref<Gb28181Channel[]>([])
const jt1078DeviceList = ref<Jt1078Device[]>([])

// 播放
const easyPlayerOpen = ref(false)
const deviceRow = ref({})
const rtcUrl = ref("");
const flvUrl = ref("");
const wsUrl = ref('');
const tabActiveName = ref('media');
const streamInfo = ref({});
const quality = ref(['普清', '高清', '超清']);
const defaultQuality = ref('高清');
const isPtz = ref(true);
const isPresetSupported = ref(true); // 是否支持预置点功能
const isQuality = ref(true);
const isLive = ref(true);
const sharedIframe = ref(null);

// 云台
const controSpeed = ref(5);
const controSpeedMax = ref(10);
const controSpeedMin = ref(1);
const lastPtzCommand = ref('up'); // 保存上一次的云台命令

// 预置点
const presetList = ref([]);
const selectedPresetIndex = ref(null);
const newPresetIndex = ref(1);
const newPresetName = ref('');
const presetDialogVisible = ref(false);
const presetFormRef = ref();

// 预置点表单数据
const presetForm = reactive({
  index: 1,
  name: ''
});

// 预置点表单校验规则
const presetRules = {
  index: [
    { required: true, message: '预置点编号不能为空', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '预置点名称不能为空', trigger: 'blur' }
  ]
};

// 灯光和雨刷
const lightOn = ref(false);
const wiperOn = ref(false);


// 接入地址
const streamPushAddressForm = ref({});

const data = reactive({
  form: {} as QsDevice,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceName: undefined,
    ipAddress: undefined,
    type: undefined,
    status: undefined,
    deviceStatus: undefined,
  } as DeviceQueryParams,
  rules: {
    deviceName: [
      {required: true, message: "设备名称不能为空", trigger: "blur"}
    ],
    ipAddress: [
      {required: true, message: "IP地址不能为空", trigger: "blur"}
    ],
    liveAddress: [
      {required: true, message: "直播流地址不能为空", trigger: "blur"}
    ],
    port: [
      {required: true, message: "端口号不能为空", trigger: "blur"}
    ],
    userName: [
      {required: true, message: "用户名不能为空", trigger: "blur"}
    ],
    password: [
      {required: true, message: "密码不能为空", trigger: "blur"}
    ],
    fileAddress: [
      {required: true, message: "视频文件不能为空", trigger: "blur"}
    ],
    channel: [
      {required: true, message: "通道号不能为空", trigger: "blur"}
    ],
    deviceCode: [
      {required: true, message: "设备唯一标识不能为空", trigger: "change"}
    ],
  }
})

const {queryParams, form, rules} = toRefs(data)

/** 查询视频监控设备列表 */
function getList() {
  loading.value = true
  queryParams.value.params = {}
  listDevice(queryParams.value).then(response => {
    // 为每个设备添加 checked 属性用于卡片视图的选择
    deviceList.value = response.rows.map((item: any) => ({
      ...item,
      checked: ids.value.includes(item.id)
    }))
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    deviceCode: null,
    deviceName: null,
    ipAddress: null,
    port: null,
    userName: null,
    password: null,
    type: "1",
    deviceType: null,
    onlineType: null,
    channel: null,
    alarmChannelId: null,
    status: "ENABLE",
    streamType: "1",
    protocol: "TCP",
    enableAudio: "0",
    enableMp4: "0",
    enableDisableNoneReader: "0",
    onvifAuth: "1",
    onvifHostName: null,
    gbDeviceId: null,
    gbChannelId: null,
    streamMode: "TCP-PASSIVE",
    manufacturer: null,
    address: null,
    ptzType: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    jtMobileNo: null,
    jtPlateNo: null,
    jtPlateColor: null
  }
  proxy.resetForm("deviceRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  getList()
}

// 多选框选中数据
function handleSelectionChange(selection: QsDevice[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 卡片视图多选框选中处理
function handleCardSelection() {
  const selectedItems = deviceList.value.filter(item => item.checked)
  ids.value = selectedItems.map(item => item.id!)
  single.value = selectedItems.length != 1
  multiple.value = !selectedItems.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加视频监控设备"
}

/** 修改按钮操作 */
function handleUpdate(row: QsDevice) {
  reset()
  const _id = row.id || ids.value[0]
  getDevice(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改视频监控设备"

    // 海康isup
    if (form.value.type === '8') {
      listHaiKangIsupDevice().then((res) => {
        haiKangIsupDeviceList.value = res.data
      })
    }

    // 大华主动上线
    if (form.value.type === '9' && form.value.onlineType === '2') {
      listDaHusDevice().then((res) => {
        res.data.forEach((item) => {
          item.deviceId = "device_" + item.deviceId
        })
        dahuaDeviceList.value = res.data
      })
    }

    if (form.value.type === '5') {
      getOnvifDeviceList().then((res) => {
        onvifDeviceList.value = res.data
      })
    }

    // 国标28181
    if (form.value.type === '12') {
      getAllDevices().then((res) => {
        gb28181DeviceList.value = res.data
        // 如果有选中的国标设备，自动填充生产厂商
        if (form.value.gbDeviceId) {
          const device = res.data.find((item: any) => item.deviceId === form.value.gbDeviceId)
          if (device?.manufacturer && !form.value.manufacturer) {
            form.value.manufacturer = device.manufacturer
          }
        }
      })
      if (form.value.gbDeviceId) {
        getChannelsByDeviceId(form.value.gbDeviceId).then((res) => {
          gb28181ChannelList.value = res.data
        })
      }
    }

    // JT1078
    if (form.value.type === '14') {
      getAllDevice().then((res) => {
        jt1078DeviceList.value = res.data
        // 如果有选中的 JT1078 设备，自动填充信息
        let device = null;
        // 优先用 deviceCode 查找
        if (form.value.deviceCode) {
          device = res.data.find((item: any) => item.deviceId === form.value.deviceCode)
        }
        // 如果用 deviceCode 没找到，尝试用 mobileNo 查找（兼容旧数据）
        if (!device && form.value.jtMobileNo) {
          device = res.data.find((item: any) => item.mobileNo === form.value.jtMobileNo)
          if (device) {
            form.value.deviceCode = device.deviceId
          }
        }
        
        if (device) {
          if (device?.makerId) {
            form.value.manufacturer = device.makerId
          }
          if (device?.mobileNo) {
            form.value.jtMobileNo = device.mobileNo
          }
          if (device?.plateNo) {
            form.value.jtPlateNo = device.plateNo
          }
          if (device?.plateColor !== undefined && device?.plateColor !== null) {
            form.value.jtPlateColor = String(device.plateColor)
          }
        }
      })
    }
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateDevice(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDevice(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: QsDevice) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除视频监控设备编号为"' + _ids + '"的数据项？').then(function () {
    return delDevice(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {
  })
}

/**
 * 复制内容到粘贴板
 *
 * @param text
 */
const handleCopy = async (text: string) => {
  if (!text) {
    proxy.$modal.msgError('内容为空，无法复制');
    return;
  }

  try {
    await toClipboard(text)
    proxy.$modal.msgSuccess('成功拷贝到粘贴板');
  } catch (e) {
    console.error(e)
  }
};

/**
 * 直播流接入类型
 *
 * @param text
 */
const liveStreamChange = (e: string) => {
  // 清空所有设备相关字段
  form.value.deviceCode = null
  form.value.deviceName = null
  form.value.ipAddress = null
  form.value.port = null
  form.value.userName = null
  form.value.password = null
  form.value.channel = null
  form.value.alarmChannelId = null
  form.value.hostName = null
  form.value.gbDeviceId = null
  form.value.gbChannelId = null
  form.value.onvifAuth = '1'
  form.value.onvifHostName = null
  form.value.manufacturer = null
  form.value.address = null
  form.value.ptzType = null
  form.value.deviceType = null
  form.value.onlineType = null
  form.value.jtMobileNo = null
  form.value.jtPlateNo = null
  form.value.jtPlateColor = null

  // 根据接入类型设置默认值
  if (e === '12' || e === '14') {
    form.value.streamMode = 'TCP-PASSIVE'
  }

  // 海康sdk
  if (e === '7') {
    form.value.port = '8000';
    return
  }

  // 海康isup
  if (e === '8') {
    listHaiKangIsupDevice().then((res) => {
      haiKangIsupDeviceList.value = res.data
    })
  }

  // 大华sdk
  if (e === '9') {
    form.value.port = '37777';
    form.value.onlineType = '1';
    return
  }

  if (e === '5') {
    getOnvifDeviceList().then((res) => {
      onvifDeviceList.value = res.data
    })
  }

  // 国标28181
  if (e === '12') {
    getAllDevices().then((res) => {
      gb28181DeviceList.value = res.data
    })
  }

  // JT1078
  if (e === '14') {
    getAllDevice().then((res) => {
      jt1078DeviceList.value = res.data
    })
  }
}

/**
 * 国标设备选择变化
 * @param gbDeviceId 国标设备ID
 */
const gbDeviceChange = (gbDeviceId: string) => {
  form.value.gbChannelId = null
  if (gbDeviceId) {
    getChannelsByDeviceId(gbDeviceId).then((res) => {
      gb28181ChannelList.value = res.data
    })
    const device = gb28181DeviceList.value.find(item => item.deviceId === gbDeviceId)
    if (device) {
      if (device.manufacturer) {
        form.value.manufacturer = device.manufacturer
      }
      if (device.ip) {
        form.value.ipAddress = device.ip
      }
      if (device.port) {
        form.value.port = device.port
      }
    }
  } else {
    form.value.manufacturer = null
    form.value.ipAddress = null
    form.value.port = null
  }
}

/**
 * 国标通道选择变化
 * @param gbChannelId 国标通道ID
 */
const gbChannelChange = (gbChannelId: string) => {
  // 可以在这里添加处理逻辑
}

/**
 * JT1078 设备选择变化
 * @param deviceId JT1078 设备ID
 */
const jt1078DeviceChange = (deviceId: string) => {
  if (deviceId) {
    const device = jt1078DeviceList.value.find(item => item.deviceId === deviceId)
    if (device) {
      if (device.makerId) {
        form.value.manufacturer = device.makerId
      }
      if (device.mobileNo) {
        form.value.jtMobileNo = device.mobileNo
      }
      if (device.plateNo) {
        form.value.jtPlateNo = device.plateNo
      }
      if (device.plateColor) {
        form.value.jtPlateColor = String(device.plateColor)
      }
    }
  } else {
    form.value.manufacturer = null
    form.value.deviceName = null
    form.value.jtMobileNo = null
    form.value.jtPlateNo = null
    form.value.jtPlateColor = null
  }
}

/**
 * 直播流接入类型
 *
 * @param text
 */
const handleNumberInput = (val: string) => {
  form.value.channel = val.replace(/\D/g, '');
}

/** 状态修改  */
function handleStatusChange(row: QsDevice) {
  const text = row.status === "ENABLE" ? "启用" : "停用"
  proxy.$modal.confirm('确认要"' + text + '"该设备吗?').then(function () {
    return changeDeviceStatus(row.id!, row.status!)
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功")
  }).catch(function () {
    row.status = row.status === "DEACTIVATE" ? "ENABLE" : "DEACTIVATE"
  })
}

/**
 * 海康isup设备code改变
 *
 * @param e
 */
const haikangIsupDeviceCodeChange = (e: string) => {
  const device = haiKangIsupDeviceList.value.find(item => item.deviceId === e);
  form.value.ipAddress = device.ip
}

/**
 * 上线类型改变
 *
 * @param e
 */
const onlineTypeChange = (e: string) => {
  if (e === '2') {
    listDaHusDevice().then((res: any) => {
      res.data.forEach((item) => {
        item.deviceId = "device_" + item.deviceId
        if (item.deviceCode === form.value.deviceCode) {
          form.value.ipAddress = item.ip
          form.value.port = item.port
        }
      })
      dahuaDeviceList.value = res.data
    })
  } else {
    form.value.port = "37777"
  }
}

/**
 * 大华设备code改变
 *
 * @param e
 */
const dahuaDeviceCodeChange = (e: string) => {
  const device = dahuaDeviceList.value.find(item => item.deviceId === e);
  form.value.ipAddress = device.ip
  form.value.port = device.port
}

/**
 * onvif设备code改变
 *
 * @param e
 */
const onvifDeviceCodeChange = (e: string) => {
  const device = onvifDeviceList.value.find(item => item.ip === e);
  form.value.onvifHostName = device.hostName
}

/**
 * onvif 设备登录
 *
 * @param e
 */
const onvifAuthLogin = () => {

  if (!form.value.ipAddress) {
    proxy.$modal.msgError('请选择onvif设备IP');
    return
  }

  if (!form.value.onvifHostName) {
    proxy.$modal.msgError('请输入设备用户名');
    return
  }

  if (!form.value.password) {
    proxy.$modal.msgError('请输入设备密码');
    return
  }

  let data = {
    ip: form.value.ipAddress,
    auth: form.value.onvifAuth,
    hostName: form.value.hostName,
    username: form.value.userName,
    password: form.value.password,
  } as WSOnvifDevice;

  onvifLogin(data).then((res: any) => {
    streamUris.value = res.data.streamUris

    proxy.$modal.msgSuccess('认证成功');
  })
}

/**
 * 播放
 *
 * @param row
 */
const handlePlay = (row: QsDevice) => {
  row.loading = true

  if (row.type === '1' || row.type === '2' || row.type === '3' || row.type === '4' || row.type === '5') {
    let data = {
      deviceId: row.id,
      app: '',
      stream: row.deviceCode,
      url: row.liveAddress,
      enable_audio: false,
      enable_mp4: false,
      rtp_type: '1',
      timeOut: 10,
    } as PullConfig;

    if (row.type === '1') {
      data.app = "rtsp"
    } else if (row.type === '2') {
      data.app = "rtmp"
    } else if (row.type === '3') {
      data.app = "flv"
    } else if (row.type === '4') {
      data.app = "hls"
    } else if (row.type === '5') {
      data.app = "onvif"

      controSpeedMin.value = 1
      controSpeed.value = 50
      controSpeedMax.value = 100
    }

    if (row.type === '3' && row.flvType === 'ws') {
      if (row.liveAddress != null) {
        data.url = convertWsToHttp(row.liveAddress)
      }
    }

    if (row.protocol === 'UDP') {
      data.rtp_type = '0'
    } else if (row.protocol === 'TCP') {
      data.rtp_type = '1'
    }

    if (row.enableAudio === '1') {
      data.enable_audio = true
    }

    if (row.enableMp4 === '1') {
      data.enable_mp4 = true
    }

    streamPullPlay(data).then(async (res: any) => {
      await nextTick(async () => {
        if (location.protocol === "https:") {
          flvUrl.value = res.data.https_flv;
          rtcUrl.value = res.data.rtcs;
          wsUrl.value = res.data.wss_flv;
        } else {
          flvUrl.value = res.data.flv;
          rtcUrl.value = res.data.rtc;
          wsUrl.value = res.data.ws_flv;
        }

        sharedIframe.value = '<iframe src="' + window.location.origin + '/easyPlayer?url=' + encodeURIComponent(wsUrl.value) + '"></iframe>'

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = row.type === '5' // ONVIF 支持云台
        isPresetSupported.value = row.type === '5' // ONVIF 支持预置点
        isQuality.value = false
        isLive.value = true
        deviceRow.value = row
        row.loading = false
        easyPlayerOpen.value = true

        await nextTick()
        if (proxy.$refs['EasyPlayerRef']) {
          proxy.$refs['EasyPlayerRef'].play(wsUrl.value)
        }
      })
    }).catch((err) => {
      row.loading = false
    })
  } else if (row.type === '6') {
    loadRecord(row.id).then(async (res: any) => {
      await nextTick(async () => {
        if (location.protocol === "https:") {
          flvUrl.value = res.data.https_flv;
          rtcUrl.value = res.data.rtcs;
          wsUrl.value = res.data.wss_flv;
        } else {
          flvUrl.value = res.data.flv;
          rtcUrl.value = res.data.rtc;
          wsUrl.value = res.data.ws_flv;
        }

        sharedIframe.value = '<iframe src="' + window.location.origin + '/easyPlayer?url=' + encodeURIComponent(wsUrl.value) + '"></iframe>'

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false // 视频文件不支持云台
        isQuality.value = false
        isLive.value = true
        deviceRow.value = row
        row.loading = false
        easyPlayerOpen.value = true

        await nextTick()
        if (proxy.$refs['EasyPlayerRef']) {
          proxy.$refs['EasyPlayerRef'].play(wsUrl.value)
        }

        getVideoSnapshot(row.id);
      })
    }).catch((err) => {
      row.loading = false
    })
  } else if (row.type === '7' || row.type === '8' || row.type === '9') {
    let data = {
      app: "haikang",
      streamId: row.deviceCode,
      tcpMode: "0",
      type: row.type,
      id: row.id
    } as RTPServerParam;

    if (row.type === '7') {
      data.app = "haikang"
      controSpeedMin.value = 1
      controSpeed.value = 5
      controSpeedMax.value = 10
    } else if (row.type === '8') {
      data.app = "haikang_isup"
      controSpeed.value = 5
      controSpeedMin.value = 1
      controSpeedMax.value = 5
    } else if (row.type === '9') {
      data.app = "dahua"
      controSpeed.value = 5
      controSpeedMin.value = 1
      controSpeedMax.value = 15
    }

    rtpPlay(data).then(async (res: any) => {
      await nextTick(async () => {
        if (location.protocol === "https:") {
          flvUrl.value = res.data.https_flv;
          rtcUrl.value = res.data.rtcs;
          wsUrl.value = res.data.wss_flv;
        } else {
          flvUrl.value = res.data.flv;
          rtcUrl.value = res.data.rtc;
          wsUrl.value = res.data.ws_flv;
        }

        sharedIframe.value = '<iframe src="' + window.location.origin + '/easyPlayer?url=' + encodeURIComponent(wsUrl.value) + '"></iframe>'

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = true // 海康、海康ISUP、大华支持云台
        isPresetSupported.value = true // 海康、海康ISUP、大华支持预置点
        isQuality.value = false
        isLive.value = true
        deviceRow.value = row
        row.loading = false
        easyPlayerOpen.value = true

        await nextTick()
        if (proxy.$refs['EasyPlayerRef']) {
          proxy.$refs['EasyPlayerRef'].play(wsUrl.value)
        }
      })
    }).catch((err) => {
      row.loading = false
    })
  } else if (row.type === '13') {
    streamPullPush(row.id).then(async (res: any) => {
      await nextTick(async () => {
        if (location.protocol === "https:") {
          flvUrl.value = res.data.https_flv;
          rtcUrl.value = res.data.rtcs;
          wsUrl.value = res.data.wss_flv;
        } else {
          flvUrl.value = res.data.flv;
          rtcUrl.value = res.data.rtc;
          wsUrl.value = res.data.ws_flv;
        }

        sharedIframe.value = '<iframe src="' + window.location.origin + '/easyPlayer?url=' + encodeURIComponent(wsUrl.value) + '"></iframe>'

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false // PUSH 不支持云台
        isQuality.value = false
        isLive.value = true
        deviceRow.value = row
        row.loading = false
        easyPlayerOpen.value = true

        await nextTick()
        if (proxy.$refs['EasyPlayerRef']) {
          proxy.$refs['EasyPlayerRef'].play(wsUrl.value)
        }
      })
    }).catch((err) => {
      row.loading = false
    })
  } else if (row.type === '12') {
    // GB28181 协议 - 设置云台控制速度
    controSpeedMin.value = 1
    controSpeed.value = 50
    controSpeedMax.value = 100
    
    startGb28181Play(row.id).then(async (res: any) => {
      await nextTick(async () => {
        if (location.protocol === "https:") {
          flvUrl.value = res.data.https_flv;
          rtcUrl.value = res.data.rtcs;
          wsUrl.value = res.data.wss_flv;
        } else {
          flvUrl.value = res.data.flv;
          rtcUrl.value = res.data.rtc;
          wsUrl.value = res.data.ws_flv;
        }

        sharedIframe.value = '<iframe src="' + window.location.origin + '/easyPlayer?url=' + encodeURIComponent(wsUrl.value) + '"></iframe>'

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = true // GB28181 支持云台
        isPresetSupported.value = true // GB28181 支持预置点
        isQuality.value = false
        isLive.value = true
        deviceRow.value = row
        row.loading = false
        easyPlayerOpen.value = true

        await nextTick()
        if (proxy.$refs['EasyPlayerRef']) {
          proxy.$refs['EasyPlayerRef'].play(wsUrl.value)
        }
      })
    }).catch((err) => {
      row.loading = false
    })
  } else if (row.type === '14') {
    // JT1078协议 - 设置云台控制速度
    controSpeedMin.value = 1
    controSpeed.value = 50
    controSpeedMax.value = 255

    startJt1078Play(row.id).then(async (res: any) => {
      await nextTick(async () => {
        if (location.protocol === "https:") {
          flvUrl.value = res.data.https_flv;
          rtcUrl.value = res.data.rtcs;
          wsUrl.value = res.data.wss_flv;
        } else {
          flvUrl.value = res.data.flv;
          rtcUrl.value = res.data.rtc;
          wsUrl.value = res.data.ws_flv;
        }

        sharedIframe.value = '<iframe src="' + window.location.origin + '/easyPlayer?url=' + encodeURIComponent(wsUrl.value) + '"></iframe>'

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = true // JT1078 支持云台
        isPresetSupported.value = false // JT1078 不支持预置点
        isQuality.value = false
        isLive.value = true
        deviceRow.value = row
        row.loading = false
        easyPlayerOpen.value = true

        await nextTick()
        if (proxy.$refs['EasyPlayerRef']) {
          proxy.$refs['EasyPlayerRef'].play(wsUrl.value)
        }
      })
    }).catch((err) => {
      row.loading = false
    })
  }

}

const convertWsToHttp = (wsUrl: string) => {
  if (!wsUrl) return wsUrl;

  // 正则解释：
  // ^ 表示开头
  // wss? 匹配 "ws" 或 "wss"
  // :\/\/ 匹配 "://"
  const regex = /^wss?:\/\//;

  if (regex.test(wsUrl)) {
    // 如果是 wss:// 开头，替换为 https://
    if (wsUrl.startsWith('wss://')) {
      return wsUrl.replace(regex, 'https://');
    }
    // 如果是 ws:// 开头，替换为 http://
    else {
      return wsUrl.replace(regex, 'http://');
    }
  }

  // 如果已经是 http/https，直接返回
  return wsUrl;
}

/**
 * 停止播放
 */
const handleStopPlay = (row: QsDevice) => {
  if (row.type === '1' || row.type === '2' || row.type === '3' || row.type === '4' || row.type === '5') {
    let data = {
      deviceId: row.id,
      mediaServerId: row.mediaServerId,
      streamKey: row.streamKey,
    }
    stopStreamPullPlay(data).then((res) => {
      getList()
      proxy.$modal.msgSuccess("停止播放成功");
    })
  } else if (row.type === '6') {
    closeStreams(row.id).then((res) => {
      getList()
      proxy.$modal.msgSuccess("停止播放成功");
    })
  } else if (row.type === '7' || row.type === '8' || row.type === '9') {
    let data = {
      type: row.type,
      streamId: streamInfo.value.stream,
      id: row.id
    }
    stopRtpPlay(data).then((res) => {
      getList()
      proxy.$modal.msgSuccess("停止播放成功");
    })
  } else if (row.type === '12') {
    stopGb28181Play(row.id).then((res) => {
      getList()
      proxy.$modal.msgSuccess("停止播放成功");
    })
  } else if (row.type === '14') {
    stopJt1078Play(row.id).then((res) => {
      getList()
      proxy.$modal.msgSuccess("停止播放成功");
    })
  }
}

const accessAddressOpen = ref(false)

const selectMapPositionFun = () => {
  proxy.$refs["selectMapPositionRef"].openDialog({
    lat: form.value.latitude,
    lng: form.value.longitude,
  })
}

const selectMapPositionSubmit = (data: any) => {
  form.value.longitude = data.lng
  form.value.latitude = data.lat
}

const handleChannelCode = () => {
  proxy.$refs["channelCodeRef"].openDialog(null, form.value.gbCode)
}

const channelCodeOk = (code: string) => {
  form.value.gbCode = code
}

/**
 * 接入地址
 */
const handleAccessAddress = (row: QsDevice) => {
  if (row.id != null) {
    ElMessageBox.prompt('请输入callId', '温馨提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern:
          /^[a-zA-Z0-9]+$/,
      inputErrorMessage: '输入callId不合法',
    })
        .then(({value}) => {
          getStreamPushAddress(row.id, value).then((res: any) => {
            deviceRow.value = row
            streamPushAddressForm.value = res.data
            accessAddressOpen.value = true
          })
        })
        .catch(() => {

        })
  }
}

/**
 * EasyPlayer 云台事件处理
 * @param data 云台数据 'up'|'down'|'left'|'right'|'zoomin'|'zoomout'|'near'|'far'|'in'|'out'|'stop'
 */
const handlePtz = async (data: any) => {
  console.log('handlePtz', data);
  if (!deviceRow.value || !deviceRow.value.id) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  
  if (!isPtz.value) {
    proxy.$modal.msgWarning('当前设备不支持云台控制');
    return;
  }
  
  try {
    if (data === 'stop') {
      // 结束云台控制，使用上一次保存的命令
      await endPtz(deviceRow.value.id, lastPtzCommand.value, controSpeed.value);
    } else {
      // 保存当前命令
      lastPtzCommand.value = data;
      // 开始云台控制
      await startPtz(deviceRow.value.id, data, controSpeed.value);
    }
  } catch (error) {
    console.error('云台控制失败:', error);
    proxy.$modal.msgError('云台控制失败');
  }
}

/**
 * 云台方向
 * @param command
 * @returns {Promise<void>}
 */
const ptzCamera = async (command) => {
  if (!deviceRow.value || !deviceRow.value.id) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  
  if (!isPtz.value) {
    proxy.$modal.msgWarning('当前设备不支持云台控制');
    return;
  }
  
  try {
    if (command !== 'stop') {
      // 开始云台控制
      await startPtz(deviceRow.value.id, command, controSpeed.value);
    } else {
      // 结束云台控制，这里我们传入一个默认的方向或者上一个方向
      // 为了简单，我们传入 'up' 作为方向，但实际上后端可能只需要 id 和速度
      await endPtz(deviceRow.value.id, 'up', controSpeed.value);
    }
  } catch (error) {
    console.error('云台控制失败:', error);
    proxy.$modal.msgError('云台控制失败');
  }
}

let timer = null
/**
 * 获取列表
 */
const startTimer = () => {
  // 清除可能存在的旧定时器，防止重复创建
  if (timer) clearInterval(timer);

  // 立即先执行一次
  getList();

  // 30000 毫秒 = 30 秒
  timer = setInterval(() => {
    getList();
  }, 30000);
};

startTimer()

// 组件卸载时清理定时器，防止内存泄漏
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
})

// ==================== 预置点功能 ====================

// 加载预置点列表
const loadPresetList = async () => {
  if (!isPresetSupported.value || !deviceRow.value || !deviceRow.value.id) {
    return;
  }
  try {
    const res = await getPresetList(deviceRow.value.id, deviceRow.value.channel);
    if (res && res.data) {
      presetList.value = res.data;
    }
  } catch (error) {
    console.error('获取预置点列表失败:', error);
    proxy.$modal.msgError('获取预置点列表失败');
  }
}

// 预置点选择
const handlePresetSelect = (index) => {
  selectedPresetIndex.value = index;
  if (index) {
    newPresetIndex.value = index;
    const preset = presetList.value.find(p => p.index === index);
    if (preset) {
      newPresetName.value = preset.name || '';
    }
  }
}

// 打开设置预置点对话框
const openSetPresetDialog = () => {
  // 如果没有选择预置点也没有输入预置点编号，默认设为1
  presetForm.index = newPresetIndex.value || 1;
  presetForm.name = '';
  // 如果选择了预置点，自动填充名称
  if (selectedPresetIndex.value) {
    const preset = presetList.value.find(p => p.index === selectedPresetIndex.value);
    if (preset) {
      presetForm.index = preset.index;
      presetForm.name = preset.name || '';
    }
  }
  presetDialogVisible.value = true;
  // 重置表单校验
  nextTick(() => {
    presetFormRef.value?.resetFields();
  });
}

// 设置预置点
const handleSetPreset = async () => {
  if (!deviceRow.value || !deviceRow.value.id) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  // 校验表单
  if (!presetFormRef.value) return;
  await presetFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await setPreset(deviceRow.value.id, deviceRow.value.channel, presetForm.index, presetForm.name);
        proxy.$modal.msgSuccess('设置预置点成功');
        presetDialogVisible.value = false;
        await loadPresetList();
      } catch (error) {
        console.error('设置预置点失败:', error);
        proxy.$modal.msgError('设置预置点失败');
      }
    }
  });
}

// 调用预置点
const handleGotoPreset = async () => {
  if (!deviceRow.value || !deviceRow.value.id) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  const presetIndex = selectedPresetIndex.value || newPresetIndex.value;
  if (!presetIndex) {
    proxy.$modal.msgWarning('请先选择或输入预置点');
    return;
  }
  try {
    await gotoPreset(deviceRow.value.id, deviceRow.value.channel, presetIndex);
    proxy.$modal.msgSuccess('调用预置点成功');
  } catch (error) {
    console.error('调用预置点失败:', error);
    proxy.$modal.msgError('调用预置点失败');
  }
}

// 删除预置点
const handleDeletePreset = async () => {
  if (!deviceRow.value || !deviceRow.value.id) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  const presetIndex = selectedPresetIndex.value || newPresetIndex.value;
  if (!presetIndex) {
    proxy.$modal.msgWarning('请先选择或输入预置点');
    return;
  }
  try {
    await proxy.$modal.confirm('确定要删除该预置点吗？');
    await deletePreset(deviceRow.value.id, deviceRow.value.channel, presetIndex);
    proxy.$modal.msgSuccess('删除预置点成功');
    selectedPresetIndex.value = null;
    await loadPresetList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除预置点失败:', error);
      proxy.$modal.msgError('删除预置点失败');
    }
  }
}

// ==================== 灯光和雨刷控制 ====================

// 灯光控制
const handleLightControl = async (value) => {
  if (!deviceRow.value || !deviceRow.value.id) {
    proxy.$modal.msgError('请先选择设备');
    lightOn.value = !value;
    return;
  }
  try {
    await controlLight(deviceRow.value.id, deviceRow.value.channel, value);
    proxy.$modal.msgSuccess(value ? '灯光已开启' : '灯光已关闭');
  } catch (error) {
    console.error('灯光控制失败:', error);
    proxy.$modal.msgError('灯光控制失败');
    lightOn.value = !value;
  }
}

// 雨刷控制
const handleWiperControl = async (value) => {
  if (!deviceRow.value || !deviceRow.value.id) {
    proxy.$modal.msgError('请先选择设备');
    wiperOn.value = !value;
    return;
  }
  try {
    await controlWiper(deviceRow.value.id, deviceRow.value.channel, value);
    proxy.$modal.msgSuccess(value ? '雨刷已开启' : '雨刷已关闭');
  } catch (error) {
    console.error('雨刷控制失败:', error);
    proxy.$modal.msgError('雨刷控制失败');
    wiperOn.value = !value;
  }
}

// 监听播放对话框打开，加载预置点列表
watch(easyPlayerOpen, (newVal) => {
  if (newVal && isPtz.value && isPresetSupported.value) {
    setTimeout(() => {
      loadPresetList();
    }, 500);
  }
})
</script>

<style scoped>
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.player {
  width: 100%;
  height: 450px;
}

::v-deep(.el-icon) {
  height: auto !important;
}

.control-wrapper {
  position: relative;
  width: 100px; /* 6.25rem * 16 = 100px */
  height: 100px; /* 6.25rem * 16 = 100px */
  max-width: 100px; /* 6.25rem * 16 = 100px */
  max-height: 100px; /* 6.25rem * 16 = 100px */
  border-radius: 100%;
  margin-top: 24px; /* 1.5rem * 16 = 24px */
  margin-left: 8px; /* 0.5rem * 16 = 8px */
  float: left;
}

.control-btn {
  display: flex;
  justify-content: center;
  position: absolute;
  width: 44%;
  height: 44%;
  border-radius: 5px;
  border: 1px solid #78aee4;
  box-sizing: border-box;
  transition: all 0.3s linear;
}


.control-btn:hover {
  cursor: pointer;
}

.control-btn .icon {
  width: 100%;
  font-size: 20px;
  color: #78aee4;
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-btn .icon:hover {
  cursor: pointer;
}

.control-zoom-btn:hover {
  cursor: pointer;
}

.control-round {
  position: absolute;
  top: 21%;
  left: 21%;
  width: 58%;
  height: 58%;
  background: #fff;
  border-radius: 100%;
}

.control-round-inner {
  position: absolute;
  left: 13%;
  top: 13%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70%;
  height: 70%;
  font-size: 40px;
  color: #78aee4;
  border: 1px solid #78aee4;
  border-radius: 100%;
  transition: all 0.3s linear;
}

.control-inner-btn {
  position: absolute;
  width: 60%;
  height: 60%;
  background: #fafafa;
}

.control-top {
  top: -12px; /* -8% of 100px ≈ -12px */
  left: 27%;
  transform: rotate(-45deg);
  border-radius: 5px 100% 5px 0;
}

.control-top .icon {
  transform: rotate(45deg);
  border-radius: 5px 100% 5px 0;
}

.control-top .control-inner {
  left: -1px;
  bottom: 0;
  border-top: 1px solid #78aee4;
  border-right: 1px solid #78aee4;
  border-radius: 0 100% 0 0;
}

.control-top .fa {
  transform: rotate(45deg) translateY(-7px);
}

.control-left {
  top: 27%;
  left: -12px; /* -8% of 100px ≈ -12px */
  transform: rotate(45deg);
  border-radius: 5px 0 5px 100%;
}

.control-left .icon {
  transform: rotate(-45deg);
}

.control-left .control-inner {
  right: -1px;
  top: -1px;
  border-bottom: 1px solid #78aee4;
  border-left: 1px solid #78aee4;
  border-radius: 0 0 0 100%;
}

.control-left .fa {
  transform: rotate(-45deg) translateX(-7px);
}

.control-right {
  top: 27%;
  right: -12px; /* -8% of 100px ≈ -12px */
  transform: rotate(45deg);
  border-radius: 5px 100% 5px 0;
}

.control-right .icon {
  transform: rotate(-45deg);
}

.control-right .control-inner {
  left: -1px;
  bottom: -1px;
  border-top: 1px solid #78aee4;
  border-right: 1px solid #78aee4;
  border-radius: 0 100% 0 0;
}

.control-right .fa {
  transform: rotate(-45deg) translateX(7px);
}

.control-bottom {
  left: 27%;
  bottom: -12px; /* -8% of 100px ≈ -12px */
  transform: rotate(45deg);
  border-radius: 0 5px 100% 5px;
}

.control-bottom .icon {
  transform: rotate(-45deg);
}

.control-bottom .control-inner {
  top: -1px;
  left: -1px;
  border-bottom: 1px solid #78aee4;
  border-right: 1px solid #78aee4;
  border-radius: 0 0 100% 0;
}

.control-bottom .fa {
  transform: rotate(-45deg) translateY(7px);
}

.trank {
  width: 100%;
  height: 185px;
  text-align: left;
  padding: 0 10%;
  overflow: auto;
}

.trankInfo {
  width: 100%;
  padding: 0 10%;
}

.el-dialog__body {
  padding: 10px 20px;
}

.ptz-btn-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0 32px; /* 2rem * 16 = 32px */
  height: 48px; /* 3rem * 16 = 48px */
  line-height: 64px; /* 4rem * 16 = 64px */
}


.form-card {
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #dcdfe6;
}

.form-card:last-child {
  margin-bottom: 0;
}

:deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid #ebeef5;
  padding: 14px 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input) {
  transition: all 0.2s ease;
}

:deep(.el-input:hover .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-input-border-color, #c0c4cc) inset;
}

:deep(.el-button--primary.is-plain) {
  transition: all 0.2s ease;
}

:deep(.el-button--primary.is-plain:hover) {
  transform: translateY(-1px);
}

:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper) {
  border-radius: 6px 6px 0 0;
}

:deep(.el-table th) {
  background: #f8f9fa;
  color: #303133;
  font-weight: 500;
}

:deep(.el-table--border) {
  border: 1px solid #ebeef5;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-radio-group .el-radio) {
  margin-right: 24px;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 18px 24px;
  margin-right: 0;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.el-tab-pane) {
  padding-top: 8px;
}

.mb8 {
  margin-bottom: 16px;
}

/* 云台功能面板样式 */
.ptz-function-panel {
  text-align: left;
  height: 100%;
}

.ptz-tabs {
  width: 100%;
  height: 100%;
}

:deep(.ptz-tabs .el-tabs__header) {
  margin-bottom: 0;
}

/* 预置点面板样式 */
.preset-panel {
  padding: 10px;
}

.preset-select {
  width: 100%;
  margin-bottom: 10px;
}

.preset-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.preset-buttons .el-button {
  flex: 1;
}

.refresh-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

/* 控制面板样式 */
.control-panel {
  padding: 15px 10px;
  display: flex;
}

.control-btn-on,
.control-btn-off {
  width: 100%;
}

/* 视图切换样式 */
.view-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-switch :deep(.el-radio-group) {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  padding: 2px;
  box-shadow: none;
  border: none;
  display: flex;
}

.view-switch :deep(.el-radio-button) {
  margin: 0;
}

.view-switch :deep(.el-radio-button__inner) {
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  position: relative;
}

.view-switch :deep(.el-radio-button__inner:hover) {
  color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.08);
  transform: translateY(-1px);
}

.view-switch :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.view-switch :deep(.el-icon) {
  font-size: 16px;
  vertical-align: middle;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-switch :deep(.el-radio-button__inner:hover .el-icon) {
  transform: scale(1.1);
}

.view-switch :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner .el-icon) {
  transform: scale(1.15);
}

/* 卡片视图样式 */
.card-view {
  padding: 8px 0;
}

.device-card {
  position: relative;
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardFadeIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(16px);
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 8px rgba(0,0,0,0.04),
    0 8px 16px rgba(0,0,0,0.02);
}

.device-card:nth-child(1) { animation-delay: 0.04s; }
.device-card:nth-child(2) { animation-delay: 0.08s; }
.device-card:nth-child(3) { animation-delay: 0.12s; }
.device-card:nth-child(4) { animation-delay: 0.16s; }
.device-card:nth-child(5) { animation-delay: 0.20s; }
.device-card:nth-child(6) { animation-delay: 0.24s; }
.device-card:nth-child(7) { animation-delay: 0.28s; }
.device-card:nth-child(8) { animation-delay: 0.32s; }

@keyframes cardFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.device-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.05),
    0 12px 24px rgba(0,0,0,0.06),
    0 24px 48px rgba(0,0,0,0.04);
  border-color: rgba(64, 158, 255, 0.25);
}

.device-card.is-selected {
  border-color: rgba(64, 158, 255, 0.5);
  box-shadow: 
    0 0 0 3px rgba(64, 158, 255, 0.1),
    0 8px 24px -4px rgba(64, 158, 255, 0.2),
    0 4px 12px rgba(64, 158, 255, 0.1);
}

/* 媒体区 */
.card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, var(--el-fill-color-lighter) 0%, var(--el-fill-color) 100%);
  overflow: hidden;
}

.media-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 让 image-preview / el-image 占满媒体区 */
.media-inner > * {
  width: 100% !important;
  height: 100% !important;
}

/* 覆盖 ImagePreview 组件内部的圆角和阴影 */
.media-inner :deep(.el-image) {
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* 接管图片缩放动画 */
.media-inner :deep(.el-image__inner) {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.media-inner :deep(.el-image__inner:hover) {
  transform: none !important;
}

.device-card:hover .media-inner :deep(.el-image__inner) {
  transform: scale(1.08) !important;
}

.snapshot-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-placeholder);
  gap: 6px;
}

.snapshot-placeholder .el-icon {
  font-size: 40px;
  opacity: 0.4;
}

.snapshot-placeholder span {
  font-size: 12px;
}

/* 底部玻璃信息条 */
.media-glass-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  z-index: 3;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.4) 55%,
    transparent 100%
  );
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.card-checkbox :deep(.el-checkbox__inner) {
  border-radius: 6px;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.card-checkbox :deep(.el-checkbox__inner:hover) {
  background: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.7);
}

.card-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.card-checkbox :deep(.el-checkbox__inner::after) {
  left: 8px;
  top: 8px;
  border-color: #fff;
}

.bar-device-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  min-width: 0;
}

/* 状态指示器 - 高对比发光版 */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.status-indicator.online {
  background: rgba(103, 194, 58, 0.92);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  animation: statusGlowOnline 3s ease-in-out infinite;
}

.status-indicator.offline {
  background: rgba(245, 108, 108, 0.92);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  animation: statusGlowOffline 4s ease-in-out infinite;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
}

.status-dot.pulse {
  animation: dotPulse 2s ease-in-out infinite;
}

.status-dot.breathe {
  animation: dotBreathe 3s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 4px #fff, 0 0 10px currentColor;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    box-shadow: 0 0 10px #fff, 0 0 20px currentColor;
    transform: scale(1.4);
  }
}

@keyframes dotBreathe {
  0%, 100% {
    opacity: 0.5;
    box-shadow: 0 0 2px currentColor;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 8px currentColor;
    transform: scale(1.25);
  }
}

@keyframes statusGlowOnline {
  0%, 100% {
    box-shadow: 
      0 0 0 1px rgba(103, 194, 58, 0.3),
      0 4px 14px rgba(103, 194, 58, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 
      0 0 0 1px rgba(103, 194, 58, 0.3),
      0 4px 22px rgba(103, 194, 58, 0.65),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

@keyframes statusGlowOffline {
  0%, 100% {
    box-shadow: 
      0 0 0 1px rgba(245, 108, 108, 0.3),
      0 4px 14px rgba(245, 108, 108, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 
      0 0 0 1px rgba(245, 108, 108, 0.3),
      0 4px 22px rgba(245, 108, 108, 0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

/* 信息区 */
.card-info {
  padding: 14px 16px 10px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 11.5px;
  line-height: 1.5;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.info-tag:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.type-tag {
  margin-left: auto;
}

.tag-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.tag-val {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

/* 通道单独一行 */
.info-channel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
  transition: all 0.2s ease;
}

.info-channel:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.channel-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.channel-val {
  color: var(--el-text-color-primary);
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.info-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.remark {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: right;
}

/* 操作栏 */
.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.btn-play {
  flex-shrink: 0;
  min-width: 72px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
  transition: all 0.3s ease;
}

.btn-play:not(:disabled):hover {
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-actions .el-button {
  padding: 7px 10px;
  height: auto;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toolbar-actions .el-button:hover {
  transform: scale(1.08);
}
</style>

