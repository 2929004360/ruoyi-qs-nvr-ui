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
        <el-select v-model="queryParams.type" placeholder="请选择直播流接入类型" clearable style="width: 240px;">
          <el-option
              v-for="dict in qs_live_stream_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px;">
          <el-option
              v-for="dict in qs_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备状态" prop="deviceStatus">
        <el-select v-model="queryParams.deviceStatus" placeholder="请选择设备状态" clearable style="width: 240px;">
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="350" fixed="right">
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
                type="primary"
                text
                bg
                size="small"
                icon="VideoCamera"
                @click="handleCloudRecord(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="设备录像" v-if="!['1', '2', '3', '4', '6', '13'].includes(scope.row.type)">
              <el-button
                type="primary"
                text
                bg
                size="small"
                icon="Monitor"
                @click="handleDeviceRecord(scope.row)"
              />
            </el-tooltip>
            
            <!-- 刷新设备状态和通道（GB28181） -->
            <el-tooltip content="刷新" v-if="scope.row.type === '12'">
              <el-button
                type="success"
                text
                bg
                size="small"
                icon="Refresh"
                :loading="scope.row.refreshing"
                @click="handleRefreshDevice(scope.row)"
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
                  <!-- 目录订阅/取消订阅（GB28181） -->
                  <el-dropdown-item v-if="scope.row.type === '12' && scope.row.subscribeCatalogStatus !== 1" :disabled="scope.row.deviceStatus !== 'ON'" command="subscribeCatalog" icon="Connection">目录订阅</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.type === '12' && scope.row.subscribeCatalogStatus === 1" :disabled="scope.row.deviceStatus !== 'ON'" command="unsubscribeCatalog" icon="SwitchButton">取消目录订阅</el-dropdown-item>
                  <!-- 设备校时（海康/大华/海康ISUP/ONVIF） -->
                  <el-dropdown-item v-if="scope.row.type === '5' || scope.row.type === '7' || scope.row.type === '8' || scope.row.type === '9'" :disabled="scope.row.deviceStatus !== 'ON'" command="timeSync" icon="Clock" class="time-sync-item">校时</el-dropdown-item>
                  <!-- 设备信息（大华/海康/海康ISUP/GB28181/ONVIF） -->
                  <el-dropdown-item v-if="scope.row.type === '5' || scope.row.type === '7' || scope.row.type === '8' || scope.row.type === '9' || scope.row.type === '12' || scope.row.type === '14'" :disabled="scope.row.deviceStatus !== 'ON'" command="deviceInfo" icon="InfoFilled" class="time-sync-item">设备信息</el-dropdown-item>
                  <!-- 设备抓图（海康/海康ISUP/大华/ONVIF） -->
                  <el-dropdown-item v-if="scope.row.type === '5' || scope.row.type === '7' || scope.row.type === '8' || scope.row.type === '9'" :disabled="scope.row.deviceStatus !== 'ON'" command="capture" icon="Camera">抓图</el-dropdown-item>
                  <!-- 设备重启（海康/大华/海康ISUP/GB28181/JT1078/ONVIF） -->
                  <el-dropdown-item v-if="scope.row.type === '5' || scope.row.type === '7' || scope.row.type === '8' || scope.row.type === '9' || scope.row.type === '12' || scope.row.type === '14'" :disabled="scope.row.deviceStatus !== 'ON'" command="reboot" icon="Refresh" class="is-danger">重启</el-dropdown-item>
                  <!-- GB28181录像控制 -->
                  <el-dropdown-item v-if="scope.row.type === '12'" :disabled="scope.row.deviceStatus !== 'ON'" command="recordControl" icon="VideoCamera">录像控制</el-dropdown-item>
                  <!-- 设备配置查询 -->
                  <el-dropdown-item v-if="scope.row.type === '12'" :disabled="scope.row.deviceStatus !== 'ON'" command="deviceConfig" icon="Setting">设备配置</el-dropdown-item>
                  <!-- 录像下载 -->
                  <el-dropdown-item v-if="scope.row.type === '7' || scope.row.type === '8' || scope.row.type === '9'" :disabled="scope.row.deviceStatus !== 'ON'" command="downloadRecord" icon="Download">录像下载</el-dropdown-item>
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
      <div v-if="deviceList.length > 0" class="card-grid">
        <div class="device-card" :class="{ 'is-selected': item.checked, 'is-online': item.deviceStatus === 'ON' }" v-for="item in deviceList" :key="item.id">
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
                
                <!-- 刷新设备状态和通道（GB28181） -->
                <el-tooltip content="刷新" v-if="item.type === '12'">
                  <el-button
                    type="success"
                    text
                    bg
                    size="small"
                    icon="Refresh"
                    :loading="item.refreshing"
                    @click="handleRefreshDevice(item)"
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
                      <!-- 目录订阅/取消订阅（GB28181） -->
                      <el-dropdown-item v-if="item.type === '12' && item.subscribeCatalogStatus !== 1" :disabled="item.deviceStatus !== 'ON'" command="subscribeCatalog" icon="Connection">目录订阅</el-dropdown-item>
                      <el-dropdown-item v-if="item.type === '12' && item.subscribeCatalogStatus === 1" :disabled="item.deviceStatus !== 'ON'" command="unsubscribeCatalog" icon="SwitchButton">取消目录订阅</el-dropdown-item>
                      <!-- 设备校时（海康/大华/海康ISUP/ONVIF） -->
                      <el-dropdown-item v-if="item.type === '5' || item.type === '7' || item.type === '8' || item.type === '9'" :disabled="item.deviceStatus !== 'ON'" command="timeSync" icon="Clock" class="time-sync-item">校时</el-dropdown-item>
                      <!-- 设备信息（大华/海康/海康ISUP/GB28181/ONVIF） -->
                      <el-dropdown-item v-if="item.type === '5' || item.type === '7' || item.type === '8' || item.type === '9' || item.type === '12' || item.type === '14'" :disabled="item.deviceStatus !== 'ON'" command="deviceInfo" icon="InfoFilled" class="time-sync-item">设备信息</el-dropdown-item>
                      <!-- 设备抓图（海康/海康ISUP/大华/ONVIF） -->
                      <el-dropdown-item v-if="item.type === '5' || item.type === '7' || item.type === '8' || item.type === '9'" :disabled="item.deviceStatus !== 'ON'" command="capture" icon="Camera">抓图</el-dropdown-item>
                      <!-- 设备重启（海康/大华/海康ISUP/GB28181/JT1078/ONVIF） -->
                  <el-dropdown-item v-if="item.type === '5' || item.type === '7' || item.type === '8' || item.type === '9' || item.type === '12' || item.type === '14'" :disabled="item.deviceStatus !== 'ON'" command="reboot" icon="Refresh" class="is-danger">重启</el-dropdown-item>
                      <!-- GB28181录像控制 -->
                  <el-dropdown-item v-if="item.type === '12'" :disabled="item.deviceStatus !== 'ON'" command="recordControl" icon="VideoCamera">录像控制</el-dropdown-item>
                  <!-- 设备配置查询 -->
                  <el-dropdown-item v-if="item.type === '12'" :disabled="item.deviceStatus !== 'ON'" command="deviceConfig" icon="Setting">设备配置</el-dropdown-item>
                  <!-- 录像下载 -->
                      <el-dropdown-item v-if="item.type === '7' || item.type === '8' || item.type === '9'" :disabled="item.deviceStatus !== 'ON'" command="downloadRecord" icon="Download">录像下载</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
      </div>
      <el-empty v-else description="暂无设备数据" />
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
                  <el-select v-if="form.type === '5'" v-model="form.ipAddress" @change="onvifDeviceCodeChange" placeholder="请选择或输入设备IP" filterable allow-create style="width: 100%;">
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
                <div style="display: flex; align-items: center; gap: 12px;">
                  <el-radio-group v-model="form.onvifAuth">
                    <el-radio v-for="dict in qs_onvif_auth" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
                  <el-button type="primary" @click="onvifAuthLogin" size="small">认证</el-button>
                </div>
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
                <el-col :span="8">
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
                
                <!-- 看守位控制 - 仅 GB28181 -->
                <el-tab-pane v-if="isGb28181Device" label="看守位">
                  <div class="control-panel">
                    <el-form :model="homePositionForm" label-width="100px" style="margin-top: 20px;">
                      <el-form-item label="预置点编号">
                        <el-input-number v-model="homePositionForm.presetId" :min="1" :max="255" style="width: 100%;" />
                      </el-form-item>
                      <el-form-item label="停留时间(秒)">
                        <el-input-number v-model="homePositionForm.dwellTime" :min="0" style="width: 100%;" />
                      </el-form-item>
                    </el-form>
                    <div class="button-group" style="margin-top: 20px;">
                      <el-button type="primary" @click="handleQueryHomePosition" icon="Refresh">
                        查询
                      </el-button>
                      <el-button type="success" @click="handleSetHomePosition" icon="Check">
                        设置
                      </el-button>
                      <el-button type="warning" @click="handleHomePositionControl" icon="SwitchButton">
                        调用
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
                
                <!-- 巡航轨迹管理 - 仅 GB28181 -->
                <el-tab-pane v-if="isGb28181Device" label="巡航轨迹">
                  <div class="control-panel">
                    <el-form :model="cruiseTrackForm" label-width="100px" style="margin-top: 20px;">
                      <el-form-item label="轨迹编号">
                        <el-input-number v-model="cruiseTrackForm.trackId" :min="0" style="width: 100%;" />
                      </el-form-item>
                    </el-form>
                    <div class="button-group" style="margin-top: 20px;">
                      <el-button type="primary" @click="handleQueryCruiseTrackList" icon="Refresh">
                        查询列表
                      </el-button>
                      <el-button type="success" @click="handleQueryCruiseTrack" icon="Search">
                        查询详情
                      </el-button>
                      <el-button type="warning" @click="handleStartCruise" icon="VideoPlay">
                        开始巡航
                      </el-button>
                      <el-button type="danger" @click="handleStopCruise" icon="VideoPause">
                        停止巡航
                      </el-button>
                    </div>
                    <div v-if="cruiseTrackList.length > 0" style="margin-top: 20px;">
                      <div class="panel-section-title">巡航轨迹列表:</div>
                      <el-table :data="cruiseTrackList" border size="small" style="width: 100%;">
                        <el-table-column prop="id" label="编号" width="100" />
                        <el-table-column prop="name" label="名称" />
                      </el-table>
                    </div>
                  </div>
                </el-tab-pane>
                
                <!-- PTZ精准控制 - 仅 GB28181 -->
                <el-tab-pane v-if="isGb28181Device" label="精准控制">
                  <div class="control-panel">
                    <el-form :model="ptzPreciseForm" label-width="100px" style="margin-top: 20px;">
                      <el-form-item label="水平位置(0-359)">
                        <el-input-number v-model="ptzPreciseForm.pan" :min="0" :max="359" style="width: 100%;" />
                      </el-form-item>
                      <el-form-item label="垂直位置(0-359)">
                        <el-input-number v-model="ptzPreciseForm.tilt" :min="0" :max="359" style="width: 100%;" />
                      </el-form-item>
                      <el-form-item label="变倍(0-15)">
                        <el-input-number v-model="ptzPreciseForm.zoom" :min="0" :max="15" style="width: 100%;" />
                      </el-form-item>
                    </el-form>
                    <div class="button-group" style="margin-top: 20px;">
                      <el-button type="primary" @click="handleQueryPTZPosition" icon="Refresh">
                        查询位置
                      </el-button>
                      <el-button type="success" @click="handlePtzPreciseControl" icon="Connection">
                        执行控制
                      </el-button>
                    </div>
                    <div v-if="ptzPosition.pan !== undefined" style="margin-top: 20px;">
                      <div class="panel-section-title">当前PTZ位置:</div>
                      <el-descriptions :column="3" border size="small">
                        <el-descriptions-item label="水平位置">{{ ptzPosition.pan }}</el-descriptions-item>
                        <el-descriptions-item label="垂直位置">{{ ptzPosition.tilt }}</el-descriptions-item>
                        <el-descriptions-item label="变倍">{{ ptzPosition.zoom }}</el-descriptions-item>
                      </el-descriptions>
                    </div>
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

        <!-- 抓图记录 -->
        <el-tab-pane label="抓图记录" name="snapshots">
          <div style="padding: 10px;">
            <!-- 顶部操作栏 -->
            <div style="margin-bottom: 10px;">
              <el-button type="primary" :icon="Camera" @click="handleCaptureFromStream" :loading="captureLoading" :disabled="!shouldShowCaptureBtn">
                抓图
              </el-button>
              <el-button type="success" :icon="Refresh" @click="getDeviceSnapshotList" :loading="deviceSnapshotLoading">
                刷新
              </el-button>
            </div>

            <!-- 抓图网格列表 -->
            <div v-loading="deviceSnapshotLoading">
              <div v-if="deviceSnapshotList.length > 0" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                <div
                  v-for="item in deviceSnapshotList"
                  :key="item.id"
                  style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); aspect-ratio: 1/1;"
                >
                  <!-- 图片 -->
                  <image-preview v-if="item.fileUrl" :src="item.fileUrl" :width="'100%'" :height="'100%'"/>
                  <!-- 右上角操作按钮 -->
                  <div class="snapshot-actions" style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
                    <el-tooltip content="下载">
                      <el-button
                        type="success"
                        text
                        bg
                        size="small"
                        :icon="Download"
                        @click.stop="handleDownloadDeviceSnapshot(item)"
                      />
                    </el-tooltip>
                    <el-tooltip content="删除">
                      <el-button
                        type="danger"
                        text
                        bg
                        size="small"
                        :icon="Delete"
                        @click.stop="handleDeleteDeviceSnapshot(item)"
                      />
                    </el-tooltip>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无抓图记录" />
            </div>

            <!-- 分页 -->
            <pagination
              v-show="deviceSnapshotTotal > 0"
              :total="deviceSnapshotTotal"
              v-model:page="deviceSnapshotQuery.pageNum"
              v-model:limit="deviceSnapshotQuery.pageSize"
              @pagination="getDeviceSnapshotList"
            />
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

    <!-- 设备校时对话框 -->
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
        <el-form-item label="同步方式" v-if="timeSyncForm.deviceType === '9'">
          <el-radio-group v-model="timeSyncForm.syncType">
            <el-radio :label="true">设备时间同步到本地</el-radio>
            <el-radio :label="false">本地时间同步到设备</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="timeSyncForm.deviceType === '7' || timeSyncForm.deviceType === '8'">
          <div style="color: #909399; font-size: 12px;">海康设备仅支持本地时间同步到设备</div>
        </el-form-item>
        <el-form-item v-if="timeSyncForm.deviceType === '5'">
          <div style="color: #909399; font-size: 12px;">ONVIF设备：若不设置同步时间，将使用服务器当前时间</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="timeSyncDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTimeSync" :loading="timeSyncLoading">同步</el-button>
      </template>
    </el-dialog>

    <!-- 设备信息对话框 -->
    <el-dialog :title="(currentDeviceRow?.type === '7' || currentDeviceRow?.type === '8') ? '海康设备信息' : '大华设备信息'" v-model="deviceInfoDialogVisible" width="850px" append-to-body class="glass-dialog device-info-dialog">
      <el-tabs v-model="deviceInfoTabActive" type="border-card" @tab-change="handleDeviceInfoTabChange">
        <!-- 设备信息标签页 -->
        <el-tab-pane label="设备信息" name="deviceInfo">
          <div class="device-info-dashboard" v-loading="deviceInfoLoading">
            <div class="dashboard-header">
              <div class="dashboard-title">
                <el-icon class="dashboard-icon"><Cpu /></el-icon>
                <span>设备基本信息</span>
              </div>
              <div class="dashboard-badge" v-if="deviceInfo.serialNumber">
                <el-icon><CollectionTag /></el-icon>
                <span>{{ deviceInfo.serialNumber }}</span>
              </div>
            </div>
            <div class="info-cards-grid">
              <div class="info-card primary" style="animation-delay: 0.04s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Medal /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">序列号</div>
                  <div class="info-card-value">{{ deviceInfo.serialNumber || '-' }}</div>
                </div>
              </div>
              <div class="info-card success" style="animation-delay: 0.08s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">通道数量</div>
                  <div class="info-card-value">{{ deviceInfo.channelNum || '-' }}</div>
                </div>
              </div>
              <div class="info-card warning" style="animation-delay: 0.12s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Histogram /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">硬盘数量</div>
                  <div class="info-card-value">{{ deviceInfo.diskNum || '-' }}</div>
                </div>
              </div>
              <div class="info-card danger" style="animation-delay: 0.16s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Monitor /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">DVR类型</div>
                  <div class="info-card-value">{{ deviceInfo.dvrType || '-' }}</div>
                </div>
              </div>
              <div class="info-card info" style="animation-delay: 0.20s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Bell /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">报警输入端口</div>
                  <div class="info-card-value">{{ deviceInfo.alarmInPortNum || '-' }}</div>
                </div>
              </div>
              <div class="info-card purple" style="animation-delay: 0.24s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Bell /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">报警输出端口</div>
                  <div class="info-card-value">{{ deviceInfo.alarmOutPortNum || '-' }}</div>
                </div>
              </div>
              <div class="info-card teal" style="animation-delay: 0.28s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Timer /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">登录超时(分钟)</div>
                  <div class="info-card-value">{{ deviceInfo.limitLoginTime || '-' }}</div>
                </div>
              </div>
              <div class="info-card orange" style="animation-delay: 0.32s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Key /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">剩余登录次数</div>
                  <div class="info-card-value">{{ deviceInfo.leftLogTimes || '-' }}</div>
                </div>
              </div>
              <div class="info-card pink" style="animation-delay: 0.36s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Lock /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">解锁剩余时间(秒)</div>
                  <div class="info-card-value">{{ deviceInfo.lockLeftTime || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleRefreshDeviceInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
            <el-button type="warning" @click="handleDeviceInfoTimeSync" icon="Clock">校时</el-button>
            <el-button type="danger" @click="handleDeviceInfoReboot" icon="Refresh">重启</el-button>
          </div>
        </el-tab-pane>

        <!-- 系统参数标签页 - 仅大华显示 -->
        <el-tab-pane label="系统参数" name="systemParam" v-if="currentDeviceRow?.type === '9'">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><SetUp /></el-icon>
              <span>系统参数配置</span>
            </div>
            <el-form :model="systemParam" label-width="120px" class="data-form">
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
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetSystemParam" :loading="deviceInfoLoading" icon="Refresh">获取</el-button>
          </div>
        </el-tab-pane>

        <!-- 视频参数标签页 - 仅大华显示 -->
        <el-tab-pane label="视频参数" name="videoParam" v-if="currentDeviceRow?.type === '9'">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><VideoCamera /></el-icon>
              <span>视频参数配置</span>
            </div>
            <el-form :model="videoParam" label-width="120px" class="data-form">
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
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetVideoParam" :loading="deviceInfoLoading" icon="Refresh">获取</el-button>
            <el-button type="success" @click="handleSetVideoParam" :loading="deviceInfoLoading" icon="Check">设置</el-button>
          </div>
        </el-tab-pane>

        <!-- 设备视频参数标签页 - 仅大华显示 -->
        <el-tab-pane label="设备视频参数" name="deviceVideoParam" v-if="currentDeviceRow?.type === '9'">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Camera /></el-icon>
              <span>设备视频参数</span>
            </div>
            <el-form :model="deviceVideoParam" label-width="120px" class="data-form">
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
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetDeviceVideoParam" :loading="deviceInfoLoading" icon="Refresh">获取</el-button>
            <el-button type="success" @click="handleSetDeviceVideoParam" :loading="deviceInfoLoading" icon="Check">设置</el-button>
          </div>
        </el-tab-pane>

        <!-- 存储信息标签页 -->
        <el-tab-pane label="存储信息" name="storageInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Histogram /></el-icon>
              <span>存储设备信息</span>
            </div>
            <el-empty v-if="!storageInfo.storageDevices || storageInfo.storageDevices.length === 0" description="暂无存储设备信息"/>
            <el-collapse v-else accordion>
              <el-collapse-item v-for="(device, index) in storageInfo.storageDevices" :key="index" :title="device.name || `存储设备${index + 1}`">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="设备名称">{{ device.name || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="介质类型">
                    <el-tag v-if="device.mediaTypeDesc" :type="device.mediaType === 2 ? 'warning' : ''">{{ device.mediaTypeDesc }}</el-tag>
                    <span v-else>{{ device.mediaType !== undefined ? device.mediaType : '-' }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="总线类型">{{ device.busTypeDesc || device.busType || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="卷类型">{{ device.volumeTypeDesc || device.volumeType || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="总容量">{{ device.totalSpaceGB !== undefined ? `${device.totalSpaceGB.toFixed(2)} GB` : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="可用空间">{{ device.freeSpaceGB !== undefined ? `${device.freeSpaceGB.toFixed(2)} GB` : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="已用空间">{{ device.usedSpaceGB !== undefined ? `${device.usedSpaceGB.toFixed(2)} GB` : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="使用率">
                    <el-progress v-if="device.usagePercent !== undefined" :percentage="device.usagePercent" :color="device.usagePercent > 80 ? '#f56c6c' : '#67c23a'"/>
                    <span v-else>-</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="设备状态">
                    <el-tag :type="device.state === 1 ? 'success' : 'info'">{{ device.stateDesc || device.state || '-' }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="操作状态">{{ device.opStateDesc || device.opState || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="序列号" v-if="device.serial">{{ device.serial }}</el-descriptions-item>
                  <el-descriptions-item label="固件版本" v-if="device.firmware">{{ device.firmware }}</el-descriptions-item>
                </el-descriptions>
                <div v-if="device.partitions && device.partitions.length > 0" style="margin-top: 15px;">
                  <div class="panel-section-title">分区信息:</div>
                  <el-table :data="device.partitions" border size="small" style="width: 100%">
                    <el-table-column prop="name" label="分区名称"/>
                    <el-table-column label="总容量">
                      <template #default="{ row }">
                        {{ row.totalSpaceGB !== undefined ? `${row.totalSpaceGB.toFixed(2)} GB` : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column label="可用空间">
                      <template #default="{ row }">
                        {{ row.freeSpaceGB !== undefined ? `${row.freeSpaceGB.toFixed(2)} GB` : '-' }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetStorageInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 系统资源标签页 - 仅大华显示 -->
        <el-tab-pane label="系统资源" name="systemResourceInfo" v-if="currentDeviceRow?.type === '9'">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Cpu /></el-icon>
              <span>系统资源监控</span>
            </div>
            <el-empty v-if="!systemResourceInfo.success" description="暂无系统资源信息"/>
            <el-descriptions :column="2" border v-else>
              <el-descriptions-item label="CPU使用率">
                <el-progress v-if="systemResourceInfo.cpuUsage !== undefined" :percentage="systemResourceInfo.cpuUsage" :color="systemResourceInfo.cpuUsage > 80 ? '#f56c6c' : '#67c23a'"/>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="内存使用率">
                <el-progress v-if="systemResourceInfo.memoryUsage !== undefined" :percentage="systemResourceInfo.memoryUsage" :color="systemResourceInfo.memoryUsage > 80 ? '#f56c6c' : '#67c23a'"/>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="IP通道接入速度" v-if="systemResourceInfo.ipChannelIn !== undefined">{{ systemResourceInfo.ipChannelIn }} Mbps</el-descriptions-item>
              <el-descriptions-item label="网络剩余能力" v-if="systemResourceInfo.netRemain !== undefined">{{ systemResourceInfo.netRemain }} Mbps</el-descriptions-item>
              <el-descriptions-item label="网络总能力" v-if="systemResourceInfo.netCapability !== undefined">{{ systemResourceInfo.netCapability }} Mbps</el-descriptions-item>
              <el-descriptions-item label="远程预览能力" v-if="systemResourceInfo.previewRemain !== undefined">{{ systemResourceInfo.previewRemain }}</el-descriptions-item>
              <el-descriptions-item label="远程回放能力" v-if="systemResourceInfo.playBackRemain !== undefined">{{ systemResourceInfo.playBackRemain }}</el-descriptions-item>
              <el-descriptions-item label="远程发送能力" v-if="systemResourceInfo.netSendRemain !== undefined">{{ systemResourceInfo.netSendRemain }}</el-descriptions-item>
              <el-descriptions-item label="解码能力" v-if="systemResourceInfo.decodeAbility !== undefined">{{ systemResourceInfo.decodeAbility }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetSystemResourceInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- SD卡信息标签页 -->
        <el-tab-pane label="SD卡信息" name="sdCardInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Monitor /></el-icon>
              <span>SD卡信息</span>
            </div>
            <el-empty v-if="!sdCardInfo.success" description="暂无SD卡信息"/>
            <div v-else>
              <el-descriptions :column="2" border style="margin-bottom: 20px;">
                <el-descriptions-item label="SD卡状态">
                  <el-tag :type="sdCardInfo.exists ? 'success' : 'info'">{{ sdCardInfo.exists ? '已检测到' : '未检测到' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="总容量(GB)" v-if="sdCardInfo.totalSpaceGB !== undefined">{{ sdCardInfo.totalSpaceGB }} GB</el-descriptions-item>
                <el-descriptions-item label="可用空间(GB)" v-if="sdCardInfo.freeSpaceGB !== undefined">{{ sdCardInfo.freeSpaceGB }} GB</el-descriptions-item>
                <el-descriptions-item label="已用空间(GB)" v-if="sdCardInfo.usedSpaceGB !== undefined">{{ sdCardInfo.usedSpaceGB }} GB</el-descriptions-item>
                <el-descriptions-item label="使用率" v-if="sdCardInfo.usagePercent !== undefined">
                  <el-progress :percentage="sdCardInfo.usagePercent" :status="sdCardInfo.usagePercent > 90 ? 'exception' : 'success'"/>
                </el-descriptions-item>
                <el-descriptions-item label="硬盘数量" v-if="sdCardInfo.diskCount !== undefined">{{ sdCardInfo.diskCount }}</el-descriptions-item>
              </el-descriptions>
              
              <div v-if="sdCardInfo.diskList && sdCardInfo.diskList.length > 0">
                <div class="panel-section-title">硬盘详细信息:</div>
                <el-table :data="sdCardInfo.diskList" border size="small" style="width: 100%">
                  <el-table-column prop="diskNumber" label="硬盘编号" width="100"/>
                  <el-table-column prop="partitionNumber" label="分区号" width="100"/>
                  <el-table-column prop="volume" label="卷名"/>
                  <el-table-column prop="freeSpace" label="剩余容量"/>
                  <el-table-column prop="signal" label="信号"/>
                  <el-table-column label="状态">
                    <template #default="{ row }">
                      <el-tag :type="getDiskStatusType(row.diskStatus, row.status)">
                        {{ getDiskStatusText(row.diskStatus, row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetSDCardInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 码流信息标签页 -->
        <el-tab-pane label="码流信息" name="bitrateInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><VideoCamera /></el-icon>
              <span>码流信息</span>
            </div>
            <el-empty v-if="!bitrateInfo.success || !bitrateInfo.channelBitrates || bitrateInfo.channelBitrates.length === 0" description="暂无码流信息"/>
            <el-table :data="bitrateInfo.channelBitrates" border v-else style="width: 100%">
              <el-table-column prop="channelId" label="通道号"/>
              <el-table-column prop="streamType" label="码流类型"/>
              <el-table-column prop="bitrate" label="实时码率 (kbps)"/>
              <el-table-column prop="bitrateDesc" label="描述" v-if="bitrateInfo.channelBitrates[0]?.bitrateDesc"/>
            </el-table>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetBitrateInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 网络状态标签页 -->
        <el-tab-pane label="网络状态" name="networkStatusInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Place /></el-icon>
              <span>网络状态</span>
            </div>
            <el-empty v-if="!networkStatusInfo.success" description="暂无网络状态信息"/>
            <el-descriptions :column="2" border v-else>
              <el-descriptions-item label="IP地址">{{ networkStatusInfo.ipAddress || '-' }}</el-descriptions-item>
              <el-descriptions-item label="子网掩码">{{ networkStatusInfo.subnetMask || '-' }}</el-descriptions-item>
              <el-descriptions-item label="网关">{{ networkStatusInfo.gateway || '-' }}</el-descriptions-item>
              <el-descriptions-item label="MAC地址">{{ networkStatusInfo.macAddress || '-' }}</el-descriptions-item>
              <el-descriptions-item label="网络连接">
                <el-tag :type="networkStatusInfo.linkStatus ? 'success' : 'info'">{{ networkStatusInfo.linkStatusDesc || (networkStatusInfo.linkStatus ? '已连接' : '未连接') }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="DNS 1">{{ networkStatusInfo.dns1 || '-' }}</el-descriptions-item>
              <el-descriptions-item label="DNS 2">{{ networkStatusInfo.dns2 || '-' }}</el-descriptions-item>
              <el-descriptions-item label="网络可用" v-if="networkStatusInfo.networkAvailable !== undefined">
                <el-tag :type="networkStatusInfo.networkAvailable ? 'success' : 'warning'">{{ networkStatusInfo.networkAvailable ? '是' : '否' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="无线功能" v-if="networkStatusInfo.hasWireless !== undefined">
                <el-tag :type="networkStatusInfo.hasWireless ? 'success' : 'info'">{{ networkStatusInfo.hasWireless ? '支持' : '不支持' }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetNetworkStatusInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 软件版本标签页 -->
        <el-tab-pane label="软件版本" name="softwareVersionInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><InfoFilled /></el-icon>
              <span>软件版本信息</span>
            </div>
            <el-empty v-if="!softwareVersionInfo.success" description="暂无软件版本信息"/>
            <el-descriptions :column="2" border v-else>
              <el-descriptions-item label="设备型号">{{ softwareVersionInfo.deviceModel || '-' }}</el-descriptions-item>
              <el-descriptions-item label="序列号">{{ softwareVersionInfo.serialNumber || '-' }}</el-descriptions-item>
              <el-descriptions-item label="软件版本" :span="2">{{ softwareVersionInfo.fullVersion || softwareVersionInfo.softwareVersion || '-' }}</el-descriptions-item>
              <el-descriptions-item label="Web版本" v-if="softwareVersionInfo.webVersion">{{ softwareVersionInfo.webVersion }}</el-descriptions-item>
              <el-descriptions-item label="硬件版本" v-if="softwareVersionInfo.hardwareVersion">{{ softwareVersionInfo.hardwareVersion }}</el-descriptions-item>
              <el-descriptions-item label="外围版本" v-if="softwareVersionInfo.peripheralVersion">{{ softwareVersionInfo.peripheralVersion }}</el-descriptions-item>
              <el-descriptions-item label="地理版本" v-if="softwareVersionInfo.geographyVersion">{{ softwareVersionInfo.geographyVersion }}</el-descriptions-item>
              <el-descriptions-item label="协议版本" v-if="softwareVersionInfo.protocolVersion !== undefined">{{ softwareVersionInfo.protocolVersion }}</el-descriptions-item>
              <el-descriptions-item label="软件构建时间" v-if="softwareVersionInfo.softwareBuildDate !== undefined">{{ softwareVersionInfo.softwareBuildDate }}</el-descriptions-item>
              <el-descriptions-item label="Web构建时间" v-if="softwareVersionInfo.webBuildDate !== undefined">{{ softwareVersionInfo.webBuildDate }}</el-descriptions-item>
              <el-descriptions-item label="外围构建时间" v-if="softwareVersionInfo.peripheralBuildDate !== undefined">{{ softwareVersionInfo.peripheralBuildDate }}</el-descriptions-item>
              <el-descriptions-item label="地理构建时间" v-if="softwareVersionInfo.geographyBuildDate !== undefined">{{ softwareVersionInfo.geographyBuildDate }}</el-descriptions-item>
              <el-descriptions-item label="硬件时间" v-if="softwareVersionInfo.hardwareDate !== undefined">{{ softwareVersionInfo.hardwareDate }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetSoftwareVersionInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 录像状态标签页 -->
        <el-tab-pane label="录像状态" name="recordStateInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><VideoCamera /></el-icon>
              <span>录像状态</span>
            </div>
            <el-empty v-if="!recordStateInfo.success" description="暂无录像状态信息"/>
            <div v-else>
              <el-descriptions :column="2" border style="margin-bottom: 20px;">
                <el-descriptions-item label="整体录像状态">
                  <el-tag :type="recordStateInfo.wholeRecording ? 'success' : 'info'">{{ recordStateInfo.wholeRecording ? '正在录像' : '未录像' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="整体编码状态">
                  <el-tag :type="recordStateInfo.wholeEncoding ? 'success' : 'info'">{{ recordStateInfo.wholeEncoding ? '正在编码' : '未编码' }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>
              <div v-if="recordStateInfo.channelStates && recordStateInfo.channelStates.length > 0">
                <div class="panel-section-title">通道录像状态:</div>
                <el-table :data="recordStateInfo.channelStates" border size="small" style="width: 100%">
                  <el-table-column prop="channelId" label="通道号"/>
                  <el-table-column prop="mainStreamRecording" label="主码流录像">
                    <template #default="{ row }">
                      <el-tag :type="row.mainStreamRecording ? 'success' : 'info'">{{ row.mainStreamRecording ? '录像中' : '未录像' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="extraStream1Recording" label="辅码流1录像">
                    <template #default="{ row }">
                      <el-tag :type="row.extraStream1Recording ? 'success' : 'info'">{{ row.extraStream1Recording ? '录像中' : '未录像' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="extraStream2Recording" label="辅码流2录像">
                    <template #default="{ row }">
                      <el-tag :type="row.extraStream2Recording ? 'success' : 'info'">{{ row.extraStream2Recording ? '录像中' : '未录像' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="extraStream3Recording" label="辅码流3录像">
                    <template #default="{ row }">
                      <el-tag :type="row.extraStream3Recording ? 'success' : 'info'">{{ row.extraStream3Recording ? '录像中' : '未录像' }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetRecordStateInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 电源状态标签页 -->
        <el-tab-pane label="电源状态" name="powerStateInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><SwitchButton /></el-icon>
              <span>电源状态</span>
            </div>
            <el-empty v-if="!powerStateInfo.success" description="暂无电源状态信息"/>
            <div v-else>
              <el-empty v-if="!powerStateInfo.powerStates || powerStateInfo.powerStates.length === 0" description="暂无电源设备信息"/>
              <el-table :data="powerStateInfo.powerStates" border size="small" style="width: 100%" v-else>
                <el-table-column prop="powerId" label="电源ID" width="100"/>
                <el-table-column prop="powerName" label="电源名称" width="150"/>
                <el-table-column prop="status" label="电源状态" width="120">
                  <template #default="{ row }">
                    <el-tag :type="row.status ? 'success' : 'info'">{{ row.statusDesc || (row.status ? '正常' : '异常') }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="online" label="在线状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.online ? 'success' : 'warning'">{{ row.online ? '在线' : '离线' }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetPowerStateInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 报警布防标签页 -->
        <el-tab-pane label="报警布防" name="alarmArmInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Bell /></el-icon>
              <span>报警布防信息</span>
            </div>
            <el-empty v-if="!alarmArmInfo.success" description="暂无报警布防信息"/>
            <div v-else>
              <el-empty v-if="!alarmArmInfo.channelStates || alarmArmInfo.channelStates.length === 0" description="暂无报警设备信息"/>
              <el-table :data="alarmArmInfo.channelStates" border size="small" style="width: 100%" v-else>
                <el-table-column prop="channelId" label="通道号"/>
                <el-table-column prop="channelName" label="通道名称"/>
                <el-table-column prop="armed" label="布防状态">
                  <template #default="{ row }">
                    <el-tag :type="row.armed ? 'success' : 'warning'">{{ row.armed ? '已布防' : '未布防' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="armType" label="布防类型">
                  <template #default="{ row }">
                    {{ row.armTypeDesc || row.armType }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetAlarmArmInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 摄像头属性标签页 -->
        <el-tab-pane label="摄像头属性" name="cameraInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Camera /></el-icon>
              <span>摄像头属性</span>
            </div>
            <el-empty v-if="!cameraInfo.success" description="暂无摄像头属性信息"/>
            <div v-else>
              <el-empty v-if="!cameraInfo.cameraList || cameraInfo.cameraList.length === 0" description="暂无摄像头信息"/>
              <el-table :data="cameraInfo.cameraList" border size="small" style="width: 100%" v-else>
                <el-table-column prop="channelId" label="通道号" width="100"/>
                <el-table-column prop="cameraName" label="摄像头名称" width="150"/>
                <el-table-column prop="cameraType" label="摄像头类型" width="120"/>
                <el-table-column prop="online" label="在线状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.online ? 'success' : 'warning'">{{ row.online ? '在线' : '离线' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="{ row }">
                    {{ row.statusDesc || row.status }}
                  </template>
                </el-table-column>
                <el-table-column prop="manufacturer" label="厂商" width="120"/>
                <el-table-column prop="model" label="型号" width="150"/>
                <el-table-column prop="ipAddress" label="IP地址" width="150"/>
                <el-table-column prop="port" label="端口" width="80"/>
              </el-table>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetCameraInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- RTSP URL标签页 -->
        <el-tab-pane label="RTSP URL" name="rtspUrlInfo">
          <div class="tab-content-wrapper" v-loading="deviceInfoLoading">
            <div class="panel-header">
              <el-icon><Link /></el-icon>
              <span>RTSP URL</span>
            </div>
            <el-empty v-if="!rtspUrlInfo.success" description="暂无RTSP URL信息"/>
            <div v-else>
              <el-empty v-if="!rtspUrlInfo.urlList || rtspUrlInfo.urlList.length === 0" description="暂无RTSP URL信息"/>
              <el-table :data="rtspUrlInfo.urlList" border size="small" style="width: 100%" v-else>
                <el-table-column prop="channelId" label="通道号" width="100"/>
                <el-table-column prop="streamType" label="码流类型" width="150"/>
                <el-table-column prop="url" label="RTSP URL">
                  <template #default="{ row }">
                    <div class="flex items-center gap-2">
                      <el-input v-model="row.url" disabled size="small" style="flex: 1;"/>
                      <el-button type="primary" size="small" link @click="handleCopy(row.url)">复制</el-button>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" width="200"/>
              </el-table>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="deviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetRtspUrlInfo" :loading="deviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 设备配置对话框 -->
    <el-dialog title="设备配置管理" v-model="deviceConfigDialogVisible" width="1000px" append-to-body class="glass-dialog device-config-dialog">
      <div class="device-config-header">
        <el-alert title="当前设备" type="info" :closable="false" show-icon style="margin-bottom: 16px;">
          <template #default>
            <div class="device-info-row">
              <span class="device-info-item"><strong>设备名称：</strong>{{ currentConfigDevice?.deviceName || '-' }}</span>
              <span class="device-info-item"><strong>国标ID：</strong>{{ currentConfigDevice?.gbDeviceId || '-' }}</span>
              <span class="device-info-item"><strong>IP地址：</strong>{{ currentConfigDevice?.ipAddress || '-' }}</span>
            </div>
          </template>
        </el-alert>
        <el-form label-width="90px" class="query-form">
          <el-row :gutter="12" align="middle">
            <el-col :span="16">
              <el-form-item label="配置类型">
                <el-select v-model="selectedConfigTypes" multiple placeholder="请选择配置类型" style="width: 100%" collapse-tags collapse-tags-tooltip>
                  <el-option label="基本参数" value="BasicParam"/>
                  <el-option label="视频参数范围" value="VideoParamOpt"/>
                  <el-option label="SVAC编码配置" value="SVACEncodeConfig"/>
                  <el-option label="SVAC解码配置" value="SVACDecodeConfig"/>
                  <el-option label="视频参数属性配置" value="VideoParamAttribute"/>
                  <el-option label="录像计划" value="VideoRecordPlan"/>
                  <el-option label="报警录像" value="VideoAlarmRecord"/>
                  <el-option label="视频画面遮挡" value="PictureMask"/>
                  <el-option label="画面翻转" value="FrameMirror"/>
                  <el-option label="报警上报开关" value="AlarmReport"/>
                  <el-option label="前端OSD设置" value="OSDConfig"/>
                  <el-option label="图像抓拍配置" value="Snapshot"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label=" ">
                <div class="query-actions">
                  <el-button
                    type="primary"
                    icon="Search"
                    @click="handleQueryDeviceConfig"
                    :loading="deviceConfigLoading"
                  >
                    查询配置
                  </el-button>
                  <el-button
                    link
                    type="info"
                    icon="RefreshRight"
                    :disabled="!selectedConfigTypes.length"
                    @click="selectedConfigTypes = []"
                  >
                    清空
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div v-loading="deviceConfigLoading" class="config-content">
        <el-empty v-if="!deviceConfigData || Object.keys(deviceConfigData).length === 0" description="暂无配置数据，请先查询"/>
        <el-collapse v-else v-model="activeConfigPanels" class="config-collapse">
          <el-collapse-item v-for="(value, key) in deviceConfigData" :key="key" :name="key">
            <template #title>
              <div class="collapse-title">
                <el-icon class="title-icon"><Setting /></el-icon>
                <span class="title-text">{{ getConfigTypeName(key) }}</span>
                <el-tag type="success" size="small" style="margin-left: 8px;">{{ Object.keys(value).length }} 项</el-tag>
              </div>
            </template>
            <div class="config-card">
              <el-form :model="deviceConfigData[key]" label-width="140px" class="config-form">
                <el-row :gutter="16">
                  <template v-for="(itemValue, itemKey) in value" :key="itemKey">
                    <el-col :span="12">
                      <el-form-item :label="getConfigFieldName(key, itemKey)">
                        <el-input v-model="deviceConfigData[key][itemKey]" clearable />
                      </el-form-item>
                    </el-col>
                  </template>
                </el-row>
              </el-form>
              <div class="config-actions">
                <el-button type="primary" size="default" @click="handleUpdateSingleConfig(key)" :loading="updateConfigLoading[key]" icon="Check">保存配置</el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deviceConfigDialogVisible = false" icon="Close">关闭</el-button>
          <el-button type="success" @click="handleUpdateAllConfig" :loading="updateAllConfigLoading" :disabled="!deviceConfigData || Object.keys(deviceConfigData).length === 0" icon="DocumentChecked">保存全部</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设备录像下载对话框 -->
    <el-dialog :title="getDownloadDialogTitle()" v-model="downloadRecordDialogVisible" width="650px" append-to-body class="glass-dialog download-record-dialog">
      <el-form :model="downloadRecordForm" label-width="100px" v-loading="downloadRecordLoading">
        <el-form-item label="设备名称">
          <el-input v-model="downloadRecordForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="通道号">
          <el-input-number v-model="downloadRecordForm.channelId" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="downloadRecordForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="downloadRecordForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="码流类型">
          <el-select v-model="downloadRecordForm.recordFileType" placeholder="选择码流类型" style="width: 100%;">
            <el-option label="主码流" :value="0" />
            <el-option label="辅码流1" :value="1" />
            <el-option label="辅码流2" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 下载进度 -->
      <div v-if="downloadResult && downloadResult.success" style="margin-top: 15px;">
        <el-divider>下载结果</el-divider>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="文件大小">
            {{ downloadResult.fileSize ? (downloadResult.fileSize / 1024 / 1024).toFixed(2) + ' MB' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="文件路径">
            {{ downloadResult.filePath || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="访问链接">
            <div v-if="downloadResult.fileUrl" class="flex items-center gap-2">
              <el-input v-model="downloadResult.fileUrl" disabled size="small" style="flex: 1;" />
              <el-button type="primary" size="small" link @click="handleCopy(downloadResult.fileUrl)">复制</el-button>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="downloadResult && !downloadResult.success"
        type="error"
        :title="downloadResult.errorMessage || '下载失败'"
        style="margin-top: 15px;"
        show-icon
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="downloadRecordDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleDownloadRecord" :loading="downloadRecordLoading" icon="Download">下载</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 海康设备信息弹窗 -->
    <el-dialog title="海康设备信息" v-model="haikangDeviceInfoDialogVisible" width="850px" append-to-body class="glass-dialog device-info-dialog">
      <el-tabs v-model="haikangDeviceInfoTabActive" type="border-card" @tab-change="handleHaikangDeviceInfoTabChange">
        <!-- 设备信息标签页 -->
        <el-tab-pane label="设备信息" name="deviceInfo">
          <div class="device-info-dashboard" v-loading="haikangDeviceInfoLoading">
            <el-empty v-if="!haikangDeviceInfo.success" description="暂无设备信息" />
            <template v-else>
              <div class="dashboard-header">
                <div class="dashboard-title">
                  <el-icon class="dashboard-icon"><Cpu /></el-icon>
                  <span>设备基本信息</span>
                </div>
                <div class="dashboard-badge" v-if="haikangDeviceInfo.deviceName">
                  <el-icon><CollectionTag /></el-icon>
                  <span>{{ haikangDeviceInfo.deviceName }}</span>
                </div>
              </div>
              <div class="info-cards-grid cols-3">
                <div class="info-card primary" style="animation-delay: 0.04s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><OfficeBuilding /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">设备名称</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.deviceName || '-' }}</div>
                  </div>
                </div>
                <div class="info-card success" style="animation-delay: 0.07s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><SetUp /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">设备类型</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.deviceType || '-' }}</div>
                  </div>
                </div>
                <div class="info-card warning" style="animation-delay: 0.10s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Medal /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">序列号</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.serialNumber || '-' }}</div>
                  </div>
                </div>
                <div class="info-card info" style="animation-delay: 0.13s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Place /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">IP地址</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.ipAddress || '-' }}</div>
                  </div>
                </div>
                <div class="info-card danger" style="animation-delay: 0.16s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">总通道数</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.channelNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card teal" style="animation-delay: 0.19s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">模拟通道数</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.analogChanNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card purple" style="animation-delay: 0.22s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Link /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">IP通道数</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.ipChanNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card orange" style="animation-delay: 0.25s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Monitor /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">DVR类型</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.dvrType || '-' }}</div>
                  </div>
                </div>
                <div class="info-card pink" style="animation-delay: 0.28s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><CollectionTag /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">设备类型码</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.devType || '-' }}</div>
                  </div>
                </div>
                <div class="info-card cyan" style="animation-delay: 0.31s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><InfoFilled /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">设备类别</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.devClass || '-' }}</div>
                  </div>
                </div>
                <div class="info-card lime" style="animation-delay: 0.34s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Bell /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">报警输入端口</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.alarmInPortNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card indigo" style="animation-delay: 0.37s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Bell /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">报警输出端口</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.alarmOutPortNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card primary" style="animation-delay: 0.40s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Histogram /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">硬盘数量</div>
                    <div class="info-card-value">{{ haikangDeviceInfo.diskNum || '-' }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleRefreshHaikangDeviceInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 存储信息标签页 -->
        <el-tab-pane label="存储信息" name="storageInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Histogram /></el-icon>
              <span>存储设备信息</span>
            </div>
            <el-empty v-if="!haikangStorageInfo.diskList || haikangStorageInfo.diskList.length === 0" description="暂无存储设备信息"></el-empty>
            <el-collapse v-else accordion>
              <el-collapse-item v-for="(disk, index) in haikangStorageInfo.diskList" :key="index" :title="'硬盘 ' + (disk.diskNo || index + 1)">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="硬盘编号">{{ disk.diskNo || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="容量">{{ disk.capacity !== undefined ? disk.capacity + ' MB' : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="可用空间">{{ disk.freeSpace !== undefined ? disk.freeSpace + ' MB' : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="已用空间">{{ disk.usedSpace !== undefined ? disk.usedSpace + ' MB' : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="状态">{{ disk.statusDesc || disk.status || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="属性">{{ disk.attrDesc || disk.attr || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="组编号">{{ disk.groupNo || '-' }}</el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangStorageInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- SD卡信息标签页 -->
        <el-tab-pane label="SD卡信息" name="sdCardInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Monitor /></el-icon>
              <span>SD卡信息</span>
            </div>
            <el-empty v-if="!haikangSdCardInfo.success" description="暂无SD卡信息"></el-empty>
            <div v-else>
              <el-descriptions :column="2" border style="margin-bottom: 20px;">
                <el-descriptions-item label="SD卡数量" v-if="haikangSdCardInfo.sdCardCount !== undefined">{{ haikangSdCardInfo.sdCardCount }}</el-descriptions-item>
              </el-descriptions>

              <div v-if="haikangSdCardInfo.sdCardList && haikangSdCardInfo.sdCardList.length > 0">
                <div class="panel-section-title">SD卡详细信息:</div>
                <el-table :data="haikangSdCardInfo.sdCardList" border size="small" style="width: 100%" height="250">
                  <el-table-column prop="cardNo" label="SD卡编号" width="100"></el-table-column>
                  <el-table-column prop="capacity" label="总容量(MB)" width="120"></el-table-column>
                  <el-table-column prop="freeSpace" label="剩余空间(MB)" width="140"></el-table-column>
                  <el-table-column prop="usedSpace" label="已用空间(MB)" width="140"></el-table-column>
                  <el-table-column prop="statusDesc" label="状态"></el-table-column>
                  <el-table-column prop="attrDesc" label="属性"></el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangSdCardInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 码流信息标签页 -->
        <el-tab-pane label="码流信息" name="bitrateInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><VideoCamera /></el-icon>
              <span>码流信息</span>
            </div>
            <el-empty v-if="!haikangBitrateInfo.success || !haikangBitrateInfo.streamList || haikangBitrateInfo.streamList.length === 0" description="暂无码流信息"></el-empty>
            <el-table :data="haikangBitrateInfo.streamList" border v-else style="width: 100%" height="250">
              <el-table-column prop="streamName" label="码流名称" width="150"></el-table-column>
              <el-table-column prop="streamTypeDesc" label="码流类型" width="120"></el-table-column>
              <el-table-column prop="resolutionDesc" label="分辨率" width="120"></el-table-column>
              <el-table-column prop="videoBitrate" label="视频码率" width="100"></el-table-column>
              <el-table-column prop="videoFrameRateDesc" label="帧率" width="100"></el-table-column>
              <el-table-column prop="videoEncTypeDesc" label="编码类型" width="120"></el-table-column>
              <el-table-column prop="picQualityDesc" label="图片质量" width="120"></el-table-column>
            </el-table>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangBitrateInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 网络状态标签页 -->
        <el-tab-pane label="网络状态" name="networkStatusInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Place /></el-icon>
              <span>网络状态</span>
            </div>
            <el-empty v-if="!haikangNetworkStatusInfo.success" description="暂无网络状态信息"></el-empty>
            <div v-else>
              <el-descriptions :column="2" border style="margin-bottom: 20px;">
                <el-descriptions-item label="客户端连接数" v-if="haikangNetworkStatusInfo.clientCount !== undefined">{{ haikangNetworkStatusInfo.clientCount }}</el-descriptions-item>
                <el-descriptions-item label="当前码率" v-if="haikangNetworkStatusInfo.bitRate !== undefined">{{ haikangNetworkStatusInfo.bitRate }}</el-descriptions-item>
                <el-descriptions-item label="总码率" v-if="haikangNetworkStatusInfo.allBitRate !== undefined">{{ haikangNetworkStatusInfo.allBitRate }}</el-descriptions-item>
                <el-descriptions-item label="IP连接数" v-if="haikangNetworkStatusInfo.ipLinkNum !== undefined">{{ haikangNetworkStatusInfo.ipLinkNum }}</el-descriptions-item>
              </el-descriptions>

              <div v-if="haikangNetworkStatusInfo.clientList && haikangNetworkStatusInfo.clientList.length > 0">
                <div class="panel-section-title">客户端连接详情:</div>
                <el-table :data="haikangNetworkStatusInfo.clientList" border size="small" style="width: 100%" height="250">
                  <el-table-column prop="clientNo" label="客户端编号" width="120"></el-table-column>
                  <el-table-column prop="ip" label="IP地址"></el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangNetworkStatusInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 软件版本标签页 -->
        <el-tab-pane label="设备状态" name="softwareVersionInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><InfoFilled /></el-icon>
              <span>设备状态</span>
            </div>
            <el-empty v-if="!haikangSoftwareVersionInfo.success" description="暂无设备状态信息"></el-empty>
            <el-descriptions :column="2" border v-else>
              <el-descriptions-item label="设备状态">
                <el-tag :type="haikangSoftwareVersionInfo.deviceStatic === 0 ? 'success' : 'warning'">{{ haikangSoftwareVersionInfo.deviceStaticDesc || '-' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="本地显示">
                <el-tag :type="haikangSoftwareVersionInfo.localDisplay === 0 ? 'success' : 'warning'">{{ haikangSoftwareVersionInfo.localDisplayDesc || '-' }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangSoftwareVersionInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 录像状态标签页 -->
        <el-tab-pane label="录像状态" name="recordStateInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><VideoCamera /></el-icon>
              <span>录像状态</span>
            </div>
            <el-empty v-if="!haikangRecordStateInfo.success || !haikangRecordStateInfo.channelRecordList || haikangRecordStateInfo.channelRecordList.length === 0" description="暂无录像状态信息"></el-empty>
            <div v-else>
              <el-table :data="haikangRecordStateInfo.channelRecordList" border size="small" style="width: 100%" height="250">
                <el-table-column prop="channelId" label="通道号"></el-table-column>
                <el-table-column prop="recordingDesc" label="录像状态"></el-table-column>
                <el-table-column prop="signalDesc" label="信号状态"></el-table-column>
                <el-table-column prop="hardwareDesc" label="硬件状态"></el-table-column>
                <el-table-column prop="bitRate" label="码率"></el-table-column>
              </el-table>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangRecordStateInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 电源状态标签页 -->
        <el-tab-pane label="电源状态" name="powerStateInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><SwitchButton /></el-icon>
              <span>电源状态</span>
            </div>
            <el-empty v-if="!haikangPowerStateInfo.success" description="暂无电源状态信息"></el-empty>
            <el-descriptions :column="2" border v-else>
              <el-descriptions-item label="设备状态">
                <el-tag :type="haikangPowerStateInfo.deviceStatic === 0 ? 'success' : 'warning'">{{ haikangPowerStateInfo.deviceStaticDesc || '-' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="电源状态" v-if="haikangPowerStateInfo.devicePowerStatus !== undefined">
                <el-tag :type="haikangPowerStateInfo.devicePowerStatus === 0 ? 'success' : 'warning'">{{ haikangPowerStateInfo.devicePowerStatus === 0 ? '正常' : '异常' }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangPowerStateInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 报警布防标签页 -->
        <el-tab-pane label="报警布防" name="alarmArmInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Bell /></el-icon>
              <span>报警布防信息</span>
            </div>
            <el-empty v-if="!haikangAlarmArmInfo.success" description="暂无报警布防信息"></el-empty>
            <div v-else>
              <div v-if="haikangAlarmArmInfo.alarmInList && haikangAlarmArmInfo.alarmInList.length > 0" style="margin-bottom: 20px;">
                <div class="panel-section-title">报警输入:</div>
                <el-table :data="haikangAlarmArmInfo.alarmInList" border size="small" style="width: 100%" height="200">
                  <el-table-column prop="alarmInNo" label="输入编号"></el-table-column>
                  <el-table-column prop="alarmInStatus" label="输入状态"></el-table-column>
                </el-table>
              </div>

              <div v-if="haikangAlarmArmInfo.alarmOutList && haikangAlarmArmInfo.alarmOutList.length > 0">
                <div class="panel-section-title">报警输出:</div>
                <el-table :data="haikangAlarmArmInfo.alarmOutList" border size="small" style="width: 100%" height="200">
                  <el-table-column prop="alarmOutNo" label="输出编号"></el-table-column>
                  <el-table-column prop="alarmOutStatus" label="输出状态"></el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangAlarmArmInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- 摄像头属性标签页 -->
        <el-tab-pane label="摄像头属性" name="cameraInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Camera /></el-icon>
              <span>摄像头属性</span>
            </div>
            <el-empty v-if="!haikangCameraInfo.success" description="暂无摄像头属性信息"></el-empty>
            <div v-else>
              <el-empty v-if="!haikangCameraInfo.cameraList || haikangCameraInfo.cameraList.length === 0" description="暂无摄像头信息"></el-empty>
              <el-table :data="haikangCameraInfo.cameraList" border size="small" style="width: 100%" v-else height="300">
                <el-table-column prop="channelId" label="通道号" width="100"></el-table-column>
                <el-table-column prop="cameraName" label="摄像头名称" width="150"></el-table-column>
                <el-table-column prop="cameraType" label="摄像头类型" width="120"></el-table-column>
                <el-table-column prop="online" label="在线状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.online ? 'success' : 'warning'">{{ row.online ? '在线' : '离线' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="{ row }">
                    {{ row.statusDesc || row.status }}
                  </template>
                </el-table-column>
                <el-table-column prop="manufacturer" label="厂商" width="120"></el-table-column>
                <el-table-column prop="model" label="型号" width="150"></el-table-column>
                <el-table-column prop="ipAddress" label="IP地址" width="150"></el-table-column>
                <el-table-column prop="port" label="端口" width="80"></el-table-column>
              </el-table>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangCameraInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>

        <!-- RTSP URL标签页 -->
        <el-tab-pane label="RTSP URL" name="rtspUrlInfo">
          <div class="tab-content-wrapper" v-loading="haikangDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Link /></el-icon>
              <span>RTSP URL</span>
            </div>
            <el-empty v-if="!haikangRtspUrlInfo.success" description="暂无RTSP URL信息"></el-empty>
            <div v-else>
              <div class="panel-section-title">RTSP URL:</div>
              <div class="flex items-center gap-2">
                <el-input v-model="haikangRtspUrlInfo.rtspUrl" disabled size="small" style="flex: 1;"></el-input>
                <el-button type="primary" size="small" @click="handleCopy(haikangRtspUrlInfo.rtspUrl)">复制</el-button>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangRtspUrlInfo" :loading="haikangDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 海康ISUP设备信息弹窗 -->
    <el-dialog title="海康ISUP设备信息" v-model="haikangIsupDeviceInfoDialogVisible" width="850px" append-to-body class="glass-dialog device-info-dialog">
      <el-tabs v-model="haikangIsupDeviceInfoTabActive" type="border-card" @tab-change="handleHaikangIsupDeviceInfoTabChange">
        <!-- 设备信息标签页 -->
        <el-tab-pane label="设备信息" name="deviceInfo">
          <div class="device-info-dashboard" v-loading="haikangIsupDeviceInfoLoading">
            <el-empty v-if="!haikangIsupDeviceInfo.success" description="暂无设备信息" />
            <template v-else>
              <div class="dashboard-header">
                <div class="dashboard-title">
                  <el-icon class="dashboard-icon"><Cpu /></el-icon>
                  <span>设备基本信息</span>
                </div>
                <div class="dashboard-badge" v-if="haikangIsupDeviceInfo.deviceName">
                  <el-icon><CollectionTag /></el-icon>
                  <span>{{ haikangIsupDeviceInfo.deviceName }}</span>
                </div>
              </div>
              <div class="info-cards-grid cols-3">
                <div class="info-card primary" style="animation-delay: 0.04s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><OfficeBuilding /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">设备名称</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.deviceName || '-' }}</div>
                  </div>
                </div>
                <div class="info-card success" style="animation-delay: 0.07s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><SetUp /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">设备类型</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.deviceType || '-' }}</div>
                  </div>
                </div>
                <div class="info-card warning" style="animation-delay: 0.10s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Medal /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">序列号</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.serialNumber || '-' }}</div>
                  </div>
                </div>
                <div class="info-card info" style="animation-delay: 0.13s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Place /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">IP地址</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.ipAddress || '-' }}</div>
                  </div>
                </div>
                <div class="info-card danger" style="animation-delay: 0.16s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">总通道数</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.channelNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card teal" style="animation-delay: 0.19s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">模拟通道数</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.analogChanNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card purple" style="animation-delay: 0.22s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Link /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">IP通道数</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.ipChanNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card orange" style="animation-delay: 0.25s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Monitor /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">硬盘数量</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.diskNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card pink" style="animation-delay: 0.28s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Bell /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">报警输入端口</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.alarmInPortNum || '-' }}</div>
                  </div>
                </div>
                <div class="info-card cyan" style="animation-delay: 0.31s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Bell /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">报警输出端口</div>
                    <div class="info-card-value">{{ haikangIsupDeviceInfo.alarmOutPortNum || '-' }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleRefreshHaikangIsupDeviceInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 存储信息标签页 -->
        <el-tab-pane label="存储信息" name="storageInfo" @tab-click="handleGetHaikangIsupStorageInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Histogram /></el-icon>
              <span>存储设备信息</span>
            </div>
            <el-empty v-if="!haikangIsupStorageInfo.diskList || haikangIsupStorageInfo.diskList.length === 0" description="暂无存储设备信息"></el-empty>
            <el-collapse v-else accordion>
              <el-collapse-item v-for="(disk, index) in haikangIsupStorageInfo.diskList" :key="index" :title="'硬盘 ' + (disk.diskNo || index + 1)">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="硬盘编号">{{ disk.diskNo || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="容量">{{ disk.capacity !== undefined ? disk.capacity + ' MB' : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="可用空间">{{ disk.freeSpace !== undefined ? disk.freeSpace + ' MB' : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="已用空间">{{ disk.usedSpace !== undefined ? disk.usedSpace + ' MB' : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="属性">{{ disk.attrDesc || disk.attr || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="组编号">{{ disk.groupNo || '-' }}</el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupStorageInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- SD卡信息标签页 -->
        <el-tab-pane label="SD卡信息" name="sdCardInfo" @tab-click="handleGetHaikangIsupSdCardInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Monitor /></el-icon>
              <span>SD卡信息</span>
            </div>
            <el-empty v-if="!haikangIsupSdCardInfo.success" description="暂无SD卡信息" />
            <el-table v-else :data="haikangIsupSdCardInfo.sdCardList || []" border size="small" style="width: 100%" height="250">
              <el-table-column prop="sdCardCapacity" label="容量(MB)" />
              <el-table-column prop="sdCardSpace" label="剩余空间(MB)" />
            </el-table>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupSdCardInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 码率信息标签页 -->
        <el-tab-pane label="码率信息" name="bitrateInfo" @tab-click="handleGetHaikangIsupBitrateInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><VideoCamera /></el-icon>
              <span>码率信息</span>
            </div>
            <el-empty v-if="!haikangIsupBitrateInfo.success || !haikangIsupBitrateInfo.streamList || haikangIsupBitrateInfo.streamList.length === 0" description="暂无码率信息" />
            <el-table v-else :data="haikangIsupBitrateInfo.streamList" border style="width: 100%" height="250">
              <el-table-column prop="channel" label="通道号" width="100" />
              <el-table-column prop="bitrate" label="码率(kbps)" />
            </el-table>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupBitrateInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 网络状态标签页 -->
        <el-tab-pane label="网络状态" name="networkStatus" @tab-click="handleGetHaikangIsupNetworkStatusInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Place /></el-icon>
              <span>网络状态</span>
            </div>
            <el-empty v-if="!haikangIsupNetworkStatusInfo.success" description="暂无网络状态信息" />
            <div v-else>
              <el-descriptions :column="2" border style="margin-bottom: 20px;">
                <el-descriptions-item label="客户端连接数" v-if="haikangIsupNetworkStatusInfo.clientCount !== undefined">{{ haikangIsupNetworkStatusInfo.clientCount }}</el-descriptions-item>
                <el-descriptions-item label="当前码率" v-if="haikangIsupNetworkStatusInfo.bitRate !== undefined">{{ haikangIsupNetworkStatusInfo.bitRate }} kbps</el-descriptions-item>
                <el-descriptions-item label="总码率" v-if="haikangIsupNetworkStatusInfo.allBitRate !== undefined">{{ haikangIsupNetworkStatusInfo.allBitRate }} kbps</el-descriptions-item>
                <el-descriptions-item label="IP连接数" v-if="haikangIsupNetworkStatusInfo.ipLinkNum !== undefined">{{ haikangIsupNetworkStatusInfo.ipLinkNum }}</el-descriptions-item>
              </el-descriptions>

              <div v-if="haikangIsupNetworkStatusInfo.clientList && haikangIsupNetworkStatusInfo.clientList.length > 0">
                <div class="panel-section-title">连接客户端列表:</div>
                <el-table :data="haikangIsupNetworkStatusInfo.clientList" border size="small" style="width: 100%" height="250">
                  <el-table-column prop="ip" label="客户端IP" width="180" />
                  <el-table-column prop="username" label="用户名" />
                </el-table>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupNetworkStatusInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 软件版本标签页 -->
        <el-tab-pane label="设备状态" name="softwareVersion" @tab-click="handleGetHaikangIsupSoftwareVersionInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><InfoFilled /></el-icon>
              <span>设备状态</span>
            </div>
            <el-empty v-if="!haikangIsupSoftwareVersionInfo.success" description="暂无设备状态信息" />
            <el-descriptions v-else :column="2" border>
              <el-descriptions-item label="设备状态">
                <el-tag :type="haikangIsupSoftwareVersionInfo.deviceStatic === 1 ? 'success' : 'warning'">{{ haikangIsupSoftwareVersionInfo.deviceStaticDesc || '--' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="本地显示">
                <el-tag :type="haikangIsupSoftwareVersionInfo.localDisplay === 1 ? 'success' : 'warning'">{{ haikangIsupSoftwareVersionInfo.localDisplayDesc || '--' }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupSoftwareVersionInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 电源状态标签页 -->
        <el-tab-pane label="电源状态" name="powerState" @tab-click="handleGetHaikangIsupPowerStateInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><SwitchButton /></el-icon>
              <span>电源状态</span>
            </div>
            <el-empty v-if="!haikangIsupPowerStateInfo.success" description="暂无电源状态信息" />
            <el-descriptions v-else :column="2" border>
              <el-descriptions-item label="设备状态">
                <el-tag :type="haikangIsupPowerStateInfo.deviceStatic === 1 ? 'success' : 'warning'">{{ haikangIsupPowerStateInfo.deviceStaticDesc || '--' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="电源状态" v-if="haikangIsupPowerStateInfo.devicePowerStatus !== undefined">
                <el-tag :type="haikangIsupPowerStateInfo.devicePowerStatus === 1 ? 'success' : 'warning'">{{ haikangIsupPowerStateInfo.devicePowerStatus === 1 ? '正常' : '异常' }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupPowerStateInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 摄像头属性标签页 -->
        <el-tab-pane label="摄像头属性" name="cameraInfo" @tab-click="handleGetHaikangIsupCameraInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Camera /></el-icon>
              <span>摄像头属性</span>
            </div>
            <el-empty v-if="!haikangIsupCameraInfo.success" description="暂无摄像头属性信息" />
            <div v-else>
              <el-empty v-if="!haikangIsupCameraInfo.cameraList || haikangIsupCameraInfo.cameraList.length === 0" description="暂无摄像头信息" />
              <el-table :data="haikangIsupCameraInfo.cameraList" border size="small" style="width: 100%" v-else height="300">
                <el-table-column prop="channelId" label="通道号" width="100" />
                <el-table-column prop="cameraName" label="摄像头名称" width="150" />
                <el-table-column prop="cameraType" label="摄像头类型" width="150" />
                <el-table-column prop="online" label="在线状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.online ? 'success' : 'warning'">{{ row.online ? '在线' : '离线' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    {{ row.statusDesc || row.status }}
                  </template>
                </el-table-column>
                <el-table-column prop="manufacturer" label="厂商" width="120" />
                <el-table-column prop="model" label="型号" width="120" />
                <el-table-column prop="serialNumber" label="序列号" width="150" />
              </el-table>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupCameraInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 设备配置标签页 -->
        <el-tab-pane label="设备配置" name="deviceConfig" @tab-click="handleGetHaikangIsupDeviceConfig">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><SetUp /></el-icon>
              <span>设备配置</span>
            </div>
            <el-empty v-if="!haikangIsupDeviceConfig.success" description="暂无设备配置信息" />
            <div v-else style="margin-top: 20px;">
              <!-- 基本信息（只读） -->
              <div style="margin-bottom: 20px;">
                <div class="panel-section-title">基本信息</div>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="设备型号">{{ haikangIsupDeviceConfig.model || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="序列号">{{ haikangIsupDeviceConfig.serialNumber || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="MAC地址">{{ haikangIsupDeviceConfig.macAddress || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="设备类型">{{ haikangIsupDeviceConfig.deviceType || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="制造商">{{ haikangIsupDeviceConfig.manufacturer || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="固件版本">{{ haikangIsupDeviceConfig.firmwareVersion || '-' }}</el-descriptions-item>
                </el-descriptions>
              </div>
              
              <!-- 可编辑配置 -->
              <div style="margin-bottom: 20px;">
                <div class="panel-section-title">设备配置</div>
                <el-form :model="haikangIsupDeviceConfig" label-width="120px">
                  <el-form-item label="设备名称">
                    <el-input v-model="haikangIsupDeviceConfig.deviceName" placeholder="请输入设备名称" />
                  </el-form-item>
                  <el-form-item label="设备描述">
                    <el-input v-model="haikangIsupDeviceConfig.deviceDescription" type="textarea" :rows="2" placeholder="请输入设备描述" />
                  </el-form-item>
                  <el-form-item label="设备位置">
                    <el-input v-model="haikangIsupDeviceConfig.deviceLocation" placeholder="请输入设备位置" />
                  </el-form-item>
                  <el-form-item label="系统联系人">
                    <el-input v-model="haikangIsupDeviceConfig.systemContact" placeholder="请输入系统联系人" />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button @click="handleGetHaikangIsupDeviceConfig" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
            <el-button type="primary" @click="handleSetHaikangIsupDeviceConfig" :loading="haikangIsupDeviceInfoLoading" icon="Edit">保存配置</el-button>
          </div>
        </el-tab-pane>

        <!-- 版本信息标签页 -->
        <el-tab-pane label="版本信息" name="versionInfo" @tab-click="handleGetHaikangIsupVersionInfo">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><InfoFilled /></el-icon>
              <span>版本信息</span>
            </div>
            <el-empty v-if="!haikangIsupVersionInfo.success" description="暂无版本信息" />
            <el-descriptions v-else :column="1" border>
              <el-descriptions-item label="软件版本">{{ haikangIsupVersionInfo.softwareVersion || '-' }}</el-descriptions-item>
              <el-descriptions-item label="编码版本">{{ haikangIsupVersionInfo.encodeVersion || '-' }}</el-descriptions-item>
              <el-descriptions-item label="面板版本">{{ haikangIsupVersionInfo.panelVersion || '-' }}</el-descriptions-item>
              <el-descriptions-item label="硬件版本">{{ haikangIsupVersionInfo.hardwareVersion || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupVersionInfo" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>



        <!-- 系统状态标签页 -->
        <el-tab-pane label="系统状态" name="systemStatus" @tab-click="handleGetHaikangIsupSystemStatus">
          <div class="tab-content-wrapper" v-loading="haikangIsupDeviceInfoLoading">
            <div class="panel-header">
              <el-icon><Cpu /></el-icon>
              <span>系统状态</span>
            </div>
            <el-empty v-if="!haikangIsupSystemStatusInfo.success" description="暂无系统状态信息" />
            <div v-else>
              <el-descriptions :column="2" border style="margin-bottom: 20px;">
                <el-descriptions-item label="当前设备时间">{{ haikangIsupSystemStatusInfo.currentDeviceTime || '-' }}</el-descriptions-item>
                <el-descriptions-item label="设备已运行时间">{{ haikangIsupSystemStatusInfo.deviceUpTime !== undefined ? haikangIsupSystemStatusInfo.deviceUpTime + ' 秒' : '-' }}</el-descriptions-item>
              </el-descriptions>

              <div v-if="haikangIsupSystemStatusInfo.cpuList && haikangIsupSystemStatusInfo.cpuList.length > 0" style="margin-bottom: 20px;">
                <div class="panel-section-title">CPU信息:</div>
                <el-table :data="haikangIsupSystemStatusInfo.cpuList" border size="small" style="width: 100%">
                  <el-table-column prop="cpuUtilization" label="CPU使用率(%)">
                    <template #default="{ row }">
                      <el-progress :percentage="row.cpuUtilization || 0" :color="getProgressColor(row.cpuUtilization)"></el-progress>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div v-if="haikangIsupSystemStatusInfo.memoryList && haikangIsupSystemStatusInfo.memoryList.length > 0" style="margin-bottom: 20px;">
                <div class="panel-section-title">内存信息:</div>
                <el-table :data="haikangIsupSystemStatusInfo.memoryList" border size="small" style="width: 100%">
                  <el-table-column prop="memoryDescription" label="描述" width="150" />
                  <el-table-column prop="memoryUsage" label="已用内存(MB)" width="150" />
                  <el-table-column prop="memoryAvailable" label="可用内存(MB)" width="150" />
                  <el-table-column label="使用率">
                    <template #default="{ row }">
                      <el-progress v-if="row.memoryUsage !== undefined && row.memoryAvailable !== undefined" :percentage="Math.round((row.memoryUsage / (row.memoryUsage + row.memoryAvailable)) * 100) || 0" :color="getProgressColor(Math.round((row.memoryUsage / (row.memoryUsage + row.memoryAvailable)) * 100))"></el-progress>
                      <span v-else>-</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div v-if="haikangIsupSystemStatusInfo.netPortStatusList && haikangIsupSystemStatusInfo.netPortStatusList.length > 0">
                <div class="panel-section-title">网络端口状态:</div>
                <el-table :data="haikangIsupSystemStatusInfo.netPortStatusList" border size="small" style="width: 100%">
                  <el-table-column prop="id" label="索引" width="100" />
                  <el-table-column prop="netPortDescription" label="端口描述" width="150" />
                  <el-table-column prop="linkStatus" label="连接状态" width="150">
                    <template #default="{ row }">
                      <el-tag :type="row.linkStatus === 'connected' ? 'success' : 'warning'">{{ row.linkStatus === 'connected' ? '已连接' : '未连接' }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetHaikangIsupSystemStatus" :loading="haikangIsupDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 远程升级标签页 -->
        <el-tab-pane label="远程升级" name="remoteUpgrade">
          <div class="tab-content-wrapper">
            <div class="panel-header">
              <el-icon><Tools /></el-icon>
              <span>远程升级</span>
            </div>
            <el-form :model="haikangIsupUpgradeForm" label-width="120px" style="margin-top: 20px;">
              <el-form-item label="FTP服务器IP">
                <el-input v-model="haikangIsupUpgradeForm.ftpServerIp" placeholder="请输入FTP服务器IP地址" />
              </el-form-item>
              <el-form-item label="FTP服务器端口">
                <el-input-number v-model="haikangIsupUpgradeForm.ftpServerPort" :min="1" :max="65535" style="width: 100%" />
              </el-form-item>
              <el-form-item label="FTP账号">
                <el-input v-model="haikangIsupUpgradeForm.ftpAccount" placeholder="请输入FTP账号" />
              </el-form-item>
              <el-form-item label="FTP密码">
                <el-input v-model="haikangIsupUpgradeForm.ftpPassword" type="password" placeholder="请输入FTP密码" show-password />
              </el-form-item>
              <el-form-item label="升级文件名">
                <el-input v-model="haikangIsupUpgradeForm.fileName" placeholder="请输入升级文件名，如：digicap.dav" />
              </el-form-item>
              <el-form-item label="通道号">
                <el-input-number v-model="haikangIsupUpgradeForm.channel" :min="0" style="width: 100%" />
              </el-form-item>
            </el-form>
            
            <div v-if="haikangIsupUpgradeResult.success" style="margin-top: 20px;">
              <div class="panel-section-title">升级结果:</div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="消息">{{ haikangIsupUpgradeResult.message }}</el-descriptions-item>
                <el-descriptions-item v-if="haikangIsupUpgradeResult.upgradeResult" label="升级响应">{{ haikangIsupUpgradeResult.upgradeResult }}</el-descriptions-item>
              </el-descriptions>
              
              <div v-if="haikangIsupUpgradeResult.beforeInfo && haikangIsupUpgradeResult.beforeInfo.success" style="margin-top: 20px;">
                <div class="panel-section-title">升级前版本信息:</div>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="型号">{{ haikangIsupUpgradeResult.beforeInfo.model || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="序列号">{{ haikangIsupUpgradeResult.beforeInfo.serialNumber || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="固件版本">{{ haikangIsupUpgradeResult.beforeInfo.firmwareVersion || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="设备名称">{{ haikangIsupUpgradeResult.beforeInfo.deviceName || '-' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="haikangIsupDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleHaikangIsupUpgrade" :loading="haikangIsupUpgradeLoading" icon="Tools">执行升级</el-button>
          </div>
        </el-tab-pane>
        

      </el-tabs>
    </el-dialog>

    <SelectMapPosition ref="selectMapPositionRef" @onSubmit="selectMapPositionSubmit"></SelectMapPosition>
    <ChannelCode ref="channelCodeRef" @handleOk="channelCodeOk"></ChannelCode>
    <DeviceSnapshotDialog ref="snapshotDialogRef"></DeviceSnapshotDialog>

    <!-- GB28181设备刷新进度对话框 -->
    <el-dialog
      v-model="refreshProgressDialogVisible"
      width="400px"
      title="设备刷新"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="refresh-progress-dialog"
      :show-close="false"
    >
      <div class="refresh-progress-center">
        <div class="refresh-header">
          <div class="refresh-icon-wrapper">
            <el-icon class="refresh-icon" :class="{ spinning: refreshProgress < 100 }"><Refresh /></el-icon>
          </div>
          <h3 class="refresh-title">{{ refreshProgress < 100 ? '设备刷新中' : '刷新完成' }}</h3>
        </div>
        
        <div class="progress-circle-wrapper">
          <el-progress
            type="circle"
            :percentage="refreshProgress"
            :stroke-width="10"
            :width="180"
            :color="refreshProgressColor"
            :format="() => ''"
          />
          <div class="progress-percent">
            <span class="percent-num">{{ refreshProgress }}</span>
            <span class="percent-unit">%</span>
          </div>
        </div>
        
        <div class="refresh-steps">
          <div class="step-item" :class="{ active: true, completed: refreshProgress >= 30 }">
            <el-icon class="step-icon">
              <component :is="refreshProgress >= 30 ? 'CircleCheck' : 'Connection'" />
            </el-icon>
            <span class="step-text">设备连接</span>
          </div>
          <div class="step-divider"></div>
          <div class="step-item" :class="{ active: refreshProgress >= 30, completed: refreshProgress >= 70 }">
            <el-icon class="step-icon">
              <component :is="refreshProgress >= 70 ? 'CircleCheck' : 'Monitor'" />
            </el-icon>
            <span class="step-text">状态同步</span>
          </div>
          <div class="step-divider"></div>
          <div class="step-item" :class="{ active: refreshProgress >= 70, completed: refreshProgress >= 100 }">
            <el-icon class="step-icon">
              <component :is="refreshProgress >= 100 ? 'CircleCheck' : 'CollectionTag'" />
            </el-icon>
            <span class="step-text">通道刷新</span>
          </div>
        </div>
        
        <div class="refresh-tip" v-if="refreshProgress < 100">
          <p class="tip-content">正在与设备通信，请稍候...</p>
        </div>
      </div>
    </el-dialog>

    <!-- GB28181录像控制对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      width="500px"
      title="录像控制"
      append-to-body
    >
      <el-form :model="recordDialogForm" label-width="100px">
        <el-form-item label="通道ID">
          <el-input v-model="recordDialogForm.channelId" disabled />
        </el-form-item>
        <el-form-item label="录像命令">
          <el-select v-model="recordDialogForm.recordCmd" placeholder="请选择录像命令">
            <el-option label="停止录像" value="0" />
            <el-option label="开始录像" value="1" />
            <el-option label="定时录像" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="码流类型">
          <el-select v-model="recordDialogForm.streamNumber" placeholder="请选择码流类型">
            <el-option label="主码流" :value="0" />
            <el-option label="子码流1" :value="1" />
            <el-option label="子码流2" :value="2" />
            <el-option label="子码流3" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRecordControl">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- GB28181设备信息对话框 -->
    <el-dialog title="设备信息" v-model="gb28181DeviceInfoDialogVisible" width="850px" append-to-body class="glass-dialog device-info-dialog">
      <el-tabs v-model="gb28181DeviceInfoTabActive" type="border-card" @tab-change="handleTabChange">
        <!-- 设备信息标签页 -->
        <el-tab-pane label="设备信息" name="deviceInfo">
          <div class="device-info-dashboard" v-loading="gb28181DeviceInfoLoading">
            <div class="dashboard-header">
              <div class="dashboard-title">
                <el-icon class="dashboard-icon"><Cpu /></el-icon>
                <span>设备基本信息</span>
              </div>
              <div class="dashboard-badge" v-if="gb28181DeviceInfo.sn">
                <el-icon><CollectionTag /></el-icon>
                <span>{{ gb28181DeviceInfo.sn }}</span>
              </div>
            </div>
            <div class="info-cards-grid">
              <div class="info-card primary" style="animation-delay: 0.04s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Medal /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">设备ID</div>
                  <div class="info-card-value">{{ gb28181DeviceInfo.deviceId || '-' }}</div>
                </div>
              </div>
              <div class="info-card success" style="animation-delay: 0.08s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">设备名称</div>
                  <div class="info-card-value">{{ gb28181DeviceInfo.deviceName || '-' }}</div>
                </div>
              </div>
              <div class="info-card info" style="animation-delay: 0.12s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><OfficeBuilding /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">制造商</div>
                  <div class="info-card-value">{{ gb28181DeviceInfo.manufacturer || '-' }}</div>
                </div>
              </div>
              <div class="info-card warning" style="animation-delay: 0.16s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><SetUp /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">设备型号</div>
                  <div class="info-card-value">{{ gb28181DeviceInfo.model || '-' }}</div>
                </div>
              </div>
              <div class="info-card danger" style="animation-delay: 0.2s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Odometer /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">固件版本</div>
                  <div class="info-card-value">{{ gb28181DeviceInfo.firmware || '-' }}</div>
                </div>
              </div>
              <div class="info-card teal" style="animation-delay: 0.24s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Monitor /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">设备类型</div>
                  <div class="info-card-value">{{ gb28181DeviceInfo.deviceType || '-' }}</div>
                </div>
              </div>
              <div class="info-card purple" style="animation-delay: 0.28s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><CollectionTag /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">通道数</div>
                  <div class="info-card-value">
                    {{ (gb28181DeviceInfo.channel !== null ? gb28181DeviceInfo.channel : gb28181DeviceInfo.maxCamera) || '-' }}
                  </div>
                </div>
              </div>
              <div class="info-card orange" style="animation-delay: 0.32s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Warning /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">最大报警数</div>
                  <div class="info-card-value">{{ gb28181DeviceInfo.maxAlarm !== null ? gb28181DeviceInfo.maxAlarm : '-' }}</div>
                </div>
              </div>
            </div>

            <!-- 扩展信息 -->
            <div v-if="gb28181DeviceInfo.extraInfo && gb28181DeviceInfo.extraInfo.length > 0" style="margin-top: 20px;">
              <h4 style="margin-bottom: 10px;">扩展信息</h4>
              <div v-for="(info, index) in gb28181DeviceInfo.extraInfo" :key="index" class="extra-info-item">
                {{ info }}
              </div>
            </div>
          </div>
        </el-tab-pane>
        <!-- 设备状态标签页 -->
        <el-tab-pane label="设备状态" name="deviceStatus">
          <div class="device-info-dashboard" v-loading="gb28181DeviceInfoLoading">
            <div class="dashboard-header">
              <div class="dashboard-title">
                <el-icon class="dashboard-icon"><Cpu /></el-icon>
                <span>设备状态信息</span>
              </div>
              <div class="dashboard-badge" v-if="gb28181DeviceStatus.sn">
                <el-icon><CollectionTag /></el-icon>
                <span>{{ gb28181DeviceStatus.sn }}</span>
              </div>
            </div>
            <div class="info-cards-grid">
              <div class="info-card primary" style="animation-delay: 0.04s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Medal /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">设备ID</div>
                  <div class="info-card-value">{{ gb28181DeviceStatus.deviceId || '-' }}</div>
                </div>
              </div>
              <div class="info-card success" style="animation-delay: 0.08s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">在线状态</div>
                  <div class="info-card-value">
                    <el-tag v-if="gb28181DeviceStatus.online === 'ONLINE'" type="success">在线</el-tag>
                    <el-tag v-else-if="gb28181DeviceStatus.online === 'OFFLINE'" type="danger">离线</el-tag>
                    <span v-else>{{ gb28181DeviceStatus.online || '-' }}</span>
                  </div>
                </div>
              </div>
              <div class="info-card info" style="animation-delay: 0.12s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Position /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">设备状态</div>
                  <div class="info-card-value">
                    <el-tag v-if="gb28181DeviceStatus.status === 'OK'" type="success">正常</el-tag>
                    <el-tag v-else-if="gb28181DeviceStatus.status" type="danger">异常</el-tag>
                    <span v-else>{{ gb28181DeviceStatus.status || '-' }}</span>
                  </div>
                </div>
              </div>
              <div class="info-card warning" style="animation-delay: 0.16s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Clock /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">设备时间</div>
                  <div class="info-card-value">{{ gb28181DeviceStatus.deviceTime || '-' }}</div>
                </div>
              </div>
              <div class="info-card danger" style="animation-delay: 0.2s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><Link /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">编码状态</div>
                  <div class="info-card-value">
                    <el-tag v-if="gb28181DeviceStatus.encode === 'ON'" type="success">开启</el-tag>
                    <el-tag v-else-if="gb28181DeviceStatus.encode === 'OFF'" type="info">关闭</el-tag>
                    <span v-else>{{ gb28181DeviceStatus.encode || '-' }}</span>
                  </div>
                </div>
              </div>
              <div class="info-card teal" style="animation-delay: 0.24s">
                <div class="info-card-glow"></div>
                <div class="info-card-icon"><el-icon><CollectionTag /></el-icon></div>
                <div class="info-card-content">
                  <div class="info-card-label">录像状态</div>
                  <div class="info-card-value">
                    <el-tag v-if="gb28181DeviceStatus.record === 'ON'" type="success">录像中</el-tag>
                    <el-tag v-else-if="gb28181DeviceStatus.record === 'OFF'" type="info">未录像</el-tag>
                    <span v-else>{{ gb28181DeviceStatus.record || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 异常原因 -->
            <div v-if="gb28181DeviceStatus.reason" style="margin-top: 20px;">
              <el-alert
                title="异常原因"
                type="warning"
                :closable="false"
                :description="gb28181DeviceStatus.reason"
              />
            </div>
            
            <!-- 报警状态列表 -->
            <div v-if="gb28181DeviceStatus.alarmStatus && gb28181DeviceStatus.alarmStatus.length > 0" style="margin-top: 20px;">
              <h4 style="margin-bottom: 10px;">报警设备状态</h4>
              <el-table :data="gb28181DeviceStatus.alarmStatus" border style="width: 100%;">
                <el-table-column prop="deviceId" label="设备ID" />
                <el-table-column prop="dutyStatus" label="状态">
                  <template #default="scope">
                    <el-tag v-if="scope.row.dutyStatus === 'ONDUTY'" type="success">在位</el-tag>
                    <el-tag v-else-if="scope.row.dutyStatus === 'OFFDUTY'" type="info">离岗</el-tag>
                    <el-tag v-else-if="scope.row.dutyStatus === 'ALARM'" type="danger">报警</el-tag>
                    <span v-else>{{ scope.row.dutyStatus }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 扩展信息 -->
            <div v-if="gb28181DeviceStatus.extraInfo && gb28181DeviceStatus.extraInfo.length > 0" style="margin-top: 20px;">
              <h4 style="margin-bottom: 10px;">扩展信息</h4>
              <div v-for="(info, index) in gb28181DeviceStatus.extraInfo" :key="index" class="extra-info-item">
                {{ info }}
              </div>
            </div>
          </div>
        </el-tab-pane>
        <!-- 存储卡管理标签页 -->
        <el-tab-pane label="存储卡管理" name="sdCard">
          <div class="device-info-dashboard" v-loading="gb28181DeviceInfoLoading">
            <div class="dashboard-header">
              <div class="dashboard-title">
                <el-icon class="dashboard-icon"><SetUp /></el-icon>
                <span>存储卡管理</span>
              </div>
            </div>
            
            <el-form :model="gb28181SdCardForm" label-width="120px" class="data-form" style="margin-top: 20px; padding: 20px;">
              <el-form-item label="SD卡编号">
                <el-input-number v-model="gb28181SdCardForm.sdCardId" :min="0" style="width: 100%;" />
                <div style="font-size: 12px; color: #909399; margin-top: 5px;">0 表示所有存储卡</div>
              </el-form-item>
            </el-form>
            
            <div v-if="gb28181SdCardInfo && Object.keys(gb28181SdCardInfo).length > 0" style="margin-top: 20px; padding: 0 20px;">
              <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">存储卡状态:</div>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="状态" v-if="gb28181SdCardInfo.status !== undefined">
                  <el-tag :type="gb28181SdCardInfo.status === 1 ? 'success' : 'info'">
                    {{ gb28181SdCardInfo.statusDesc || (gb28181SdCardInfo.status === 1 ? '正常' : '异常') }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="总容量" v-if="gb28181SdCardInfo.totalSpace !== undefined">
                  {{ gb28181SdCardInfo.totalSpace }}
                </el-descriptions-item>
                <el-descriptions-item label="可用空间" v-if="gb28181SdCardInfo.freeSpace !== undefined">
                  {{ gb28181SdCardInfo.freeSpace }}
                </el-descriptions-item>
                <el-descriptions-item label="已用空间" v-if="gb28181SdCardInfo.usedSpace !== undefined">
                  {{ gb28181SdCardInfo.usedSpace }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="dialog-footer" style="margin-top: 20px;">
        <el-button @click="gb28181DeviceInfoDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleRefreshCurrentTab" :loading="gb28181DeviceInfoLoading" icon="Refresh">刷新</el-button>
        <el-button type="primary" v-if="gb28181DeviceInfoTabActive === 'sdCard'" @click="handleQueryGb28181SdCardStatus" :loading="gb28181DeviceInfoLoading" icon="Refresh">查询状态</el-button>
        <el-button type="danger" v-if="gb28181DeviceInfoTabActive === 'sdCard'" @click="handleFormatGb28181SdCard" :loading="gb28181DeviceInfoLoading" icon="Tools">格式化</el-button>
      </div>
    </el-dialog>

    <!-- ONVIF设备信息对话框 -->
    <el-dialog title="ONVIF设备信息" v-model="onvifDeviceInfoDialogVisible" width="850px" append-to-body class="glass-dialog device-info-dialog">
      <el-tabs v-model="onvifDeviceInfoTabActive" type="border-card" @tab-change="handleOnvifTabChange">
        <!-- 设备信息标签页 -->
        <el-tab-pane label="设备信息" name="deviceInfo">
          <div class="device-info-dashboard" v-loading="onvifDeviceInfoLoading">
            <el-empty v-if="!onvifDeviceInfo.success" description="暂无设备信息" />
            <template v-else>
              <div class="dashboard-header">
                <div class="dashboard-title">
                  <el-icon class="dashboard-icon"><Cpu /></el-icon>
                  <span>设备基本信息</span>
                </div>
              </div>
              <div class="info-cards-grid cols-3">
                <div class="info-card primary" style="animation-delay: 0.04s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><OfficeBuilding /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">厂商</div>
                    <div class="info-card-value">{{ onvifDeviceInfo.manufacturer || '-' }}</div>
                  </div>
                </div>
                <div class="info-card success" style="animation-delay: 0.07s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><SetUp /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">型号</div>
                    <div class="info-card-value">{{ onvifDeviceInfo.model || '-' }}</div>
                  </div>
                </div>
                <div class="info-card warning" style="animation-delay: 0.10s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><Medal /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">固件版本</div>
                    <div class="info-card-value">{{ onvifDeviceInfo.firmwareVersion || '-' }}</div>
                  </div>
                </div>
                <div class="info-card info" style="animation-delay: 0.13s">
                  <div class="info-card-glow"></div>
                  <div class="info-card-icon"><el-icon><VideoCamera /></el-icon></div>
                  <div class="info-card-content">
                    <div class="info-card-label">Profile 数量</div>
                    <div class="info-card-value">{{ onvifDeviceInfo.profileCount || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- 流地址信息 -->
              <div v-if="onvifDeviceInfo.streamUris && onvifDeviceInfo.streamUris.length > 0" style="margin-top: 30px;">
                <div class="panel-header">
                  <el-icon><Link /></el-icon>
                  <span>流地址</span>
                </div>
                <el-table :data="onvifDeviceInfo.streamUris" border size="small" style="width: 100%; margin-top: 15px;">
                  <el-table-column prop="type" label="类型" width="150">
                    <template #default="{ row }">
                      <el-tag v-if="row.type === 'main'" type="primary">主码流</el-tag>
                      <el-tag v-else-if="row.type === 'sub'" type="success">子码流</el-tag>
                      <el-tag v-else>{{ row.type || '-' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="uri" label="地址">
                    <template #default="{ row }">
                      <el-input :value="row.uri || '-'" readonly size="small">
                        <template #append>
                          <el-button @click="handleCopy(row.uri)" icon="DocumentCopy">复制</el-button>
                        </template>
                      </el-input>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- Profile 信息 -->
              <div v-if="onvifDeviceInfo.profiles && onvifDeviceInfo.profiles.length > 0" style="margin-top: 30px;">
                <div class="panel-header">
                  <el-icon><VideoCamera /></el-icon>
                  <span>Profiles</span>
                </div>
                <el-table :data="onvifDeviceInfo.profiles" border size="small" style="width: 100%; margin-top: 15px;">
                  <el-table-column prop="token" label="Token" width="250" />
                  <el-table-column prop="name" label="名称" />
                </el-table>
              </div>
            </template>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleRefreshOnvifDeviceInfo" :loading="onvifDeviceInfoLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 存储配置标签页 -->
        <el-tab-pane label="存储配置" name="storageConfigurations" @tab-click="handleGetOnvifStorageConfigurations">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><SetUp /></el-icon>
              <span>存储配置信息</span>
            </div>
            <el-alert v-if="onvifStorageConfigurations.hasError" type="error" :title="onvifStorageConfigurations.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifStorageConfigurations.success" description="暂无存储配置信息" />
            <div v-else>
              <el-table v-if="onvifStorageConfigurations.configurations && onvifStorageConfigurations.configurations.length > 0" :data="onvifStorageConfigurations.configurations" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="200" />
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="storageUri" label="存储地址" min-width="200" />
                <el-table-column prop="enabled" label="启用状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无存储配置数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifStorageConfigurations" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 存储能力标签页 -->
        <el-tab-pane label="存储能力" name="storageCapabilities" @tab-click="handleGetOnvifStorageCapabilities">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><Box /></el-icon>
              <span>存储能力信息</span>
            </div>
            <el-alert v-if="onvifStorageCapabilities.hasError" type="error" :title="onvifStorageCapabilities.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifStorageCapabilities.success" description="暂无存储能力信息" />
            <div v-else>
              <el-table v-if="onvifStorageCapabilities.capabilities && onvifStorageCapabilities.capabilities.length > 0" :data="onvifStorageCapabilities.capabilities" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="200" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="recording" label="录制" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.recording ? 'success' : 'info'">{{ row.recording ? '支持' : '不支持' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="search" label="搜索" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.search ? 'success' : 'info'">{{ row.search ? '支持' : '不支持' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="replay" label="回放" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.replay ? 'success' : 'info'">{{ row.replay ? '支持' : '不支持' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="export" label="导出" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.export ? 'success' : 'info'">{{ row.export ? '支持' : '不支持' }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无存储能力数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifStorageCapabilities" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 存储状态标签页 -->
        <el-tab-pane label="存储状态" name="storageState" @tab-click="handleGetOnvifStorageState">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><DataLine /></el-icon>
              <span>存储状态信息</span>
            </div>
            <el-alert v-if="onvifStorageState.hasError" type="error" :title="onvifStorageState.errorMessage || '获取状态出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifStorageState.success" description="暂无存储状态信息" />
            <div v-else>
              <div v-if="onvifStorageState.states && onvifStorageState.states.length > 0">
                <div v-for="(state, index) in onvifStorageState.states" :key="index" class="storage-state-card">
                  <div class="storage-state-header">
                    <div class="storage-state-name">{{ state.token || '存储 ' + (index + 1) }}</div>
                    <el-tag :type="state.state === 'ready' ? 'success' : state.state === 'error' ? 'danger' : 'info'" size="small">
                      {{ state.state || '-' }}
                    </el-tag>
                  </div>
                  <div class="storage-stats">
                    <div class="stat-item">
                      <span class="stat-label">总容量</span>
                      <span class="stat-value">{{ formatCapacity(state.totalCapacity) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">已用容量</span>
                      <span class="stat-value">{{ formatCapacity(state.usedCapacity) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">可用容量</span>
                      <span class="stat-value">{{ formatCapacity(state.freeCapacity) }}</span>
                    </div>
                  </div>
                  <div v-if="state.totalCapacity && state.usedCapacity" class="storage-progress">
                    <el-progress :percentage="calculateStoragePercentage(state.usedCapacity, state.totalCapacity)" 
                                 :color="getStorageColor(state.usedCapacity, state.totalCapacity)" 
                                 :stroke-width="12" />
                  </div>
                  <div v-if="state.lastUpdated" class="storage-updated">
                    <el-icon><Clock /></el-icon>
                    <span>最后更新：{{ state.lastUpdated }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无存储状态数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifStorageState" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 网络接口标签页 -->
        <el-tab-pane label="网络接口" name="networkInterfaces" @tab-click="handleGetOnvifNetworkInterfaces">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><Connection /></el-icon>
              <span>网络接口配置</span>
            </div>
            <el-alert v-if="onvifNetworkInterfaces.hasError" type="error" :title="onvifNetworkInterfaces.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifNetworkInterfaces.success" description="暂无网络接口配置" />
            <div v-else>
              <el-table v-if="onvifNetworkInterfaces.networkInterfaces && onvifNetworkInterfaces.networkInterfaces.length > 0" :data="onvifNetworkInterfaces.networkInterfaces" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="180" />
                <el-table-column prop="name" label="名称" width="120" />
                <el-table-column prop="enabled" label="启用状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="hwAddress" label="MAC地址" width="150" />
                <el-table-column prop="ipv4Address" label="IPv4地址" width="150" />
                <el-table-column prop="ipv4SubnetMask" label="子网掩码" width="150" />
                <el-table-column prop="ipv4Gateway" label="网关" width="150" />
                <el-table-column prop="dnsServers" label="DNS服务器" min-width="150">
                  <template #default="{ row }">
                    {{ Array.isArray(row.dnsServers) ? row.dnsServers.join(', ') : (row.dnsServers || '-') }}
                  </template>
                </el-table-column>
                <el-table-column prop="dhcpEnabled" label="DHCP" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.dhcpEnabled ? 'success' : 'info'">{{ row.dhcpEnabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无网络接口数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifNetworkInterfaces" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 网络协议标签页 -->
        <el-tab-pane label="网络协议" name="networkProtocols" @tab-click="handleGetOnvifNetworkProtocols">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><Link /></el-icon>
              <span>网络协议配置</span>
            </div>
            <el-alert v-if="onvifNetworkProtocols.hasError" type="error" :title="onvifNetworkProtocols.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifNetworkProtocols.success" description="暂无网络协议配置" />
            <div v-else>
              <div v-if="onvifNetworkProtocols.networkProtocols && onvifNetworkProtocols.networkProtocols.length > 0" class="protocol-cards">
                <div v-for="(protocol, index) in onvifNetworkProtocols.networkProtocols" :key="index" class="protocol-card">
                  <div class="protocol-icon" :class="protocol.name?.toLowerCase()">
                    <el-icon><Connection /></el-icon>
                  </div>
                  <div class="protocol-info">
                    <div class="protocol-name">{{ protocol.name || '未知协议' }}</div>
                    <div class="protocol-details">
                      <span class="detail-item">
                        <el-tag :type="protocol.enabled ? 'success' : 'info'" size="small">
                          {{ protocol.enabled ? '已启用' : '未启用' }}
                        </el-tag>
                      </span>
                      <span class="detail-item">
                        <el-icon><Odometer /></el-icon>
                        端口: {{ protocol.port || '-' }}
                      </span>
                      <span v-if="protocol.tlsEnabled !== undefined && protocol.tlsEnabled !== null" class="detail-item">
                        <el-tag :type="protocol.tlsEnabled ? 'success' : 'info'" size="small">
                          TLS: {{ protocol.tlsEnabled ? '已开启' : '未开启' }}
                        </el-tag>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无网络协议数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifNetworkProtocols" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 视频源配置标签页 -->
        <el-tab-pane label="视频源配置" name="videoSourceConfigs" @tab-click="handleGetOnvifVideoSourceConfigs">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><VideoCamera /></el-icon>
              <span>视频源配置</span>
            </div>
            <el-alert v-if="onvifVideoSourceConfigs.hasError" type="error" :title="onvifVideoSourceConfigs.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifVideoSourceConfigs.success" description="暂无视频源配置" />
            <div v-else>
              <el-table v-if="onvifVideoSourceConfigs.videoSourceConfigs && onvifVideoSourceConfigs.videoSourceConfigs.length > 0" :data="onvifVideoSourceConfigs.videoSourceConfigs" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="180" />
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="enabled" label="启用状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="width" label="宽度" width="100" />
                <el-table-column prop="height" label="高度" width="100" />
                <el-table-column prop="frameRate" label="帧率" width="100" />
                <el-table-column prop="bitrate" label="码率" width="120" />
                <el-table-column prop="snapshotUri" label="快照地址" min-width="200" />
              </el-table>
              <el-empty v-else description="暂无视频源配置数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifVideoSourceConfigs" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 视频编码器配置标签页 -->
        <el-tab-pane label="视频编码器配置" name="videoEncoderConfigs" @tab-click="handleGetOnvifVideoEncoderConfigs">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><Setting /></el-icon>
              <span>视频编码器配置</span>
            </div>
            <el-alert v-if="onvifVideoEncoderConfigs.hasError" type="error" :title="onvifVideoEncoderConfigs.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifVideoEncoderConfigs.success" description="暂无视频编码器配置" />
            <div v-else>
              <el-table v-if="onvifVideoEncoderConfigs.videoEncoderConfigs && onvifVideoEncoderConfigs.videoEncoderConfigs.length > 0" :data="onvifVideoEncoderConfigs.videoEncoderConfigs" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="180" />
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="enabled" label="启用状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="encoding" label="编码格式" width="120" />
                <el-table-column prop="width" label="宽度" width="100" />
                <el-table-column prop="height" label="高度" width="100" />
                <el-table-column prop="frameRate" label="帧率" width="100" />
                <el-table-column prop="bitrate" label="码率" width="120" />
                <el-table-column prop="quality" label="质量" width="100" />
                <el-table-column prop="iFrameInterval" label="I帧间隔" width="120" />
              </el-table>
              <el-empty v-else description="暂无视频编码器配置数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifVideoEncoderConfigs" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 音频源配置标签页 -->
        <el-tab-pane label="音频源配置" name="audioSourceConfigs" @tab-click="handleGetOnvifAudioSourceConfigs">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><Microphone /></el-icon>
              <span>音频源配置</span>
            </div>
            <el-alert v-if="onvifAudioSourceConfigs.hasError" type="error" :title="onvifAudioSourceConfigs.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifAudioSourceConfigs.success" description="暂无音频源配置" />
            <div v-else>
              <el-table v-if="onvifAudioSourceConfigs.audioSourceConfigs && onvifAudioSourceConfigs.audioSourceConfigs.length > 0" :data="onvifAudioSourceConfigs.audioSourceConfigs" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="180" />
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="enabled" label="启用状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="channels" label="声道" width="100" />
                <el-table-column prop="sampleRate" label="采样率" width="120" />
                <el-table-column prop="bitDepth" label="位深" width="100" />
              </el-table>
              <el-empty v-else description="暂无音频源配置数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifAudioSourceConfigs" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 音频编码器配置标签页 -->
        <el-tab-pane label="音频编码器配置" name="audioEncoderConfigs" @tab-click="handleGetOnvifAudioEncoderConfigs">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><Operation /></el-icon>
              <span>音频编码器配置</span>
            </div>
            <el-alert v-if="onvifAudioEncoderConfigs.hasError" type="error" :title="onvifAudioEncoderConfigs.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifAudioEncoderConfigs.success" description="暂无音频编码器配置" />
            <div v-else>
              <el-table v-if="onvifAudioEncoderConfigs.audioEncoderConfigs && onvifAudioEncoderConfigs.audioEncoderConfigs.length > 0" :data="onvifAudioEncoderConfigs.audioEncoderConfigs" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="180" />
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="enabled" label="启用状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="encoding" label="编码格式" width="120" />
                <el-table-column prop="channels" label="声道" width="100" />
                <el-table-column prop="sampleRate" label="采样率" width="120" />
                <el-table-column prop="bitrate" label="码率" width="120" />
                <el-table-column prop="bitDepth" label="位深" width="100" />
              </el-table>
              <el-empty v-else description="暂无音频编码器配置数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifAudioEncoderConfigs" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
        <!-- 视频输出配置标签页 -->
        <el-tab-pane label="视频输出配置" name="videoOutputConfigs" @tab-click="handleGetOnvifVideoOutputConfigs">
          <div class="tab-content-wrapper" v-loading="onvifStorageLoading">
            <div class="panel-header">
              <el-icon><Monitor /></el-icon>
              <span>视频输出配置</span>
            </div>
            <el-alert v-if="onvifVideoOutputConfigs.hasError" type="error" :title="onvifVideoOutputConfigs.errorMessage || '获取配置出错'" show-icon style="margin-bottom: 20px;" />
            <el-empty v-else-if="!onvifVideoOutputConfigs.success" description="暂无视频输出配置" />
            <div v-else>
              <el-table v-if="onvifVideoOutputConfigs.videoOutputConfigs && onvifVideoOutputConfigs.videoOutputConfigs.length > 0" :data="onvifVideoOutputConfigs.videoOutputConfigs" border size="small" style="width: 100%;">
                <el-table-column prop="token" label="Token" width="180" />
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="enabled" label="启用状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '已启用' : '未启用' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="width" label="宽度" width="100" />
                <el-table-column prop="height" label="高度" width="100" />
                <el-table-column prop="frameRate" label="帧率" width="100" />
                <el-table-column prop="outputUri" label="输出地址" min-width="200" />
              </el-table>
              <el-empty v-else description="暂无视频输出配置数据" />
            </div>
          </div>
          <div class="dialog-footer" style="margin-top: 20px;">
            <el-button @click="onvifDeviceInfoDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleGetOnvifVideoOutputConfigs" :loading="onvifStorageLoading" icon="Refresh">刷新</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- JT1078设备信息对话框 -->
    <el-dialog title="设备信息" v-model="jt1078ParamsDialogVisible" width="1000px" append-to-body>
      <div class="terminal-params-dialog-wrapper" v-loading="jt1078ParamsLoading">
        <el-descriptions :column="2" border style="margin-bottom: 20px;">
          <el-descriptions-item label="设备ID">{{ jt1078CurrentDevice.deviceId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ jt1078CurrentDevice.mobileNo || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <el-tabs v-model="jt1078ParamsTabActive" @tab-change="handleJt1078TabChange">
          <!-- 终端参数查询和设置标签页 -->
          <el-tab-pane label="终端参数" name="params">
            <div v-if="jt1078TerminalParams && Object.keys(jt1078TerminalParams).length > 0">
              <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
                终端参数
                <el-button type="primary" size="small" @click="handleQueryJt1078Params" style="margin-left: 10px;" icon="Refresh">刷新</el-button>
              </div>
              <div class="terminal-params-table-wrapper">
                <el-table :data="jt1078EditableParams" border style="width: 100%;">
                  <el-table-column prop="key" label="参数ID" width="120" />
                  <el-table-column prop="value" label="参数值">
                    <template #default="{ row }">
                      <el-input
                        v-if="typeof row.originalValue === 'number'"
                        v-model.number="row.editableValue"
                        type="number"
                        size="small"
                        placeholder="请输入数值"
                      />
                      <div v-else-if="typeof row.originalValue === 'object'" style="width: 100%;">
                        <el-input
                          v-model="row.editableValue"
                          type="textarea"
                          :rows="4"
                          size="small"
                          placeholder="请输入JSON格式数据"
                          readonly
                        />
                        <div style="font-size: 12px; color: var(--el-text-color-secondary); margin-top: 4px;">
                          ⚠️ 对象类型参数暂不支持编辑
                        </div>
                      </div>
                      <el-input
                        v-else
                        v-model="row.editableValue"
                        size="small"
                        placeholder="请输入字符"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button 
                        v-if="typeof row.originalValue !== 'object'"
                        type="primary" 
                        size="small" 
                        @click="removeParam(row.key)" 
                        icon="Delete"
                      >删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <el-empty v-else description="暂无参数数据，请点击查询按钮获取参数" style="padding: 40px 0;" />
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--el-border-color-lighter);">
              <div class="panel-section-title" style="font-weight: bold; font-size: 14px; margin-bottom: 15px;">添加新参数</div>
              <el-form :model="jt1078SetParamsForm" label-width="100px" class="data-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="panel-section-title" style="font-size: 13px; margin-bottom: 10px; color: var(--el-text-color-secondary);">数值型参数</div>
                    <el-form-item label="参数ID">
                      <el-input-number v-model="jt1078TempParamId" :min="0" placeholder="请输入参数ID" size="small" style="width: 100%;" />
                    </el-form-item>
                    <el-form-item label="参数值">
                      <el-input-number v-model="jt1078TempParamValue" :min="0" placeholder="请输入参数值" size="small" style="width: 100%;" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="addIntParam" icon="Plus" size="small">添加数值参数</el-button>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <div class="panel-section-title" style="font-size: 13px; margin-bottom: 10px; color: var(--el-text-color-secondary);">字符型参数</div>
                    <el-form-item label="参数ID">
                      <el-input-number v-model="jt1078TempStrParamId" :min="0" placeholder="请输入参数ID" size="small" style="width: 100%;" />
                    </el-form-item>
                    <el-form-item label="参数值">
                      <el-input v-model="jt1078TempStrParamValue" placeholder="请输入参数值" size="small" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="addStrParam" icon="Plus" size="small">添加字符参数</el-button>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-tab-pane>
          
          <!-- 终端音视频属性标签页 -->
          <el-tab-pane label="终端音视频属性" name="terminalAVProperties">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              终端音视频属性
            </div>
            <div v-if="jt1078TerminalAVPropertiesResult" style="margin-top: 20px;">
              <div class="terminal-params-table-wrapper">
                <el-table :data="Object.entries(jt1078TerminalAVPropertiesResult).map(([key, value]) => ({ key, value }))" border style="width: 100%;">
                  <el-table-column prop="key" label="属性名" width="180">
                    <template #default="{ row }">
                      {{ jt1078TerminalAVPropertiesFieldMap[row.key] || row.key }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="属性值">
                    <template #default="{ row }">
                      <span v-if="typeof row.value === 'boolean'">{{ row.value ? '是' : '否' }}</span>
                      <span v-else-if="typeof row.value === 'object'">{{ JSON.stringify(row.value, null, 2) }}</span>
                      <span v-else>{{ row.value }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <el-empty v-else description="暂无属性数据，请点击查询按钮获取属性" style="padding: 40px 0;" />
            <div style="margin-top: 20px; text-align: center;">
              <el-button type="primary" @click="handleQueryTerminalAVProperties" :loading="jt1078ParamsLoading">查询终端音视频属性</el-button>
            </div>
          </el-tab-pane>
          
          <!-- 查询指定终端参数标签页 -->
          <el-tab-pane label="查询指定参数" name="querySpecific">
            <el-form :model="jt1078QuerySpecificForm" label-width="100px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="参数ID列表">
                <el-input 
                  v-model="jt1078QuerySpecificForm.ids" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入参数ID，多个用逗号分隔，如：0,1,2,3" 
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQuerySpecificTerminalParams" :loading="jt1078ParamsLoading" icon="Search">查询指定参数</el-button>
                <el-button type="success" @click="handleSetQuerySpecificParams" :loading="jt1078ParamsLoading" icon="Check" :disabled="!hasQuerySpecificModifiedParams">保存修改</el-button>
              </el-form-item>
            </el-form>
            
            <div v-if="jt1078QuerySpecificEditableParams && jt1078QuerySpecificEditableParams.length > 0" style="margin-top: 20px;">
              <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">查询结果（可编辑）</div>
              <div class="terminal-params-table-wrapper">
                <el-table :data="jt1078QuerySpecificEditableParams" border style="width: 100%;">
                  <el-table-column prop="key" label="参数ID" width="120" />
                  <el-table-column prop="value" label="参数值">
                    <template #default="{ row }">
                      <el-input
                        v-if="typeof row.originalValue === 'number'"
                        v-model.number="row.editableValue"
                        type="number"
                        size="small"
                        placeholder="请输入数值"
                      />
                      <div v-else-if="typeof row.originalValue === 'object'" style="width: 100%;">
                        <el-input
                          v-model="row.editableValue"
                          type="textarea"
                          :rows="4"
                          size="small"
                          placeholder="请输入JSON格式数据"
                          readonly
                        />
                        <div style="font-size: 12px; color: var(--el-text-color-secondary); margin-top: 4px;">
                          ⚠️ 对象类型参数暂不支持编辑
                        </div>
                      </div>
                      <el-input
                        v-else
                        v-model="row.editableValue"
                        size="small"
                        placeholder="请输入字符"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
          
          <!-- 终端控制标签页 -->
          <el-tab-pane label="终端控制" name="control">
            <el-form :model="jt1078ControlForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="命令类型">
                <el-select v-model="jt1078ControlForm.command" placeholder="请选择命令">
                  <el-option label="1 - 无线升级" :value="1" />
                  <el-option label="2 - 控制终端连接指定服务器" :value="2" />
                  <el-option label="3 - 终端关机" :value="3" />
                  <el-option label="4 - 终端复位" :value="4" />
                  <el-option label="5 - 终端恢复出厂设置" :value="5" />
                  <el-option label="6 - 关闭数据通信" :value="6" />
                  <el-option label="7 - 关闭所有无线通信" :value="7" />
                </el-select>
              </el-form-item>
              <el-form-item label="命令参数">
                <el-input 
                  v-model="jt1078ControlForm.parameter" 
                  type="textarea" 
                  :rows="3" 
                  placeholder="请输入命令参数（可选）" 
                />
              </el-form-item>
              <el-form-item>
                <el-button type="danger" @click="handleTerminalControl" :loading="jt1078ParamsLoading" icon="SwitchButton">执行控制</el-button>
              </el-form-item>
            </el-form>
            
            <el-alert
              v-if="jt1078ControlResult"
              title="执行结果"
              :type="jt1078ControlResult.success ? 'success' : 'error'"
              :description="jt1078ControlResult.message"
              style="margin-top: 20px;"
            />
          </el-tab-pane>
          
          <!-- 终端属性标签页 -->
          <el-tab-pane label="终端属性" name="attribute">
            <div v-if="jt1078TerminalAttribute && Object.keys(jt1078TerminalAttribute).length > 0">
              <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
                终端属性
                <el-button type="primary" size="small" @click="handleQueryJt1078Attribute" style="margin-left: 10px;" icon="Refresh">刷新</el-button>
              </div>
              <div class="terminal-params-table-wrapper">
                <el-table :data="Object.entries(jt1078TerminalAttribute).map(([key, value]) => ({ key, value }))" border style="width: 100%;">
                  <el-table-column prop="key" label="属性名" width="180">
                    <template #default="{ row }">
                      {{ jt1078AttributeFieldMap[row.key] || row.key }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="属性值">
                    <template #default="{ row }">
                      <span v-if="typeof row.value === 'object'">{{ JSON.stringify(row.value, null, 2) }}</span>
                      <span v-else>{{ row.value }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <el-empty v-else description="暂无属性数据，请点击查询按钮获取属性" style="padding: 40px 0;" />
          </el-tab-pane>

          <!-- 位置信息查询标签页 -->
          <el-tab-pane label="位置信息" name="location">
            <div v-if="jt1078Location && Object.keys(jt1078Location).length > 0">
              <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
                位置信息
                <el-button type="primary" size="small" @click="handleQueryJt1078Location" style="margin-left: 10px;" icon="Refresh">刷新</el-button>
              </div>
              <div class="terminal-params-table-wrapper">
                <el-table :data="Object.entries(jt1078Location).map(([key, value]) => ({ key, value }))" border style="width: 100%;">
                  <el-table-column prop="key" label="属性名" width="180">
                    <template #default="{ row }">
                      {{ jt1078LocationFieldMap[row.key] || row.key }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="属性值">
                    <template #default="{ row }">
                      <span v-if="typeof row.value === 'object'">{{ JSON.stringify(row.value, null, 2) }}</span>
                      <span v-else>{{ row.value }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <el-empty v-else description="暂无位置数据，请点击查询按钮获取位置" style="padding: 40px 0;" />
          </el-tab-pane>

          <!-- 临时位置跟踪控制标签页 -->
          <el-tab-pane label="位置跟踪" name="locationTrack">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              临时位置跟踪控制
            </div>
            <el-form :model="jt1078TempLocationForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="时间间隔(秒)">
                <el-input-number v-model="jt1078TempLocationForm.interval" :min="1" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="有效期(秒)">
                <el-input-number v-model="jt1078TempLocationForm.validityPeriod" :min="1" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTempLocationTrack" :loading="jt1078ParamsLoading" icon="SetUp">执行控制</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 人工确认报警消息标签页 -->
          <el-tab-pane label="报警确认" name="alarmConfirm">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              人工确认报警消息
            </div>
            <el-form :model="jt1078AlarmConfirmForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="消息流水号">
                <el-input-number v-model="jt1078AlarmConfirmForm.responseSerialNo" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="报警类型">
                <el-select v-model="jt1078AlarmConfirmForm.type" placeholder="请选择报警类型" size="small" style="width: 100%;">
                  <el-option label="0-确认紧急报警" :value="0" />
                  <el-option label="3-确认危险预警" :value="3" />
                  <el-option label="20-确认进出区域报警" :value="20" />
                  <el-option label="21-确认进出路线报警" :value="21" />
                  <el-option label="22-确认路段行驶时间不足/过长报警" :value="22" />
                  <el-option label="27-确认车辆非法点火报警" :value="27" />
                  <el-option label="28-确认车辆非法位移报警" :value="28" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleConfirmAlarm" :loading="jt1078ParamsLoading" icon="Check">确认报警</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 链路检测标签页 -->
          <el-tab-pane label="链路检测" name="linkCheck">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              服务器向终端发起链路检测请求
            </div>
            <div style="margin-top: 20px;">
              <el-button type="primary" @click="handleLinkCheck" :loading="jt1078ParamsLoading" icon="Connection">执行检测</el-button>
            </div>
            <el-alert
              v-if="jt1078LinkCheckResult"
              title="检测结果"
              type="success"
              :description="JSON.stringify(jt1078LinkCheckResult, null, 2)"
              style="margin-top: 20px;"
            />
          </el-tab-pane>

          <!-- 文本信息下发标签页 -->
          <el-tab-pane label="文本下发" name="textSend">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              文本信息下发
            </div>
            <el-form :model="jt1078TextForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="标志">
                <el-checkbox-group v-model="jt1078TextForm.signBits" style="width: 100%;">
                  <el-checkbox :label="1 << 0">紧急</el-checkbox>
                  <el-checkbox :label="1 << 2">终端显示器显示</el-checkbox>
                  <el-checkbox :label="1 << 3">终端 TTS 播读</el-checkbox>
                  <el-checkbox :label="1 << 4">广告屏显示</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="jt1078TextForm.type" size="small" style="width: 100%;">
                  <el-option label="通知" :value="1" />
                  <el-option label="服务" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="文本内容">
                <el-input v-model="jt1078TextForm.content" type="textarea" :rows="4" size="small" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSendText" :loading="jt1078ParamsLoading">下发文本</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 事件设置标签页 -->
          <el-tab-pane label="事件设置" name="eventSetting">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              事件设置
            </div>
            <el-form :model="jt1078EventForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="设置类型">
                <el-select v-model="jt1078EventForm.type" size="small" style="width: 100%;">
                  <el-option label="清空" :value="0" />
                  <el-option label="更新(先清空,后追加)" :value="1" />
                  <el-option label="追加" :value="2" />
                  <el-option label="修改" :value="3" />
                  <el-option label="指定删除" :value="4" />
                </el-select>
              </el-form-item>
              <el-form-item label="事件列表">
                <div style="width: 100%;">
                  <div v-for="(event, index) in jt1078EventForm.events" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="event.id" :min="0" size="small" placeholder="事件ID" style="flex: 1;" />
                    <el-input v-model="event.content" size="small" placeholder="内容" style="flex: 2;" />
                    <el-button type="danger" size="small" @click="jt1078EventForm.events.splice(index, 1)" icon="Delete">删除</el-button>
                  </div>
                  <el-button type="primary" size="small" @click="jt1078EventForm.events.push({ id: 0, content: '' })" icon="Plus">添加事件</el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleEventSetting" :loading="jt1078ParamsLoading">设置事件</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 提问下发标签页 -->
          <el-tab-pane label="提问下发" name="questionSend">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              提问下发
            </div>
            <el-form :model="jt1078QuestionForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="标志">
                <el-checkbox-group v-model="jt1078QuestionForm.signBits" style="width: 100%;">
                  <el-checkbox :label="1 << 0">紧急</el-checkbox>
                  <el-checkbox :label="1 << 2">终端显示器显示</el-checkbox>
                  <el-checkbox :label="1 << 3">终端 TTS 播读</el-checkbox>
                  <el-checkbox :label="1 << 4">广告屏显示</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="问题内容">
                <el-input v-model="jt1078QuestionForm.content" type="textarea" :rows="3" size="small" />
              </el-form-item>
              <el-form-item label="候选答案">
                <div style="width: 100%;">
                  <div v-for="(option, index) in jt1078QuestionForm.options" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="option.id" :min="0" size="small" placeholder="答案ID" style="flex: 1;" />
                    <el-input v-model="option.content" size="small" placeholder="答案内容" style="flex: 2;" />
                    <el-button type="danger" size="small" @click="jt1078QuestionForm.options.splice(index, 1)" icon="Delete">删除</el-button>
                  </div>
                  <el-button type="primary" size="small" @click="jt1078QuestionForm.options.push({ id: 0, content: '' })" icon="Plus">添加答案</el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSendQuestion" :loading="jt1078ParamsLoading">下发提问</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 信息点播菜单设置标签页 -->
          <el-tab-pane label="菜单设置" name="menuSetting">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              信息点播菜单设置
            </div>
            <el-form :model="jt1078MenuForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="设置类型">
                <el-select v-model="jt1078MenuForm.type" size="small" style="width: 100%;">
                  <el-option label="清空" :value="0" />
                  <el-option label="更新(先清空,后追加)" :value="1" />
                  <el-option label="追加" :value="2" />
                  <el-option label="修改" :value="3" />
                  <el-option label="指定删除" :value="4" />
                </el-select>
              </el-form-item>
              <el-form-item label="信息项列表">
                <div style="width: 100%;">
                  <div v-for="(info, index) in jt1078MenuForm.infos" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="info.type" :min="0" size="small" placeholder="信息类型" style="flex: 1;" />
                    <el-input v-model="info.name" size="small" placeholder="信息名称" style="flex: 2;" />
                    <el-button type="danger" size="small" @click="jt1078MenuForm.infos.splice(index, 1)" icon="Delete">删除</el-button>
                  </div>
                  <el-button type="primary" size="small" @click="jt1078MenuForm.infos.push({ type: 0, name: '' })" icon="Plus">添加信息</el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleMenuSetting" :loading="jt1078ParamsLoading">设置菜单</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 信息服务标签页 -->
          <el-tab-pane label="信息服务" name="infoService">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              信息服务
            </div>
            <el-form :model="jt1078InfoServiceForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="信息类型">
                <el-input-number v-model="jt1078InfoServiceForm.type" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="文本信息">
                <el-input v-model="jt1078InfoServiceForm.content" type="textarea" :rows="4" size="small" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleInfoService" :loading="jt1078ParamsLoading">发送信息</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 电话回拨标签页 -->
          <el-tab-pane label="电话回拨" name="phoneCallback">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              电话回拨
            </div>
            <el-form :model="jt1078PhoneCallbackForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="类型">
                <el-select v-model="jt1078PhoneCallbackForm.type" size="small" style="width: 100%;">
                  <el-option label="通话" :value="0" />
                  <el-option label="监听" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="电话号码">
                <el-input v-model="jt1078PhoneCallbackForm.phoneNumber" size="small" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handlePhoneCallback" :loading="jt1078ParamsLoading">回拨电话</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 设置电话本标签页 -->
          <el-tab-pane label="电话本" name="phoneBook">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              设置电话本
            </div>
            <el-form :model="jt1078PhoneBookForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="设置类型">
                <el-select v-model="jt1078PhoneBookForm.type" size="small" style="width: 100%;">
                  <el-option label="清空" :value="0" />
                  <el-option label="更新(先清空,后追加)" :value="1" />
                  <el-option label="追加" :value="2" />
                  <el-option label="修改" :value="3" />
                  <el-option label="指定删除" :value="4" />
                </el-select>
              </el-form-item>
              <el-form-item label="联系人列表">
                <div style="width: 100%;">
                  <div v-for="(contact, index) in jt1078PhoneBookForm.contacts" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="contact.sign" :min="0" size="small" placeholder="标志" style="flex: 1;" />
                    <el-input v-model="contact.phone" size="small" placeholder="电话号码" style="flex: 2;" />
                    <el-input v-model="contact.name" size="small" placeholder="联系人" style="flex: 2;" />
                    <el-button type="danger" size="small" @click="jt1078PhoneBookForm.contacts.splice(index, 1)" icon="Delete">删除</el-button>
                  </div>
                  <el-button type="primary" size="small" @click="jt1078PhoneBookForm.contacts.push({ sign: 0, phone: '', name: '' })" icon="Plus">添加联系人</el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSetPhoneBook" :loading="jt1078ParamsLoading">设置电话本</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 车辆控制标签页 -->
          <el-tab-pane label="车辆控制" name="vehicleControl">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              车辆控制
            </div>
            <el-form :model="jt1078VehicleControlForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="控制类型">
                <el-select v-model="jt1078VehicleControlForm.type" size="small" style="width: 100%;">
                  <el-option label="车门加锁" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="控制标志">
                <el-select v-model="jt1078VehicleControlForm.param" size="small" style="width: 100%;">
                  <el-option label="车门解锁" :value="0" />
                  <el-option label="车门加锁" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleVehicleControl" :loading="jt1078ParamsLoading">执行控制</el-button>
              </el-form-item>
            </el-form>
            <el-alert
              v-if="jt1078VehicleControlResult"
              title="控制结果"
              type="success"
              :description="JSON.stringify(jt1078VehicleControlResult, null, 2)"
              style="margin-top: 20px;"
            />
          </el-tab-pane>

          <!-- 圆形区域标签页 -->
          <el-tab-pane label="圆形区域" name="circleArea">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              设置圆形区域
            </div>
            <el-form :model="jt1078CircleAreaForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="设置属性">
                <el-select v-model="jt1078CircleAreaForm.action" size="small" style="width: 100%;">
                  <el-option label="更新(先清空,后追加)" :value="1" />
                  <el-option label="追加" :value="2" />
                  <el-option label="修改" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="区域列表">
                <div v-for="(item, index) in jt1078CircleAreaForm.items" :key="index" style="border: 1px solid #e6e6e6; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.id" :min="0" size="small" placeholder="区域ID" style="flex: 1;" />
                    <el-input-number v-model="item.attribute" :min="0" size="small" placeholder="区域属性" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.latitude" :min="0" size="small" placeholder="中心点纬度" style="flex: 1;" />
                    <el-input-number v-model="item.longitude" :min="0" size="small" placeholder="中心点经度" style="flex: 1;" />
                    <el-input-number v-model="item.radius" :min="0" size="small" placeholder="半径(米)" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-date-picker v-model="item.startTime" type="datetime" placeholder="起始时间" size="small" style="flex: 1;" />
                    <el-date-picker v-model="item.endTime" type="datetime" placeholder="结束时间" size="small" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.maxSpeed" :min="0" size="small" placeholder="最高速度" style="flex: 1;" />
                    <el-input-number v-model="item.duration" :min="0" size="small" placeholder="超速持续时间" style="flex: 1;" />
                    <el-input-number v-model="item.nightMaxSpeed" :min="0" size="small" placeholder="夜间最高速度" style="flex: 1;" />
                  </div>
                  <el-input v-model="item.name" placeholder="区域名称" size="small" style="margin-bottom: 10px;" />
                  <el-button type="danger" size="small" @click="jt1078CircleAreaForm.items.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078CircleAreaForm.items.push({ id: 0, attribute: 0, latitude: 0, longitude: 0, radius: 0, startTime: '', endTime: '', maxSpeed: null, duration: null, nightMaxSpeed: null, name: '' })" icon="Plus">添加区域</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSetCircleArea" :loading="jt1078ParamsLoading">设置圆形区域</el-button>
              </el-form-item>
            </el-form>
            
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: 30px;">
              删除圆形区域
            </div>
            <el-form :model="jt1078DeleteCircleForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="区域ID列表">
                <div v-for="(id, index) in jt1078DeleteCircleForm.ids" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <el-input-number v-model="jt1078DeleteCircleForm.ids[index]" :min="0" size="small" placeholder="区域ID" style="flex: 1;" />
                  <el-button type="danger" size="small" @click="jt1078DeleteCircleForm.ids.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078DeleteCircleForm.ids.push(0)" icon="Plus">添加ID</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleDeleteCircleArea" :loading="jt1078ParamsLoading">删除圆形区域</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 矩形区域标签页 -->
          <el-tab-pane label="矩形区域" name="rectArea">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              设置矩形区域
            </div>
            <el-form :model="jt1078RectAreaForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="设置属性">
                <el-select v-model="jt1078RectAreaForm.action" size="small" style="width: 100%;">
                  <el-option label="更新(先清空,后追加)" :value="1" />
                  <el-option label="追加" :value="2" />
                  <el-option label="修改" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="区域列表">
                <div v-for="(item, index) in jt1078RectAreaForm.items" :key="index" style="border: 1px solid #e6e6e6; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.id" :min="0" size="small" placeholder="区域ID" style="flex: 1;" />
                    <el-input-number v-model="item.attribute" :min="0" size="small" placeholder="区域属性" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.latitudeUL" :min="0" size="small" placeholder="左上角纬度" style="flex: 1;" />
                    <el-input-number v-model="item.longitudeUL" :min="0" size="small" placeholder="左上角经度" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.latitudeLR" :min="0" size="small" placeholder="右下角纬度" style="flex: 1;" />
                    <el-input-number v-model="item.longitudeLR" :min="0" size="small" placeholder="右下角经度" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-date-picker v-model="item.startTime" type="datetime" placeholder="起始时间" size="small" style="flex: 1;" />
                    <el-date-picker v-model="item.endTime" type="datetime" placeholder="结束时间" size="small" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.maxSpeed" :min="0" size="small" placeholder="最高速度" style="flex: 1;" />
                    <el-input-number v-model="item.duration" :min="0" size="small" placeholder="超速持续时间" style="flex: 1;" />
                    <el-input-number v-model="item.nightMaxSpeed" :min="0" size="small" placeholder="夜间最高速度" style="flex: 1;" />
                  </div>
                  <el-input v-model="item.name" placeholder="区域名称" size="small" style="margin-bottom: 10px;" />
                  <el-button type="danger" size="small" @click="jt1078RectAreaForm.items.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078RectAreaForm.items.push({ id: 0, attribute: 0, latitudeUL: 0, longitudeUL: 0, latitudeLR: 0, longitudeLR: 0, startTime: '', endTime: '', maxSpeed: null, duration: null, nightMaxSpeed: null, name: '' })" icon="Plus">添加区域</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSetRectArea" :loading="jt1078ParamsLoading">设置矩形区域</el-button>
              </el-form-item>
            </el-form>
            
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: 30px;">
              删除矩形区域
            </div>
            <el-form :model="jt1078DeleteRectForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="区域ID列表">
                <div v-for="(id, index) in jt1078DeleteRectForm.ids" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <el-input-number v-model="jt1078DeleteRectForm.ids[index]" :min="0" size="small" placeholder="区域ID" style="flex: 1;" />
                  <el-button type="danger" size="small" @click="jt1078DeleteRectForm.ids.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078DeleteRectForm.ids.push(0)" icon="Plus">添加ID</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleDeleteRectArea" :loading="jt1078ParamsLoading">删除矩形区域</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 多边形区域标签页 -->
          <el-tab-pane label="多边形区域" name="polygonArea">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              设置多边形区域
            </div>
            <el-form :model="jt1078PolygonAreaForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="区域ID">
                <el-input-number v-model="jt1078PolygonAreaForm.id" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="区域属性">
                <el-input-number v-model="jt1078PolygonAreaForm.attribute" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="起始时间">
                <el-date-picker v-model="jt1078PolygonAreaForm.startTime" type="datetime" placeholder="起始时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker v-model="jt1078PolygonAreaForm.endTime" type="datetime" placeholder="结束时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="最高速度">
                <el-input-number v-model="jt1078PolygonAreaForm.maxSpeed" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="超速持续时间">
                <el-input-number v-model="jt1078PolygonAreaForm.duration" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="夜间最高速度">
                <el-input-number v-model="jt1078PolygonAreaForm.nightMaxSpeed" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="区域名称">
                <el-input v-model="jt1078PolygonAreaForm.name" placeholder="区域名称" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="顶点列表">
                <div v-for="(point, index) in jt1078PolygonAreaForm.points" :key="index" style="border: 1px solid #e6e6e6; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                  <div style="display: flex; gap: 10px;">
                    <el-input-number v-model="point.latitude" :min="0" size="small" placeholder="纬度" style="flex: 1;" />
                    <el-input-number v-model="point.longitude" :min="0" size="small" placeholder="经度" style="flex: 1;" />
                  </div>
                  <el-button type="danger" size="small" @click="jt1078PolygonAreaForm.points.splice(index, 1)" icon="Delete" style="margin-top: 10px;">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078PolygonAreaForm.points.push({ latitude: 0, longitude: 0 })" icon="Plus">添加顶点</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSetPolygonArea" :loading="jt1078ParamsLoading">设置多边形区域</el-button>
              </el-form-item>
            </el-form>
            
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: 30px;">
              删除多边形区域
            </div>
            <el-form :model="jt1078DeletePolygonForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="区域ID列表">
                <div v-for="(id, index) in jt1078DeletePolygonForm.ids" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <el-input-number v-model="jt1078DeletePolygonForm.ids[index]" :min="0" size="small" placeholder="区域ID" style="flex: 1;" />
                  <el-button type="danger" size="small" @click="jt1078DeletePolygonForm.ids.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078DeletePolygonForm.ids.push(0)" icon="Plus">添加ID</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleDeletePolygonArea" :loading="jt1078ParamsLoading">删除多边形区域</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 路线管理标签页 -->
          <el-tab-pane label="路线管理" name="routeManagement">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              设置路线
            </div>
            <el-form :model="jt1078RouteForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="路线ID">
                <el-input-number v-model="jt1078RouteForm.id" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="路线属性">
                <el-input-number v-model="jt1078RouteForm.attribute" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="起始时间">
                <el-date-picker v-model="jt1078RouteForm.startTime" type="datetime" placeholder="起始时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker v-model="jt1078RouteForm.endTime" type="datetime" placeholder="结束时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="路线名称">
                <el-input v-model="jt1078RouteForm.name" placeholder="路线名称" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="路线点列表">
                <div v-for="(item, index) in jt1078RouteForm.items" :key="index" style="border: 1px solid #e6e6e6; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.id" :min="0" size="small" placeholder="点ID" style="flex: 1;" />
                    <el-input-number v-model="item.routeId" :min="0" size="small" placeholder="路线ID" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.latitude" :min="0" size="small" placeholder="纬度" style="flex: 1;" />
                    <el-input-number v-model="item.longitude" :min="0" size="small" placeholder="经度" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.width" :min="0" size="small" placeholder="路段宽度" style="flex: 1;" />
                    <el-input-number v-model="item.attribute" :min="0" size="small" placeholder="路段属性" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.upperLimit" :min="0" size="small" placeholder="上限速度" style="flex: 1;" />
                    <el-input-number v-model="item.lowerLimit" :min="0" size="small" placeholder="下限速度" style="flex: 1;" />
                    <el-input-number v-model="item.maxSpeed" :min="0" size="small" placeholder="最高速度" style="flex: 1;" />
                  </div>
                  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <el-input-number v-model="item.duration" :min="0" size="small" placeholder="超速持续时间" style="flex: 1;" />
                    <el-input-number v-model="item.nightMaxSpeed" :min="0" size="small" placeholder="夜间最高速度" style="flex: 1;" />
                  </div>
                  <el-button type="danger" size="small" @click="jt1078RouteForm.items.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078RouteForm.items.push({ id: 0, routeId: 0, latitude: 0, longitude: 0, width: 0, attribute: 0, upperLimit: null, lowerLimit: null, maxSpeed: null, duration: null, nightMaxSpeed: null })" icon="Plus">添加路线点</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSetRoute" :loading="jt1078ParamsLoading">设置路线</el-button>
              </el-form-item>
            </el-form>
            
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: 30px;">
              删除路线
            </div>
            <el-form :model="jt1078DeleteRouteForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="路线ID列表">
                <div v-for="(id, index) in jt1078DeleteRouteForm.ids" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <el-input-number v-model="jt1078DeleteRouteForm.ids[index]" :min="0" size="small" placeholder="路线ID" style="flex: 1;" />
                  <el-button type="danger" size="small" @click="jt1078DeleteRouteForm.ids.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078DeleteRouteForm.ids.push(0)" icon="Plus">添加ID</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleDeleteRoute" :loading="jt1078ParamsLoading">删除路线</el-button>
              </el-form-item>
            </el-form>

            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: 30px;">
              查询区域或线路数据
            </div>
            <el-form :model="jt1078QueryAreaForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="查询类型">
                <el-select v-model="jt1078QueryAreaForm.type" size="small" style="width: 100%;">
                  <el-option label="圆形区域" :value="1" />
                  <el-option label="矩形区域" :value="2" />
                  <el-option label="多边形区域" :value="3" />
                  <el-option label="路线" :value="4" />
                </el-select>
              </el-form-item>
              <el-form-item label="ID列表">
                <div v-for="(id, index) in jt1078QueryAreaForm.ids" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <el-input-number v-model="jt1078QueryAreaForm.ids[index]" :min="0" size="small" placeholder="ID" style="flex: 1;" />
                  <el-button type="danger" size="small" @click="jt1078QueryAreaForm.ids.splice(index, 1)" icon="Delete">删除</el-button>
                </div>
                <el-button type="primary" size="small" @click="jt1078QueryAreaForm.ids.push(0)" icon="Plus">添加ID</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQueryAreaOrRoute" :loading="jt1078ParamsLoading">查询</el-button>
              </el-form-item>
            </el-form>
            <el-alert
              v-if="jt1078QueryAreaResult"
              title="查询结果"
              type="success"
              :description="JSON.stringify(jt1078QueryAreaResult, null, 2)"
              style="margin-top: 20px;"
            />
          </el-tab-pane>

          <!-- 行驶记录仪标签页 -->
          <el-tab-pane label="行驶记录仪" name="tachograph">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              行驶记录仪数据采集命令
            </div>
            <el-form label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item>
                <el-button type="primary" @click="handleTachographDataCollect" :loading="jt1078ParamsLoading">发送数据采集命令</el-button>
              </el-form-item>
            </el-form>
            
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: 30px;">
              行驶记录仪参数下传命令
            </div>
            <el-form :model="jt1078TachographParamSendForm" label-width="120px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="命令字">
                <el-select v-model="jt1078TachographParamSendForm.type" size="small" style="width: 100%;">
                  <el-option label="130-设置车辆信息" :value="130" />
                  <el-option label="131-设置记录仪初次安装日期" :value="131" />
                  <el-option label="132-设置状态配置信息" :value="132" />
                  <el-option label="194-设置记录仪时间" :value="194" />
                  <el-option label="195-设置记录仪脉冲系数" :value="195" />
                  <el-option label="196-设置初始里程" :value="196" />
                </el-select>
              </el-form-item>
              <el-form-item label="数据内容">
                <el-input v-model="jt1078TachographParamSendForm.content" type="textarea" :rows="4" placeholder="输入数据内容（可选）" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTachographParamSend" :loading="jt1078ParamsLoading">下传参数</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 驾驶员身份信息标签页 -->
          <el-tab-pane label="驾驶员身份" name="driverInfo">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              驾驶员身份信息
            </div>
            <div v-if="jt1078DriverInfoResult" style="margin-top: 20px;">
              <div class="terminal-params-table-wrapper">
                <el-table :data="Object.entries(jt1078DriverInfoResult).map(([key, value]) => ({ key, value }))" border style="width: 100%;">
                  <el-table-column prop="key" label="属性名" width="180">
                    <template #default="{ row }">
                      {{ jt1078DriverInfoFieldMap[row.key] || row.key }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="属性值">
                    <template #default="{ row }">
                      <span v-if="typeof row.value === 'boolean'">{{ row.value ? '是' : '否' }}</span>
                      <span v-else-if="typeof row.value === 'object'">{{ JSON.stringify(row.value, null, 2) }}</span>
                      <span v-else>{{ row.value }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <el-empty v-else description="暂无驾驶员身份数据，请点击查询按钮获取" style="padding: 40px 0;" />
            <div style="margin-top: 20px; text-align: center;">
              <el-button type="primary" @click="handleReportDriverInfo" :loading="jt1078ParamsLoading">请求上报驾驶员身份信息</el-button>
            </div>
          </el-tab-pane>

          <!-- 摄像头拍摄标签页 -->
          <el-tab-pane label="摄像头拍摄" name="cameraShoot">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              摄像头立即拍摄命令
            </div>
            <el-form :model="jt1078CameraShootForm" label-width="140px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="通道ID">
                <el-input-number v-model="jt1078CameraShootForm.channelId" :min="1" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="拍摄命令">
                <el-select v-model="jt1078CameraShootForm.command" size="small" style="width: 100%;">
                  <el-option label="停止拍摄" :value="0" />
                  <el-option label="录像" :value="65535" />
                  <el-option label="拍照1张" :value="1" />
                  <el-option label="拍照2张" :value="2" />
                  <el-option label="拍照3张" :value="3" />
                  <el-option label="拍照4张" :value="4" />
                  <el-option label="拍照5张" :value="5" />
                </el-select>
              </el-form-item>
              <el-form-item label="拍照间隔/录像时间(秒)">
                <el-input-number v-model="jt1078CameraShootForm.time" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="保存标志">
                <el-select v-model="jt1078CameraShootForm.save" size="small" style="width: 100%;">
                  <el-option label="实时上传" :value="0" />
                  <el-option label="保存" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="分辨率">
                <el-select v-model="jt1078CameraShootForm.resolution" size="small" style="width: 100%;">
                  <el-option label="320x240" :value="1" />
                  <el-option label="640x480" :value="2" />
                  <el-option label="800x600" :value="3" />
                  <el-option label="1024x768" :value="4" />
                  <el-option label="176x144 (QCIF)" :value="5" />
                  <el-option label="352x288 (CIF)" :value="6" />
                  <el-option label="704x288 (HALF D1)" :value="7" />
                  <el-option label="704x576 (D1)" :value="8" />
                </el-select>
              </el-form-item>
              <el-form-item label="图像/视频质量(1-10)">
                <el-input-number v-model="jt1078CameraShootForm.quality" :min="1" :max="10" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="亮度(0-255)">
                <el-input-number v-model="jt1078CameraShootForm.brightness" :min="0" :max="255" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="对比度(0-127)">
                <el-input-number v-model="jt1078CameraShootForm.contrast" :min="0" :max="127" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="饱和度(0-127)">
                <el-input-number v-model="jt1078CameraShootForm.saturation" :min="0" :max="127" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="色度(0-255)">
                <el-input-number v-model="jt1078CameraShootForm.chroma" :min="0" :max="255" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleCameraShoot" :loading="jt1078ParamsLoading">发送拍摄命令</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 多媒体数据标签页 -->
          <el-tab-pane label="多媒体数据" name="multimedia">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              存储多媒体数据检索
            </div>
            <el-form :model="jt1078SearchMultimediaForm" label-width="140px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="多媒体类型">
                <el-select v-model="jt1078SearchMultimediaForm.type" size="small" style="width: 100%;">
                  <el-option label="图像" :value="0" />
                  <el-option label="音频" :value="1" />
                  <el-option label="视频" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="通道ID(0=全部)">
                <el-input-number v-model="jt1078SearchMultimediaForm.channelId" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="事件项编码">
                <el-select v-model="jt1078SearchMultimediaForm.event" size="small" style="width: 100%;">
                  <el-option label="平台下发指令" :value="0" />
                  <el-option label="定时动作" :value="1" />
                  <el-option label="抢劫报警触发" :value="2" />
                  <el-option label="碰撞侧翻报警触发" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="起始时间">
                <el-date-picker v-model="jt1078SearchMultimediaForm.startTime" type="datetime" placeholder="选择日期时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker v-model="jt1078SearchMultimediaForm.endTime" type="datetime" placeholder="选择日期时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearchMultimedia" :loading="jt1078ParamsLoading">检索多媒体数据</el-button>
              </el-form-item>
            </el-form>
            <el-alert
              v-if="jt1078SearchMultimediaResult"
              title="检索结果"
              type="success"
              :description="JSON.stringify(jt1078SearchMultimediaResult, null, 2)"
              style="margin-top: 20px;"
            />
            
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px; margin-top: 30px;">
              存储多媒体数据上传
            </div>
            <el-form :model="jt1078UploadMultimediaForm" label-width="140px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="多媒体类型">
                <el-select v-model="jt1078UploadMultimediaForm.type" size="small" style="width: 100%;">
                  <el-option label="图像" :value="0" />
                  <el-option label="音频" :value="1" />
                  <el-option label="视频" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="通道ID">
                <el-input-number v-model="jt1078UploadMultimediaForm.channelId" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="事件项编码">
                <el-select v-model="jt1078UploadMultimediaForm.event" size="small" style="width: 100%;">
                  <el-option label="平台下发指令" :value="0" />
                  <el-option label="定时动作" :value="1" />
                  <el-option label="抢劫报警触发" :value="2" />
                  <el-option label="碰撞侧翻报警触发" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="起始时间">
                <el-date-picker v-model="jt1078UploadMultimediaForm.startTime" type="datetime" placeholder="选择日期时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker v-model="jt1078UploadMultimediaForm.endTime" type="datetime" placeholder="选择日期时间" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="删除标志">
                <el-select v-model="jt1078UploadMultimediaForm.delete" size="small" style="width: 100%;">
                  <el-option label="保留" :value="0" />
                  <el-option label="删除" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUploadMultimedia" :loading="jt1078ParamsLoading">上传多媒体数据</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 录音标签页 -->
          <el-tab-pane label="录音" name="recording">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              录音开始命令
            </div>
            <el-form :model="jt1078StartRecordingForm" label-width="140px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="录音命令">
                <el-select v-model="jt1078StartRecordingForm.command" size="small" style="width: 100%;">
                  <el-option label="停止录音" :value="0" />
                  <el-option label="开始录音" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="录音时间(秒)">
                <el-input-number v-model="jt1078StartRecordingForm.time" :min="0" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="保存标志">
                <el-select v-model="jt1078StartRecordingForm.save" size="small" style="width: 100%;">
                  <el-option label="实时上传" :value="0" />
                  <el-option label="保存" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="音频采样率">
                <el-select v-model="jt1078StartRecordingForm.audioSamplingRate" size="small" style="width: 100%;">
                  <el-option label="8K" :value="0" />
                  <el-option label="11K" :value="1" />
                  <el-option label="23K" :value="2" />
                  <el-option label="32K" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleStartRecording" :loading="jt1078ParamsLoading">发送录音命令</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 单条多媒体标签页 -->
          <el-tab-pane label="单条多媒体" name="singleMultimedia">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              单条存储多媒体数据检索上传命令
            </div>
            <el-form :model="jt1078SearchUploadMultimediaForm" label-width="140px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="多媒体ID">
                <el-input-number v-model="jt1078SearchUploadMultimediaForm.id" :min="1" size="small" style="width: 100%;" />
              </el-form-item>
              <el-form-item label="删除标志">
                <el-select v-model="jt1078SearchUploadMultimediaForm.delete" size="small" style="width: 100%;">
                  <el-option label="保留" :value="0" />
                  <el-option label="删除" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearchUploadMultimedia" :loading="jt1078ParamsLoading">检索上传单条多媒体</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 终端升级标签页 -->
          <el-tab-pane label="终端升级" name="terminalUpgrade">
            <div class="panel-section-title" style="font-weight: bold; font-size: 16px; margin-bottom: 15px;">
              下发终端升级包
            </div>
            <el-form :model="jt1078TerminalUpgradeForm" label-width="140px" class="data-form" style="margin-top: 20px;">
              <el-form-item label="升级类型">
                <el-select v-model="jt1078TerminalUpgradeForm.type" size="small" style="width: 100%;">
                  <el-option label="终端" :value="0" />
                  <el-option label="读卡器" :value="12" />
                  <el-option label="北斗" :value="52" />
                </el-select>
              </el-form-item>
              <el-form-item label="制造商ID">
                <el-input v-model="jt1078TerminalUpgradeForm.makerId" placeholder="终端制造商编码" size="small" />
              </el-form-item>
              <el-form-item label="版本号">
                <el-input v-model="jt1078TerminalUpgradeForm.version" placeholder="版本号" size="small" />
              </el-form-item>
              <el-form-item label="数据包">
                <el-input v-model="jt1078TerminalUpgradeForm.packet" type="textarea" :rows="4" placeholder="数据包(Base64编码)" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTerminalUpgrade" :loading="jt1078ParamsLoading">下发升级包</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="dialog-footer" style="margin-top: 20px;">
        <el-button @click="jt1078ParamsDialogVisible = false">关闭</el-button>
        <el-button v-if="jt1078ParamsTabActive === 'params'" type="primary" @click="handleQueryJt1078Params" :loading="jt1078ParamsLoading" icon="Search">查询参数</el-button>
        <el-button v-if="jt1078ParamsTabActive === 'params'" type="success" @click="handleSetJt1078Params" :loading="jt1078ParamsLoading" icon="Check" :disabled="!hasModifiedParams">保存修改</el-button>
        <el-button v-if="jt1078ParamsTabActive === 'attribute'" type="primary" @click="handleQueryJt1078Attribute" :loading="jt1078ParamsLoading" icon="Search">查询属性</el-button>
        <el-button v-if="jt1078ParamsTabActive === 'location'" type="primary" @click="handleQueryJt1078Location" :loading="jt1078ParamsLoading" icon="Search">查询位置</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Device">
import {onUnmounted, watch, nextTick, reactive, ref, getCurrentInstance, toRefs, computed} from "vue";
import useClipboard from "vue-clipboard3";
import { ElLoading } from "element-plus";
import {
  getHaiKangIsupDeviceConfig,
  setHaiKangIsupDeviceConfig,
  getHaiKangIsupVersionInfo
} from "@/api/qs/haikang-isup";
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
import {
    listHaiKangIsupDevice,
    rebootHaiKangIsupDevice,
    getHaiKangIsupDevTime,
    setHaiKangIsupDevTime,
    captureHaiKangIsupAndSave,
    downloadHaikangIsupRecordDirect,
    getHaiKangIsupDeviceInfo,
    getHaiKangIsupStorageInfo,
    getHaiKangIsupSDCardInfo,
    getHaiKangIsupBitrateInfo,
    getHaiKangIsupNetworkStatusInfo,
    getHaiKangIsupSoftwareVersionInfo,
    getHaiKangIsupPowerStateInfo,
    getHaiKangIsupCameraInfo,
    getHaiKangIsupSystemParam,
    getHaiKangIsupVideoParam,
    getHaiKangIsupSystemStatus,
    getHaiKangIsupDeviceInfoXml,
    upgradeHaiKangIsupDevice
} from "@/api/qs/haikang-isup";
import {HaikangIsupDevice, PullConfig, RTPServerParam, WSDiscoveryDevice, WSOnvifDevice} from "@/types/api";
import {
  DaHuaDevice,
  DaHuaDeviceInfo,
  DaHuaStorageInfo,
  DaHuaSystemResourceInfo,
  DaHuaSDCardInfo,
  DaHuaBitrateInfo,
  DaHuaNetworkStatusInfo,
  DaHuaSoftwareVersionInfo,
  DaHuaRecordStateInfo,
  DaHuaPowerStateInfo,
  DaHuaAlarmArmInfo,
  DaHuaCameraInfo,
  DaHuaRtspUrlInfo,
  DaHuaRecordDownloadRequest,
  DaHuaRecordDownloadResponse
} from "@/types/api/qs/dahua";
import {
  listDaHuaDevice, getDaHuaTime, setDaHuaTime, rebootDaHuaDevice, getDaHuaDeviceInfo, getDaHuaSystemParam,
  getDaHuaVideoParam, setDaHuaVideoParam, getDaHuaDeviceVideoParam, setDaHuaDeviceVideoParam, captureDaHuaAndSave,
  getDaHuaStorageInfo, getDaHuaSystemResourceInfo, getDaHuaSDCardInfo, getDaHuaBitrateInfo,
  getDaHuaNetworkStatusInfo, getDaHuaSoftwareVersionInfo, getDaHuaRecordStateInfo, getDaHuaPowerStateInfo,
  getDaHuaAlarmArmInfo, getDaHuaCameraInfo, getDaHuaRtspUrlInfo, downloadDaHuaRecord, downloadDaHuaRecordDirect
} from "@/api/qs/dahua";
import { 
  queryHaiKangRecord, 
  downloadHaikangRecordDirect, 
  captureHaikangAndSave, 
  getHaiKangDeviceInfo,
  getHaiKangStorageInfo,
  getHaiKangSDCardInfo,
  getHaiKangBitrateInfo,
  getHaiKangNetworkStatusInfo,
  getHaiKangSoftwareVersionInfo,
  getHaiKangRecordStateInfo,
  getHaiKangPowerStateInfo,
  getHaiKangAlarmArmInfo,
  getHaiKangCameraInfo,
  getHaiKangRtspUrlInfo,
  getHaiKangSystemParam,
  getHaiKangVideoParam,
  getHaiKangDevTime,
  setHaiKangDevTime,
  rebootHaiKangDevice
} from "@/api/qs/haikang";
import { saveAs } from "file-saver";
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
import {DocumentCopy, InfoFilled, Refresh, Sunny, Moon, SwitchButton, CircleClose, Position, Plus, Delete, Download, WindPower, List, Grid, CircleCheck, Picture, VideoCamera, MapLocation, Monitor, More, ArrowDown, Clock, Camera, Cpu, Histogram, Bell, Lock, Key, Timer, Place, OfficeBuilding, CollectionTag, Link, Medal, SetUp, Box, Connection, Odometer, Files, TrendCharts, Tools, Lightning, Warning, Loading, Search, Setting, VideoPlay, VideoPause} from '@element-plus/icons-vue'
import StreamDropdown from "@/components/Channel/streamDropdown.vue";
import { queryTerminalParams, setTerminalParams, querySpecificTerminalParams, terminalControl, queryTerminalAttribute, queryLocation, tempLocationTrack, confirmAlarm, linkCheck, sendText, eventSetting, sendQuestion, menuSetting, infoService, phoneCallback, setPhoneBook, vehicleControl, setCircleArea, deleteCircleArea, setRectArea, deleteRectArea, setPolygonArea, deletePolygonArea, setRoute, deleteRoute, queryAreaOrRoute, tachographDataCollect, tachographParamSend, reportDriverInfo, queryTerminalAVProperties, cameraShoot, searchMultimedia, uploadMultimedia, startRecording, searchUploadMultimedia, terminalUpgrade } from "@/api/qs/jt1078";
import MediaInfo from "@/components/Channel/mediaInfo.vue";
import SelectMapPosition from '@/components/SelectMapPosition';
import ChannelCode from '@/views/components/common/channelCode.vue';
import DeviceSnapshotDialog from '@/components/DeviceSnapshotDialog/index.vue';
import {getOnvifDeviceList, onvifLogin, restartOnvifDevice, syncOnvifDeviceTime, getOnvifDeviceTime, getOnvifDeviceInfo, captureOnvifAndSave, getOnvifStorageConfigurations, getOnvifStorageCapabilities, getOnvifStorageState, getOnvifNetworkInterfaces, getOnvifNetworkProtocols, getOnvifVideoSourceConfigs, getOnvifVideoEncoderConfigs, getOnvifAudioSourceConfigs, getOnvifAudioEncoderConfigs, getOnvifVideoOutputConfigs} from "@/api/qs/onvif";
import {getAllDevices, getChannelsByDeviceId, refreshDevice, rebootGb28181Device, recordCmd, queryDeviceStatus, queryDeviceInfo, subscribeCatalog, unsubscribeCatalog, queryDeviceConfig, updateDeviceConfig, queryHomePosition, updateHomePosition, queryCruiseTrackList, queryCruiseTrack, queryPTZPosition, homePositionControl, ptzPreciseControl, startCruise, stopCruise, querySDCardStatus, formatSDCardControl} from "@/api/qs/gb28181";
import type {Gb28181Device, Gb28181Channel} from "@/types/api/qs/gb28181";
import {getAllDevice} from "@/api/qs/jt1078";
import type {Jt1078Device} from "@/types/api/qs/jt1078";
import {ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {captureFromStream, listSnapshot, delSnapshot} from "@/api/qs/snapshot";
import type { QsDeviceSnapshot, SnapshotQueryParams } from "@/types/api/qs/snapshot";

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

// GB28181设备刷新进度
const refreshProgressDialogVisible = ref(false)
const refreshProgress = ref(0)
const refreshProgressColor = 'var(--el-color-primary)'

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
const isGb28181Device = ref(false); // 是否是 GB28181 设备
const isQuality = ref(true);
const isLive = ref(true);
const sharedIframe = ref(null);
const captureLoading = ref(false);

// 抓图列表相关
const deviceSnapshotList = ref<QsDeviceSnapshot[]>([]);
const deviceSnapshotQuery = reactive({
  deviceId: undefined as number | undefined,
  pageNum: 1,
  pageSize: 10,
  snapshotType: undefined,
  sdkType: undefined
});
const deviceSnapshotTotal = ref(0);
const deviceSnapshotLoading = ref(false);

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

// GB28181高级功能
const homePositionForm = reactive({
  presetId: 1,
  dwellTime: 10
});

const cruiseTrackForm = reactive({
  trackId: 0
});

const cruiseTrackList = ref([]);

const ptzPreciseForm = reactive({
  pan: 0,
  tilt: 0,
  zoom: 0
});

const ptzPosition = reactive({
  pan: undefined as number | undefined,
  tilt: undefined as number | undefined,
  zoom: undefined as number | undefined
});

// 大华设备校时
const timeSyncDialogVisible = ref(false);
const timeSyncLoading = ref(false);
const timeSyncForm = reactive({
  deviceId: null as number | null,
  deviceIp: '',
  deviceType: '' as string,
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
// ONVIF 设备信息
const onvifDeviceInfoDialogVisible = ref(false);
const onvifDeviceInfoLoading = ref(false);
const onvifDeviceInfoTabActive = ref('deviceInfo');
const onvifDeviceInfo = reactive({
  success: false,
  manufacturer: '',
  model: '',
  firmwareVersion: '',
  streamUris: [],
  profileCount: 0,
  profiles: []
});
// ONVIF 存储信息
const onvifStorageDialogVisible = ref(false);
const onvifStorageLoading = ref(false);
const onvifStorageTabActive = ref('storageConfigurations');
const onvifStorageDevice = ref<any>(null);
const onvifStorageConfigurations = reactive({
  success: false
});
const onvifStorageCapabilities = reactive({
  success: false
});
const onvifStorageState = reactive({
  success: false
});
// ONVIF 网络配置信息
const onvifNetworkInterfaces = reactive({
  success: false
});
const onvifNetworkProtocols = reactive({
  success: false
});
// ONVIF 媒体配置信息
const onvifVideoSourceConfigs = reactive({
  success: false
});
const onvifVideoEncoderConfigs = reactive({
  success: false
});
const onvifAudioSourceConfigs = reactive({
  success: false
});
const onvifAudioEncoderConfigs = reactive({
  success: false
});
const onvifVideoOutputConfigs = reactive({
  success: false
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
const storageInfo = reactive<DaHuaStorageInfo>({
  storageDevices: []
});
const systemResourceInfo = reactive<DaHuaSystemResourceInfo>({
  success: false,
  cpuUsage: 0,
  memoryUsage: 0
});
const sdCardInfo = reactive<DaHuaSDCardInfo>({
  success: false,
  exists: false
});
// GB28181 存储卡管理相关数据
const gb28181SdCardForm = reactive({
  sdCardId: 0
});
const gb28181SdCardInfo = reactive({});
const bitrateInfo = reactive<DaHuaBitrateInfo>({
  success: false,
  channelBitrates: []
});
const networkStatusInfo = reactive<DaHuaNetworkStatusInfo>({
  success: false
});
const softwareVersionInfo = reactive<DaHuaSoftwareVersionInfo>({
  success: false
});
const recordStateInfo = reactive<DaHuaRecordStateInfo>({
  success: false,
  wholeRecording: false,
  wholeEncoding: false,
  channelStates: []
});
const powerStateInfo = reactive<DaHuaPowerStateInfo>({
  success: false,
  powerStates: []
});
const alarmArmInfo = reactive<DaHuaAlarmArmInfo>({
  success: false,
  alarmStates: []
});
const cameraInfo = reactive<DaHuaCameraInfo>({
  success: false,
  cameraProperties: []
});
const rtspUrlInfo = reactive<DaHuaRtspUrlInfo>({
  success: false,
  rtspUrls: []
});
// JT1078终端参数
const jt1078ParamsDialogVisible = ref(false);
const jt1078ParamsTabActive = ref('params');
const jt1078ParamsLoading = ref(false);
const jt1078CurrentDevice = reactive({
  deviceId: '',
  mobileNo: ''
});
const jt1078TerminalParams = reactive({});
// JT1078终端属性
const jt1078TerminalAttribute = reactive<any>({});
// JT1078终端属性字段名映射
const jt1078AttributeFieldMap: Record<string, string> = {
  messageId: '消息ID',
  properties: '属性',
  protocolVersion: '协议版本',
  clientId: '客户端ID',
  serialNo: '流水号',
  verified: '已验证',
  version: '版本',
  reserved: '保留',
  subpackage: '分包',
  bodyLength: '消息体长度',
  encryption: '加密方式',
  deviceType: '终端类型',
  makerId: '制造商ID',
  deviceModel: '终端型号',
  deviceId: '终端ID',
  iccid: '终端SIM卡ICCID',
  hardwareVersion: '硬件版本号',
  firmwareVersion: '固件版本号',
  gnssAttribute: 'GNSS模块属性',
  networkAttribute: '通信模块属性'
};
// JT1078驾驶员身份信息字段名映射
const jt1078DriverInfoFieldMap: Record<string, string> = {
  messageId: '消息ID',
  properties: '属性',
  protocolVersion: '协议版本',
  clientId: '客户端ID',
  serialNo: '流水号',
  verified: '已验证',
  status: '状态',
  dateTime: '日期时间',
  cardStatus: '卡状态',
  version: '版本',
  reserved: '保留',
  subpackage: '分包',
  bodyLength: '消息体长度',
  encryption: '加密方式'
};
// JT1078终端音视频属性字段名映射
const jt1078TerminalAVPropertiesFieldMap: Record<string, string> = {
  messageId: '消息ID',
  properties: '属性',
  protocolVersion: '协议版本',
  clientId: '客户端ID',
  serialNo: '流水号',
  verified: '已验证',
  audioFormat: '音频编码格式',
  audioChannels: '音频通道数',
  audioSamplingRate: '音频采样率',
  audioBitDepth: '音频采样精度',
  audioFrameLength: '音频帧长度',
  audioSupport: '音频输出支持',
  videoFormat: '视频编码格式',
  maxAudioChannels: '最大音频通道数',
  maxVideoChannels: '最大视频通道数',
  version: '版本',
  reserved: '保留',
  subpackage: '分包',
  bodyLength: '消息体长度',
  encryption: '加密方式'
};
// JT1078位置信息字段名映射
const jt1078LocationFieldMap: Record<string, string> = {
  messageId: '消息ID',
  properties: '属性',
  protocolVersion: '协议版本',
  clientId: '客户端ID',
  serialNo: '流水号',
  verified: '已验证',
  warnBit: '报警标志位',
  statusBit: '状态标志位',
  latitude: '原始纬度',
  longitude: '原始经度',
  altitude: '海拔高度',
  speed: '原始速度',
  direction: '方向',
  deviceTime: '设备时间',
  responseSerialNo: '应答流水号',
  lng: '经度',
  lat: '纬度',
  speedKph: '速度(公里/小时)',
  version: '版本',
  reserved: '保留',
  subpackage: '分包',
  bodyLength: '消息体长度',
  encryption: '加密方式'
};
// JT1078位置信息
const jt1078Location = reactive<any>({});
// JT1078临时位置跟踪控制表单
const jt1078TempLocationForm = reactive({
  interval: 10,
  validityPeriod: 600
});
// JT1078人工确认报警消息表单
const jt1078AlarmConfirmForm = reactive({
  responseSerialNo: 0,
  type: 0
});
// JT1078链路检测结果
const jt1078LinkCheckResult = ref<any>(null);
// JT1078文本信息下发表单
const jt1078TextForm = reactive({
  signBits: [] as number[],
  type: 1,
  content: ''
});
// JT1078事件设置表单
const jt1078EventForm = reactive({
  type: 1,
  events: [] as { id: number; content: string }[]
});
// JT1078提问下发表单
const jt1078QuestionForm = reactive({
  signBits: [] as number[],
  content: '',
  options: [] as { id: number; content: string }[]
});
// JT1078信息点播菜单设置表单
const jt1078MenuForm = reactive({
  type: 1,
  infos: [] as { type: number; name: string }[]
});
// JT1078信息服务表单
const jt1078InfoServiceForm = reactive({
  type: 0,
  content: ''
});
// JT1078电话回拨表单
const jt1078PhoneCallbackForm = reactive({
  type: 0,
  phoneNumber: ''
});
// JT1078设置电话本表单
const jt1078PhoneBookForm = reactive({
  type: 1,
  contacts: [] as { sign: number; phone: string; name: string }[]
});
// JT1078车辆控制表单
const jt1078VehicleControlForm = reactive({
  type: 1,
  param: 0
});
// JT1078车辆控制结果
const jt1078VehicleControlResult = ref<any>(null);
// JT1078设置圆形区域表单
const jt1078CircleAreaForm = reactive({
  action: 1,
  items: [] as { id: number, attribute: number, latitude: number, longitude: number, radius: number, startTime: string, endTime: string, maxSpeed: number | null, duration: number | null, nightMaxSpeed: number | null, name: string }[]
});
// JT1078删除圆形区域表单
const jt1078DeleteCircleForm = reactive({
  ids: [] as number[]
});
// JT1078设置矩形区域表单
const jt1078RectAreaForm = reactive({
  action: 1,
  items: [] as { id: number, attribute: number, latitudeUL: number, longitudeUL: number, latitudeLR: number, longitudeLR: number, startTime: string, endTime: string, maxSpeed: number | null, duration: number | null, nightMaxSpeed: number | null, name: string }[]
});
// JT1078删除矩形区域表单
const jt1078DeleteRectForm = reactive({
  ids: [] as number[]
});
// JT1078设置多边形区域表单
const jt1078PolygonAreaForm = reactive({
  id: 0,
  attribute: 0,
  startTime: '',
  endTime: '',
  maxSpeed: null as number | null,
  duration: null as number | null,
  nightMaxSpeed: null as number | null,
  name: '',
  points: [] as { latitude: number, longitude: number }[]
});
// JT1078删除多边形区域表单
const jt1078DeletePolygonForm = reactive({
  ids: [] as number[]
});
// JT1078设置路线表单
const jt1078RouteForm = reactive({
  id: 0,
  attribute: 0,
  startTime: '',
  endTime: '',
  name: '',
  items: [] as { id: number, routeId: number, latitude: number, longitude: number, width: number, attribute: number, upperLimit: number | null, lowerLimit: number | null, maxSpeed: number | null, duration: number | null, nightMaxSpeed: number | null }[]
});
// JT1078删除路线表单
const jt1078DeleteRouteForm = reactive({
  ids: [] as number[]
});
// JT1078查询区域或线路表单
const jt1078QueryAreaForm = reactive({
  type: 1,
  ids: [] as number[]
});
// JT1078查询结果
const jt1078QueryAreaResult = ref<any>(null);
// JT1078行驶记录仪数据采集命令表单
const jt1078TachographDataCollectForm = reactive({});
// JT1078行驶记录仪参数下传命令表单
const jt1078TachographParamSendForm = reactive({
  type: 130,
  content: ''
});
// JT1078上报驾驶员身份信息请求结果
const jt1078DriverInfoResult = ref<any>(null);
// JT1078查询终端音视频属性结果
const jt1078TerminalAVPropertiesResult = ref<any>(null);
// JT1078摄像头立即拍摄命令表单
const jt1078CameraShootForm = reactive({
  channelId: 1,
  command: 1,
  time: 0,
  save: 1,
  resolution: 2,
  quality: 5,
  brightness: 128,
  contrast: 64,
  saturation: 64,
  chroma: 128
});
// JT1078存储多媒体数据检索表单
const jt1078SearchMultimediaForm = reactive({
  type: 0,
  channelId: 0,
  event: 0,
  startTime: '',
  endTime: ''
});
// JT1078存储多媒体数据检索结果
const jt1078SearchMultimediaResult = ref<any>(null);
// JT1078存储多媒体数据上传表单
const jt1078UploadMultimediaForm = reactive({
  type: 0,
  channelId: 0,
  event: 0,
  startTime: '',
  endTime: '',
  delete: 0
});
// JT1078录音开始命令表单
const jt1078StartRecordingForm = reactive({
  command: 1,
  time: 0,
  save: 1,
  audioSamplingRate: 0
});
// JT1078单条存储多媒体数据检索上传命令表单
const jt1078SearchUploadMultimediaForm = reactive({
  id: 0,
  delete: 0
});
// JT1078下发终端升级包表单
const jt1078TerminalUpgradeForm = reactive({
  type: 0,
  makerId: '',
  version: '',
  packet: ''
});
const jt1078SetParamsForm = reactive({
  parametersInt: {} as Record<number, number>,
  parametersStr: {} as Record<number, string>
});
const jt1078TempParamId = ref(0);
const jt1078TempParamValue = ref(0);
const jt1078TempStrParamId = ref(0);
const jt1078TempStrParamValue = ref('');

// 查询指定参数表单
const jt1078QuerySpecificForm = reactive({
  ids: ''
});
const jt1078QuerySpecificResult = reactive({});
const jt1078QuerySpecificEditableParams = ref<any[]>([]);

// 终端控制表单
const jt1078ControlForm = reactive({
  command: 1,
  parameter: ''
});
const jt1078ControlResult = ref<{ success: boolean; message: string } | null>(null);

// 可编辑参数的计算属性
const jt1078EditableParams = computed(() => {
  const params = [];
  // 从查询结果添加
  if (jt1078TerminalParams) {
    for (const [key, value] of Object.entries(jt1078TerminalParams)) {
      // 处理对象类型，转换为JSON字符串
      let displayValue = value;
      let editableValue = value;
      if (value && typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2);
        editableValue = JSON.stringify(value, null, 2);
      }
      params.push({
        key,
        value: displayValue,
        editableValue,
        originalValue: value,
        isNew: false
      });
    }
  }
  // 从新添加的数值参数添加
  if (jt1078SetParamsForm.parametersInt) {
    for (const [key, value] of Object.entries(jt1078SetParamsForm.parametersInt)) {
      // 避免重复
      if (!params.find(p => p.key === String(key))) {
        params.push({
          key: String(key),
          value: value,
          editableValue: value,
          originalValue: value,
          isNew: true
        });
      }
    }
  }
  // 从新添加的字符参数添加
  if (jt1078SetParamsForm.parametersStr) {
    for (const [key, value] of Object.entries(jt1078SetParamsForm.parametersStr)) {
      // 避免重复
      if (!params.find(p => p.key === String(key))) {
        params.push({
          key: String(key),
          value: value,
          editableValue: value,
          originalValue: value,
          isNew: true
        });
      }
    }
  }
  return params;
});

// 判断是否有可编辑参数
const hasEditableParams = computed(() => {
  return jt1078EditableParams.value.length > 0;
});

// 判断是否有参数被修改（用于提示）
const hasModifiedParams = computed(() => {
  return jt1078EditableParams.value.some(param => {
    // 新添加的参数总是认为被修改了
    if (param.isNew) {
      return true;
    }
    // 比较原始值和当前值是否不同
    return String(param.originalValue) !== String(param.editableValue);
  });
});

// 判断查询指定参数是否有修改
const hasQuerySpecificModifiedParams = computed(() => {
  return jt1078QuerySpecificEditableParams.value.some(param => {
    return String(param.originalValue) !== String(param.editableValue);
  });
});
// 设备配置
const deviceConfigDialogVisible = ref(false);
const deviceConfigLoading = ref(false);
const deviceConfigData = ref<any>({});
const selectedConfigTypes = ref<string[]>([]);
const currentConfigDevice = ref<QsDevice | null>(null);
const activeConfigPanels = ref<string[]>([]);
const updateConfigLoading = ref<Record<string, boolean>>({});
const updateAllConfigLoading = ref(false);
// 配置类型名称映射
const configTypeNameMap: Record<string, string> = {
  'BasicParam': '基本参数',
  'VideoParamOpt': '视频参数范围',
  'SVACEncodeConfig': 'SVAC编码配置',
  'SVACDecodeConfig': 'SVAC解码配置',
  'VideoParamAttribute': '视频参数属性配置',
  'VideoRecordPlan': '录像计划',
  'VideoAlarmRecord': '报警录像',
  'PictureMask': '视频画面遮挡',
  'FrameMirror': '画面翻转',
  'AlarmReport': '报警上报开关',
  'OSDConfig': '前端OSD设置',
  'Snapshot': '图像抓拍配置'
};
// 配置字段中文名称映射
const configFieldNameMap: Record<string, Record<string, string>> = {
  'BasicParam': {
    'DeviceID': '设备ID',
    'Name': '设备名称',
    'Manufacturer': '制造商',
    'Model': '设备型号',
    'Firmware': '固件版本',
    'SerialNumber': '序列号',
    'Hardware': '硬件版本',
    'Software': '软件版本',
    'IPAddress': 'IP地址',
    'Port': '端口号',
    'HeartBeatInterval': '心跳间隔',
    'HeartBeatCount': '心跳次数',
    'PositionCapability': '定位能力',
    'Expiration': '注册有效期'
  },
  'VideoParamOpt': {
    'DeviceID': '设备ID',
    'Resolution': '分辨率',
    'FrameRate': '帧率',
    'BitRate': '码率',
    'BitRateType': '码率类型',
    'Quality': '画质',
    'SVQ': '空间编码',
    'TVQ': '时间编码',
    'GovLength': 'I帧间隔',
    'Profile': '编码级别',
    'SVACProfile': 'SVAC编码级别'
  },
  'VideoParamAttribute': {
    'DeviceID': '设备ID',
    'MaxStream': '最大码流数',
    'InputNum': '输入数量',
    'AEC': '回声消除',
    'AGC': '自动增益',
    'ABF': '自动背景滤除'
  },
  'AlarmReport': {
    'DeviceID': '设备ID',
    'MobileSubscription': '移动侦测订阅',
    'AlarmSubscription': '报警事件订阅'
  },
  'VideoRecordPlan': {
    'DeviceID': '设备ID',
    'RecordPlan': '录像计划'
  },
  'OSDConfig': {
    'DeviceID': '设备ID',
    'OSD': 'OSD叠加配置'
  },
  'SVACEncodeConfig': {
    'DeviceID': '设备ID',
    'SVACCode': 'SVAC编码模式',
    'SVACCompression': 'SVAC压缩级别',
    'SVACProfile': 'SVAC编码级别'
  },
  'SVACDecodeConfig': {
    'DeviceID': '设备ID',
    'SVACDecode': 'SVAC解码模式'
  },
  'VideoAlarmRecord': {
    'DeviceID': '设备ID',
    'AlarmRecord': '报警录像配置'
  },
  'PictureMask': {
    'DeviceID': '设备ID',
    'PictureMask': '遮挡区域配置'
  },
  'FrameMirror': {
    'DeviceID': '设备ID',
    'FrameMirror': '镜像翻转配置'
  },
  'Snapshot': {
    'DeviceID': '设备ID',
    'Snapshot': '抓拍配置'
  }
};
// 大华设备录像下载
const downloadRecordDialogVisible = ref(false);
const downloadRecordLoading = ref(false);
const downloadRecordForm = reactive({
  deviceId: null as number | null,
  deviceName: '',
  channelId: 0,
  startTime: '',
  endTime: '',
  recordFileType: 0
});
const downloadResult = ref<DaHuaRecordDownloadResponse | null>(null);
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
      listDaHuaDevice().then((res) => {
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
 * 格式化容量显示
 */
const formatCapacity = (capacity: any) => {
  if (!capacity && capacity !== 0) return '-';
  const num = Number(capacity);
  if (isNaN(num)) return capacity;
  
  if (num >= 1024 * 1024 * 1024) {
    return (num / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  } else if (num >= 1024 * 1024) {
    return (num / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (num >= 1024) {
    return (num / 1024).toFixed(2) + ' KB';
  } else {
    return num + ' B';
  }
};

/**
 * 计算存储使用百分比
 */
const calculateStoragePercentage = (used: any, total: any) => {
  const usedNum = Number(used);
  const totalNum = Number(total);
  if (!totalNum || isNaN(usedNum) || isNaN(totalNum)) return 0;
  return Math.min(100, Math.round((usedNum / totalNum) * 100));
};

/**
 * 根据存储使用比例获取颜色
 */
const getStorageColor = (used: any, total: any) => {
  const percentage = calculateStoragePercentage(used, total);
  if (percentage >= 90) return '#f56c6c'; // 红色
  if (percentage >= 70) return '#e6a23c'; // 橙色
  return '#67c23a'; // 绿色
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
    listDaHuaDevice().then((res: any) => {
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
  if (device) {
    form.value.onvifHostName = device.hostName
  } else {
    // 手动输入的 IP，不自动填充 hostName
    form.value.onvifHostName = null
  }
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

  if (!form.value.userName) {
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
    hostName: form.value.onvifHostName,
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
        isGb28181Device.value = false // 不是 GB28181 设备
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
        isGb28181Device.value = false // 不是 GB28181 设备
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
        isGb28181Device.value = false // 不是 GB28181 设备
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
        isGb28181Device.value = false // 不是 GB28181 设备
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
        isGb28181Device.value = true // 是 GB28181 设备
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
        isGb28181Device.value = false // 不是 GB28181 设备
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

// ==================== GB28181高级功能 ====================

// 查询看守位
const handleQueryHomePosition = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    const res = await queryHomePosition(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId);
    if (res.data) {
      homePositionForm.presetId = res.data.presetId || 1;
      homePositionForm.dwellTime = res.data.dwellTime || 10;
      proxy.$modal.msgSuccess('查询看守位成功');
    }
  } catch (error) {
    console.error('查询看守位失败:', error);
    proxy.$modal.msgError('查询看守位失败');
  }
}

// 设置看守位
const handleSetHomePosition = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    await updateHomePosition(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId, {
      homePosition: {
        presetId: homePositionForm.presetId,
        dwellTime: homePositionForm.dwellTime
      }
    });
    proxy.$modal.msgSuccess('设置看守位成功');
  } catch (error) {
    console.error('设置看守位失败:', error);
    proxy.$modal.msgError('设置看守位失败');
  }
}

// 调用看守位
const handleHomePositionControl = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    await homePositionControl(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId);
    proxy.$modal.msgSuccess('调用看守位成功');
  } catch (error) {
    console.error('调用看守位失败:', error);
    proxy.$modal.msgError('调用看守位失败');
  }
}

// 查询巡航轨迹列表
const handleQueryCruiseTrackList = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    const res = await queryCruiseTrackList(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId);
    if (res.data) {
      cruiseTrackList.value = res.data;
      proxy.$modal.msgSuccess('查询巡航轨迹列表成功');
    }
  } catch (error) {
    console.error('查询巡航轨迹列表失败:', error);
    proxy.$modal.msgError('查询巡航轨迹列表失败');
  }
}

// 查询巡航轨迹详情
const handleQueryCruiseTrack = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  if (cruiseTrackForm.trackId === null || cruiseTrackForm.trackId === undefined) {
    proxy.$modal.msgWarning('请选择轨迹编号');
    return;
  }
  try {
    const res = await queryCruiseTrack(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId, cruiseTrackForm.trackId);
    if (res.data) {
      proxy.$modal.msgSuccess('查询巡航轨迹详情成功');
    }
  } catch (error) {
    console.error('查询巡航轨迹详情失败:', error);
    proxy.$modal.msgError('查询巡航轨迹详情失败');
  }
}

// 查询PTZ位置
const handleQueryPTZPosition = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    const res = await queryPTZPosition(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId);
    if (res.data) {
      ptzPosition.pan = res.data.pan;
      ptzPosition.tilt = res.data.tilt;
      ptzPosition.zoom = res.data.zoom;
      proxy.$modal.msgSuccess('查询PTZ位置成功');
    }
  } catch (error) {
    console.error('查询PTZ位置失败:', error);
    proxy.$modal.msgError('查询PTZ位置失败');
  }
}

// PTZ精准控制
const handlePtzPreciseControl = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    await ptzPreciseControl(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId, {
      pan: ptzPreciseForm.pan,
      tilt: ptzPreciseForm.tilt,
      zoom: ptzPreciseForm.zoom
    });
    proxy.$modal.msgSuccess('PTZ精准控制成功');
  } catch (error) {
    console.error('PTZ精准控制失败:', error);
    proxy.$modal.msgError('PTZ精准控制失败');
  }
}

// 开始巡航
const handleStartCruise = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    await startCruise(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId, cruiseTrackForm.trackId);
    proxy.$modal.msgSuccess('开始巡航成功');
  } catch (error) {
    console.error('开始巡航失败:', error);
    proxy.$modal.msgError('开始巡航失败');
  }
}

// 停止巡航
const handleStopCruise = async () => {
  if (!deviceRow.value || !deviceRow.value.gbDeviceId) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  try {
    await stopCruise(deviceRow.value.gbDeviceId, deviceRow.value.gbChannelId, cruiseTrackForm.trackId);
    proxy.$modal.msgSuccess('停止巡航成功');
  } catch (error) {
    console.error('停止巡航失败:', error);
    proxy.$modal.msgError('停止巡航失败');
  }
}

// 查询 GB28181 存储卡状态
const handleQueryGb28181SdCardStatus = async () => {
  if (!currentDeviceRow.value?.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }
  try {
    const response = await querySDCardStatus(currentDeviceRow.value.gbDeviceId, currentDeviceRow.value.gbChannelId);
    if (response.code === 200) {
      Object.assign(gb28181SdCardInfo, response.data || {});
      proxy.$modal.msgSuccess('查询存储卡状态成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询存储卡状态失败:', error);
    proxy.$modal.msgError('查询存储卡状态失败');
  }
}

// 格式化 GB28181 存储卡
const handleFormatGb28181SdCard = async () => {
  if (!currentDeviceRow.value?.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要格式化存储卡吗？此操作将清除所有数据！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await formatSDCardControl(
      currentDeviceRow.value.gbDeviceId, 
      currentDeviceRow.value.gbChannelId, 
      gb28181SdCardForm.sdCardId
    );
    
    if (response.code === 200) {
      proxy.$modal.msgSuccess('格式化存储卡成功');
    } else {
      proxy.$modal.msgError(response.msg || '格式化失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('格式化存储卡失败:', error);
      proxy.$modal.msgError('格式化存储卡失败');
    }
  }
}

// ==================== 大华设备校时 ====================

// 目录订阅
const handleSubscribeCatalog = async (row: QsDevice) => {
  if (row.deviceStatus !== 'ON') {
    proxy.$modal.msgWarning('设备离线，无法订阅目录');
    return;
  }

  try {
    await subscribeCatalog(row.id!);
    proxy.$modal.msgSuccess('目录订阅成功');
    // 订阅成功后更新本地状态
    row.subscribeCatalogStatus = 1;
  } catch (error) {
    console.error('目录订阅失败:', error);
    proxy.$modal.msgError('目录订阅失败');
  }
};

// 取消目录订阅
const handleUnsubscribeCatalog = async (row: QsDevice) => {
  if (row.deviceStatus !== 'ON') {
    proxy.$modal.msgWarning('设备离线，无法取消订阅目录');
    return;
  }

  try {
    await unsubscribeCatalog(row.id!);
    proxy.$modal.msgSuccess('取消目录订阅成功');
    // 取消订阅后更新本地状态
    row.subscribeCatalogStatus = 0;
  } catch (error) {
    console.error('取消目录订阅失败:', error);
    proxy.$modal.msgError('取消目录订阅失败');
  }
};

// 打开设备配置对话框
const openDeviceConfigDialog = (row: QsDevice) => {
  currentConfigDevice.value = row;
  deviceConfigData.value = {};
  selectedConfigTypes.value = [];
  deviceConfigDialogVisible.value = true;
};

// 获取配置类型名称
const getConfigTypeName = (key: string): string => {
  return configTypeNameMap[key] || key;
};

// 获取配置字段名称
const getConfigFieldName = (configType: string, fieldKey: string): string => {
  const fieldMap = configFieldNameMap[configType];
  return fieldMap ? (fieldMap[fieldKey] || fieldKey) : fieldKey;
};

// 查询设备配置
const handleQueryDeviceConfig = async () => {
  if (!currentConfigDevice.value?.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }
  if (selectedConfigTypes.value.length === 0) {
    proxy.$modal.msgWarning('请至少选择一个配置类型');
    return;
  }

  try {
    deviceConfigLoading.value = true;
    const configTypeStr = selectedConfigTypes.value.join('/');
    const response = await queryDeviceConfig(currentConfigDevice.value.gbDeviceId, configTypeStr);

    if (response.code === 200 && response.data) {
      deviceConfigData.value = response.data;
      proxy.$modal.msgSuccess('查询成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询设备配置失败:', error);
    proxy.$modal.msgError('查询设备配置失败');
  } finally {
    deviceConfigLoading.value = false;
  }
};

// 更新单个配置
const handleUpdateSingleConfig = async (configType: string) => {
  if (!currentConfigDevice.value?.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }

  try {
    updateConfigLoading.value[configType] = true;
    // 构建配置对象
    const configParam: any = {
      cmdType: 'DeviceControl'
    };
    // 添加对应的配置项
    configParam[configType] = deviceConfigData.value[configType];
    const response = await updateDeviceConfig(currentConfigDevice.value.gbDeviceId, configParam);

    if (response.code === 200) {
      proxy.$modal.msgSuccess(`更新${getConfigTypeName(configType)}成功`);
    } else {
      proxy.$modal.msgError(response.msg || '更新失败');
    }
  } catch (error) {
    console.error('更新设备配置失败:', error);
    proxy.$modal.msgError('更新设备配置失败');
  } finally {
    updateConfigLoading.value[configType] = false;
  }
};

// 更新全部配置
const handleUpdateAllConfig = async () => {
  if (!currentConfigDevice.value?.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }

  try {
    updateAllConfigLoading.value = true;
    // 构建配置对象
    const configParam: any = {
      cmdType: 'DeviceControl',
      ...deviceConfigData.value
    };
    const response = await updateDeviceConfig(currentConfigDevice.value.gbDeviceId, configParam);

    if (response.code === 200) {
      proxy.$modal.msgSuccess('更新全部配置成功');
    } else {
      proxy.$modal.msgError(response.msg || '更新失败');
    }
  } catch (error) {
    console.error('更新全部配置失败:', error);
    proxy.$modal.msgError('更新全部配置失败');
  } finally {
    updateAllConfigLoading.value = false;
  }
};

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
    case 'refresh':
      handleRefreshDevice(row);
      break;
    case 'timeSync':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法校时');
        return;
      }
      openTimeSyncDialog(row);
      break;
    case 'deviceInfo':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法查看设备信息');
        return;
      }
      openDeviceInfoDialog(row);
      break;
    case 'capture':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法抓图');
        return;
      }
      handleCapture(row);
      break;
    case 'reboot':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法重启');
        return;
      }
      handleReboot(row);
      break;
    case 'recordControl':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法进行录像控制');
        return;
      }
      handleRecordControl(row);
      break;
    case 'downloadRecord':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法下载录像');
        return;
      }
      openDownloadRecordDialog(row);
      break;
    case 'subscribeCatalog':
      handleSubscribeCatalog(row);
      break;
    case 'unsubscribeCatalog':
      handleUnsubscribeCatalog(row);
      break;
    case 'deviceConfig':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法查询设备配置');
        return;
      }
      openDeviceConfigDialog(row);
      break;
    case 'jt1078Params':
      if (row.deviceStatus !== 'ON') {
        proxy.$modal.msgWarning('设备离线，无法操作终端参数');
        return;
      }
      openJt1078ParamsDialog(row);
      break;
  }
}

// 打开JT1078终端参数对话框
const openJt1078ParamsDialog = (row: QsDevice) => {
  currentDeviceRow.value = row;
  jt1078CurrentDevice.deviceId = row.deviceCode || '';
  jt1078CurrentDevice.mobileNo = row.jtMobileNo || '';
  // 清空参数
  Object.keys(jt1078TerminalParams).forEach(key => {
    delete jt1078TerminalParams[key];
  });
  // 重置设置表单
  Object.keys(jt1078SetParamsForm.parametersInt).forEach(key => {
    delete jt1078SetParamsForm.parametersInt[key];
  });
  Object.keys(jt1078SetParamsForm.parametersStr).forEach(key => {
    delete jt1078SetParamsForm.parametersStr[key];
  });
  jt1078TempParamId.value = 0;
  jt1078TempParamValue.value = 0;
  jt1078TempStrParamId.value = 0;
  jt1078TempStrParamValue.value = '';
  // 重置查询指定参数表单
  jt1078QuerySpecificForm.ids = '';
  Object.keys(jt1078QuerySpecificResult).forEach(key => {
    delete jt1078QuerySpecificResult[key];
  });
  jt1078QuerySpecificEditableParams.value = [];
  // 重置终端控制表单
  jt1078ControlForm.command = 1;
  jt1078ControlForm.parameter = '';
  jt1078ControlResult.value = null;
  // 重置标签页
  jt1078ParamsTabActive.value = 'params';
  jt1078ParamsDialogVisible.value = true;
  // 自动查询参数
  nextTick(() => {
    handleQueryJt1078Params();
  });
};

// 删除参数
const removeParam = (key: string) => {
  // 从查询结果删除
  if (jt1078TerminalParams[key]) {
    delete jt1078TerminalParams[key];
  }
  // 从数值参数删除
  if (jt1078SetParamsForm.parametersInt[key]) {
    delete jt1078SetParamsForm.parametersInt[key];
  }
  // 从字符参数删除
  if (jt1078SetParamsForm.parametersStr[key]) {
    delete jt1078SetParamsForm.parametersStr[key];
  }
};

// 添加数值参数
const addIntParam = () => {
  if (jt1078TempParamId.value === null || jt1078TempParamId.value === undefined) {
    proxy.$modal.msgWarning('请输入参数ID');
    return;
  }
  if (jt1078TempParamValue.value === null || jt1078TempParamValue.value === undefined) {
    proxy.$modal.msgWarning('请输入参数值');
    return;
  }
  const key = String(jt1078TempParamId.value);
  // 添加到查询结果中（统一展示）
  jt1078TerminalParams[key] = jt1078TempParamValue.value;
  jt1078TempParamId.value = 0;
  jt1078TempParamValue.value = 0;
};

// 删除数值参数（保留以兼容）
const removeIntParam = (key: number) => {
  removeParam(String(key));
};

// 添加字符参数
const addStrParam = () => {
  if (jt1078TempStrParamId.value === null || jt1078TempStrParamId.value === undefined) {
    proxy.$modal.msgWarning('请输入参数ID');
    return;
  }
  if (!jt1078TempStrParamValue.value) {
    proxy.$modal.msgWarning('请输入参数值');
    return;
  }
  const key = String(jt1078TempStrParamId.value);
  // 添加到查询结果中（统一展示）
  jt1078TerminalParams[key] = jt1078TempStrParamValue.value;
  jt1078TempStrParamId.value = 0;
  jt1078TempStrParamValue.value = '';
};

// 删除字符参数（保留以兼容）
const removeStrParam = (key: number) => {
  removeParam(String(key));
};

// 查询JT1078终端参数
const handleQueryJt1078Params = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await queryTerminalParams({
      clientId: jt1078CurrentDevice.mobileNo
    });

    if (response.code === 200 && response.data) {
      // 清空旧参数
      Object.keys(jt1078TerminalParams).forEach(key => {
        delete jt1078TerminalParams[key];
      });
      // 清空设置表单
      Object.keys(jt1078SetParamsForm.parametersInt).forEach(key => {
        delete jt1078SetParamsForm.parametersInt[key];
      });
      Object.keys(jt1078SetParamsForm.parametersStr).forEach(key => {
        delete jt1078SetParamsForm.parametersStr[key];
      });
      // 复制新参数
      if (response.data.parameters) {
        Object.assign(jt1078TerminalParams, response.data.parameters);
      }
      proxy.$modal.msgSuccess('查询终端参数成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询终端参数失败:', error);
    proxy.$modal.msgError('查询终端参数失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// 查询JT1078终端属性
const handleQueryJt1078Attribute = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await queryTerminalAttribute({
      clientId: jt1078CurrentDevice.mobileNo
    });

    if (response.code === 200 && response.data) {
      // 清空旧属性
      Object.keys(jt1078TerminalAttribute).forEach(key => {
        delete jt1078TerminalAttribute[key];
      });
      // 复制新属性
      Object.assign(jt1078TerminalAttribute, response.data);
      proxy.$modal.msgSuccess('查询终端属性成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询终端属性失败:', error);
    proxy.$modal.msgError('查询终端属性失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// 查询JT1078位置信息
const handleQueryJt1078Location = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await queryLocation({
      clientId: jt1078CurrentDevice.mobileNo
    });

    if (response.code === 200 && response.data) {
      // 清空旧位置
      Object.keys(jt1078Location).forEach(key => {
        delete jt1078Location[key];
      });
      // 复制新位置
      Object.assign(jt1078Location, response.data);
      proxy.$modal.msgSuccess('查询位置信息成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询位置信息失败:', error);
    proxy.$modal.msgError('查询位置信息失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078临时位置跟踪控制
const handleTempLocationTrack = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await tempLocationTrack({
      clientId: jt1078CurrentDevice.mobileNo,
      interval: jt1078TempLocationForm.interval,
      validityPeriod: jt1078TempLocationForm.validityPeriod
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('临时位置跟踪控制成功');
    } else {
      proxy.$modal.msgError(response.msg || '控制失败');
    }
  } catch (error) {
    console.error('临时位置跟踪控制失败:', error);
    proxy.$modal.msgError('临时位置跟踪控制失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078人工确认报警消息
const handleConfirmAlarm = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await confirmAlarm({
      clientId: jt1078CurrentDevice.mobileNo,
      responseSerialNo: jt1078AlarmConfirmForm.responseSerialNo,
      type: jt1078AlarmConfirmForm.type
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('人工确认报警消息成功');
    } else {
      proxy.$modal.msgError(response.msg || '确认失败');
    }
  } catch (error) {
    console.error('人工确认报警消息失败:', error);
    proxy.$modal.msgError('人工确认报警消息失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078链路检测
const handleLinkCheck = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await linkCheck({
      clientId: jt1078CurrentDevice.mobileNo
    });

    if (response.code === 200) {
      jt1078LinkCheckResult.value = response.data;
      proxy.$modal.msgSuccess('链路检测成功');
    } else {
      proxy.$modal.msgError(response.msg || '检测失败');
    }
  } catch (error) {
    console.error('链路检测失败:', error);
    proxy.$modal.msgError('链路检测失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078文本信息下发
const handleSendText = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  if (!jt1078TextForm.content) {
    proxy.$modal.msgError('文本内容不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    let sign = 0;
    jt1078TextForm.signBits.forEach(bit => {
      sign |= bit;
    });
    const response = await sendText({
      clientId: jt1078CurrentDevice.mobileNo,
      sign: sign,
      type: jt1078TextForm.type,
      content: jt1078TextForm.content
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('文本信息下发成功');
    } else {
      proxy.$modal.msgError(response.msg || '下发失败');
    }
  } catch (error) {
    console.error('文本信息下发失败:', error);
    proxy.$modal.msgError('文本信息下发失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078事件设置
const handleEventSetting = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await eventSetting({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078EventForm.type,
      events: jt1078EventForm.events
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('事件设置成功');
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('事件设置失败:', error);
    proxy.$modal.msgError('事件设置失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078提问下发
const handleSendQuestion = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  if (!jt1078QuestionForm.content) {
    proxy.$modal.msgError('问题内容不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    let sign = 0;
    jt1078QuestionForm.signBits.forEach(bit => {
      sign |= bit;
    });
    const response = await sendQuestion({
      clientId: jt1078CurrentDevice.mobileNo,
      sign: sign,
      content: jt1078QuestionForm.content,
      options: jt1078QuestionForm.options
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('提问下发成功');
    } else {
      proxy.$modal.msgError(response.msg || '下发失败');
    }
  } catch (error) {
    console.error('提问下发失败:', error);
    proxy.$modal.msgError('提问下发失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078信息点播菜单设置
const handleMenuSetting = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await menuSetting({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078MenuForm.type,
      infos: jt1078MenuForm.infos
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('信息点播菜单设置成功');
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('信息点播菜单设置失败:', error);
    proxy.$modal.msgError('信息点播菜单设置失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078信息服务
const handleInfoService = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  if (!jt1078InfoServiceForm.content) {
    proxy.$modal.msgError('信息内容不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await infoService({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078InfoServiceForm.type,
      content: jt1078InfoServiceForm.content
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('信息服务成功');
    } else {
      proxy.$modal.msgError(response.msg || '服务失败');
    }
  } catch (error) {
    console.error('信息服务失败:', error);
    proxy.$modal.msgError('信息服务失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078电话回拨
const handlePhoneCallback = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  if (!jt1078PhoneCallbackForm.phoneNumber) {
    proxy.$modal.msgError('电话号码不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await phoneCallback({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078PhoneCallbackForm.type,
      phoneNumber: jt1078PhoneCallbackForm.phoneNumber
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('电话回拨成功');
    } else {
      proxy.$modal.msgError(response.msg || '回拨失败');
    }
  } catch (error) {
    console.error('电话回拨失败:', error);
    proxy.$modal.msgError('电话回拨失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078设置电话本
const handleSetPhoneBook = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await setPhoneBook({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078PhoneBookForm.type,
      contacts: jt1078PhoneBookForm.contacts
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('设置电话本成功');
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('设置电话本失败:', error);
    proxy.$modal.msgError('设置电话本失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078车辆控制
const handleVehicleControl = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await vehicleControl({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078VehicleControlForm.type,
      param: jt1078VehicleControlForm.param
    });

    if (response.code === 200) {
      jt1078VehicleControlResult.value = response.data;
      proxy.$modal.msgSuccess('车辆控制成功');
    } else {
      proxy.$modal.msgError(response.msg || '控制失败');
    }
  } catch (error) {
    console.error('车辆控制失败:', error);
    proxy.$modal.msgError('车辆控制失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078设置圆形区域
const handleSetCircleArea = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await setCircleArea({
      clientId: jt1078CurrentDevice.mobileNo,
      action: jt1078CircleAreaForm.action,
      items: jt1078CircleAreaForm.items
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('设置圆形区域成功');
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('设置圆形区域失败:', error);
    proxy.$modal.msgError('设置圆形区域失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078删除圆形区域
const handleDeleteCircleArea = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await deleteCircleArea({
      clientId: jt1078CurrentDevice.mobileNo,
      id: jt1078DeleteCircleForm.ids
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('删除圆形区域成功');
    } else {
      proxy.$modal.msgError(response.msg || '删除失败');
    }
  } catch (error) {
    console.error('删除圆形区域失败:', error);
    proxy.$modal.msgError('删除圆形区域失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078设置矩形区域
const handleSetRectArea = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await setRectArea({
      clientId: jt1078CurrentDevice.mobileNo,
      action: jt1078RectAreaForm.action,
      items: jt1078RectAreaForm.items
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('设置矩形区域成功');
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('设置矩形区域失败:', error);
    proxy.$modal.msgError('设置矩形区域失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078删除矩形区域
const handleDeleteRectArea = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await deleteRectArea({
      clientId: jt1078CurrentDevice.mobileNo,
      id: jt1078DeleteRectForm.ids
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('删除矩形区域成功');
    } else {
      proxy.$modal.msgError(response.msg || '删除失败');
    }
  } catch (error) {
    console.error('删除矩形区域失败:', error);
    proxy.$modal.msgError('删除矩形区域失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078设置多边形区域
const handleSetPolygonArea = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await setPolygonArea({
      clientId: jt1078CurrentDevice.mobileNo,
      id: jt1078PolygonAreaForm.id,
      attribute: jt1078PolygonAreaForm.attribute,
      startTime: jt1078PolygonAreaForm.startTime,
      endTime: jt1078PolygonAreaForm.endTime,
      maxSpeed: jt1078PolygonAreaForm.maxSpeed,
      duration: jt1078PolygonAreaForm.duration,
      nightMaxSpeed: jt1078PolygonAreaForm.nightMaxSpeed,
      name: jt1078PolygonAreaForm.name,
      points: jt1078PolygonAreaForm.points
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('设置多边形区域成功');
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('设置多边形区域失败:', error);
    proxy.$modal.msgError('设置多边形区域失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078删除多边形区域
const handleDeletePolygonArea = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await deletePolygonArea({
      clientId: jt1078CurrentDevice.mobileNo,
      id: jt1078DeletePolygonForm.ids
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('删除多边形区域成功');
    } else {
      proxy.$modal.msgError(response.msg || '删除失败');
    }
  } catch (error) {
    console.error('删除多边形区域失败:', error);
    proxy.$modal.msgError('删除多边形区域失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078设置路线
const handleSetRoute = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await setRoute({
      clientId: jt1078CurrentDevice.mobileNo,
      id: jt1078RouteForm.id,
      attribute: jt1078RouteForm.attribute,
      startTime: jt1078RouteForm.startTime,
      endTime: jt1078RouteForm.endTime,
      name: jt1078RouteForm.name,
      items: jt1078RouteForm.items
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('设置路线成功');
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('设置路线失败:', error);
    proxy.$modal.msgError('设置路线失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078删除路线
const handleDeleteRoute = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await deleteRoute({
      clientId: jt1078CurrentDevice.mobileNo,
      id: jt1078DeleteRouteForm.ids
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('删除路线成功');
    } else {
      proxy.$modal.msgError(response.msg || '删除失败');
    }
  } catch (error) {
    console.error('删除路线失败:', error);
    proxy.$modal.msgError('删除路线失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078查询区域或线路数据
const handleQueryAreaOrRoute = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await queryAreaOrRoute({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078QueryAreaForm.type,
      id: jt1078QueryAreaForm.ids
    });

    if (response.code === 200) {
      jt1078QueryAreaResult.value = response.data;
      proxy.$modal.msgSuccess('查询成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询失败:', error);
    proxy.$modal.msgError('查询失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078行驶记录仪数据采集命令
const handleTachographDataCollect = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await tachographDataCollect({
      clientId: jt1078CurrentDevice.mobileNo
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('行驶记录仪数据采集命令发送成功');
    } else {
      proxy.$modal.msgError(response.msg || '发送失败');
    }
  } catch (error) {
    console.error('行驶记录仪数据采集命令发送失败:', error);
    proxy.$modal.msgError('行驶记录仪数据采集命令发送失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078行驶记录仪参数下传命令
const handleTachographParamSend = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await tachographParamSend({
      clientId: jt1078CurrentDevice.mobileNo,
      type: jt1078TachographParamSendForm.type,
      content: jt1078TachographParamSendForm.content
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('行驶记录仪参数下传成功');
    } else {
      proxy.$modal.msgError(response.msg || '下传失败');
    }
  } catch (error) {
    console.error('行驶记录仪参数下传失败:', error);
    proxy.$modal.msgError('行驶记录仪参数下传失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078上报驾驶员身份信息请求
const handleReportDriverInfo = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await reportDriverInfo({
      clientId: jt1078CurrentDevice.mobileNo
    });

    if (response.code === 200) {
      jt1078DriverInfoResult.value = response.data;
      proxy.$modal.msgSuccess('上报驾驶员身份信息请求成功');
    } else {
      proxy.$modal.msgError(response.msg || '请求失败');
    }
  } catch (error) {
    console.error('上报驾驶员身份信息请求失败:', error);
    proxy.$modal.msgError('上报驾驶员身份信息请求失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078查询终端音视频属性
const handleQueryTerminalAVProperties = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await queryTerminalAVProperties({
      clientId: jt1078CurrentDevice.mobileNo
    });

    if (response.code === 200) {
      jt1078TerminalAVPropertiesResult.value = response.data;
      proxy.$modal.msgSuccess('查询终端音视频属性成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询终端音视频属性失败:', error);
    proxy.$modal.msgError('查询终端音视频属性失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078摄像头立即拍摄命令
const handleCameraShoot = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await cameraShoot({
      clientId: jt1078CurrentDevice.mobileNo,
      ...jt1078CameraShootForm
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('摄像头立即拍摄命令发送成功');
    } else {
      proxy.$modal.msgError(response.msg || '发送失败');
    }
  } catch (error) {
    console.error('摄像头立即拍摄命令发送失败:', error);
    proxy.$modal.msgError('摄像头立即拍摄命令发送失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078存储多媒体数据检索
const handleSearchMultimedia = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await searchMultimedia({
      clientId: jt1078CurrentDevice.mobileNo,
      ...jt1078SearchMultimediaForm
    });

    if (response.code === 200) {
      jt1078SearchMultimediaResult.value = response.data;
      proxy.$modal.msgSuccess('存储多媒体数据检索成功');
    } else {
      proxy.$modal.msgError(response.msg || '检索失败');
    }
  } catch (error) {
    console.error('存储多媒体数据检索失败:', error);
    proxy.$modal.msgError('存储多媒体数据检索失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078存储多媒体数据上传
const handleUploadMultimedia = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await uploadMultimedia({
      clientId: jt1078CurrentDevice.mobileNo,
      ...jt1078UploadMultimediaForm
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('存储多媒体数据上传命令发送成功');
    } else {
      proxy.$modal.msgError(response.msg || '发送失败');
    }
  } catch (error) {
    console.error('存储多媒体数据上传失败:', error);
    proxy.$modal.msgError('存储多媒体数据上传失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078录音开始命令
const handleStartRecording = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await startRecording({
      clientId: jt1078CurrentDevice.mobileNo,
      ...jt1078StartRecordingForm
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('录音命令发送成功');
    } else {
      proxy.$modal.msgError(response.msg || '发送失败');
    }
  } catch (error) {
    console.error('录音命令发送失败:', error);
    proxy.$modal.msgError('录音命令发送失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078单条存储多媒体数据检索上传命令
const handleSearchUploadMultimedia = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await searchUploadMultimedia({
      clientId: jt1078CurrentDevice.mobileNo,
      ...jt1078SearchUploadMultimediaForm
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('单条存储多媒体数据检索上传命令发送成功');
    } else {
      proxy.$modal.msgError(response.msg || '发送失败');
    }
  } catch (error) {
    console.error('单条存储多媒体数据检索上传命令发送失败:', error);
    proxy.$modal.msgError('单条存储多媒体数据检索上传命令发送失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// JT1078下发终端升级包
const handleTerminalUpgrade = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const response = await terminalUpgrade({
      clientId: jt1078CurrentDevice.mobileNo,
      ...jt1078TerminalUpgradeForm
    });

    if (response.code === 200) {
      proxy.$modal.msgSuccess('终端升级包下发成功');
    } else {
      proxy.$modal.msgError(response.msg || '下发失败');
    }
  } catch (error) {
    console.error('终端升级包下发失败:', error);
    proxy.$modal.msgError('终端升级包下发失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// 设置JT1078终端参数
const handleSetJt1078Params = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  if (!hasModifiedParams.value) {
    proxy.$modal.msgWarning('没有修改任何参数');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const requestData: any = {
        clientId: jt1078CurrentDevice.mobileNo,
        parametersLong: {} as Record<number, number>,
        parametersStr: {} as Record<number, string>
      };

    // 遍历可编辑参数，只发送修改过的
    jt1078EditableParams.value.forEach(param => {
      const key = Number(param.key);
      let value = param.editableValue;
      
      // 检查是否是新添加的或者被修改过
      const isModified = param.isNew || String(param.originalValue) !== String(value);
      if (!isModified) {
        return; // 跳过未修改的参数
      }
      
      // 尝试解析JSON字符串，但只有当originalValue是对象时才解析
      let isObject = false;
      if (typeof value === 'string' && param.originalValue && typeof param.originalValue === 'object') {
        try {
          value = JSON.parse(value);
          isObject = true;
        } catch (e) {
          // 不是JSON，保持原样
        }
      }
      
      // 对象类型的参数跳过，不发送（这些是复杂对象，需要专门处理）
      if (isObject || (value && typeof value === 'object')) {
        console.warn('跳过对象类型参数，不建议编辑:', key, value);
        return;
      }
      
      // 尝试把值转换为数值，能成功就用parametersLong，否则用parametersStr
      const numValue = Number(value);
      if (!isNaN(numValue) && value !== '' && value !== null && value !== undefined) {
        // 能转换为数值，用parametersLong发送
        // 确保我们发送的是数值类型，而不是字符串
        requestData.parametersLong[key] = numValue;
      } else {
        // 不能转换为数值，用parametersStr发送
        requestData.parametersStr[key] = String(value);
      }
    });

    // 如果没有参数，直接返回
    const hasLongParams = Object.keys(requestData.parametersLong).length > 0;
    const hasStrParams = Object.keys(requestData.parametersStr).length > 0;
    
    if (!hasLongParams && !hasStrParams) {
      proxy.$modal.msgWarning('没有可保存的参数（对象类型参数不支持编辑）');
      return;
    }

    // 清理数据，确保没有parameters字段，只保留需要的字段
    const cleanRequestData: any = {
      clientId: requestData.clientId
    };
    
    if (hasLongParams) {
      cleanRequestData.parametersLong = requestData.parametersLong;
    }
    if (hasStrParams) {
      cleanRequestData.parametersStr = requestData.parametersStr;
    }

    console.log('发送保存请求:', cleanRequestData);
    
    const response = await setTerminalParams(cleanRequestData);

    if (response.code === 200) {
      proxy.$modal.msgSuccess('设置终端参数成功');
      // 设置成功后重新查询
      await handleQueryJt1078Params();
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('设置终端参数失败:', error);
    proxy.$modal.msgError('设置终端参数失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// 查询指定终端参数
const handleQuerySpecificTerminalParams = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  if (!jt1078QuerySpecificForm.ids.trim()) {
    proxy.$modal.msgWarning('请输入参数ID列表');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;

    // 解析参数ID列表
    const idArray = jt1078QuerySpecificForm.ids
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));

    if (idArray.length === 0) {
      proxy.$modal.msgWarning('参数ID格式无效');
      return;
    }

    const response = await querySpecificTerminalParams({
      clientId: jt1078CurrentDevice.mobileNo,
      id: idArray
    });

    if (response.code === 200 && response.data) {
      // 清空旧结果
      Object.keys(jt1078QuerySpecificResult).forEach(key => {
        delete jt1078QuerySpecificResult[key];
      });
      // 复制新结果
      if (response.data.parameters) {
        Object.assign(jt1078QuerySpecificResult, response.data.parameters);
      }
      // 初始化可编辑参数
      jt1078QuerySpecificEditableParams.value = [];
      for (const [key, value] of Object.entries(jt1078QuerySpecificResult)) {
        let displayValue = value;
        let editableValue = value;
        if (value && typeof value === 'object') {
          displayValue = JSON.stringify(value, null, 2);
          editableValue = JSON.stringify(value, null, 2);
        }
        jt1078QuerySpecificEditableParams.value.push({
          key,
          value: displayValue,
          editableValue,
          originalValue: value,
          isNew: false
        });
      }
      proxy.$modal.msgSuccess('查询指定参数成功');
    } else {
      proxy.$modal.msgError(response.msg || '查询失败');
    }
  } catch (error) {
    console.error('查询指定终端参数失败:', error);
    proxy.$modal.msgError('查询指定终端参数失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// 终端控制
const handleTerminalControl = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;

    const requestData: any = {
      clientId: jt1078CurrentDevice.mobileNo,
      command: jt1078ControlForm.command
    };

    if (jt1078ControlForm.parameter.trim()) {
      requestData.parameter = jt1078ControlForm.parameter.trim();
    }

    const response = await terminalControl(requestData);

    if (response.code === 200) {
      jt1078ControlResult.value = {
        success: true,
        message: '终端控制执行成功'
      };
      proxy.$modal.msgSuccess('终端控制执行成功');
    } else {
      jt1078ControlResult.value = {
        success: false,
        message: response.msg || '执行失败'
      };
      proxy.$modal.msgError(response.msg || '执行失败');
    }
  } catch (error) {
    console.error('终端控制失败:', error);
    jt1078ControlResult.value = {
      success: false,
      message: '终端控制执行失败'
    };
    proxy.$modal.msgError('终端控制执行失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// 保存查询指定参数的修改
const handleSetQuerySpecificParams = async () => {
  if (!jt1078CurrentDevice.mobileNo) {
    proxy.$modal.msgError('设备手机号不能为空');
    return;
  }

  if (!hasQuerySpecificModifiedParams.value) {
    proxy.$modal.msgWarning('没有修改任何参数');
    return;
  }

  try {
    jt1078ParamsLoading.value = true;
    const requestData: any = {
        clientId: jt1078CurrentDevice.mobileNo,
        parametersLong: {} as Record<number, number>,
        parametersStr: {} as Record<number, string>
      };

    // 遍历可编辑参数，只发送修改过的
    jt1078QuerySpecificEditableParams.value.forEach(param => {
      const key = Number(param.key);
      let value = param.editableValue;
      
      // 检查是否被修改过
      const isModified = String(param.originalValue) !== String(value);
      if (!isModified) {
        return; // 跳过未修改的参数
      }
      
      // 尝试解析JSON字符串，但只有当originalValue是对象时才解析
      let isObject = false;
      if (typeof value === 'string' && param.originalValue && typeof param.originalValue === 'object') {
        try {
          value = JSON.parse(value);
          isObject = true;
        } catch (e) {
          // 不是JSON，保持原样
        }
      }
      
      // 对象类型的参数跳过，不发送（这些是复杂对象，需要专门处理）
      if (isObject || (value && typeof value === 'object')) {
        console.warn('跳过对象类型参数，不建议编辑:', key, value);
        return;
      }
      
      // 尝试把值转换为数值，能成功就用parametersLong，否则用parametersStr
      const numValue = Number(value);
      if (!isNaN(numValue) && value !== '' && value !== null && value !== undefined) {
        // 能转换为数值，用parametersLong发送
        // 确保我们发送的是数值类型，而不是字符串
        requestData.parametersLong[key] = numValue;
      } else {
        // 不能转换为数值，用parametersStr发送
        requestData.parametersStr[key] = String(value);
      }
    });

    // 如果没有参数，直接返回
    const hasLongParams = Object.keys(requestData.parametersLong).length > 0;
    const hasStrParams = Object.keys(requestData.parametersStr).length > 0;
    
    if (!hasLongParams && !hasStrParams) {
      proxy.$modal.msgWarning('没有可保存的参数（对象类型参数不支持编辑）');
      return;
    }

    // 清理数据，确保没有parameters字段，只保留需要的字段
    const cleanRequestData: any = {
      clientId: requestData.clientId
    };
    
    if (hasLongParams) {
      cleanRequestData.parametersLong = requestData.parametersLong;
    }
    if (hasStrParams) {
      cleanRequestData.parametersStr = requestData.parametersStr;
    }

    console.log('发送保存查询指定参数请求:', cleanRequestData);
    
    const response = await setTerminalParams(cleanRequestData);

    if (response.code === 200) {
      proxy.$modal.msgSuccess('设置终端参数成功');
      // 设置成功后重新查询
      await handleQuerySpecificTerminalParams();
    } else {
      proxy.$modal.msgError(response.msg || '设置失败');
    }
  } catch (error) {
    console.error('设置终端参数失败:', error);
    proxy.$modal.msgError('设置终端参数失败');
  } finally {
    jt1078ParamsLoading.value = false;
  }
};

// 刷新设备状态和通道（GB28181）
const handleRefreshDevice = async (row: QsDevice) => {
  if (!row.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }

  try {
    // 设置刷新状态
    row.refreshing = true;
    refreshProgress.value = 0;
    refreshProgressDialogVisible.value = true;

    // 模拟进度条跳动
    const progressInterval = setInterval(() => {
      if (refreshProgress.value < 90) {
        refreshProgress.value += Math.floor(Math.random() * 10) + 1;
      }
    }, 300);

    // 调用刷新接口
    const response = await refreshDevice(row.gbDeviceId);

    // 清除进度条定时器
    clearInterval(progressInterval);

    if (response.code === 200) {
      // 设置为100%
      refreshProgress.value = 100;

      // 延迟关闭对话框，让用户看到100%
      setTimeout(() => {
        refreshProgressDialogVisible.value = false;
        proxy.$modal.msgSuccess('刷新成功');
        // 重新获取国标设备列表，更新通道信息
        getAllDevices().then((res) => {
          gb28181DeviceList.value = res.data;
        });
        // 刷新设备列表
        getList();
      }, 2000);
    } else {
      refreshProgressDialogVisible.value = false;
      proxy.$modal.msgError(response.msg || '刷新失败');
    }
  } catch (error) {
    console.error('刷新失败:', error);
    refreshProgressDialogVisible.value = false;
    proxy.$modal.msgError('刷新失败');
  } finally {
    row.refreshing = false;
  }
}

// 计算属性：判断是否应该显示抓图按钮
const shouldShowCaptureBtn = computed(() => {
  const supportedTypes = ['1', '2', '3', '4', '5', '6', '13', '14']; // 1=RTSP, 2=RTMP, 3=FLV, 4=HLS, 5=ONVIF, 6=视频文件, 13=PUSH, 14=部标1078
  const deviceType = deviceRow.value?.type;
  return supportedTypes.includes(deviceType) && streamInfo.value?.app && streamInfo.value?.stream;
});

// 获取设备抓图列表
function getDeviceSnapshotList() {
  deviceSnapshotLoading.value = true;
  listSnapshot({
    ...deviceSnapshotQuery,
    deviceId: deviceRow.value?.id
  }).then(response => {
    deviceSnapshotList.value = response.rows;
    deviceSnapshotTotal.value = response.total;
    deviceSnapshotLoading.value = false;
  }).catch(() => {
    deviceSnapshotLoading.value = false;
  });
}

// 删除单个抓图记录
function handleDeleteDeviceSnapshot(row: QsDeviceSnapshot) {
  proxy.$modal.confirm('是否确认删除该抓图记录?').then(() => {
    return delSnapshot(row.id!);
  }).then(() => {
    getDeviceSnapshotList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 下载抓图
// 下载抓图
async function handleDownloadDeviceSnapshot(row: QsDeviceSnapshot) {
  if (row.fileUrl) {
    try {
      // 用 fetch 获取 blob，确保真正下载而不是预览
      const response = await fetch(row.fileUrl);
      if (!response.ok) {
        throw new Error('下载失败');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // 从URL中提取文件名作为默认下载名
      const urlFileName = row.fileUrl.split('/').pop();
      link.download = row.fileName || urlFileName || 'snapshot.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      ElMessage.error('下载失败，请稍后重试');
    }
  }
}

// 简单的文件大小格式化
function formatDeviceSnapshotFileSize(bytes: number | undefined): string {
  if (bytes === undefined) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 从流中抓图
const handleCaptureFromStream = async () => {
  try {
    await proxy.$modal.confirm(`是否确认对设备"${deviceRow.value?.deviceName}"进行抓图？`);
    
    captureLoading.value = true;
    let response;
    const deviceType = deviceRow.value?.type;
    const deviceId = deviceRow.value?.id!;
    const channelId = deviceRow.value?.channel || 0;
    
    // 根据设备类型调用不同的API
    if (deviceType === '5') {
      // ONVIF 设备
      response = await captureOnvifAndSave(deviceId, channelId, 'manual');
    } else if (deviceType === '7') {
      // 海康设备
      response = await captureHaikangAndSave(deviceId, channelId, 'manual');
    } else if (deviceType === '8') {
      // 海康ISUP设备
      response = await captureHaiKangIsupAndSave(deviceId, channelId, 'manual');
    } else if (deviceType === '9') {
      // 大华设备
      response = await captureDaHuaAndSave(deviceId, channelId, 'manual');
    } else {
      // 其他设备（RTSP/RTMP/FLV/HLS等）
      if (!streamInfo.value?.app || !streamInfo.value?.stream) {
        proxy.$modal.msgError('流信息不完整，无法抓图');
        return;
      }
      response = await captureFromStream({
        deviceId: deviceId,
        app: streamInfo.value.app,
        stream: streamInfo.value.stream,
        snapshotType: 'manual'
      });
    }
    
    if (response.code === 200) {
      proxy.$modal.msgSuccess('抓图成功，已保存到数据库');
      // 刷新抓图列表
      getDeviceSnapshotList();
    } else {
      proxy.$modal.msgError(response.msg || '抓图失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('抓图失败:', error);
      proxy.$modal.msgError('抓图失败');
    }
  } finally {
    captureLoading.value = false;
  }
};

// 设备抓图
const handleCapture = async (row: QsDevice) => {
  try {
    await proxy.$modal.confirm(`是否确认对设备"${row.deviceName}"进行抓图？`);
    
    const channelId = row.channel || 0;
    let response;
    
    // 根据设备类型调用不同的API
    if (row.type === '5') {
      // ONVIF 设备
      response = await captureOnvifAndSave(row.id!, channelId, 'manual');
    } else if (row.type === '7') {
      // 海康设备
      response = await captureHaikangAndSave(row.id!, channelId, 'manual');
    } else if (row.type === '8') {
      // 海康ISUP设备
      response = await captureHaiKangIsupAndSave(row.id!, channelId, 'manual');
    } else if (row.type === '9') {
      // 大华设备
      response = await captureDaHuaAndSave(row.id!, channelId, 'manual');
    } else {
      proxy.$modal.msgError('不支持的设备类型');
      return;
    }
    
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

// 重启设备（支持海康/大华/海康ISUP/GB28181/JT1078/ONVIF）
const handleReboot = async (row: QsDevice) => {
  try {
    await proxy.$modal.confirm(`是否确认重启设备"${row.deviceName}"？`);
    
    let response;
    // 根据设备类型调用不同的API
    if (row.type === '5') {
      // ONVIF 设备
      response = await restartOnvifDevice(row.id!);
    } else if (row.type === '7') {
      // 海康设备
      response = await rebootHaiKangDevice(row.id!);
    } else if (row.type === '8') {
      // 海康ISUP设备
      response = await rebootHaiKangIsupDevice(row.id!);
    } else if (row.type === '9') {
      // 大华设备
      response = await rebootDaHuaDevice(row.id!);
    } else if (row.type === '12') {
      // GB28181 设备
      if (!row.gbDeviceId) {
        proxy.$modal.msgError('设备未配置国标设备ID');
        return;
      }
      response = await rebootGb28181Device(row.gbDeviceId);
    } else if (row.type === '14') {
      // JT1078 设备 - 终端控制命令字4是终端复位（重启）
      if (!row.jtMobileNo) {
        proxy.$modal.msgError('设备未配置JT1078手机号');
        return;
      }
      response = await terminalControl({
        clientId: row.jtMobileNo,
        command: 4, // 4表示终端复位（重启）
        parameter: ''
      });
    } else {
      proxy.$modal.msgError('不支持的设备类型');
      return;
    }
    
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

// 录像控制对话框
const recordDialogVisible = ref(false);
const recordDialogForm = ref({
  device: null as QsDevice | null,
  channelId: '',
  recordCmd: '1',
  streamNumber: 0
});
const gbChannelsList = ref<Gb28181Channel[]>([]);

// GB28181设备信息对话框
const gb28181DeviceInfoDialogVisible = ref(false);
const gb28181DeviceInfoTabActive = ref('deviceInfo');
const gb28181DeviceInfoLoading = ref(false);
const gb28181DeviceInfo = ref({
  deviceId: '',
  cmdType: '',
  sn: '',
  deviceName: '',
  result: '',
  manufacturer: '',
  model: '',
  firmware: '',
  channel: null as number | null,
  extraInfo: [] as string[]
});
const gb28181DeviceStatus = ref({
  deviceId: '',
  cmdType: '',
  sn: '',
  result: '',
  online: '',
  status: '',
  reason: '',
  encode: '',
  record: '',
  deviceTime: '',
  alarmStatus: [] as Array<{ deviceId: string; dutyStatus: string }>,
  extraInfo: [] as string[]
});


// 查询设备信息数据
const queryDeviceInfoData = async () => {
  if (!currentDeviceRow.value?.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }
  gb28181DeviceInfoLoading.value = true;
  try {
    const response = await queryDeviceInfo(currentDeviceRow.value.gbDeviceId);
    if (response.code === 200 && response.data) {
      gb28181DeviceInfo.value = {
        deviceId: response.data.deviceId || '',
        cmdType: response.data.cmdType || '',
        sn: response.data.sn || '',
        deviceName: response.data.deviceName || '',
        result: response.data.result || '',
        manufacturer: response.data.manufacturer || '',
        model: response.data.model || '',
        firmware: response.data.firmware || '',
        channel: response.data.channel || null,
        extraInfo: response.data.extraInfo || []
      };
    } else {
      proxy.$modal.msgError(response.msg || '查询设备信息失败');
    }
  } catch (error) {
    console.error('查询设备信息失败:', error);
    proxy.$modal.msgError('查询设备信息失败');
  } finally {
    gb28181DeviceInfoLoading.value = false;
  }
};

// 查询设备状态数据
const queryDeviceStatusData = async () => {
  if (!currentDeviceRow.value?.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }
  gb28181DeviceInfoLoading.value = true;
  try {
    const response = await queryDeviceStatus(currentDeviceRow.value.gbDeviceId);
    if (response.code === 200 && response.data) {
      gb28181DeviceStatus.value = {
        deviceId: response.data.deviceId || '',
        cmdType: response.data.cmdType || '',
        sn: response.data.sn || '',
        result: response.data.result || '',
        online: response.data.online || '',
        status: response.data.status || '',
        reason: response.data.reason || '',
        encode: response.data.encode || '',
        record: response.data.record || '',
        deviceTime: response.data.deviceTime || '',
        alarmStatus: response.data.alarmStatus || [],
        extraInfo: response.data.extraInfo || []
      };
    } else {
      proxy.$modal.msgError(response.msg || '查询设备状态失败');
    }
  } catch (error) {
    console.error('查询设备状态失败:', error);
    proxy.$modal.msgError('查询设备状态失败');
  } finally {
    gb28181DeviceInfoLoading.value = false;
  }
};

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  if (tabName === 'deviceInfo') {
    queryDeviceInfoData();
  } else if (tabName === 'deviceStatus') {
    queryDeviceStatusData();
  } else if (tabName === 'sdCard') {
    handleQueryGb28181SdCardStatus();
  }
};

// 刷新当前标签页
const handleRefreshCurrentTab = () => {
  if (gb28181DeviceInfoTabActive.value === 'deviceInfo') {
    queryDeviceInfoData();
  } else if (gb28181DeviceInfoTabActive.value === 'deviceStatus') {
    queryDeviceStatusData();
  } else if (gb28181DeviceInfoTabActive.value === 'sdCard') {
    handleQueryGb28181SdCardStatus();
  }
};

// ONVIF标签页切换处理
const handleOnvifTabChange = (tabName: string) => {
  if (tabName === 'deviceInfo') {
    handleRefreshOnvifDeviceInfo();
  } else if (tabName === 'storageConfigurations') {
    handleGetOnvifStorageConfigurations();
  } else if (tabName === 'storageCapabilities') {
    handleGetOnvifStorageCapabilities();
  } else if (tabName === 'storageState') {
    handleGetOnvifStorageState();
  } else if (tabName === 'networkInterfaces') {
    handleGetOnvifNetworkInterfaces();
  } else if (tabName === 'networkProtocols') {
    handleGetOnvifNetworkProtocols();
  } else if (tabName === 'videoSourceConfigs') {
    handleGetOnvifVideoSourceConfigs();
  } else if (tabName === 'videoEncoderConfigs') {
    handleGetOnvifVideoEncoderConfigs();
  } else if (tabName === 'audioSourceConfigs') {
    handleGetOnvifAudioSourceConfigs();
  } else if (tabName === 'audioEncoderConfigs') {
    handleGetOnvifAudioEncoderConfigs();
  } else if (tabName === 'videoOutputConfigs') {
    handleGetOnvifVideoOutputConfigs();
  }
};

// 设备信息标签页切换处理
const handleDeviceInfoTabChange = (tabName: string) => {
  if (tabName === 'deviceInfo') {
    handleRefreshDeviceInfo();
  } else if (tabName === 'systemParam') {
    handleGetSystemParam();
  } else if (tabName === 'videoParam') {
    handleGetVideoParam();
  } else if (tabName === 'deviceVideoParam') {
    handleGetDeviceVideoParam();
  } else if (tabName === 'storageInfo') {
    handleGetStorageInfo();
  } else if (tabName === 'systemResourceInfo') {
    handleGetSystemResourceInfo();
  } else if (tabName === 'sdCardInfo') {
    handleGetSDCardInfo();
  } else if (tabName === 'bitrateInfo') {
    handleGetBitrateInfo();
  } else if (tabName === 'networkStatusInfo') {
    handleGetNetworkStatusInfo();
  } else if (tabName === 'softwareVersionInfo') {
    handleGetSoftwareVersionInfo();
  } else if (tabName === 'recordStateInfo') {
    handleGetRecordStateInfo();
  } else if (tabName === 'powerStateInfo') {
    handleGetPowerStateInfo();
  } else if (tabName === 'alarmArmInfo') {
    handleGetAlarmArmInfo();
  } else if (tabName === 'cameraInfo') {
    handleGetCameraInfo();
  } else if (tabName === 'rtspUrlInfo') {
    handleGetRtspUrlInfo();
  }
};

// 海康设备信息标签页切换处理
const handleHaikangDeviceInfoTabChange = (tabName: string) => {
  if (tabName === 'deviceInfo') {
    handleRefreshHaikangDeviceInfo();
  } else if (tabName === 'storageInfo') {
    handleGetHaikangStorageInfo();
  } else if (tabName === 'sdCardInfo') {
    handleGetHaikangSdCardInfo();
  } else if (tabName === 'bitrateInfo') {
    handleGetHaikangBitrateInfo();
  } else if (tabName === 'networkStatusInfo') {
    handleGetHaikangNetworkStatusInfo();
  } else if (tabName === 'softwareVersionInfo') {
    handleGetHaikangSoftwareVersionInfo();
  } else if (tabName === 'recordStateInfo') {
    handleGetHaikangRecordStateInfo();
  } else if (tabName === 'powerStateInfo') {
    handleGetHaikangPowerStateInfo();
  } else if (tabName === 'alarmArmInfo') {
    handleGetHaikangAlarmArmInfo();
  } else if (tabName === 'cameraInfo') {
    handleGetHaikangCameraInfo();
  } else if (tabName === 'rtspUrlInfo') {
    handleGetHaikangRtspUrlInfo();
  }
};

// 海康ISUP设备信息标签页切换处理
const handleHaikangIsupDeviceInfoTabChange = (tabName: string) => {
  if (tabName === 'deviceInfo') {
    handleRefreshHaikangIsupDeviceInfo();
  } else if (tabName === 'storageInfo') {
    handleGetHaikangIsupStorageInfo();
  } else if (tabName === 'sdCardInfo') {
    handleGetHaikangIsupSdCardInfo();
  } else if (tabName === 'bitrateInfo') {
    handleGetHaikangIsupBitrateInfo();
  } else if (tabName === 'networkStatus') {
    handleGetHaikangIsupNetworkStatusInfo();
  } else if (tabName === 'softwareVersion') {
    handleGetHaikangIsupSoftwareVersionInfo();
  } else if (tabName === 'powerState') {
    handleGetHaikangIsupPowerStateInfo();
  } else if (tabName === 'cameraInfo') {
    handleGetHaikangIsupCameraInfo();
  } else if (tabName === 'deviceConfig') {
    handleGetHaikangIsupDeviceConfig();
  } else if (tabName === 'versionInfo') {
    handleGetHaikangIsupVersionInfo();
  } else if (tabName === 'systemStatus') {
    handleGetHaikangIsupSystemStatus();
  }
};

// JT1078设备信息标签页切换处理
const handleJt1078TabChange = (tabName: string) => {
  if (tabName === 'params') {
    handleQueryJt1078Params();
  } else if (tabName === 'terminalAVProperties') {
    handleQueryTerminalAVProperties();
  }
  // 注意：querySpecific 和 control 标签页不需要自动查询，因为它们需要用户主动输入
};

// 打开录像控制对话框
const handleRecordControl = async (row: QsDevice) => {
  if (row.type !== '12') {
    proxy.$modal.msgError('仅支持GB28181设备的录像控制');
    return;
  }
  if (!row.gbDeviceId) {
    proxy.$modal.msgError('设备未配置国标设备ID');
    return;
  }
  if (!row.gbChannelId) {
    proxy.$modal.msgError('设备未配置国标通道ID');
    return;
  }
  // 直接使用设备中已保存的 gbChannelId
  recordDialogForm.value = {
    device: row,
    channelId: row.gbChannelId,
    recordCmd: '1',
    streamNumber: 0
  };
  recordDialogVisible.value = true;
};

// 提交录像控制
const submitRecordControl = async () => {
  if (!recordDialogForm.value.device || !recordDialogForm.value.channelId) {
    proxy.$modal.msgError('请选择设备和通道');
    return;
  }
  try {
    const response = await recordCmd(
      recordDialogForm.value.device.gbDeviceId!,
      recordDialogForm.value.channelId,
      recordDialogForm.value.recordCmd,
      recordDialogForm.value.streamNumber
    );
    if (response.code === 200) {
      proxy.$modal.msgSuccess('录像控制命令已发送');
      recordDialogVisible.value = false;
    } else {
      proxy.$modal.msgError(response.msg || '录像控制失败');
    }
  } catch (error) {
    console.error('录像控制失败:', error);
    proxy.$modal.msgError('录像控制失败');
  }
};

// 设备信息对话框中的重启按钮处理
const handleDeviceInfoReboot = async () => {
  if (!currentDeviceRow.value) {
    proxy.$modal.msgError('设备信息未加载');
    return;
  }
  await handleReboot(currentDeviceRow.value);
}

// 设备信息对话框中的校时按钮处理
const handleDeviceInfoTimeSync = () => {
  if (!currentDeviceRow.value) {
    proxy.$modal.msgError('设备信息未加载');
    return;
  }
  openTimeSyncDialog(currentDeviceRow.value);
}

// 当前下载的设备行
let currentDownloadDevice: QsDevice | null = null;

// 海康设备信息弹窗
const haikangDeviceInfoDialogVisible = ref(false);
const haikangDeviceInfoTabActive = ref('deviceInfo');
const haikangDeviceInfoLoading = ref(false);

// 海康设备信息数据
const haikangDeviceInfo = reactive({
  success: false,
  deviceName: '',
  deviceType: '',
  serialNumber: '',
  ipAddress: '',
  channelNum: undefined as number | undefined,
  analogChanNum: undefined as number | undefined,
  ipChanNum: undefined as number | undefined,
  dvrType: undefined as number | undefined,
  devType: undefined as number | undefined,
  devClass: undefined as number | undefined,
  alarmInPortNum: undefined as number | undefined,
  alarmOutPortNum: undefined as number | undefined,
  diskNum: undefined as number | undefined
});

// 海康存储信息
const haikangStorageInfo = reactive({
  diskList: [],
  diskCount: 0,
  success: false
});

// 海康SD卡信息
const haikangSdCardInfo = reactive({
  success: false,
  sdCardCount: undefined as number | undefined,
  sdCardList: []
});

// 海康码流信息
const haikangBitrateInfo = reactive({
  success: false,
  streamList: []
});

// 海康网络状态信息
const haikangNetworkStatusInfo = reactive({
  success: false,
  clientList: [],
  clientCount: undefined as number | undefined,
  bitRate: undefined as number | undefined,
  allBitRate: undefined as number | undefined,
  ipLinkNum: undefined as number | undefined,
  exceedMaxLink: undefined as number | undefined
});

// 海康软件版本信息
const haikangSoftwareVersionInfo = reactive({
  success: false,
  deviceStatic: undefined as number | undefined,
  deviceStaticDesc: '',
  localDisplay: undefined as number | undefined,
  localDisplayDesc: ''
});

// 海康录像状态信息
const haikangRecordStateInfo = reactive({
  success: false,
  channelRecordList: []
});

// 海康电源状态信息
const haikangPowerStateInfo = reactive({
  success: false,
  deviceStatic: undefined as number | undefined,
  deviceStaticDesc: '',
  devicePowerStatus: undefined as number | undefined,
  localDisplay: undefined as number | undefined
});

// 海康报警布防信息
const haikangAlarmArmInfo = reactive({
  success: false,
  alarmInList: [],
  alarmOutList: []
});

// 海康摄像头属性信息
const haikangCameraInfo = reactive({
  success: false,
  cameraList: []
});

// 海康RTSP URL信息
const haikangRtspUrlInfo = reactive({
    success: false,
    rtspUrl: ''
});

// 海康ISUP设备信息弹窗
const haikangIsupDeviceInfoDialogVisible = ref(false);
const haikangIsupDeviceInfoTabActive = ref('deviceInfo');
const haikangIsupDeviceInfoLoading = ref(false);

// 海康ISUP设备信息数据
const haikangIsupDeviceInfo = reactive({
    success: false,
    deviceName: '',
    deviceType: '',
    serialNumber: '',
    ipAddress: '',
    channelNum: undefined as number | undefined,
    analogChanNum: undefined as number | undefined,
    ipChanNum: undefined as number | undefined,
    dvrType: undefined as number | undefined,
    devType: undefined as number | undefined,
    devClass: undefined as number | undefined,
    alarmInPortNum: undefined as number | undefined,
    alarmOutPortNum: undefined as number | undefined,
    diskNum: undefined as number | undefined
});

// 海康ISUP存储信息
const haikangIsupStorageInfo = reactive({
    diskList: [],
    diskCount: 0,
    success: false
});

// 海康ISUP SD卡信息
const haikangIsupSdCardInfo = reactive({
    success: false,
    sdCardCount: undefined as number | undefined,
    sdCardList: []
});

// 海康ISUP码流信息
const haikangIsupBitrateInfo = reactive({
    success: false,
    streamList: []
});

// 海康ISUP网络状态信息
const haikangIsupNetworkStatusInfo = reactive({
    success: false,
    clientList: [],
    clientCount: undefined as number | undefined,
    bitRate: undefined as number | undefined,
    allBitRate: undefined as number | undefined,
    ipLinkNum: undefined as number | undefined,
    exceedMaxLink: undefined as number | undefined
});

// 海康ISUP软件版本信息
const haikangIsupSoftwareVersionInfo = reactive({
    success: false,
    deviceStatic: undefined as number | undefined,
    deviceStaticDesc: '',
    localDisplay: undefined as number | undefined,
    localDisplayDesc: ''
});

// 海康ISUP电源状态信息
const haikangIsupPowerStateInfo = reactive({
    success: false,
    deviceStatic: undefined as number | undefined,
    deviceStaticDesc: '',
    devicePowerStatus: undefined as number | undefined,
    localDisplay: undefined as number | undefined
});

// 海康ISUP摄像头属性信息
const haikangIsupCameraInfo = reactive({
    success: false,
    cameraList: []
});

// 海康ISUP系统状态信息
const haikangIsupSystemStatusInfo = reactive({
    success: false,
    currentDeviceTime: '',
    deviceUpTime: 0,
    cpuList: [] as Array<{ cpuUtilization: number }>,
    memoryList: [] as Array<{ memoryDescription: string, memoryUsage: number, memoryAvailable: number }>,
    netPortStatusList: [] as Array<{ id: number, netPortDescription: string, linkStatus: string }>
});

// 海康ISUP远程升级
const haikangIsupUpgradeDialogVisible = ref(false);
const haikangIsupUpgradeLoading = ref(false);
const haikangIsupUpgradeForm = reactive({
  deviceId: null as number | null,
  ftpServerIp: '',
  ftpServerPort: 21,
  ftpAccount: '',
  ftpPassword: '',
  fileName: '',
  channel: 0
});
const haikangIsupUpgradeResult = reactive({
  success: false,
  message: '',
  upgradeResult: '',
  beforeInfo: {} as any
});

// 海康ISUP设备配置
const haikangIsupDeviceConfig = reactive({
  success: false,
  deviceName: '',
  deviceDescription: '',
  deviceLocation: '',
  systemContact: '',
  model: '',
  serialNumber: '',
  macAddress: '',
  firmwareVersion: '',
  hardwareVersion: '',
  manufacturer: '',
  deviceType: ''
});

// 海康ISUP版本信息
const haikangIsupVersionInfo = reactive({
  success: false,
  softwareVersion: '',
  encodeVersion: '',
  panelVersion: '',
  hardwareVersion: ''
});



// 获取下载对话框标题
const getDownloadDialogTitle = () => {
  if (!currentDownloadDevice) {
    return '设备录像下载';
  }
  const deviceType = String(currentDownloadDevice.type);
  if (deviceType === '9') {
    return '大华设备录像下载';
  } else if (deviceType === '7') {
    return '海康SDK设备录像下载';
  } else if (deviceType === '8') {
    return '海康ISUP设备录像下载';
  }
  return '设备录像下载';
};

// 打开录像下载对话框
const openDownloadRecordDialog = (row: QsDevice) => {
  currentDownloadDevice = row;
  downloadRecordForm.deviceId = row.id;
  downloadRecordForm.deviceName = row.deviceName || '';
  downloadRecordForm.channelId = row.channel || 0;
  
  // 默认设置时间为过去10分钟到现在
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  
  downloadRecordForm.startTime = formatDateTime(tenMinutesAgo);
  downloadRecordForm.endTime = formatDateTime(now);
  downloadRecordForm.recordFileType = 0;
  
  downloadResult.value = null;
  downloadRecordDialogVisible.value = true;
}

// 格式化日期时间
const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 处理录像下载
const handleDownloadRecord = async () => {
  if (!downloadRecordForm.deviceId) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  if (!downloadRecordForm.startTime) {
    proxy.$modal.msgError('请选择开始时间');
    return;
  }
  if (!downloadRecordForm.endTime) {
    proxy.$modal.msgError('请选择结束时间');
    return;
  }
  
  // 验证时间差是否超过10分钟
  const start = new Date(downloadRecordForm.startTime);
  const end = new Date(downloadRecordForm.endTime);
  const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  
  if (diffMinutes > 10) {
    proxy.$modal.msgWarning('下载时间范围不能超过10分钟');
    return;
  }
  if (diffMinutes <= 0) {
    proxy.$modal.msgError('结束时间必须大于开始时间');
    return;
  }
  
  if (!currentDownloadDevice) {
    proxy.$modal.msgError('请先选择设备');
    return;
  }
  
  downloadRecordLoading.value = true;
  downloadResult.value = null;
  
  // 显示加载提示
  const loading = ElLoading.service({
    lock: true,
    text: "正在下载录像，请稍候...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  
  try {
    const deviceType = String(currentDownloadDevice.type);
    const isDaHuaDevice = deviceType === '9'; // 9=大华SDK
    const isHaikangDevice = deviceType === '7' || deviceType === '8'; // 7=海康SDK,8=海康ISUP
    
    let blob: any;
    let extension: string = '.dav';
    
    if (isDaHuaDevice) {
      const request: DaHuaRecordDownloadRequest = {
        id: downloadRecordForm.deviceId,
        channelId: downloadRecordForm.channelId,
        startTime: downloadRecordForm.startTime,
        endTime: downloadRecordForm.endTime,
        recordFileType: downloadRecordForm.recordFileType
      };
      
      blob = await downloadDaHuaRecordDirect(request);
      extension = '.dav';
    } else if (isHaikangDevice) {
      const request = {
        id: downloadRecordForm.deviceId,
        channelId: downloadRecordForm.channelId,
        startTime: downloadRecordForm.startTime,
        endTime: downloadRecordForm.endTime,
        recordFileType: downloadRecordForm.recordFileType
      };
      
      if (deviceType === '8') {
        // 海康ISUP设备
        blob = await downloadHaikangIsupRecordDirect(request);
      } else {
        // 海康SDK设备
        blob = await downloadHaikangRecordDirect(request);
      }
      extension = '.mp4';
    } else {
      proxy.$modal.msgError('仅支持大华和海康设备录像下载');
      return;
    }
    
    // 如果 size > 0，直接当作文件下载
    if (blob.size > 0) {
      const fileName = `device_${downloadRecordForm.deviceId}_channel_${downloadRecordForm.channelId}_${downloadRecordForm.startTime.replace(/[:\s]/g, '-')}${extension}`;
      saveAs(blob, fileName);
      proxy.$modal.msgSuccess('录像下载成功');
    } else {
      // 尝试解析错误信息
      const text = await blob.text();
      try {
        const errorData = JSON.parse(text);
        proxy.$modal.msgError(errorData.msg || errorData.data?.errorMessage || '录像下载失败');
      } catch (e) {
        proxy.$modal.msgError('录像下载失败');
      }
    }
  } catch (error) {
    console.error('录像下载失败:', error);
    proxy.$modal.msgError('录像下载失败');
  } finally {
    downloadRecordLoading.value = false;
    // 关闭加载提示
    loading.close();
  }
}

// 打开设备信息对话框
const openDeviceInfoDialog = (row: QsDevice) => {
  currentDeviceId.value = row.id;
  currentDeviceRow.value = row;
  
  const isOnvifDevice = row.type === '5';
  const isHaikangSdkDevice = row.type === '7';
  const isHaikangIsupDevice = row.type === '8';
  const isDaHuaDevice = row.type === '9';
  const isGB28181Device = row.type === '12';
  const isJT1078Device = row.type === '14';
  
  if (isOnvifDevice) {
    onvifDeviceInfoTabActive.value = 'deviceInfo';
    onvifDeviceInfo.success = false;
    onvifDeviceInfo.manufacturer = '';
    onvifDeviceInfo.model = '';
    onvifDeviceInfo.firmwareVersion = '';
    onvifDeviceInfo.streamUris = [];
    onvifDeviceInfo.profileCount = 0;
    onvifDeviceInfo.profiles = [];
    
    // 重置存储信息状态
    onvifStorageDevice.value = row;
    onvifStorageConfigurations.success = false;
    Object.keys(onvifStorageConfigurations).forEach(key => {
      if (key !== 'success') {
        delete onvifStorageConfigurations[key];
      }
    });
    onvifStorageCapabilities.success = false;
    Object.keys(onvifStorageCapabilities).forEach(key => {
      if (key !== 'success') {
        delete onvifStorageCapabilities[key];
      }
    });
    onvifStorageState.success = false;
    Object.keys(onvifStorageState).forEach(key => {
      if (key !== 'success') {
        delete onvifStorageState[key];
      }
    });
    
    onvifDeviceInfoDialogVisible.value = true;
    handleRefreshOnvifDeviceInfo();
    return;
  }
  
  if (isJT1078Device) {
    // 打开JT1078终端参数对话框
    openJt1078ParamsDialog(row);
  } else if (isHaikangSdkDevice) {
    // 打开海康SDK设备信息弹窗
    haikangDeviceInfoTabActive.value = 'deviceInfo';
    Object.assign(haikangDeviceInfo, {
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
    Object.assign(haikangStorageInfo, {
      diskList: [],
      diskCount: 0,
      success: false
    });
    Object.assign(haikangSdCardInfo, {
      success: false,
      exists: false
    });
    Object.assign(haikangBitrateInfo, {
      success: false,
      channelBitrates: []
    });
    Object.assign(haikangNetworkStatusInfo, {
      success: false
    });
    Object.assign(haikangSoftwareVersionInfo, {
      success: false
    });
    Object.assign(haikangRecordStateInfo, {
      success: false
    });
    Object.assign(haikangPowerStateInfo, {
      success: false
    });
    Object.assign(haikangAlarmArmInfo, {
      success: false
    });
    Object.assign(haikangCameraInfo, {
      success: false
    });
    Object.assign(haikangRtspUrlInfo, {
      success: false
    });
    haikangDeviceInfoDialogVisible.value = true;
    handleRefreshHaikangDeviceInfo();
  } else if (isHaikangIsupDevice) {
    // 打开海康ISUP设备信息弹窗
    haikangIsupDeviceInfoTabActive.value = 'deviceInfo';
    Object.assign(haikangIsupDeviceInfo, {
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
    Object.assign(haikangIsupStorageInfo, {
      diskList: [],
      diskCount: 0,
      success: false
    });
    Object.assign(haikangIsupSdCardInfo, {
      success: false,
      exists: false
    });
    Object.assign(haikangIsupBitrateInfo, {
      success: false,
      channelBitrates: []
    });
    Object.assign(haikangIsupNetworkStatusInfo, {
      success: false
    });
    Object.assign(haikangIsupSoftwareVersionInfo, {
      success: false
    });
    Object.assign(haikangIsupPowerStateInfo, {
      success: false
    });
    Object.assign(haikangIsupCameraInfo, {
      success: false
    });
    Object.assign(haikangIsupDeviceConfig, {
      success: false,
      deviceName: '',
      deviceDescription: '',
      deviceLocation: '',
      systemContact: '',
      model: '',
      serialNumber: '',
      macAddress: '',
      firmwareVersion: '',
      hardwareVersion: '',
      manufacturer: '',
      deviceType: ''
    });
    Object.assign(haikangIsupVersionInfo, {
      success: false,
      softwareVersion: '',
      encodeVersion: '',
      panelVersion: '',
      hardwareVersion: ''
    });
    haikangIsupDeviceInfoDialogVisible.value = true;
    handleRefreshHaikangIsupDeviceInfo();
  } else if (isDaHuaDevice) {
    // 打开大华设备信息弹窗
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
    storageInfo.storageDevices = [];
    Object.assign(systemResourceInfo, {
      success: false,
      cpuUsage: 0,
      memoryUsage: 0
    });
    Object.assign(sdCardInfo, {
      success: false,
      exists: false
    });
    Object.assign(bitrateInfo, {
      success: false,
      channelBitrates: []
    });
    Object.assign(networkStatusInfo, {
      success: false
    });
    Object.assign(softwareVersionInfo, {
      success: false
    });
    deviceInfoDialogVisible.value = true;
    handleRefreshDeviceInfo();
  } else if (isGB28181Device) {
    // 打开GB28181设备信息弹窗
    gb28181DeviceInfoTabActive.value = 'deviceInfo';
    Object.assign(gb28181DeviceInfo, {
      deviceId: '',
      cmdType: '',
      sn: '',
      deviceName: '',
      result: '',
      manufacturer: '',
      model: '',
      firmware: '',
      channel: null,
      extraInfo: []
    });
    Object.assign(gb28181DeviceStatus, {
      deviceId: '',
      cmdType: '',
      sn: '',
      result: '',
      online: '',
      status: '',
      reason: '',
      encode: '',
      record: '',
      deviceTime: '',
      alarmStatus: [],
      extraInfo: []
    });
    Object.assign(gb28181SdCardForm, {
      sdCardId: 0
    });
    Object.assign(gb28181SdCardInfo, {});
    gb28181DeviceInfoDialogVisible.value = true;
    queryDeviceInfoData();
  }
}

// 获取系统参数
const handleGetSystemParam = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangSystemParam(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaSystemParam(currentDeviceId.value);
    }
    
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
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangVideoParam(currentDeviceId.value, videoParam.channelId, videoParam.streamType);
    } else if (isDaHuaDevice) {
      res = await getDaHuaVideoParam(currentDeviceId.value, videoParam.channelId, videoParam.streamType);
    }
    
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

// 获取存储信息
const handleGetStorageInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangStorageInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaStorageInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      storageInfo.storageDevices = res.data.storageDevices || [];
      proxy.$modal.msgSuccess('获取存储信息成功');
    }
  } catch (error) {
    console.error('获取存储信息失败:', error);
    proxy.$modal.msgError('获取存储信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 获取系统资源信息
const handleGetSystemResourceInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      // 海康系统资源信息暂未实现
      proxy.$modal.msgInfo('海康系统资源信息暂未实现');
      return;
    } else if (isDaHuaDevice) {
      res = await getDaHuaSystemResourceInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(systemResourceInfo, res.data);
      proxy.$modal.msgSuccess('获取系统资源信息成功');
    }
  } catch (error) {
    console.error('获取系统资源信息失败:', error);
    proxy.$modal.msgError('获取系统资源信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 获取SD卡信息
// 获取磁盘状态文本
const getDiskStatusText = (diskStatus: number | undefined, status: number | undefined) => {
  if (diskStatus !== undefined) {
    const statusMap: Record<number, string> = {
      0: '未知',
      1: '正常',
      2: '异常',
      3: '未格式化',
      4: '格式化中',
      5: '正在检测',
      6: '休眠',
      7: '离线'
    };
    return statusMap[diskStatus] || `状态(${diskStatus})`;
  }
  if (status !== undefined) {
    return `状态(${status})`;
  }
  return '-';
};

const getDiskStatusType = (diskStatus: number | undefined, status: number | undefined) => {
  const targetStatus = diskStatus !== undefined ? diskStatus : status;
  if (targetStatus === undefined) return 'info';
  
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'danger',
    3: 'warning',
    4: 'warning',
    5: 'warning',
    6: 'info',
    7: 'danger'
  };
  return typeMap[targetStatus] || 'info';
};

const getProgressColor = (percentage: number | undefined) => {
  if (percentage === undefined) return '#409EFF';
  if (percentage < 50) return '#67C23A';
  if (percentage < 80) return '#E6A23C';
  return '#F56C6C';
};

const handleGetSDCardInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangSDCardInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaSDCardInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(sdCardInfo, res.data);
      proxy.$modal.msgSuccess('获取SD卡信息成功');
    }
  } catch (error) {
    console.error('获取SD卡信息失败:', error);
    proxy.$modal.msgError('获取SD卡信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 获取码流信息
const handleGetBitrateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangBitrateInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaBitrateInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(bitrateInfo, res.data);
      proxy.$modal.msgSuccess('获取码流信息成功');
    }
  } catch (error) {
    console.error('获取码流信息失败:', error);
    proxy.$modal.msgError('获取码流信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 获取网络状态信息
const handleGetNetworkStatusInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangNetworkStatusInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaNetworkStatusInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(networkStatusInfo, res.data);
      proxy.$modal.msgSuccess('获取网络状态信息成功');
    }
  } catch (error) {
    console.error('获取网络状态信息失败:', error);
    proxy.$modal.msgError('获取网络状态信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

// 获取软件版本信息
const handleGetSoftwareVersionInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangSoftwareVersionInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaSoftwareVersionInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(softwareVersionInfo, res.data);
      proxy.$modal.msgSuccess('获取软件版本信息成功');
    }
  } catch (error) {
    console.error('获取软件版本信息失败:', error);
    proxy.$modal.msgError('获取软件版本信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

const handleGetRecordStateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangRecordStateInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaRecordStateInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(recordStateInfo, res.data);
      proxy.$modal.msgSuccess('获取录像状态信息成功');
    }
  } catch (error) {
    console.error('获取录像状态信息失败:', error);
    proxy.$modal.msgError('获取录像状态信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

const handleGetPowerStateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangPowerStateInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaPowerStateInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(powerStateInfo, res.data);
      proxy.$modal.msgSuccess('获取电源状态信息成功');
    }
  } catch (error) {
    console.error('获取电源状态信息失败:', error);
    proxy.$modal.msgError('获取电源状态信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

const handleGetAlarmArmInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangAlarmArmInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaAlarmArmInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(alarmArmInfo, res.data);
      proxy.$modal.msgSuccess('获取报警布防信息成功');
    }
  } catch (error) {
    console.error('获取报警布防信息失败:', error);
    proxy.$modal.msgError('获取报警布防信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

const handleGetCameraInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangCameraInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaCameraInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(cameraInfo, res.data);
      proxy.$modal.msgSuccess('获取摄像头属性信息成功');
    }
  } catch (error) {
    console.error('获取摄像头属性信息失败:', error);
    proxy.$modal.msgError('获取摄像头属性信息失败');
  } finally {
    deviceInfoLoading.value = false;
  }
}

const handleGetRtspUrlInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    deviceInfoLoading.value = true;
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangRtspUrlInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaRtspUrlInfo(currentDeviceId.value);
    }
    
    if (res.data) {
      Object.assign(rtspUrlInfo, res.data);
      proxy.$modal.msgSuccess('获取RTSP URL信息成功');
    }
  } catch (error) {
    console.error('获取RTSP URL信息失败:', error);
    proxy.$modal.msgError('获取RTSP URL信息失败');
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
    const isHaikangDevice = currentDeviceRow.value.type === '7' || currentDeviceRow.value.type === '8';
    const isDaHuaDevice = currentDeviceRow.value.type === '9';
    let res;
    
    if (isHaikangDevice) {
      res = await getHaiKangDeviceInfo(currentDeviceId.value);
    } else if (isDaHuaDevice) {
      res = await getDaHuaDeviceInfo(currentDeviceId.value);
    }
    
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

// 海康设备信息 - 刷新设备信息
const handleRefreshHaikangDeviceInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangDeviceInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangDeviceInfo, res.data);
      proxy.$modal.msgSuccess('获取设备信息成功');
    }
  } catch (error) {
    console.error('获取设备信息失败:', error);
    proxy.$modal.msgError('获取设备信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取存储信息
const handleGetHaikangStorageInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangStorageInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangStorageInfo, res.data);
      proxy.$modal.msgSuccess('获取存储信息成功');
    }
  } catch (error) {
    console.error('获取存储信息失败:', error);
    proxy.$modal.msgError('获取存储信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取SD卡信息
const handleGetHaikangSdCardInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangSDCardInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangSdCardInfo, res.data);
      proxy.$modal.msgSuccess('获取SD卡信息成功');
    }
  } catch (error) {
    console.error('获取SD卡信息失败:', error);
    proxy.$modal.msgError('获取SD卡信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取码率信息
const handleGetHaikangBitrateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangBitrateInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangBitrateInfo, res.data);
      proxy.$modal.msgSuccess('获取码率信息成功');
    }
  } catch (error) {
    console.error('获取码率信息失败:', error);
    proxy.$modal.msgError('获取码率信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取网络状态信息
const handleGetHaikangNetworkStatusInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangNetworkStatusInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangNetworkStatusInfo, res.data);
      proxy.$modal.msgSuccess('获取网络状态信息成功');
    }
  } catch (error) {
    console.error('获取网络状态信息失败:', error);
    proxy.$modal.msgError('获取网络状态信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取软件版本信息
const handleGetHaikangSoftwareVersionInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangSoftwareVersionInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangSoftwareVersionInfo, res.data);
      proxy.$modal.msgSuccess('获取软件版本信息成功');
    }
  } catch (error) {
    console.error('获取软件版本信息失败:', error);
    proxy.$modal.msgError('获取软件版本信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取录像状态信息
const handleGetHaikangRecordStateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangRecordStateInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangRecordStateInfo, res.data);
      proxy.$modal.msgSuccess('获取录像状态信息成功');
    }
  } catch (error) {
    console.error('获取录像状态信息失败:', error);
    proxy.$modal.msgError('获取录像状态信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取电源状态信息
const handleGetHaikangPowerStateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangPowerStateInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangPowerStateInfo, res.data);
      proxy.$modal.msgSuccess('获取电源状态信息成功');
    }
  } catch (error) {
    console.error('获取电源状态信息失败:', error);
    proxy.$modal.msgError('获取电源状态信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取报警布防信息
const handleGetHaikangAlarmArmInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangAlarmArmInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangAlarmArmInfo, res.data);
      proxy.$modal.msgSuccess('获取报警布防信息成功');
    }
  } catch (error) {
    console.error('获取报警布防信息失败:', error);
    proxy.$modal.msgError('获取报警布防信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取摄像头属性信息
const handleGetHaikangCameraInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangCameraInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangCameraInfo, res.data);
      proxy.$modal.msgSuccess('获取摄像头属性信息成功');
    }
  } catch (error) {
    console.error('获取摄像头属性信息失败:', error);
    proxy.$modal.msgError('获取摄像头属性信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康设备信息 - 获取RTSP URL信息
const handleGetHaikangRtspUrlInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangDeviceInfoLoading.value = true;
    const res = await getHaiKangRtspUrlInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangRtspUrlInfo, res.data);
      proxy.$modal.msgSuccess('获取RTSP URL信息成功');
    }
  } catch (error) {
    console.error('获取RTSP URL信息失败:', error);
    proxy.$modal.msgError('获取RTSP URL信息失败');
  } finally {
    haikangDeviceInfoLoading.value = false;
  }
}

// 海康ISUP设备信息 - 刷新设备信息
const handleRefreshHaikangIsupDeviceInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupDeviceInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupDeviceInfo, res.data);
      proxy.$modal.msgSuccess('获取设备信息成功');
    }
  } catch (error) {
    console.error('获取设备信息失败:', error);
    proxy.$modal.msgError('获取设备信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// ONVIF设备信息 - 刷新设备信息
const handleRefreshOnvifDeviceInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifDeviceInfoLoading.value = true;
    const res = await getOnvifDeviceInfo(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    if (data.success !== undefined ? data.success : true) {
      onvifDeviceInfo.success = true;
      onvifDeviceInfo.manufacturer = data.manufacturer || '';
      onvifDeviceInfo.model = data.model || '';
      onvifDeviceInfo.firmwareVersion = data.firmwareVersion || '';
      
      // 处理流地址数据 - 后端返回的是字符串数组，需要转换为对象数组
      const streamUris = data.streamUris || [];
      onvifDeviceInfo.streamUris = streamUris.map((uri, index) => ({
        uri: uri,
        type: index === 0 ? 'main' : 'sub'  // 第一个默认是主码流，后续是子码流
      }));
      
      onvifDeviceInfo.profileCount = data.profileCount || 0;
      
      // 处理 Profiles 数据 - 后端返回的是字符串数组，需要转换为对象数组
      const profiles = data.profiles || [];
      onvifDeviceInfo.profiles = profiles.map((token, index) => ({
        token: token,
        name: `Profile ${index + 1}`
      }));
      
      proxy.$modal.msgSuccess('获取设备信息成功');
    } else {
      proxy.$modal.msgError(data.message || '获取设备信息失败');
    }
  } catch (error) {
    console.error('获取设备信息失败:', error);
    proxy.$modal.msgError('获取设备信息失败');
  } finally {
    onvifDeviceInfoLoading.value = false;
  }
}

// ONVIF存储信息 - 获取存储配置
const handleGetOnvifStorageConfigurations = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifStorageConfigurations(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifStorageConfigurations).forEach(key => {
      delete onvifStorageConfigurations[key];
    });
    onvifStorageConfigurations.success = true;
    Object.assign(onvifStorageConfigurations, data);
    
    proxy.$modal.msgSuccess('获取存储配置成功');
  } catch (error) {
    console.error('获取存储配置失败:', error);
    proxy.$modal.msgError('获取存储配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF存储信息 - 获取存储能力
const handleGetOnvifStorageCapabilities = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifStorageCapabilities(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifStorageCapabilities).forEach(key => {
      delete onvifStorageCapabilities[key];
    });
    onvifStorageCapabilities.success = true;
    Object.assign(onvifStorageCapabilities, data);
    
    proxy.$modal.msgSuccess('获取存储能力成功');
  } catch (error) {
    console.error('获取存储能力失败:', error);
    proxy.$modal.msgError('获取存储能力失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF存储信息 - 获取存储状态
const handleGetOnvifStorageState = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifStorageState(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifStorageState).forEach(key => {
      delete onvifStorageState[key];
    });
    onvifStorageState.success = true;
    Object.assign(onvifStorageState, data);
    
    proxy.$modal.msgSuccess('获取存储状态成功');
  } catch (error) {
    console.error('获取存储状态失败:', error);
    proxy.$modal.msgError('获取存储状态失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF网络配置 - 获取网络接口配置
const handleGetOnvifNetworkInterfaces = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifNetworkInterfaces(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifNetworkInterfaces).forEach(key => {
      delete onvifNetworkInterfaces[key];
    });
    onvifNetworkInterfaces.success = true;
    Object.assign(onvifNetworkInterfaces, data);
    
    proxy.$modal.msgSuccess('获取网络接口配置成功');
  } catch (error) {
    console.error('获取网络接口配置失败:', error);
    proxy.$modal.msgError('获取网络接口配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF网络配置 - 获取网络协议配置
const handleGetOnvifNetworkProtocols = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifNetworkProtocols(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifNetworkProtocols).forEach(key => {
      delete onvifNetworkProtocols[key];
    });
    onvifNetworkProtocols.success = true;
    Object.assign(onvifNetworkProtocols, data);
    
    proxy.$modal.msgSuccess('获取网络协议配置成功');
  } catch (error) {
    console.error('获取网络协议配置失败:', error);
    proxy.$modal.msgError('获取网络协议配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF媒体配置 - 获取视频源配置
const handleGetOnvifVideoSourceConfigs = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifVideoSourceConfigs(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifVideoSourceConfigs).forEach(key => {
      delete onvifVideoSourceConfigs[key];
    });
    onvifVideoSourceConfigs.success = true;
    Object.assign(onvifVideoSourceConfigs, data);
    
    proxy.$modal.msgSuccess('获取视频源配置成功');
  } catch (error) {
    console.error('获取视频源配置失败:', error);
    proxy.$modal.msgError('获取视频源配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF媒体配置 - 获取视频编码器配置
const handleGetOnvifVideoEncoderConfigs = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifVideoEncoderConfigs(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifVideoEncoderConfigs).forEach(key => {
      delete onvifVideoEncoderConfigs[key];
    });
    onvifVideoEncoderConfigs.success = true;
    Object.assign(onvifVideoEncoderConfigs, data);
    
    proxy.$modal.msgSuccess('获取视频编码器配置成功');
  } catch (error) {
    console.error('获取视频编码器配置失败:', error);
    proxy.$modal.msgError('获取视频编码器配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF媒体配置 - 获取音频源配置
const handleGetOnvifAudioSourceConfigs = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifAudioSourceConfigs(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifAudioSourceConfigs).forEach(key => {
      delete onvifAudioSourceConfigs[key];
    });
    onvifAudioSourceConfigs.success = true;
    Object.assign(onvifAudioSourceConfigs, data);
    
    proxy.$modal.msgSuccess('获取音频源配置成功');
  } catch (error) {
    console.error('获取音频源配置失败:', error);
    proxy.$modal.msgError('获取音频源配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF媒体配置 - 获取音频编码器配置
const handleGetOnvifAudioEncoderConfigs = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifAudioEncoderConfigs(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifAudioEncoderConfigs).forEach(key => {
      delete onvifAudioEncoderConfigs[key];
    });
    onvifAudioEncoderConfigs.success = true;
    Object.assign(onvifAudioEncoderConfigs, data);
    
    proxy.$modal.msgSuccess('获取音频编码器配置成功');
  } catch (error) {
    console.error('获取音频编码器配置失败:', error);
    proxy.$modal.msgError('获取音频编码器配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// ONVIF媒体配置 - 获取视频输出配置
const handleGetOnvifVideoOutputConfigs = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    onvifStorageLoading.value = true;
    const res = await getOnvifVideoOutputConfigs(currentDeviceId.value);
    
    // 从 res.data 中获取实际数据，兼容两种返回格式
    const data = res.data || res;
    
    // 清空并设置新数据
    Object.keys(onvifVideoOutputConfigs).forEach(key => {
      delete onvifVideoOutputConfigs[key];
    });
    onvifVideoOutputConfigs.success = true;
    Object.assign(onvifVideoOutputConfigs, data);
    
    proxy.$modal.msgSuccess('获取视频输出配置成功');
  } catch (error) {
    console.error('获取视频输出配置失败:', error);
    proxy.$modal.msgError('获取视频输出配置失败');
  } finally {
    onvifStorageLoading.value = false;
  }
}

// 海康ISUP设备信息 - 获取存储信息
const handleGetHaikangIsupStorageInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupStorageInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupStorageInfo, res.data);
      proxy.$modal.msgSuccess('获取存储信息成功');
    }
  } catch (error) {
    console.error('获取存储信息失败:', error);
    proxy.$modal.msgError('获取存储信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 海康ISUP设备信息 - 获取SD卡信息
const handleGetHaikangIsupSdCardInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupSDCardInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupSdCardInfo, res.data);
      proxy.$modal.msgSuccess('获取SD卡信息成功');
    }
  } catch (error) {
    console.error('获取SD卡信息失败:', error);
    proxy.$modal.msgError('获取SD卡信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 海康ISUP设备信息 - 获取码率信息
const handleGetHaikangIsupBitrateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupBitrateInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupBitrateInfo, res.data);
      proxy.$modal.msgSuccess('获取码率信息成功');
    }
  } catch (error) {
    console.error('获取码率信息失败:', error);
    proxy.$modal.msgError('获取码率信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 海康ISUP设备信息 - 获取网络状态信息
const handleGetHaikangIsupNetworkStatusInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupNetworkStatusInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupNetworkStatusInfo, res.data);
      proxy.$modal.msgSuccess('获取网络状态信息成功');
    }
  } catch (error) {
    console.error('获取网络状态信息失败:', error);
    proxy.$modal.msgError('获取网络状态信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 海康ISUP设备信息 - 获取软件版本信息
const handleGetHaikangIsupSoftwareVersionInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupSoftwareVersionInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupSoftwareVersionInfo, res.data);
      proxy.$modal.msgSuccess('获取软件版本信息成功');
    }
  } catch (error) {
    console.error('获取软件版本信息失败:', error);
    proxy.$modal.msgError('获取软件版本信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 海康ISUP设备信息 - 获取电源状态信息
const handleGetHaikangIsupPowerStateInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupPowerStateInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupPowerStateInfo, res.data);
      proxy.$modal.msgSuccess('获取电源状态信息成功');
    }
  } catch (error) {
    console.error('获取电源状态信息失败:', error);
    proxy.$modal.msgError('获取电源状态信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 海康ISUP设备信息 - 获取摄像头属性信息
const handleGetHaikangIsupCameraInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupCameraInfo(currentDeviceId.value);
    if (res.data) {
      Object.assign(haikangIsupCameraInfo, res.data);
      proxy.$modal.msgSuccess('获取摄像头属性信息成功');
    }
  } catch (error) {
    console.error('获取摄像头属性信息失败:', error);
    proxy.$modal.msgError('获取摄像头属性信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 获取海康ISUP系统状态信息
const handleGetHaikangIsupSystemStatus = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupSystemStatus(currentDeviceId.value);
    console.log('系统状态返回结果:', res);
    if (res.data) {
      // 如果有data对象，优先使用data
      if (res.data.data) {
        Object.assign(haikangIsupSystemStatusInfo, res.data.data);
      } else {
        // 直接使用顶层字段
        Object.assign(haikangIsupSystemStatusInfo, res.data);
      }
      haikangIsupSystemStatusInfo.success = true;
      proxy.$modal.msgSuccess('获取系统状态信息成功');
    }
  } catch (error) {
    console.error('获取系统状态信息失败:', error);
    proxy.$modal.msgError('获取系统状态信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 获取海康ISUP设备配置
const handleGetHaikangIsupDeviceConfig = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupDeviceConfig(currentDeviceId.value);
    console.log('设备配置返回结果:', res);
    if (res.data) {
      if (res.data.data) {
        Object.assign(haikangIsupDeviceConfig, res.data.data);
      } else {
        Object.assign(haikangIsupDeviceConfig, res.data);
      }
      haikangIsupDeviceConfig.success = true;
      proxy.$modal.msgSuccess('获取设备配置成功');
    }
  } catch (error) {
    console.error('获取设备配置失败:', error);
    proxy.$modal.msgError('获取设备配置失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 设置海康ISUP设备配置
const handleSetHaikangIsupDeviceConfig = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await setHaiKangIsupDeviceConfig(currentDeviceId.value, haikangIsupDeviceConfig);
    if (res.code === 200) {
      proxy.$modal.msgSuccess('保存设备配置成功');
    } else {
      proxy.$modal.msgError('保存设备配置失败');
    }
  } catch (error) {
    console.error('保存设备配置失败:', error);
    proxy.$modal.msgError('保存设备配置失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 获取海康ISUP版本信息
const handleGetHaikangIsupVersionInfo = async () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    haikangIsupDeviceInfoLoading.value = true;
    const res = await getHaiKangIsupVersionInfo(currentDeviceId.value);
    console.log('版本信息返回结果:', res);
    if (res.data) {
      if (res.data.data) {
        Object.assign(haikangIsupVersionInfo, res.data.data);
      } else {
        Object.assign(haikangIsupVersionInfo, res.data);
      }
      haikangIsupVersionInfo.success = true;
      proxy.$modal.msgSuccess('获取版本信息成功');
    }
  } catch (error) {
    console.error('获取版本信息失败:', error);
    proxy.$modal.msgError('获取版本信息失败');
  } finally {
    haikangIsupDeviceInfoLoading.value = false;
  }
}

// 打开海康ISUP远程升级对话框
const openHaikangIsupUpgradeDialog = () => {
  if (!currentDeviceId.value) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  haikangIsupUpgradeForm.deviceId = currentDeviceId.value;
  haikangIsupUpgradeForm.ftpServerIp = '';
  haikangIsupUpgradeForm.ftpServerPort = 21;
  haikangIsupUpgradeForm.ftpAccount = '';
  haikangIsupUpgradeForm.ftpPassword = '';
  haikangIsupUpgradeForm.fileName = '';
  haikangIsupUpgradeForm.channel = 0;
  haikangIsupUpgradeResult.success = false;
  haikangIsupUpgradeResult.message = '';
  haikangIsupUpgradeResult.upgradeResult = '';
  haikangIsupUpgradeResult.beforeInfo = {};
  haikangIsupUpgradeDialogVisible.value = true;
}

// 执行海康ISUP远程升级
const handleHaikangIsupUpgrade = async () => {
  if (!haikangIsupUpgradeForm.deviceId) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  if (!haikangIsupUpgradeForm.ftpServerIp) {
    proxy.$modal.msgError('FTP服务器IP不能为空');
    return;
  }
  if (!haikangIsupUpgradeForm.fileName) {
    proxy.$modal.msgError('升级文件名不能为空');
    return;
  }
  try {
    haikangIsupUpgradeLoading.value = true;
    const res = await upgradeHaiKangIsupDevice(haikangIsupUpgradeForm);
    if (res.data) {
      Object.assign(haikangIsupUpgradeResult, res.data);
      if (res.data.success) {
        proxy.$modal.msgSuccess('升级命令已发送，请等待设备完成升级');
      } else {
        proxy.$modal.msgError('升级失败：' + res.data.message);
      }
    }
  } catch (error) {
    console.error('远程升级失败:', error);
    proxy.$modal.msgError('远程升级失败');
  } finally {
    haikangIsupUpgradeLoading.value = false;
  }
}



// 打开校时对话框
const openTimeSyncDialog = (row: QsDevice) => {
  timeSyncForm.deviceId = row.id;
  timeSyncForm.deviceIp = row.ipAddress || '';
  timeSyncForm.deviceType = row.type || '';
  timeSyncForm.deviceTime = '';
  timeSyncForm.syncTime = '';
  timeSyncForm.syncType = false;
  timeSyncDialogVisible.value = true;
}

// 获取设备时间（支持海康/大华/海康ISUP/ONVIF）
const handleGetTime = async () => {
  if (!timeSyncForm.deviceId) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    timeSyncLoading.value = true;
    let res;
    // 根据设备类型调用不同的API
    if (timeSyncForm.deviceType === '7') {
      // 海康设备
      res = await getHaiKangDevTime(timeSyncForm.deviceId);
    } else if (timeSyncForm.deviceType === '8') {
      // 海康ISUP设备
      res = await getHaiKangIsupDevTime(timeSyncForm.deviceId);
    } else if (timeSyncForm.deviceType === '9') {
      // 大华设备
      res = await getDaHuaTime(timeSyncForm.deviceIp);
    } else if (timeSyncForm.deviceType === '5') {
      // ONVIF设备
      res = await getOnvifDeviceTime(timeSyncForm.deviceId);
    } else {
      proxy.$modal.msgError('不支持的设备类型');
      return;
    }
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

// 执行时间同步（支持海康/大华/海康ISUP/ONVIF）
const handleTimeSync = async () => {
  if (!timeSyncForm.deviceId) {
    proxy.$modal.msgError('设备ID不能为空');
    return;
  }
  try {
    timeSyncLoading.value = true;
    let response;
    // 根据设备类型调用不同的API
    if (timeSyncForm.deviceType === '7') {
      // 海康设备（只支持本地时间同步到设备）
      if (!timeSyncForm.syncTime) {
        proxy.$modal.msgError('请选择同步时间');
        return;
      }
      response = await setHaiKangDevTime(timeSyncForm.deviceId, timeSyncForm.syncTime);
    } else if (timeSyncForm.deviceType === '8') {
      // 海康ISUP设备
      if (!timeSyncForm.syncTime) {
        proxy.$modal.msgError('请选择同步时间');
        return;
      }
      response = await setHaiKangIsupDevTime(timeSyncForm.deviceId, timeSyncForm.syncTime);
    } else if (timeSyncForm.deviceType === '9') {
      // 大华设备
      if (!timeSyncForm.syncTime) {
        proxy.$modal.msgError('请选择同步时间');
        return;
      }
      response = await setDaHuaTime(timeSyncForm.deviceId, timeSyncForm.syncTime, timeSyncForm.syncType);
    } else if (timeSyncForm.deviceType === '5') {
      // ONVIF设备：直接传递 yyyy-MM-dd HH:mm:ss 格式的时间，由后端处理时区转换
      response = await syncOnvifDeviceTime(timeSyncForm.deviceId, timeSyncForm.syncTime);
    } else {
      proxy.$modal.msgError('不支持的设备类型');
      return;
    }
    if (response.code === 200) {
      proxy.$modal.msgSuccess('时间同步成功');
      timeSyncDialogVisible.value = false;
    } else {
      proxy.$modal.msgError(response.msg || '时间同步失败');
    }
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
});

// 监听tab切换，当切换到抓图记录时自动加载数据
watch(tabActiveName, (newVal) => {
  if (newVal === 'snapshots') {
    deviceSnapshotQuery.pageNum = 1;
    getDeviceSnapshotList();
  }
});
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

/* 刷新进度对话框样式 */
.refresh-progress-dialog {
  .el-dialog__header {
    padding: 20px 24px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin: 0 !important;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon {
    animation: rotateIcon 3s linear infinite;
  }

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .el-dialog__body {
    padding: 24px;
  }

  .refresh-progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .progress-wrapper {
    display: flex;
    justify-content: center;
    animation: pulse 2s ease-in-out infinite;
  }

  .progress-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .progress-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin: 0;
  }

  .text-icon {
    animation: spin 1.5s linear infinite;
    color: var(--el-color-primary);
  }

  .progress-percentage {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-color-primary);
    margin: 0;
    text-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }

  .progress-tip {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;

    &.success {
      color: var(--el-color-success);
    }

    .success-icon {
      color: var(--el-color-success);
      font-size: 16px;
    }
  }
}

@keyframes rotateIcon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
</style>

<style lang="scss" scoped>
/* ========== 基础容器 ========== */
.app-container {
  padding: 16px;
  animation: fadeIn 0.4s ease-out;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

/* 滚动条美化 */
.app-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.app-container::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.app-container::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
  transition: background 0.3s;

  &:hover {
    background: var(--el-text-color-secondary);
  }
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

/* 5列网格布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

@media (max-width: 1600px) {
  .card-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 1200px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .card-grid { grid-template-columns: 1fr; }
}

.device-card {
  position: relative;
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

.device-card:nth-child(1) { animation-delay: 0.02s; }
.device-card:nth-child(2) { animation-delay: 0.04s; }
.device-card:nth-child(3) { animation-delay: 0.06s; }
.device-card:nth-child(4) { animation-delay: 0.08s; }
.device-card:nth-child(5) { animation-delay: 0.10s; }
.device-card:nth-child(6) { animation-delay: 0.12s; }
.device-card:nth-child(7) { animation-delay: 0.14s; }
.device-card:nth-child(8) { animation-delay: 0.16s; }
.device-card:nth-child(9) { animation-delay: 0.18s; }
.device-card:nth-child(10) { animation-delay: 0.20s; }

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
}

/* ========== 大华设备信息对话框样式 ========== */
:deep(.glass-dialog.device-info-dialog .el-dialog) {
  border-radius: 20px;
  background: var(--el-bg-color-page);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
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

/* 头部 */
:deep(.glass-dialog.device-info-dialog .el-dialog__header) {
  padding: 20px 24px 16px;
  margin-right: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
}

:deep(.glass-dialog.device-info-dialog .el-dialog__header::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-5));
  border-radius: 2px;
}

:deep(.glass-dialog.device-info-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.3px;
}

:deep(.glass-dialog.device-info-dialog .el-dialog__headerbtn) {
  top: 18px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.glass-dialog.device-info-dialog .el-dialog__headerbtn:hover) {
  background: var(--el-fill-color-light);
  transform: rotate(90deg);
}

:deep(.glass-dialog.device-info-dialog .el-dialog__close) {
  color: var(--el-text-color-secondary);
  font-size: 20px;
  transition: color 0.25s;
}

:deep(.glass-dialog.device-info-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: var(--el-color-primary);
}

/* 主体 */
:deep(.glass-dialog.device-info-dialog .el-dialog__body) {
  padding: 0;
}

/* 标签页样式 */
:deep(.glass-dialog.device-info-dialog .el-tabs) {
  border: none;
}

:deep(.glass-dialog.device-info-dialog .el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

:deep(.glass-dialog.device-info-dialog .el-tabs__header) {
  margin: 0;
  background: var(--el-fill-color-lighter);
  border: none;
  padding: 0 24px;
}

:deep(.glass-dialog.device-info-dialog .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.glass-dialog.device-info-dialog .el-tabs__nav) {
  border: none;
}

:deep(.glass-dialog.device-info-dialog .el-tabs__item) {
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  border: none;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

:deep(.glass-dialog.device-info-dialog .el-tabs__item:hover) {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

:deep(.glass-dialog.device-info-dialog .el-tabs__item.is-active) {
  color: var(--el-color-primary);
  background: var(--el-bg-color);
  font-weight: 600;
}

:deep(.glass-dialog.device-info-dialog .el-tabs__active-bar) {
  height: 3px;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-5));
  border-radius: 2px 2px 0 0;
}

:deep(.glass-dialog.device-info-dialog .el-tabs__content) {
  padding: 24px;
  background: var(--el-bg-color);
}

/* 描述列表优化 */
:deep(.glass-dialog.device-info-dialog .el-descriptions) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  animation: fadeInUp 0.4s ease-out;
}

:deep(.glass-dialog.device-info-dialog .el-descriptions__header) {
  background: var(--el-fill-color-light);
}

:deep(.glass-dialog.device-info-dialog .el-descriptions__label) {
  background: var(--el-fill-color-lighter);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 16px;
}

:deep(.glass-dialog.device-info-dialog .el-descriptions__body .el-descriptions__cell) {
  padding: 14px 16px;
}

/* 表格优化 */
:deep(.glass-dialog.device-info-dialog .el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

:deep(.glass-dialog.device-info-dialog .el-table__header-wrapper th) {
  background: var(--el-fill-color-light) !important;
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 0;
}

:deep(.glass-dialog.device-info-dialog .el-table__body-wrapper tr) {
  transition: all 0.25s ease;
}

:deep(.glass-dialog.device-info-dialog .el-table__body-wrapper tr:hover) {
  background-color: var(--el-color-primary-light-9) !important;
}

:deep(.glass-dialog.device-info-dialog .el-table__body-wrapper td) {
  padding: 12px 0;
}

/* 折叠面板优化 */
:deep(.glass-dialog.device-info-dialog .el-collapse) {
  border: none;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item) {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item:last-child) {
  margin-bottom: 0;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item:hover) {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item__header) {
  padding: 14px 18px;
  background: var(--el-fill-color-lighter);
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item__wrap) {
  background: var(--el-bg-color);
  border: none;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item__content) {
  padding: 18px;
}

/* 表单优化 */
:deep(.glass-dialog.device-info-dialog .el-form-item) {
  margin-bottom: 20px;
}

:deep(.glass-dialog.device-info-dialog .el-form-item__label) {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

:deep(.glass-dialog.device-info-dialog .el-input__wrapper) {
  border-radius: 10px;
  transition: all 0.3s ease;
}

:deep(.glass-dialog.device-info-dialog .el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
}

:deep(.glass-dialog.device-info-dialog .el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px var(--el-color-primary-light-8);
}

/* 按钮底部区域 */
:deep(.glass-dialog.device-info-dialog .dialog-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 24px;
}

:deep(.glass-dialog.device-info-dialog .dialog-footer .el-button) {
  border-radius: 10px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.glass-dialog.device-info-dialog .dialog-footer .el-button:not(:disabled):hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.glass-dialog.device-info-dialog .dialog-footer .el-button--primary:not(:disabled):hover) {
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb), 0.3);
}

:deep(.glass-dialog.device-info-dialog .dialog-footer .el-button--success:not(:disabled):hover) {
  box-shadow: 0 4px 14px rgba(var(--el-color-success-rgb), 0.3);
}

/* 进度条优化 */
:deep(.glass-dialog.device-info-dialog .el-progress-bar__outer) {
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
}

:deep(.glass-dialog.device-info-dialog .el-progress-bar__inner) {
  border-radius: 10px;
}

/* 标签优化 */
:deep(.glass-dialog.device-info-dialog .el-tag) {
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 500;
  font-size: 13px;
}

/* 空状态优化 */
:deep(.glass-dialog.device-info-dialog .el-empty) {
  padding: 40px 0;
}

/* 加载动画 */
:deep(.glass-dialog.device-info-dialog .el-loading-mask) {
  border-radius: 12px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  :deep(.glass-dialog.device-info-dialog .el-dialog) {
    border-color: var(--el-border-color);
  }
  
  :deep(.glass-dialog.device-info-dialog .el-dialog__header) {
    border-color: var(--el-border-color);
  }
  
  :deep(.glass-dialog.device-info-dialog .dialog-footer) {
    border-color: var(--el-border-color);
  }
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
    background-color: rgba(255, 255, 255, 0.06) !important;
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
    background-color: rgba(255, 255, 255, 0.06) !important;
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

/* ========== 设备信息仪表板高级样式 ========== */
.device-info-dashboard {
  padding: 4px;
}

/* 仪表板头部 */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 4px;
  animation: fadeInDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dashboard-title .dashboard-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.dashboard-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
}

.dashboard-badge:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  transform: translateY(-1px);
}

/* 卡片网格 */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.info-cards-grid.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .info-cards-grid,
  .info-cards-grid.cols-3 {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .info-cards-grid,
  .info-cards-grid.cols-3 {
    grid-template-columns: 1fr;
  }
}

/* 信息卡片 */
.info-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  animation: cardPopIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

@keyframes cardPopIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.info-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

/* 光晕效果 */
.info-card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  filter: blur(24px);
}

.info-card:hover .info-card-glow {
  opacity: 0.12;
}

/* 卡片图标 */
.info-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  color: #fff;
}

.info-card:hover .info-card-icon {
  transform: scale(1.1) rotate(-4deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 卡片内容 */
.info-card-content {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.info-card-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.info-card:hover .info-card-label {
  color: var(--el-text-color-primary);
}

.info-card-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.info-card:hover .info-card-value {
  transform: translateX(2px);
}

/* 主题色 - primary */
.info-card.primary .info-card-icon {
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
.info-card.primary .info-card-glow { background: #409eff; }
.info-card.primary:hover { border-color: rgba(64, 158, 255, 0.3); }

/* 主题色 - success */
.info-card.success .info-card-icon {
  background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}
.info-card.success .info-card-glow { background: #67c23a; }
.info-card.success:hover { border-color: rgba(103, 194, 58, 0.3); }

/* 主题色 - warning */
.info-card.warning .info-card-icon {
  background: linear-gradient(135deg, #e6a23c 0%, #f3d19e 100%);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}
.info-card.warning .info-card-glow { background: #e6a23c; }
.info-card.warning:hover { border-color: rgba(230, 162, 60, 0.3); }

/* 主题色 - danger */
.info-card.danger .info-card-icon {
  background: linear-gradient(135deg, #f56c6c 0%, #fab6b6 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}
.info-card.danger .info-card-glow { background: #f56c6c; }
.info-card.danger:hover { border-color: rgba(245, 108, 108, 0.3); }

/* 主题色 - info */
.info-card.info .info-card-icon {
  background: linear-gradient(135deg, #909399 0%, #c8c9cc 100%);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.3);
}
.info-card.info .info-card-glow { background: #909399; }
.info-card.info:hover { border-color: rgba(144, 147, 153, 0.3); }

/* 主题色 - purple */
.info-card.purple .info-card-icon {
  background: linear-gradient(135deg, #8e44ad 0%, #bb8fce 100%);
  box-shadow: 0 4px 12px rgba(142, 68, 173, 0.3);
}
.info-card.purple .info-card-glow { background: #8e44ad; }
.info-card.purple:hover { border-color: rgba(142, 68, 173, 0.3); }

/* 主题色 - teal */
.info-card.teal .info-card-icon {
  background: linear-gradient(135deg, #1abc9c 0%, #76d7c4 100%);
  box-shadow: 0 4px 12px rgba(26, 188, 156, 0.3);
}
.info-card.teal .info-card-glow { background: #1abc9c; }
.info-card.teal:hover { border-color: rgba(26, 188, 156, 0.3); }

/* 主题色 - orange */
.info-card.orange .info-card-icon {
  background: linear-gradient(135deg, #e67e22 0%, #f5b041 100%);
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}
.info-card.orange .info-card-glow { background: #e67e22; }
.info-card.orange:hover { border-color: rgba(230, 126, 34, 0.3); }

/* 主题色 - pink */
.info-card.pink .info-card-icon {
  background: linear-gradient(135deg, #e84393 0%, #fd79a8 100%);
  box-shadow: 0 4px 12px rgba(232, 67, 147, 0.3);
}
.info-card.pink .info-card-glow { background: #e84393; }
.info-card.pink:hover { border-color: rgba(232, 67, 147, 0.3); }

/* 主题色 - cyan */
.info-card.cyan .info-card-icon {
  background: linear-gradient(135deg, #00bcd4 0%, #4dd0e1 100%);
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}
.info-card.cyan .info-card-glow { background: #00bcd4; }
.info-card.cyan:hover { border-color: rgba(0, 188, 212, 0.3); }

/* 主题色 - lime */
.info-card.lime .info-card-icon {
  background: linear-gradient(135deg, #cddc39 0%, #dce775 100%);
  box-shadow: 0 4px 12px rgba(205, 220, 57, 0.3);
}
.info-card.lime .info-card-glow { background: #cddc39; }
.info-card.lime:hover { border-color: rgba(205, 220, 57, 0.3); }

/* 主题色 - indigo */
.info-card.indigo .info-card-icon {
  background: linear-gradient(135deg, #3f51b5 0%, #7986cb 100%);
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
}
.info-card.indigo .info-card-glow { background: #3f51b5; }
.info-card.indigo:hover { border-color: rgba(63, 81, 181, 0.3); }

/* ========== 标签页内容面板统一样式 ========== */
.tab-content-wrapper {
  position: relative;
  padding: 24px 20px 20px;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
  overflow: hidden;
}

/* 终端参数对话框容器 */
.terminal-params-dialog-wrapper {
  position: relative;
  padding: 24px 20px 20px;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
  overflow: hidden;
}

/* 终端参数表格容器 */
.terminal-params-table-wrapper {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.terminal-params-table-wrapper::-webkit-scrollbar {
  width: 8px;
}

.terminal-params-table-wrapper::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.terminal-params-table-wrapper::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
  transition: background 0.3s;
}

.terminal-params-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--el-text-color-secondary);
}

.tab-content-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3), var(--el-color-success-light-3), var(--el-color-primary));
  background-size: 200% 100%;
  animation: gradientFlow 3s linear infinite;
  border-radius: 2px 2px 0 0;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  animation: fadeInDown 0.45s ease both;
}

.panel-header .el-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(var(--el-color-primary-rgb), 0.25);
}

.panel-header span {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 分段标题 */
.panel-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 14px;
  padding-left: 10px;
  position: relative;
  animation: fadeInLeft 0.4s ease both;
}

.panel-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, var(--el-color-primary), var(--el-color-primary-light-5));
  border-radius: 2px;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 数据表单美化 */
.data-form {
  padding: 4px;
}

.data-form .el-form-item {
  margin-bottom: 18px;
  animation: formItemEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.data-form .el-form-item:nth-child(1) { animation-delay: 0.05s; }
.data-form .el-form-item:nth-child(2) { animation-delay: 0.10s; }
.data-form .el-form-item:nth-child(3) { animation-delay: 0.15s; }
.data-form .el-form-item:nth-child(4) { animation-delay: 0.20s; }
.data-form .el-form-item:nth-child(5) { animation-delay: 0.25s; }
.data-form .el-form-item:nth-child(6) { animation-delay: 0.30s; }
.data-form .el-form-item:nth-child(7) { animation-delay: 0.35s; }
.data-form .el-form-item:nth-child(8) { animation-delay: 0.40s; }
.data-form .el-form-item:nth-child(9) { animation-delay: 0.45s; }
.data-form .el-form-item:nth-child(10) { animation-delay: 0.50s; }

.data-form .el-form-item__label {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 设备信息对话框中的表格增强 */
:deep(.glass-dialog.device-info-dialog .el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.5s ease both;
}

:deep(.glass-dialog.device-info-dialog .el-table__header-wrapper th) {
  background: linear-gradient(180deg, var(--el-fill-color-light) 0%, var(--el-fill-color) 100%) !important;
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 0;
  font-size: 13px;
  letter-spacing: 0.3px;
}

:deep(.glass-dialog.device-info-dialog .el-table__body-wrapper tr) {
  transition: all 0.25s ease;
}

:deep(.glass-dialog.device-info-dialog .el-table__body-wrapper tr:hover) {
  background-color: var(--el-color-primary-light-9) !important;
  transform: scale(1.002);
}

:deep(.glass-dialog.device-info-dialog .el-table__body-wrapper td) {
  padding: 12px 0;
  transition: all 0.2s ease;
}

/* 描述列表增强 */
:deep(.glass-dialog.device-info-dialog .el-descriptions) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.5s ease both;
}

:deep(.glass-dialog.device-info-dialog .el-descriptions__label) {
  background: linear-gradient(180deg, var(--el-fill-color-lighter) 0%, var(--el-fill-color) 100%);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 14px 16px;
  transition: all 0.3s ease;
}

:deep(.glass-dialog.device-info-dialog .el-descriptions__body .el-descriptions__cell) {
  padding: 14px 16px;
  transition: all 0.2s ease;
}

:deep(.glass-dialog.device-info-dialog .el-descriptions__row:hover .el-descriptions__cell) {
  background-color: var(--el-color-primary-light-9);
}

/* 折叠面板增强 */
:deep(.glass-dialog.device-info-dialog .el-collapse) {
  border: none;
  animation: fadeInUp 0.5s ease both;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item) {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item:last-child) {
  margin-bottom: 0;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item:hover) {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item__header) {
  padding: 14px 18px;
  background: linear-gradient(180deg, var(--el-fill-color-lighter) 0%, var(--el-fill-color) 100%);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item__wrap) {
  background: var(--el-bg-color);
  border: none;
}

:deep(.glass-dialog.device-info-dialog .el-collapse-item__content) {
  padding: 18px;
}

/* 输入框增强 */
:deep(.glass-dialog.device-info-dialog .el-input__wrapper) {
  border-radius: 10px;
  transition: all 0.3s ease;
}

:deep(.glass-dialog.device-info-dialog .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 10px rgba(var(--el-color-primary-rgb), 0.12);
}

/* 标签增强 */
:deep(.glass-dialog.device-info-dialog .el-tag) {
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s ease;
}

:deep(.glass-dialog.device-info-dialog .el-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

/* 进度条增强 */
:deep(.glass-dialog.device-info-dialog .el-progress-bar__outer) {
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
}

:deep(.glass-dialog.device-info-dialog .el-progress-bar__inner) {
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 空状态增强 - 高级设计 */
:deep(.glass-dialog.device-info-dialog .el-empty) {
  padding: 60px 0 50px;
  animation: emptyAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  position: relative;
  overflow: hidden;
}

@keyframes emptyAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 背景装饰圆 */
:deep(.glass-dialog.device-info-dialog .el-empty::before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, var(--el-color-primary-light-8) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.5;
  animation: emptyAura 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

:deep(.glass-dialog.device-info-dialog .el-empty::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--el-color-primary-light-9) 0%, transparent 60%);
  border-radius: 50%;
  opacity: 0.3;
  animation: emptyAura 4s ease-in-out infinite 1s;
  pointer-events: none;
  z-index: 0;
}

@keyframes emptyAura {
  0%, 100% {
    transform: translate(-50%, -55%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -55%) scale(1.3);
    opacity: 0.2;
  }
}

/* 图标增强 */
:deep(.glass-dialog.device-info-dialog .el-empty__image) {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 6px 16px rgba(var(--el-color-primary-rgb), 0.2));
  animation: emptyFloat 3s ease-in-out infinite;
}

/* 给SVG图标上色 */
:deep(.glass-dialog.device-info-dialog .el-empty__image svg) {
  fill: url(#emptyGradient) !important;
}

:deep(.glass-dialog.device-info-dialog .el-empty__image svg path) {
  fill: var(--el-color-primary-light-3) !important;
  opacity: 0.7;
}

@keyframes emptyFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(1deg);
  }
  66% {
    transform: translateY(-4px) rotate(-1deg);
  }
}

/* 文字增强 */
:deep(.glass-dialog.device-info-dialog .el-empty__description) {
  position: relative;
  z-index: 1;
  margin-top: 24px;
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* 底部装饰点 */
:deep(.glass-dialog.device-info-dialog .el-empty__description::after) {
  content: '';
  display: block;
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--el-color-primary-light-5), transparent);
  border-radius: 2px;
  margin: 16px auto 0;
  animation: emptyLine 2s ease-in-out infinite;
}

@keyframes emptyLine {
  0%, 100% {
    opacity: 0.4;
    transform: scaleX(1);
  }
  50% {
    opacity: 0.8;
    transform: scaleX(1.3);
  }
}

/* 警告提示增强 */
:deep(.glass-dialog.device-info-dialog .el-alert) {
  border-radius: 12px;
  animation: shakeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes shakeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 深色模式适配 */
html.dark {
  .info-card {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.06);
  }
  
  .info-card:hover {
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  }
  
  .dashboard-badge {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.06);
  }
  
  .dashboard-badge:hover {
    background: rgba(var(--el-color-primary-rgb), 0.12);
  }

  .panel-header {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .panel-section-title::before {
    background: linear-gradient(180deg, var(--el-color-primary-light-3), var(--el-color-primary-light-5));
  }

  :deep(.glass-dialog.device-info-dialog .el-descriptions__label) {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
  }

  :deep(.glass-dialog.device-info-dialog .el-collapse-item__header) {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
  }

  :deep(.glass-dialog.device-info-dialog .el-table__header-wrapper th) {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%) !important;
  }
}

/* === GB28181设备刷新进度对话框 - 居中版本 === */
:deep(.refresh-progress-dialog .el-dialog__body) {
  padding: 0;
}

.refresh-progress-center {
  padding: 36px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 12px;
}

.refresh-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.refresh-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.25);
}

.refresh-icon {
  color: #fff;
  font-size: 22px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.progress-circle-wrapper {
  position: relative;
  margin-bottom: 28px;
}

.progress-circle-wrapper :deep(.el-progress-circle__path) {
  transition: stroke-dashoffset 0.3s ease;
}

.progress-percent {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.percent-num {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-color-primary);
}

.percent-unit {
  font-size: 18px;
  font-weight: 600;
  color: #909399;
}

.refresh-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  width: 100%;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step-item.active {
  opacity: 1;
}

.step-item.completed {
  opacity: 1;
}

.step-icon {
  font-size: 20px;
  color: #c0c4cc;
  transition: all 0.3s ease;
}

.step-item.active .step-icon,
.step-item.completed .step-icon {
  color: var(--el-color-primary);
}

.step-item.completed .step-icon {
  color: #67c23a;
}

.step-text {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  white-space: nowrap;
}

.step-item.active .step-text,
.step-item.completed .step-text {
  color: #606266;
}

.step-divider {
  width: 32px;
  height: 2px;
  background: #e4e7ed;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.refresh-tip {
  text-align: center;
  padding-top: 4px;
}

.tip-content {
  margin: 0;
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}

/* 设备配置对话框样式 */
.device-config-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }
}

.device-config-header {
  margin-bottom: 20px;
}

.device-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.device-info-item {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.query-form {
  position: relative;
  margin-bottom: 0;
  padding: 14px 20px 14px 18px !important;
  background: var(--el-bg-color) !important;
  border-radius: 10px !important;
  border: 1px solid var(--el-border-color-lighter) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 3px;
    background: linear-gradient(to bottom, var(--el-color-primary), var(--el-color-primary-light-5));
    border-radius: 0 3px 3px 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--el-text-color-primary);
    padding-right: 10px;
  }

  .query-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  :deep(.el-button--primary) {
    height: 34px;
    padding: 0 18px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.25s ease;
    flex-shrink: 0;

    &:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
    }

    &:not(:disabled):active {
      transform: translateY(0);
    }

    .el-icon {
      font-size: 14px;
      margin-right: 4px;
    }
  }

  :deep(.el-button.is-link) {
    height: 34px;
    padding: 0 8px;
    font-size: 13px;
    font-weight: 400;
    flex-shrink: 0;

    &:not(.is-disabled):hover {
      color: var(--el-color-danger);
    }
  }

  :deep(.el-select) {
    width: 100%;

    .el-input__wrapper {
      height: 34px;
      border-radius: 6px;
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
      }
    }

    .el-input__inner {
      font-size: 13px;
    }
  }
}

.config-content {
  max-height: 520px;
  overflow-y: auto;
  padding: 4px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.config-collapse {
  :deep(.el-collapse-item__header) {
    background: var(--el-bg-color);
    border-radius: 6px;
    margin-bottom: 8px;
    padding-left: 16px;
    padding-right: 16px;
    border: 1px solid var(--el-border-color-lighter);
    transition: all 0.3s ease;

    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-border-color);
    }
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
    border-radius: 6px;
    margin-bottom: 8px;
    background: transparent;
  }

  :deep(.el-collapse-item__content) {
    padding: 0;
  }
}

.collapse-title {
  display: flex;
  align-items: center;
  width: 100%;
}

.title-icon {
  color: var(--el-color-primary);
  font-size: 18px;
  margin-right: 8px;
}

.title-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.config-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.config-form {
  margin-bottom: 16px;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 滚动条美化 */
.config-content::-webkit-scrollbar {
  width: 6px;
}

.config-content::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 3px;
}

.config-content::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;

  &:hover {
    background: var(--el-text-color-secondary);
  }
}

/* 抓图记录操作按钮样式 */
.snapshot-actions .el-button {
  transition: all 0.2s ease;
}

.snapshot-actions .el-button:hover {
  transform: scale(1.08);
}

/* 强制保持白色图标 */
.snapshot-actions .el-button .el-icon {
  color: #ffffff !important;
}

.snapshot-actions .el-button--success,
.snapshot-actions .el-button--success[text],
.snapshot-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

/* ========== 存储状态卡片样式 ========== */
.storage-state-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.storage-state-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.storage-state-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.storage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.storage-progress {
  margin-bottom: 12px;
}

.storage-updated {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  padding-top: 12px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

/* ========== 网络协议卡片样式 ========== */
.protocol-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.protocol-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.protocol-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
  
  &.http {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  &.https {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  &.rtsp {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
}

.protocol-info {
  flex: 1;
  min-width: 0;
}

.protocol-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.protocol-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  
  .el-icon {
    font-size: 14px;
  }
}

.snapshot-actions .el-button--danger,
.snapshot-actions .el-button--danger[text],
.snapshot-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}
</style>

