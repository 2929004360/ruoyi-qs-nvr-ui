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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="deviceList" @selection-change="handleSelectionChange" border>
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
            :videoUrl="wsUrl"/>
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
      </el-tabs>
    </el-dialog>

    <el-dialog :title="`接入地址-${deviceRow.deviceName}`" v-model="accessAddressOpen" width="600px" append-to-body
               draggable>
      <el-form :model="streamPushAddressForm" label-width="100px">
        <el-form-item label="rtsp地址">
          <el-input v-model="streamPushAddressForm.rtsp" placeholder="请输入rtsp地址" disabled>
            <template #append>
              <el-button type="primary" :icon="DocumentCopy" @click="handleCopy(streamPushAddressForm.rtsp)"/>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="rtmp地址" prop="rtmp">
          <el-input v-model="streamPushAddressForm.rtmp" placeholder="请输入rtmp地址" disabled>
            <template #append>
              <el-button type="primary" :icon="DocumentCopy" @click="handleCopy(streamPushAddressForm.rtmp)"/>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-dialog>

    <SelectMapPosition ref="selectMapPositionRef" @onSubmit="selectMapPositionSubmit"/>
    <ChannelCode ref="channelCodeRef" @handleOk="channelCodeOk"/>
  </div>
</template>

<script setup lang="ts" name="Device">
import {onUnmounted} from "vue";
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
  updateDevice
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
import {DocumentCopy} from '@element-plus/icons-vue'
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
const isQuality = ref(true);
const isLive = ref(true);

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
    deviceList.value = response.rows
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

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false
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

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false
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
    } else if (row.type === '8') {
      data.app = "haikang_isup"
    } else if (row.type === '9') {
      data.app = "dahua"
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

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false
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

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false
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

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false
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

        streamInfo.value = res.data;
        quality.value = []
        defaultQuality.value = ''
        isPtz.value = false
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
</script>

<style scoped>
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
</style>
