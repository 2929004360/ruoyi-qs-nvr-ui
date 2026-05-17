<template>
  <div class="app-container">
    <div class="search-box">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" class="query-form">
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
            v-model="queryParams.deviceName"
            placeholder="请输入设备名称"
            clearable
            @keyup.enter="handleQuery"
            prefix-icon="VideoCamera"
        />
      </el-form-item>
      <el-form-item label="IP地址" prop="ipAddress">
        <el-input
            v-model="queryParams.ipAddress"
            placeholder="请输入IP地址"
            clearable
            @keyup.enter="handleQuery"
            prefix-icon="MapLocation"
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
      <el-form-item class="form-actions">
        <div class="button-group">
          <el-button type="primary" icon="Search" @click="handleQuery" class="search-btn">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery" class="reset-btn">重置</el-button>
        </div>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8 toolbar-row action-buttons">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            class="action-btn add-btn"
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
            class="action-btn edit-btn"
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
            class="action-btn delete-btn"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" v-model:viewMode="viewMode" :showViewSwitch="true" @queryTable="getList"></right-toolbar>
    </el-row>
    </div>

    <div v-if="viewMode === 'list'" class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="deviceList"
        @selection-change="handleSelectionChange"
        class="custom-table"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" align="center" fixed/>
        <el-table-column label="编号" align="center" prop="id" width="70">
          <template #default="scope">
            <span class="id-badge">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
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
          <div v-if="scope.row.channel !== '' && scope.row.channel !== null">
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300" fixed="right">
        <template #default="scope">
          <div class="table-actions">
            <el-tooltip content="播放" v-if="scope.row.deviceStatus === 'ON'">
              <el-button
                type="primary"
                text
                bg
                size="small"
                icon="VideoPlay"
                @click="handlePlay(scope.row)"
                :loading="scope.row.loading"
              />
            </el-tooltip>
            <el-tooltip content="停止" v-if="scope.row.streamStatus === '1' && scope.row.type !== '13'">
              <el-button
                type="danger"
                text
                bg
                size="small"
                icon="SwitchButton"
                @click="handleStopPlay(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="接入地址" v-if="scope.row.type === '13'">
              <el-button
                type="primary"
                text
                bg
                size="small"
                icon="Position"
                @click="handleAccessAddress(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="云端录像">
              <el-button
                type="success"
                text
                bg
                size="small"
                icon="VideoCamera"
                @click="handleCloudRecord(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="设备录像" v-if="!['1', '2', '3', '4', '6', '13'].includes(scope.row.type)">
              <el-button
                type="info"
                text
                bg
                size="small"
                icon="Monitor"
                @click="handleDeviceRecord(scope.row)"
              />
            </el-tooltip>
            
            <!-- 更多操作下拉菜单 -->
            <el-dropdown @command="(command) => handleMoreAction(command, scope.row)" trigger="click" style="margin-left: 12px;">
              <el-button
                type="primary"
                text
                bg
                size="small"
                icon="More"
              >
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu class="device-dropdown-menu">
                  <el-dropdown-item command="edit" icon="Edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="viewSnapshots" icon="Picture">查看抓图</el-dropdown-item>
                  <el-dropdown-item command="delete" icon="Delete" class="is-danger">删除</el-dropdown-item>
                  <!-- 大华设备校时 -->
                  <el-dropdown-item v-if="scope.row.type === '9'" command="timeSync" icon="Clock" class="time-sync-item">校时</el-dropdown-item>
                  <!-- 大华设备信息 -->
                  <el-dropdown-item v-if="scope.row.type === '9'" command="deviceInfo" icon="InfoFilled" class="time-sync-item">设备信息</el-dropdown-item>
                  <!-- 大华设备抓图 -->
                  <el-dropdown-item v-if="scope.row.type === '9'" command="capture" icon="Camera">抓图</el-dropdown-item>
                  <!-- 大华设备重启 -->
                  <el-dropdown-item v-if="scope.row.type === '9'" command="reboot" icon="Refresh" class="is-danger">重启</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
      </el-table>
    </div>

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
                <span class="channel-val">{{ item.channel !== '' && item.channel !== null ? item.channel : item.gbChannelId || '-' }}</span>
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
                <el-tooltip content="云端录像">
                  <el-button
                    type="primary"
                    text
                    bg
                    size="small"
                    icon="VideoCamera"
                    @click="handleCloudRecord(item)"
                  />
                </el-tooltip>
                <el-tooltip content="设备录像" v-if="!['1', '2', '3', '4', '6', '13'].includes(item.type)">
                  <el-button
                    type="primary"
                    text
                    bg
                    size="small"
                    icon="Monitor"
                    @click="handleDeviceRecord(item)"
                  />
                </el-tooltip>
                
                <!-- 更多操作下拉菜单 -->
                <el-dropdown @command="(command) => handleMoreAction(command, item)" trigger="click" style="margin-left: 12px;">
                  <el-button
                    type="primary"
                    text
                    bg
                    size="small"
                    icon="More"
                  />
                  <template #dropdown>
                    <el-dropdown-menu class="device-dropdown-menu">
                      <el-dropdown-item command="edit" icon="Edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="viewSnapshots" icon="Picture">查看抓图</el-dropdown-item>
                      <el-dropdown-item command="delete" icon="Delete" class="is-danger">删除</el-dropdown-item>
                      <!-- 大华设备校时 -->
                      <el-dropdown-item v-if="item.type === '9'" command="timeSync" icon="Clock" class="time-sync-item">校时</el-dropdown-item>
                      <!-- 大华设备信息 -->
                      <el-dropdown-item v-if="item.type === '9'" command="deviceInfo" icon="InfoFilled" class="time-sync-item">设备信息</el-dropdown-item>
                      <!-- 大华设备抓图 -->
                      <el-dropdown-item v-if="item.type === '9'" command="capture" icon="Camera">抓图</el-dropdown-item>
                      <!-- 大华设备重启 -->
                      <el-dropdown-item v-if="item.type === '9'" command="reboot" icon="Refresh" class="is-danger">重启</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
    <el-dialog :title="title" v-model="open" width="800px" append-to-body draggable destroy-on-close class="glass-dialog device-dialog">
      <el-form ref="deviceRef" :model="form" :rules="rules" label-width="90px">
        <!-- 核心信息（始终显示） -->
        <div class="core-info">
          <el-row :gutter="16">
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

          <!-- 动态连接配置 -->
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

          <!-- IP设备配置（海康/大华/ONVIF） -->
          <template v-if="form.type === '5' || form.type === '7' || form.type === '8' || form.type === '9'">
            <el-row :gutter="16">
              <el-col :span="12">
                <!-- 海康ISUP -->
                <el-form-item label="设备ID" prop="deviceCode" v-if="form.type === '8'">
                  <el-select v-model="form.deviceCode" @change="haikangIsupDeviceCodeChange" placeholder="请选择设备" filterable style="width: 100%;">
                    <el-option v-for="item in haiKangIsupDeviceList" :key="item.deviceId" :label="item.deviceId" :value="item.deviceId">
                      <div style="display: flex; justify-content: space-between;">
                        <span>{{ item.deviceId }}</span>
                        <span style="color: var(--el-text-color-secondary); font-size: 12px;">{{ item.ip }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
                <!-- 大华 -->
                <el-form-item label="设备ID" prop="deviceCode" v-if="form.type === '9' && form.onlineType === '2'">
                  <el-select v-model="form.deviceCode" @change="dahuaDeviceCodeChange" placeholder="请选择设备" filterable style="width: 100%;">
                    <el-option v-for="item in dahuaDeviceList" :key="item.deviceId" :label="item.deviceId" :value="item.deviceId">
                      <div style="display: flex; justify-content: space-between;">
                        <span>{{ item.deviceId }}</span>
                        <span style="color: var(--el-text-color-secondary); font-size: 12px;">{{ item.ip }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
                <!-- 其他 -->
                <el-form-item label="IP地址" prop="ipAddress" v-if="form.type === '5' || form.type === '7' || (form.type === '9' && form.onlineType === '1')">
                  <el-select v-if="form.type === '5'" v-model="form.ipAddress" @change="onvifDeviceCodeChange" placeholder="请选择设备IP" filterable style="width: 100%;">
                    <el-option v-for="item in onvifDeviceList" :key="item.ip" :label="item.ip" :value="item.ip" />
                  </el-select>
                  <el-input v-else v-model="form.ipAddress" placeholder="请输入IP地址" :maxlength="50" show-word-limit/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="端口" prop="port" v-if="form.type === '7' || (form.type === '9' && form.onlineType === '1')">
                  <el-input v-model="form.port" placeholder="请输入端口" disabled :maxlength="10" show-word-limit/>
                </el-form-item>
                <el-form-item label="上线类型" prop="onlineType" v-if="form.type === '9'">
                  <el-radio-group v-model="form.onlineType" @change="onlineTypeChange">
                    <el-radio v-for="dict in qs_online_type" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16" v-if="form.type === '7' || form.type === '5' || form.type === '9'">
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
            <el-row :gutter="16" v-if="form.type === '7' || form.type === '8' || form.type === '9'">
              <el-col :span="12">
                <el-form-item label="通道号" prop="channel">
                  <el-input v-model="form.channel" placeholder="请输入通道号" @input="handleNumberInput" :maxlength="5" show-word-limit/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="码流类型" prop="streamType">
                  <el-radio-group v-model="form.streamType">
                    <el-radio v-for="dict in qs_stream_type" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- ONVIF特有 -->
            <template v-if="form.type === '5'">
              <el-form-item label="验证类型" prop="onvifAuth">
                <el-radio-group v-model="form.onvifAuth">
                  <el-radio v-for="dict in qs_onvif_auth" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item style="margin: -8px 0 0 90px;">
                <el-button type="primary" @click="onvifAuthLogin" size="small">认证</el-button>
              </el-form-item>
              <el-form-item label="流地址" prop="liveAddress">
                <el-select v-model="form.liveAddress" placeholder="请选择流地址" filterable style="width: 100%;">
                  <el-option v-for="item in streamUris" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </template>
          </template>

          <!-- 国标28181配置 -->
          <template v-if="form.type === '12'">
            <el-form-item label="国标设备" prop="gbDeviceId">
              <el-select v-model="form.gbDeviceId" placeholder="请选择国标设备" @change="gbDeviceChange" filterable style="width: 100%;">
                <el-option v-for="item in gb28181DeviceList" :key="item.deviceId" :label="item.name" :value="item.deviceId">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span :style="{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.onLine ? 'var(--el-color-success)' : 'var(--el-text-color-secondary)', display: 'inline-block'}"></span>
                      <span style="font-weight: 500;">{{ item.name }}</span>
                    </div>
                    <span style="color: var(--el-text-color-secondary); font-size: 12px; font-family: 'Courier New', monospace;">{{ item.deviceId }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="国标通道" prop="gbChannelId">
              <el-select v-model="form.gbChannelId" placeholder="请选择国标通道" @change="gbChannelChange" filterable :disabled="!form.gbDeviceId" style="width: 100%;">
                <el-option v-for="item in gb28181ChannelList" :key="item.gbDeviceId || item.deviceId" :label="item.gbName || item.name" :value="item.gbDeviceId || item.deviceId">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span :style="{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (item.gbStatus || item.status) === 'ON' ? 'var(--el-color-success)' : 'var(--el-text-color-secondary)', display: 'inline-block'}"></span>
                      <span style="font-weight: 500;">{{ item.gbName || item.name }}</span>
                    </div>
                    <span style="color: var(--el-text-color-secondary); font-size: 12px; font-family: 'Courier New', monospace;">{{ item.gbDeviceId || item.deviceId }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="传输模式" prop="streamMode">
              <el-radio-group v-model="form.streamMode">
                <el-radio label="UDP">UDP</el-radio>
                <el-radio label="TCP-PASSIVE">TCP被动</el-radio>
              </el-radio-group>
            </el-form-item>
          </template>

          <!-- JT1078配置 -->
          <template v-if="form.type === '14'">
            <el-form-item label="JT1078设备" prop="deviceCode">
              <el-select v-model="form.deviceCode" placeholder="请选择JT1078设备" @change="jt1078DeviceChange" filterable style="width: 100%;">
                <el-option v-for="item in jt1078DeviceList" :key="item.deviceId" :value="item.deviceId">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span :style="{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.online ? 'var(--el-color-success)' : 'var(--el-text-color-secondary)', display: 'inline-block'}"></span>
                      <span style="font-weight: 500;">{{ item.plateNo || item.deviceId }}</span>
                    </div>
                    <span style="color: var(--el-text-color-secondary); font-size: 12px; font-family: 'Courier New', monospace;">{{ item.mobileNo }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="通道号" prop="channel">
                  <el-input v-model="form.channel" placeholder="请输入通道号" @input="handleNumberInput" :maxlength="5" show-word-limit/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="传输模式" prop="streamMode">
                  <el-radio-group v-model="form.streamMode">
                    <el-radio label="UDP">UDP</el-radio>
                    <el-radio label="TCP-PASSIVE">TCP被动</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="车牌号" prop="jtPlateNo">
                  <el-input v-model="form.jtPlateNo" placeholder="请输入车牌号" :maxlength="20" show-word-limit disabled/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="车牌颜色" prop="jtPlateColor">
                  <el-select v-model="form.jtPlateColor" placeholder="请选择车牌颜色" disabled style="width: 100%;">
                    <el-option label="蓝牌" :value="1" />
                    <el-option label="黄牌" :value="2" />
                    <el-option label="绿牌" :value="5" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </div>

        <!-- 展开/收起按钮 -->
        <div class="expand-toggle">
          <el-button text type="primary" @click="showAdvanced = !showAdvanced">
            <el-icon v-if="!showAdvanced"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            {{ showAdvanced ? '收起高级选项' : '展开高级选项' }}
          </el-button>
        </div>

        <!-- 高级配置（可展开） -->
        <el-collapse-transition>
          <div v-show="showAdvanced" class="advanced-config">

            <!-- 功能配置 -->
            <div class="config-section">
              <div class="section-title">功能配置</div>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="音频" prop="enableAudio">
                    <el-switch v-model="form.enableAudio" active-value="1" inactive-value="0" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="MP4录制" prop="enableMp4">
                    <el-switch v-model="form.enableMp4" active-value="1" inactive-value="0" />
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="form.type !== '12' && form.type !== '14'">
                  <el-form-item label="无人观看" prop="enableDisableNoneReader">
                    <el-switch v-model="form.enableDisableNoneReader" active-value="1" inactive-value="0" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="传输协议" prop="protocol" v-if="form.type !== '12' && form.type !== '14'">
                <el-radio-group v-model="form.protocol">
                  <el-radio v-for="dict in qs_protocol" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <!-- 设备信息 -->
            <div class="config-section">
              <div class="section-title">设备信息</div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="国标编码" prop="gbCode" v-if="form.type !== '12'">
                    <el-input v-model="form.gbCode" placeholder="请输入国标编码" :maxlength="100" show-word-limit>
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
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="经度" prop="longitude">
                    <el-input v-model="form.longitude" placeholder="请输入经度" :maxlength="20" show-word-limit>
                      <template #append>
                        <el-button @click="selectMapPositionFun">选择</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="纬度" prop="latitude">
                    <el-input v-model="form.latitude" placeholder="请输入纬度" :maxlength="20" show-word-limit>
                      <template #append>
                        <el-button @click="selectMapPositionFun">选择</el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="摄像机类型" prop="ptzType">
                    <el-select v-model="form.ptzType" placeholder="请选择摄像机类型" clearable style="width: 100%;">
                      <el-option label="球机" :value="1"/>
                      <el-option label="半球" :value="2"/>
                      <el-option label="固定枪机" :value="3"/>
                      <el-option label="遥控枪机" :value="4"/>
                      <el-option label="全景/拼接通道" :value="6"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="form.status">
                      <el-radio v-for="dict in qs_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="安装地址" prop="address">
                <el-input v-model="form.address" placeholder="请输入安装地址" type="textarea" :maxlength="200" show-word-limit :rows="2"/>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" :maxlength="255" show-word-limit :rows="2"/>
              </el-form-item>
            </div>

            <!-- GB28181扩展信息 -->
            <div class="config-section">
              <div class="section-title">GB28181扩展</div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="设备型号" prop="gbModel">
                    <el-input v-model="form.gbModel" placeholder="请输入设备型号" :maxlength="50" show-word-limit/>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="设备归属" prop="gbOwner">
                    <el-input v-model="form.gbOwner" placeholder="请输入设备归属" :maxlength="50" show-word-limit/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="行政区划" prop="gbBlock">
                    <el-input v-model="form.gbBlock" placeholder="请输入行政区划" :maxlength="50" show-word-limit/>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="注册方式" prop="gbRegisterWay">
                    <el-select v-model="form.gbRegisterWay" placeholder="请选择注册方式" clearable style="width: 100%;">
                      <el-option label="IP方式" :value="1"/>
                      <el-option label="动态域名" :value="2"/>
                      <el-option label="主动上报" :value="3"/>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="使用类型" prop="gbUseType">
                    <el-select v-model="form.gbUseType" placeholder="请选择使用类型" clearable style="width: 100%;">
                      <el-option label="固定点" :value="1"/>
                      <el-option label="移动点" :value="2"/>
                      <el-option label="临时点" :value="3"/>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-collapse-transition>
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
               class="glass-dialog play-dialog"
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
          <div v-if="!isPtz" style="text-align: center; padding: 40px; color: var(--el-text-color-secondary);">
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
            <div v-else style="text-align: center; padding: 20px; color: var(--el-text-color-secondary);">
              <p>该设备暂不支持云台控制及相关功能</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog :title="`接入地址-${deviceRow.deviceName}`" v-model="accessAddressOpen" width="600px" append-to-body
               draggable
               class="glass-dialog access-dialog">
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

    <!-- 大华设备校时对话框 -->
    <el-dialog title="设备校时" v-model="timeSyncDialogVisible" width="500px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="设备IP">
          <el-input v-model="timeSyncForm.deviceIp" disabled />
        </el-form-item>
        <el-form-item label="设备时间">
          <el-input v-model="timeSyncForm.deviceTime" disabled placeholder="点击获取时间" />
          <el-button type="primary" @click="handleGetTime" style="margin-left: 10px;">获取时间</el-button>
        </el-form-item>
        <el-form-item label="同步时间">
          <el-date-picker
            v-model="timeSyncForm.syncTime"
            type="datetime"
            placeholder="选择同步时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%;"
          />
          <el-button type="primary" @click="handleSetCurrentTime" style="margin-left: 10px;">设置为当前时间</el-button>
        </el-form-item>
        <el-form-item label="同步方式">
          <el-radio-group v-model="timeSyncForm.syncType">
            <el-radio :label="true">设备时间同步到本地</el-radio>
            <el-radio :label="false">本地时间同步到设备</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="timeSyncDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTimeSync" :loading="timeSyncLoading">同步</el-button>
      </template>
    </el-dialog>

    <!-- 大华设备信息对话框 -->
    <el-dialog title="大华设备信息" v-model="deviceInfoDialogVisible" width="800px" append-to-body>
      <el-tabs v-model="deviceInfoTabActive" type="border-card">
        <!-- 设备信息标签页 -->
        <el-tab-pane label="设备信息" name="deviceInfo">
          <el-descriptions :column="2" border v-loading="deviceInfoLoading">
            <el-descriptions-item label="序列号">{{ deviceInfo.serialNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item label="通道数量">{{ deviceInfo.channelNum || '-' }}</el-descriptions-item>
            <el-descriptions-item label="硬盘数量">{{ deviceInfo.diskNum || '-' }}</el-descriptions-item>
            <el-descriptions-item label="DVR类型">{{ deviceInfo.dvrType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报警输入端口">{{ deviceInfo.alarmInPortNum || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报警输出端口">{{ deviceInfo.alarmOutPortNum || '-' }}</el-descriptions-item>
            <el-descriptions-item label="登录超时时间(分钟)">{{ deviceInfo.limitLoginTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="剩余登录次数">{{ deviceInfo.leftLogTimes || '-' }}</el-descriptions-item>
            <el-descriptions-item label="解锁剩余时间(秒)">{{ deviceInfo.lockLeftTime || '-' }}</el-descriptions-item>
          </el-descriptions>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleRefreshDeviceInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 系统参数标签页 -->
        <el-tab-pane label="系统参数" name="systemParam">
          <el-form :model="systemParam" label-width="120px" v-loading="deviceInfoLoading">
            <el-form-item label="视频制式">
              <el-select v-model="systemParam.videoStandard" style="width: 100%;">
                <el-option label="PAL" :value="0" />
                <el-option label="NTSC" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="国家/地区">
              <el-input v-model="systemParam.country" />
            </el-form-item>
          </el-form>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetSystemParam" :loading="deviceInfoLoading" icon="Refresh">获取</el-button>
          </div>
        </el-tab-pane>

        <!-- 视频参数标签页 -->
        <el-tab-pane label="视频参数" name="videoParam">
          <el-form :model="videoParam" label-width="120px" v-loading="deviceInfoLoading">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="通道ID">
                  <el-input-number v-model="videoParam.channelId" :min="0" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="码流类型">
                  <el-select v-model="videoParam.streamType" style="width: 100%;">
                    <el-option label="主码流" :value="0" />
                    <el-option label="辅码流1" :value="1" />
                    <el-option label="辅码流2" :value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="视频使能">
              <el-select v-model="videoParam.videoEnable" style="width: 100%;">
                <el-option label="关闭" :value="0" />
                <el-option label="开启" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="压缩格式">
              <el-select v-model="videoParam.compression" style="width: 100%;">
                <el-option label="MPEG4" :value="0" />
                <el-option label="MS-MPEG4" :value="1" />
                <el-option label="MPEG2" :value="2" />
                <el-option label="MPEG1" :value="3" />
                <el-option label="H.263" :value="4" />
                <el-option label="MJPG" :value="5" />
                <el-option label="FCC-MPEG4" :value="6" />
                <el-option label="H.264" :value="7" />
                <el-option label="H.265" :value="8" />
                <el-option label="SVAC" :value="9" />
              </el-select>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="宽度">
                  <el-input-number v-model="videoParam.width" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高度">
                  <el-input-number v-model="videoParam.height" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="码率控制">
              <el-select v-model="videoParam.bitRateControl" style="width: 100%;">
                <el-option label="固定码流(CBR)" :value="0" />
                <el-option label="可变码流(VBR)" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="码率(kbps)">
              <el-input-number v-model="videoParam.bitRate" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="帧率">
              <el-input-number v-model="videoParam.frameRate" :step="0.1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="I帧间隔">
              <el-input-number v-model="videoParam.iframeInterval" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="图像质量">
              <el-select v-model="videoParam.imageQuality" style="width: 100%;">
                <el-option label="图像质量10%" :value="1" />
                <el-option label="图像质量30%" :value="2" />
                <el-option label="图像质量50%" :value="3" />
                <el-option label="图像质量60%" :value="4" />
                <el-option label="图像质量80%" :value="5" />
                <el-option label="图像质量100%" :value="6" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetVideoParam" :loading="deviceInfoLoading" icon="Refresh">获取</el-button>
            <el-button type="success" @click="handleSetVideoParam" :loading="deviceInfoLoading" icon="Check">设置</el-button>
          </div>
        </el-tab-pane>

        <!-- 设备视频参数标签页 -->
        <el-tab-pane label="设备视频参数" name="deviceVideoParam">
          <el-form :model="deviceVideoParam" label-width="120px" v-loading="deviceInfoLoading">
            <el-form-item label="通道ID">
              <el-input-number v-model="deviceVideoParam.channelId" :min="0" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="亮度">
              <el-input-number v-model="deviceVideoParam.brightness" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="对比度">
              <el-input-number v-model="deviceVideoParam.contrast" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="饱和度">
              <el-input-number v-model="deviceVideoParam.saturation" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="色度">
              <el-input-number v-model="deviceVideoParam.chroma" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="锐度">
              <el-input-number v-model="deviceVideoParam.sharpness" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="色调">
              <el-input-number v-model="deviceVideoParam.hue" :min="0" :max="100" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="增益">
              <el-input-number v-model="deviceVideoParam.gain" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="黑白模式">
              <el-select v-model="deviceVideoParam.blackWhiteMode" style="width: 100%;">
                <el-option label="关闭" :value="0" />
                <el-option label="开启" :value="1" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetDeviceVideoParam" :loading="deviceInfoLoading" icon="Refresh">获取</el-button>
            <el-button type="success" @click="handleSetDeviceVideoParam" :loading="deviceInfoLoading" icon="Check">设置</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <SelectMapPosition ref="selectMapPositionRef" @onSubmit="selectMapPositionSubmit"/>
    <ChannelCode ref="channelCodeRef" @handleOk="channelCodeOk"/>
    <DeviceSnapshotDialog ref="snapshotDialogRef"/>
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
import {DaHuaDevice, DaHuaDeviceInfo} from "@/types/api/qs/dahua";
import { listDaHuaDevice, getDaHuaTime, setDaHuaTime, rebootDaHuaDevice, getDaHuaDeviceInfo, getDaHuaSystemParam, getDaHuaVideoParam, setDaHuaVideoParam, getDaHuaDeviceVideoParam, setDaHuaDeviceVideoParam, captureDaHuaAndSave } from "@/api/qs/dahua";
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
import {DocumentCopy, InfoFilled, Refresh, Sunny, Moon, SwitchButton, CircleClose, Position, Plus, Delete, WindPower, List, Grid, CircleCheck, Picture, VideoCamera, MapLocation, Monitor, More, ArrowDown, Clock, Camera} from '@element-plus/icons-vue'
import StreamDropdown from "@/components/Channel/streamDropdown.vue";
import MediaInfo from "@/components/Channel/mediaInfo.vue";
import SelectMapPosition from '@/components/SelectMapPosition';
import ChannelCode from '@/views/components/common/channelCode.vue';
import DeviceSnapshotDialog from '@/components/DeviceSnapshotDialog/index.vue';
import {getOnvifDeviceList, onvifLogin} from "@/api/qs/onvif";
import {getAllDevices, getChannelsByDeviceId} from "@/api/qs/gb28181";
import type {Gb28181Device, Gb28181Channel} from "@/types/api/qs/gb28181";
import {getAllDevice} from "@/api/qs/jt1078";
import type {Jt1078Device} from "@/types/api/qs/jt1078";
import {ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";

const {toClipboard} = useClipboard()

const {proxy} = getCurrentInstance()
const router = useRouter()
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

// 大华设备校时
const timeSyncDialogVisible = ref(false);
const timeSyncLoading = ref(false);
const timeSyncForm = reactive({
  deviceId: null as number | null,
  deviceIp: '',
  deviceTime: '',
  syncTime: '',
  syncType: false
});

// 大华设备信息
const deviceInfoDialogVisible = ref(false);
const deviceInfoLoading = ref(false);
const deviceInfoTabActive = ref('deviceInfo');
const deviceInfo = reactive<DaHuaDeviceInfo>({
  serialNumber: '',
  alarmInPortNum: undefined,
  alarmOutPortNum: undefined,
  diskNum: undefined,
  dvrType: undefined,
  channelNum: undefined,
  limitLoginTime: undefined,
  leftLogTimes: undefined,
  lockLeftTime: undefined
});
const systemParam = reactive({
  videoStandard: undefined as number | undefined,
  country: ''
});
const videoParam = reactive({
  channelId: 0,
  streamType: 0,
  formatType: undefined,
  videoEnable: undefined,
  compression: undefined,
  width: undefined,
  height: undefined,
  bitRateControl: undefined,
  bitRate: undefined,
  frameRate: undefined,
  iframeInterval: undefined,
  imageQuality: undefined
});
const deviceVideoParam = reactive({
  channelId: 0,
  brightness: undefined,
  contrast: undefined,
  saturation: undefined,
  chroma: undefined,
  sharpness: undefined,
  hue: undefined,
  gain: undefined,
  blackWhiteMode: undefined
});
const currentDeviceId = ref<number | null>(null);
const currentDeviceRow = ref<any>(null);
const snapshotDialogRef = ref();

// 接入地址
const streamPushAddressForm = ref({});

const data = reactive({
  showAdvanced: false,
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

const {queryParams, form, rules, showAdvanced} = toRefs(data)

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
    jtPlateColor: null,
    gbCode: null,
    gbModel: null,
    gbOwner: null,
    gbBlock: null,
    gbAddress: null,
    gbRegisterWay: null,
    gbUseType: null,
    gbLongitude: null,
    gbLatitude: null,
    gbLongitudeDouble: null,
    gbLatitudeDouble: null
  }
  showAdvanced.value = false
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

/**
 * 跳转到云端录像
 */
const handleCloudRecord = (row: QsDevice) => {
  proxy.$tab.openPage("[" + row.deviceName + "]云端录像", '/zlm/deviceRecordPlayback/index', {
      deviceId: row.id,
      type: 'cloud'
  })
}

/**
 * 跳转到设备录像
 */
const handleDeviceRecord = (row: QsDevice) => {
  proxy.$tab.openPage("[" + row.deviceName + "]设备录像", '/zlm/deviceRecordPlayback/index', {
      deviceId: row.id,
      type: 'device'
  })
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

// ==================== 大华设备校时 ====================

// 更多操作处理
const handleMoreAction = (command: string, row: QsDevice) => {
  switch (command) {
    case 'edit':
      handleUpdate(row);
      break;
    case 'viewSnapshots':
      snapshotDialogRef.value?.openDialog(row.id!, row.deviceName);
      break;
    case 'delete':
      handleDelete(row);
      break;
    case 'timeSync':
      openTimeSyncDialog(row);
      break;
    case 'deviceInfo':
      openDeviceInfoDialog(row);
      break;
    case 'capture':
      handleCapture(row);
      break;
    case 'reboot':
      handleReboot(row);
      break;
  }
}

// 大华设备抓图
const handleCapture = async (row: QsDevice) => {
  try {
    await proxy.$modal.confirm(`是否确认对设备"${row.deviceName}"进行抓图？`);
    
    const channelId = row.channel || 0;
    const response = await captureDaHuaAndSave(row.id!, channelId, 'manual');
    if (response.code === 200) {
      proxy.$modal.msgSuccess('抓图成功，已保存到数据库');
    } else {
      proxy.$modal.msgError(response.msg || '抓图失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('抓图失败:', error);
      proxy.$modal.msgError('抓图失败');
    }
  }
}

// 重启大华设备
const handleReboot = async (row: QsDevice) => {
  try {
    await proxy.$modal.confirm(`是否确认重启设备"${row.deviceName}"？`);
    
    const response = await rebootDaHuaDevice(row.id!);
    if (response.code === 200) {
      proxy.$modal.msgSuccess('重启命令已发送，设备正在重启...');
    } else {
      proxy.$modal.msgError(response.msg || '重启失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重启设备失败:', error);
      proxy.$modal.msgError('重启设备失败');
    }
  }
}

// 打开设备信息对话框
const openDeviceInfoDialog = (row: QsDevice) => {
  currentDeviceId.value = row.id;
  currentDeviceRow.value = row;
  deviceInfoTabActive.value = 'deviceInfo';
  Object.assign(deviceInfo, {
    serialNumber: '',
    alarmInPortNum: undefined,
    alarmOutPortNum: undefined,
    diskNum: undefined,
    dvrType: undefined,
    channelNum: undefined,
    limitLoginTime: undefined,
    leftLogTimes: undefined,
    lockLeftTime: undefined
  });
  Object.assign(systemParam, {
    videoStandard: undefined,
    country: ''
  });
  Object.assign(videoParam, {
    channelId: 0,
    streamType: 0,
    formatType: undefined,
    videoEnable: undefined,
    compression: undefined,
    width: undefined,
    height: undefined,
    bitRateControl: undefined,
    bitRate: undefined,
    frameRate: undefined,
    iframeInterval: undefined,
    imageQuality: undefined
  });
  Object.assign(deviceVideoParam, {
    channelId: 0,
    brightness: undefined,
    contrast: undefined,
    saturation: undefined,
    chroma: undefined,
    sharpness: undefined,
    hue: undefined,
    gain: undefined,
    blackWhiteMode: undefined
  });
  deviceInfoDialogVisible.value = true;
  handleRefreshDeviceInfo();
}

// 获取系统参数
const handleGetSystemParam = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const res = await getDaHuaSystemParam(currentDeviceId.value);
    if (res.data) {
      Object.assign(systemParam, res.data);
      proxy.$modal.msgSuccess('获取系统参数成功');
    }
  } catch (error) {
    console.error('获取系统参数失败:', error);
    proxy.$modal.msgError('获取系统参数失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 获取视频参数
const handleGetVideoParam = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const res = await getDaHuaVideoParam(currentDeviceId.value, videoParam.channelId, videoParam.streamType);
    if (res.data) {
      Object.assign(videoParam, res.data);
      proxy.$modal.msgSuccess('获取视频参数成功');
    }
  } catch (error) {
    console.error('获取视频参数失败:', error);
    proxy.$modal.msgError('获取视频参数失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 设置视频参数
const handleSetVideoParam = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const res = await setDaHuaVideoParam(currentDeviceId.value, videoParam.channelId, videoParam.streamType, videoParam);
    if (res.code === 200) {
      proxy.$modal.msgSuccess('设置视频参数成功');
    } else {
      proxy.$modal.msgError(res.msg || '设置视频参数失败');
    }
  } catch (error) {
    console.error('设置视频参数失败:', error);
    proxy.$modal.msgError('设置视频参数失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 获取设备视频参数
const handleGetDeviceVideoParam = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const res = await getDaHuaDeviceVideoParam(currentDeviceId.value, deviceVideoParam.channelId);
    if (res.data) {
      Object.assign(deviceVideoParam, res.data);
      proxy.$modal.msgSuccess('获取设备视频参数成功');
    }
  } catch (error) {
    console.error('获取设备视频参数失败:', error);
    proxy.$modal.msgError('获取设备视频参数失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 设置设备视频参数
const handleSetDeviceVideoParam = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const res = await setDaHuaDeviceVideoParam(currentDeviceId.value, deviceVideoParam.channelId, deviceVideoParam);
    if (res.code === 200) {
      proxy.$modal.msgSuccess('设置设备视频参数成功');
    } else {
      proxy.$modal.msgError(res.msg || '设置设备视频参数失败');
    }
  } catch (error) {
    console.error('设置设备视频参数失败:', error);
    proxy.$modal.msgError('设置设备视频参数失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 刷新设备信息
const handleRefreshDeviceInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const res = await getDaHuaDeviceInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(deviceInfo, res.data);
      proxy.$modal.msgSuccess('获取设备信息成功');
    }
  } catch (error) {
    console.error('获取设备信息失败:', error);
    proxy.$modal.msgError('获取设备信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 打开校时对话框
const openTimeSyncDialog = (row: QsDevice) => {
  timeSyncForm.deviceId = row.id;
  timeSyncForm.deviceIp = row.ipAddress || '';
  timeSyncForm.deviceTime = '';
  timeSyncForm.syncTime = '';
  timeSyncForm.syncType = false;
  timeSyncDialogVisible.value = true;
}

// 获取设备时间
const handleGetTime = async () => {
  if (!timeSyncForm.deviceIp) {
    proxy.$modal.msgError('设备IP不能为空');
    return;
  }
  try {
    timeSyncLoading.value = true;
    const res = await getDaHuaTime(timeSyncForm.deviceIp);
    timeSyncForm.deviceTime = res.data || '';
    proxy.$modal.msgSuccess('获取时间成功');
  } catch (error) {
    console.error('获取设备时间失败:', error);
    proxy.$modal.msgError('获取设备时间失败');
  } finally {
    timeSyncLoading.value = false;
  }
}

// 设置为当前时间
const handleSetCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  timeSyncForm.syncTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 执行时间同步
const handleTimeSync = async () => {
  if (!timeSyncForm.deviceId) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  if (!timeSyncForm.syncTime) {
    proxy.$modal.msgError('请选择同步时间');
    return;
  }
  try {
    timeSyncLoading.value = true;
    await setDaHuaTime(timeSyncForm.deviceId, timeSyncForm.syncTime, timeSyncForm.syncType);
    proxy.$modal.msgSuccess('时间同步成功');
    timeSyncDialogVisible.value = false;
  } catch (error) {
    console.error('时间同步失败:', error);
    proxy.$modal.msgError('时间同步失败');
  } finally {
    timeSyncLoading.value = false;
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

<style lang="scss">
/* 下拉菜单样式 - 非scoped，用于teleport到body的元素 */
.device-dropdown-menu {
  border-radius: 10px !important;
  border: 1px solid var(--el-border-color-lighter) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
  padding: 6px !important;
  min-width: 120px !important;
}

.device-dropdown-menu .el-dropdown-menu__item {
  border-radius: 6px !important;
  margin: 2px 0 !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 14px !important;
  color: var(--el-text-color-primary) !important;
  transition: all 0.2s ease !important;
}

.device-dropdown-menu .el-dropdown-menu__item:hover {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
  transform: translateX(2px) !important;
}

.device-dropdown-menu .el-dropdown-menu__item.is-danger {
  color: var(--el-color-danger) !important;
}

.device-dropdown-menu .el-dropdown-menu__item.is-danger:hover {
  background-color: var(--el-color-danger-light-9) !important;
  color: var(--el-color-danger) !important;
}

.device-dropdown-menu .time-sync-item {
  color: var(--el-color-primary) !important;
  font-weight: 500 !important;
}

.device-dropdown-menu .time-sync-item:hover {
  background-color: var(--el-color-primary-light-9) !important;
}

.device-dropdown-menu .el-dropdown-menu__item .el-icon {
  font-size: 16px !important;
}
</style>

<style lang="scss" scoped>
/* ========== 基础容器 ========== */
.app-container {
  padding: 16px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-box {
  margin-bottom: 16px;
}

/* ========== 查询表单 ========== */
.query-form {
  padding: 10px 15px;
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 0 !important;
  animation: fadeInUp 0.4s ease-out 0.15s both;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;

  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 0;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
    transition: all 0.3s;

    &:hover,
    &:focus-within {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }

    &:focus-within {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
    }
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

.search-btn {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--el-color-primary-light-7);
  }

  &:active {
    transform: translateY(0);
  }
}

.reset-btn {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(0);
  }
}

/* ========== 工具栏 ========== */
.toolbar-row {
  padding: 4px 0;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.delete-btn:not(:disabled):hover {
  box-shadow: 0 6px 16px var(--el-color-danger-light-7);
}

/* 按钮区域 */
.form-actions {
  margin-left: auto !important;
  margin-right: 0 !important;
  padding-left: 16px;
  border-left: 1px solid var(--el-border-color-lighter);
  margin-left: 12px !important;

  .button-group {
    display: flex;
    gap: 12px;
  }
}

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
  background: var(--el-fill-color-light);
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
  box-shadow: var(--el-box-shadow-light);
  border-color: var(--el-color-primary-light-5);
}

.device-card.is-selected {
  border-color: var(--el-color-primary);
  box-shadow: 
    0 0 0 3px var(--el-color-primary-light-9),
    0 8px 24px -4px rgba(var(--el-color-primary-rgb), 0.2),
    0 4px 12px rgba(var(--el-color-primary-rgb), 0.1);
}

/* 头部区域（替代图片区） */
.card-header-area {
  position: relative;
  padding: 16px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-fill-color-lighter) 100%);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 64px;
}

.card-header-area .card-checkbox {
  position: relative;
  top: auto;
  left: auto;
  z-index: 2;
}

.card-header-area .card-checkbox :deep(.el-checkbox__inner) {
  border-radius: 6px;
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.header-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  flex-shrink: 0;
  animation: iconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 4px rgba(var(--el-color-primary-rgb), 0.3));
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.header-tag {
  flex-shrink: 0;
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

/* 通道/节点单独一行 */
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

/* 操作栏 */
.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.card-toolbar .el-button.btn-play {
  flex-shrink: 0;
  min-width: 72px;
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.25) !important;
  transition: all 0.3s ease;
}

.card-toolbar .el-button.btn-play:not(:disabled):hover {
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.4) !important;
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

/* 表格容器优化 */
.table-wrapper {
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out 0.25s both;
  transition: box-shadow 0.3s;
}

.table-wrapper:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
}

.custom-table {
  --el-table-header-bg-color: var(--el-fill-color-light);

  :deep(.el-table__header-wrapper) {
    th {
      background-color: var(--el-fill-color-light) !important;
      color: var(--el-text-color-primary);
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.3px;
      transition: background-color 0.3s;
    }
  }

  :deep(.el-table__body-wrapper) {
    .el-table__row {
      transition: all 0.25s ease;
      animation: rowFadeIn 0.4s ease-out both;

      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.03 + 0.25}s;
        }
      }

      &:hover {
        background-color: var(--el-color-primary-light-9) !important;
        transform: scale(1.002);
      }

      &.current-row {
        background-color: var(--el-color-primary-light-9) !important;
      }
    }
  }

  :deep(.el-table__empty-block) {
    padding: 40px 0;
  }
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 编号徽章 */
.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 11px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;

  .el-table__row:hover & {
    background: var(--el-color-primary-light-8);
    transform: scale(1.05);
  }
}

/* 分页优化 */
:deep(.el-pagination) {
  padding: 12px 0;
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

:deep(.el-pagination__total) {
  color: var(--el-text-color-secondary);
}

:deep(.el-pagination__sizes) .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
}

:deep(.el-pager li) {
  transition: all 0.3s;
}

:deep(.el-pager li:hover:not(.is-active)) {
  color: var(--el-color-primary);
  transform: translateY(-1px);
}

:deep(.el-pager li.is-active) {
  box-shadow: 0 2px 8px var(--el-color-primary-light-5);
}

/* ========== 播放器对话框 ========== */
.play-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    background: var(--el-bg-color-page);
    backdrop-filter: blur(20px);
    border: 1px solid var(--el-border-color-lighter);
    box-shadow: var(--el-box-shadow-light);
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 16px 20px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-dialog__title) {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.el-dialog__headerbtn) {
    top: 14px;
    right: 16px;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  :deep(.el-dialog__headerbtn:hover) {
    background: var(--el-fill-color-light);
  }

  :deep(.el-dialog__close) {
    color: var(--el-text-color-secondary);
    font-size: 18px;
  }

  :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
    color: var(--el-color-primary);
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.player-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  position: relative;
}

.player-controls {
  height: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 140px auto 140px;
  background-color: rgb(0, 0, 0);
}

.player-progress {
  width: 100%;
  height: 8px;
  margin: 6px 0;
  border-radius: 4px;
  border: 1px solid #505050;
  background-color: rgb(56, 56, 56);
  cursor: pointer;
  position: relative;
}

.player-time {
  color: #FFFFFF;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--el-color-primary);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.player-progress-tooltip {
  width: fit-content;
  text-align: center;
  position: absolute;
  top: -35px;
  color: rgb(217, 217, 217);
  font-size: 14px;
  text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
  pointer-events: none;
  white-space: nowrap;
  z-index: 99;
}

.player-toolbar {
  height: 48px;
  background-color: #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 16px;
}

.player-toolbar-left,
.player-toolbar-center,
.player-toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  margin-left: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.primary {
    background: var(--el-color-primary);
  }

  &.danger {
    background: rgba(var(--el-color-danger-rgb), 0.2);
  }

  &.speed-btn {
    border-radius: 12px;
    padding: 0 8px;
    height: 24px;
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
  }
}

/* ========== 云台控制样式 ========== */
.player {
  width: 100%;
  height: 450px;
}

::v-deep(.el-icon) {
  height: auto !important;
}

.control-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  max-width: 100px;
  max-height: 100px;
  border-radius: 100%;
  margin-top: 24px;
  margin-left: 8px;
  float: left;
}

.control-btn {
  display: flex;
  justify-content: center;
  position: absolute;
  width: 44%;
  height: 44%;
  border-radius: 5px;
  border: 1px solid var(--el-color-primary-light-3);
  box-sizing: border-box;
  transition: all 0.3s linear;
}

.control-btn:hover {
  cursor: pointer;
}

.control-btn .icon {
  width: 100%;
  font-size: 20px;
  color: var(--el-color-primary-light-3);
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
  background: var(--el-bg-color);
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
  color: var(--el-color-primary-light-3);
  border: 1px solid var(--el-color-primary-light-3);
  border-radius: 100%;
  transition: all 0.3s linear;
}

.control-inner-btn {
  position: absolute;
  width: 60%;
  height: 60%;
  background: var(--el-fill-color-lighter);
}

.control-top {
  top: -12px;
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
  border-top: 1px solid var(--el-color-primary-light-3);
  border-right: 1px solid var(--el-color-primary-light-3);
  border-radius: 0 100% 0 0;
}

.control-top .fa {
  transform: rotate(45deg) translateY(-7px);
}

.control-left {
  top: 27%;
  left: -12px;
  transform: rotate(45deg);
  border-radius: 5px 0 5px 100%;
}

.control-left .icon {
  transform: rotate(-45deg);
}

.control-left .control-inner {
  right: -1px;
  top: -1px;
  border-bottom: 1px solid var(--el-color-primary-light-3);
  border-left: 1px solid var(--el-color-primary-light-3);
  border-radius: 0 0 0 100%;
}

.control-left .fa {
  transform: rotate(-45deg) translateX(-7px);
}

.control-right {
  top: 27%;
  right: -12px;
  transform: rotate(45deg);
  border-radius: 5px 100% 5px 0;
}

.control-right .icon {
  transform: rotate(-45deg);
}

.control-right .control-inner {
  left: -1px;
  bottom: -1px;
  border-top: 1px solid var(--el-color-primary-light-3);
  border-right: 1px solid var(--el-color-primary-light-3);
  border-radius: 0 100% 0 0;
}

.control-right .fa {
  transform: rotate(-45deg) translateX(7px);
}

.control-bottom {
  left: 27%;
  bottom: -12px;
  transform: rotate(45deg);
  border-radius: 0 5px 100% 5px;
}

.control-bottom .icon {
  transform: rotate(-45deg);
}

.control-bottom .control-inner {
  top: -1px;
  left: -1px;
  border-bottom: 1px solid var(--el-color-primary-light-3);
  border-right: 1px solid var(--el-color-primary-light-3);
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

.ptz-btn-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0 32px;
  height: 48px;
  line-height: 64px;
}

/* ========== 表单卡片样式 ========== */
.form-card {
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.03),
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  animation: cardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.form-card:hover {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 16px 48px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
  border-color: rgba(var(--el-color-primary-rgb), 0.25);
}

.form-card:last-child {
  margin-bottom: 0;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

:deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 14px 20px;
}

:deep(.el-card__header span) {
  color: var(--el-text-color-primary) !important;
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

:deep(.el-select) {
  width: 100%;
}

:deep(.el-radio-group .el-radio) {
  margin-right: 24px;
}

/* ========== 玻璃对话框 ========== */
.glass-dialog.device-dialog :deep(.el-dialog) {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  animation: dialogEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.glass-dialog.device-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 18px 24px;
  margin-right: 0;
}

.glass-dialog.device-dialog :deep(.el-dialog__header .el-dialog__title) {
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.3px;
}

.glass-dialog.device-dialog :deep(.el-dialog__headerbtn) {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-dialog.device-dialog :deep(.el-dialog__headerbtn:hover) {
  background: rgba(var(--el-color-primary-rgb), 0.1);
  transform: rotate(90deg) scale(1.1);
}

.glass-dialog.device-dialog :deep(.el-dialog__body) {
  padding: 16px 24px;
}

.glass-dialog.device-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  padding: 16px 24px;
}

.glass-dialog.device-dialog :deep(.el-dialog__footer .el-button) {
  min-width: 88px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 36px;
}

.glass-dialog.device-dialog :deep(.el-dialog__footer .el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.35);
}

.glass-dialog.device-dialog :deep(.el-dialog__footer .el-button:not(.el-button--primary):hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* ========== 输入框 focus 光晕 ========== */
.glass-dialog.device-dialog :deep(.el-input__wrapper) {
  transition: all 0.25s ease;
}

.glass-dialog.device-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 10px rgba(var(--el-color-primary-rgb), 0.12);
}

/* ========== 表单项入场动画 ========== */
.glass-dialog.device-dialog :deep(.el-form-item) {
  animation: formItemEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

@keyframes formItemEnter {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ========== 暗黑模式适配 ========== */
html.dark {
  .query-form {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .table-wrapper {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .table-wrapper:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3);
  }

  .custom-table :deep(.el-table__header-wrapper th) {
    background-color: var(--el-bg-color-overlay) !important;
  }

  .custom-table :deep(.el-table__row:hover) {
    background-color: #0c2a5e !important;
  }

  .custom-table :deep(.el-table__cell),
  .custom-table :deep(.el-table__cell *),
  .custom-table :deep(.el-link),
  .custom-table :deep(.el-link *),
  .custom-table :deep(.el-text),
  .custom-table :deep(.el-text *) {
    color: #ffffff !important;
  }

  .player-toolbar {
    background: linear-gradient(to bottom, #0d0d0d, #1a1a1a);
  }

  /* 播放器对话框暗黑模式 */
  .play-dialog :deep(.el-dialog) {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .play-dialog :deep(.el-dialog__header) {
    border-bottom-color: var(--el-border-color);
  }

  /* 卡片暗黑增强 */
  .device-card {
    box-shadow: var(--el-box-shadow-dark);
  }

  .device-card:hover {
    box-shadow: 
      0 4px 8px rgba(0,0,0,0.35),
      0 12px 24px rgba(0,0,0,0.3),
      0 24px 48px rgba(0,0,0,0.2);
    border-color: var(--el-color-primary-light-3);
  }

  .device-card.is-selected {
    border-color: var(--el-color-primary);
    box-shadow:
      0 0 0 3px var(--el-color-primary-light-9),
      0 8px 24px -4px rgba(var(--el-color-primary-rgb), 0.25),
      0 4px 12px rgba(var(--el-color-primary-rgb), 0.15);
  }

  .card-header-area {
    background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb), 0.12) 0%, var(--el-fill-color) 100%);
  }

  /* 玻璃对话框暗黑模式 */
  .glass-dialog.device-dialog :deep(.el-dialog) {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  /* device/index.vue 特有暗黑模式样式 */
  .glass-dialog.device-dialog :deep(.el-dialog) {
    background: rgba(30, 30, 40, 0.78);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.25),
      0 2px 8px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }

  .glass-dialog.device-dialog :deep(.el-dialog__header) {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .glass-dialog.device-dialog :deep(.el-dialog__footer) {
    border-top-color: rgba(255, 255, 255, 0.06);
  }

  .glass-dialog.device-dialog :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 12px rgba(var(--el-color-primary-rgb), 0.2);
  }

  .form-card {
    background: rgba(30, 30, 40, 0.55);
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .form-card:hover {
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.25),
      0 8px 24px rgba(0, 0, 0, 0.2),
      0 16px 48px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-card__header) {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .card-checkbox :deep(.el-checkbox__inner) {
    background: rgba(30, 30, 30, 0.85);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .card-checkbox :deep(.el-checkbox__inner:hover) {
    background: rgba(50, 50, 50, 0.9);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .device-card:hover {
    box-shadow: 
      0 4px 8px rgba(0,0,0,0.35),
      0 12px 24px rgba(0,0,0,0.3),
      0 24px 48px rgba(0,0,0,0.2);
    border-color: var(--el-color-primary-light-3);
  }

  .device-card.is-selected {
    border-color: var(--el-color-primary);
    box-shadow:
      0 0 0 3px var(--el-color-primary-light-9),
      0 8px 24px -4px rgba(var(--el-color-primary-rgb), 0.25),
      0 4px 12px rgba(var(--el-color-primary-rgb), 0.15);
  }
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
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.4);
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

/* ===== 卡片视图按钮样式 - 白色图标 ===== */
/* 播放按钮 */
.card-toolbar .btn-play {
  color: #ffffff !important;
}

.card-toolbar .btn-play .el-icon {
  color: #ffffff !important;
}

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

/* ===== 播放对话框玻璃拟态 ===== */
.glass-dialog.play-dialog :deep(.el-dialog),
.glass-dialog.access-dialog :deep(.el-dialog) {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  animation: dialogEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.glass-dialog.play-dialog :deep(.el-dialog__header),
.glass-dialog.access-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 18px 24px;
  margin-right: 0;
}

.glass-dialog.play-dialog :deep(.el-dialog__header .el-dialog__title),
.glass-dialog.access-dialog :deep(.el-dialog__header .el-dialog__title) {
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.3px;
}

.glass-dialog.play-dialog :deep(.el-dialog__headerbtn),
.glass-dialog.access-dialog :deep(.el-dialog__headerbtn) {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-dialog.play-dialog :deep(.el-dialog__headerbtn:hover),
.glass-dialog.access-dialog :deep(.el-dialog__headerbtn:hover) {
  background: rgba(var(--el-color-primary-rgb), 0.1);
  transform: rotate(90deg) scale(1.1);
}

.glass-dialog.play-dialog :deep(.el-dialog__body),
.glass-dialog.access-dialog :deep(.el-dialog__body) {
  padding: 16px 24px;
}

.glass-dialog.play-dialog :deep(.el-dialog__footer),
.glass-dialog.access-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  padding: 16px 24px;
}

/* ===== 播放对话框内输入框 focus 光晕 ===== */
.glass-dialog.play-dialog :deep(.el-input__wrapper),
.glass-dialog.access-dialog :deep(.el-input__wrapper) {
  transition: all 0.25s ease;
}

.glass-dialog.play-dialog :deep(.el-input__wrapper.is-focus),
.glass-dialog.access-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 10px rgba(var(--el-color-primary-rgb), 0.12);
}

/* ===== 云台控制玻璃效果 ===== */
.control-round {
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.control-round-inner {
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.1);
}

.control-inner-btn {
  background: var(--el-fill-color-lighter);
}

.control-btn:hover {
  background: rgba(var(--el-color-primary-rgb), 0.06);
  box-shadow: 0 0 12px rgba(var(--el-color-primary-rgb), 0.15);
}

.control-zoom-btn {
  color: var(--el-color-primary-light-3);
  transition: all 0.25s ease;
}

.control-zoom-btn:hover {
  color: var(--el-color-primary);
  transform: scale(1.15);
  filter: drop-shadow(0 0 6px rgba(var(--el-color-primary-rgb), 0.3));
}

/* ===== 预置点面板动画 ===== */
.preset-panel {
  animation: panelFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes panelFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 暗黑模式 ===== */
html.dark .glass-dialog.play-dialog :deep(.el-dialog),
html.dark .glass-dialog.access-dialog :deep(.el-dialog) {
  background: rgba(30, 30, 40, 0.78);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

html.dark .glass-dialog.play-dialog :deep(.el-dialog__header),
html.dark .glass-dialog.access-dialog :deep(.el-dialog__header) {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

html.dark .glass-dialog.play-dialog :deep(.el-dialog__footer),
html.dark .glass-dialog.access-dialog :deep(.el-dialog__footer) {
  border-top-color: rgba(255, 255, 255, 0.06);
}

html.dark .glass-dialog.play-dialog :deep(.el-input__wrapper.is-focus),
html.dark .glass-dialog.access-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 12px rgba(var(--el-color-primary-rgb), 0.2);
}

html.dark .control-round {
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

html.dark .control-round-inner {
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.15);
}

html.dark .control-inner-btn {
  background: var(--el-fill-color-darker);
}

html.dark .control-btn:hover {
  background: rgba(var(--el-color-primary-rgb), 0.1);
}

/* ===== search-box 样式 ===== */
.search-box {
  margin-bottom: 16px;
}

/* ===== 查询表单优化样式 ===== */
.query-form {
  padding: 10px 15px;
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 0 !important;
  animation: fadeInUp 0.4s ease-out 0.15s both;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
}

.query-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.query-form :deep(.el-input__wrapper),
.query-form :deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
  transition: all 0.3s;
}

.query-form :deep(.el-input__wrapper:hover),
.query-form :deep(.el-input__wrapper:focus-within),
.query-form :deep(.el-select .el-input__wrapper:hover),
.query-form :deep(.el-select .el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
}

.query-form :deep(.el-input__wrapper:focus-within),
.query-form :deep(.el-select .el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
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

.form-actions {
  margin-left: auto !important;
  margin-right: 0 !important;
  padding-left: 16px;
  border-left: 1px solid var(--el-border-color-lighter);
  margin-left: 12px !important;
}

.button-group {
  display: flex;
  gap: 12px;
}

.search-btn {
  transition: all 0.3s;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--el-color-primary-light-7);
}

.search-btn:active {
  transform: translateY(0);
}

.reset-btn {
  transition: all 0.3s;
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.reset-btn:active {
  transform: translateY(0);
}

/* ===== 工具栏样式优化 ===== */
.toolbar-row {
  padding: 4px 0;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.action-btn:not(:disabled):active {
  transform: translateY(0);
}

.add-btn:hover {
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.35);
}

.edit-btn:hover {
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.35);
}

.delete-btn:hover {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.35);
}

/* 表格容器优化 */
.table-wrapper {
  margin-top: 12px;
  background: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out 0.25s both;
  transition: box-shadow 0.3s;
}

.table-wrapper:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
}

.custom-table {
  --el-table-header-bg-color: var(--el-fill-color-light);

  :deep(.el-table__header-wrapper) {
    th {
      background-color: var(--el-fill-color-light) !important;
      color: var(--el-text-color-primary);
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.3px;
      transition: background-color 0.3s;
    }
  }

  :deep(.el-table__body-wrapper) {
    .el-table__row {
      transition: all 0.25s ease;
      animation: rowFadeIn 0.4s ease-out both;

      &:hover {
        background-color: var(--el-color-primary-light-9) !important;
        transform: scale(1.002);
      }

      &.current-row {
        background-color: var(--el-color-primary-light-9) !important;
      }
    }
  }

  :deep(.el-table__empty-block) {
    padding: 40px 0;
  }
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 编号徽章 */
.id-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 11px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;

  .el-table__row:hover & {
    background: var(--el-color-primary-light-8);
    transform: scale(1.05);
  }
}

/* 分页优化 */
:deep(.el-pagination) {
  padding: 12px 0;
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

:deep(.el-pagination__total) {
  color: var(--el-text-color-secondary);
}

:deep(.el-pagination__sizes) .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-border-color-light) inset;
}

:deep(.el-pager li) {
  transition: all 0.3s;
}

:deep(.el-pager li:hover:not(.is-active)) {
  color: var(--el-color-primary);
  transform: translateY(-1px);
}

:deep(.el-pager li.is-active) {
  box-shadow: 0 2px 8px var(--el-color-primary-light-5);
}

/* ===== 暗黑模式适配 ===== */
html.dark {
  .query-form {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .form-actions {
    border-left-color: rgba(255, 255, 255, 0.08);
  }

  .table-wrapper {
    border-color: var(--el-border-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  }

  .table-wrapper:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3);
  }

  .custom-table :deep(.el-table__header-wrapper th) {
    background-color: var(--el-bg-color-overlay) !important;
  }

  .custom-table :deep(.el-table__row:hover) {
    background-color: #0c2a5e !important;
  }

  .custom-table :deep(.el-table__cell),
  .custom-table :deep(.el-table__cell *),
  .custom-table :deep(.el-link),
  .custom-table :deep(.el-link *),
  .custom-table :deep(.el-text),
  .custom-table :deep(.el-text *) {
    color: #ffffff !important;
  }
}

/* ===== 表单核心信息样式 ===== */
.core-info {
  padding: 8px 0;
  margin-bottom: 8px;
}

/* ===== 展开/收起按钮样式 ===== */
.expand-toggle {
  display: flex;
  justify-content: center;
  margin: 8px 0 16px 0;
  padding: 8px 0;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.expand-toggle .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.expand-toggle .el-button:hover {
  transform: translateY(-1px);
}

.expand-toggle .el-icon {
  transition: transform 0.3s ease;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.table-actions .el-button {
  padding: 7px 10px;
  height: auto;
  font-size: 14px;
  transition: all 0.2s ease;
}

.table-actions .el-button:hover {
  transform: scale(1.08);
}

.table-actions .el-button .el-icon {
  color: #ffffff !important;
}

.table-actions .el-button--primary,
.table-actions .el-button--primary[text],
.table-actions .el-button--primary[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}

.table-actions .el-button--success,
.table-actions .el-button--success[text],
.table-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.table-actions .el-button--danger,
.table-actions .el-button--danger[text],
.table-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.table-actions .el-button--info,
.table-actions .el-button--info[text],
.table-actions .el-button--info[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-info) !important;
  border-color: var(--el-color-info) !important;
}

/* ===== 高级配置区域样式 ===== */
.advanced-config {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 配置分区样式 ===== */
.config-section {
  margin-bottom: 20px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.config-section .section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  gap: 6px;
}

.config-section .section-title::before {
  content: '';
  width: 4px;
  height: 14px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

/* ===== 响应式布局优化 ===== */
@media (max-width: 768px) {
  .query-form {
    padding: 8px 10px;
  }
  
  .form-actions {
    padding-left: 10px;
    margin-left: 8px !important;
  }
  
  .button-group {
    gap: 8px;
  }
  
  .action-buttons {
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .advanced-config {
    padding: 12px;
  }
}

/* ===== 暗黑模式适配 - 表单样式 ===== */
html.dark {
  .expand-toggle {
    border-top-color: rgba(255, 255, 255, 0.08);
  }
  
  .advanced-config {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
  }
  
  .config-section .section-title {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }
}
</style>

