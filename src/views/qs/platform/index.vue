<template>
  <div class="app-container">
    <div class="search-box">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="130px" class="query-form">
        <el-form-item label="平台名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入平台名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="国标编码" prop="serverGbId">
          <el-input
            v-model="queryParams.serverGbId"
            placeholder="请输入国标编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 250px;">
            <el-option label="离线" :value="0"/>
            <el-option label="在线" :value="1"/>
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
        <right-toolbar v-model:showSearch="showSearch" v-model:viewMode="viewMode" :showViewSwitch="true" @queryTable="getList"/>
      </el-row>
    </div>

    <div v-if="viewMode === 'list'" class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="platformList"
        @selection-change="handleSelectionChange"
        class="custom-table"
        highlight-current-row
      >
        <el-table-column type="selection" width="55" align="center" fixed/>
        <el-table-column label="编号" align="center" prop="id" width="70" fixed>
          <template #default="scope">
            <span class="id-badge">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平台名称" align="center" prop="name" min-width="150" fixed/>
        <el-table-column label="国标编码" align="center" prop="serverGbId" min-width="180" :show-overflow-tooltip="true"/>
        <el-table-column label="服务器IP" align="center" prop="serverIp" width="150"/>
        <el-table-column label="服务器端口" align="center" prop="serverPort" width="100"/>
        <el-table-column label="传输协议" align="center" prop="transport" width="100"/>
        <el-table-column label="启用状态" align="center" prop="enable" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enable"
              :active-value="1"
              :inactive-value="0"
              @change="handleEnableChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="在线状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联设备" align="center" prop="deviceCount" width="110">
          <template #default="scope">
            <el-tag type="info" effect="plain">{{ scope.row.deviceCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="380" class-name="small-padding fixed-width fixed-right">
          <template #default="scope">
            <div class="table-actions">
                <el-tooltip content="修改">
                  <el-button type="primary" text bg size="small" icon="Edit" @click="handleUpdate(scope.row)"/>
                </el-tooltip>
                <el-tooltip content="关联通道">
                  <el-button type="success" text bg size="small" icon="Connection" @click="handleAssociated(scope.row)"/>
                </el-tooltip>
                <template v-if="scope.row.enable === 1">
                  <el-tooltip v-if="scope.row.status === 0" content="上线">
                    <el-button type="primary" text bg size="small" icon="Connection" @click="handleRegister(scope.row)"/>
                  </el-tooltip>
                  <el-tooltip v-if="scope.row.status === 1" content="注销">
                    <el-button type="warning" text bg size="small" icon="SwitchButton" @click="handleUnregister(scope.row)"/>
                  </el-tooltip>
                  <el-tooltip v-if="scope.row.status === 1" content="推送通道">
                    <el-button type="info" text bg size="small" icon="Upload" @click="handlePushCatalog(scope.row)"/>
                  </el-tooltip>
                </template>
                <el-tooltip content="删除">
                  <el-button type="danger" text bg size="small" icon="Delete" @click="handleDelete(scope.row)"/>
                </el-tooltip>
              </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="card-view" v-loading="loading">
      <div class="card-grid" v-if="platformList.length > 0">
        <div class="platform-card" :class="{ 'is-selected': item.checked, 'is-online': item.status === 1 }" v-for="item in platformList" :key="item.id">
            <div class="card-header">
              <div class="header-left">
                <el-checkbox v-model="item.checked" @change="handleCardSelection" class="card-checkbox"/>
                <div class="platform-icon">
                  <el-icon><Monitor/></el-icon>
                </div>
                <div class="platform-name" :title="item.name">{{ item.name }}</div>
              </div>
              <div class="header-actions">
                <el-switch
                  v-model="item.enable"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleEnableChange(item)"
                  size="small"
                />
                <div class="status-dot" :class="item.status === 1 ? 'pulse online' : 'breathe offline'"/>
              </div>
            </div>

            <div class="card-body">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">编号</span>
                  <span class="info-value">{{ item.id }}</span>
                </div>
              </div>

              <div class="info-row">
                <div class="info-item full">
                  <span class="info-label">国标编码</span>
                  <span class="info-value" :title="item.serverGbId">{{ item.serverGbId || '-' }}</span>
                </div>
              </div>

              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">服务器IP</span>
                  <span class="info-value">{{ item.serverIp || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">端口</span>
                  <span class="info-value">{{ item.serverPort || '-' }}</span>
                </div>
              </div>

              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">传输协议</span>
                  <span class="info-value">{{ item.transport || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">关联设备</span>
                  <span class="info-value">
                    <el-tag type="info" effect="plain" size="small">{{ item.deviceCount || 0 }}</el-tag>
                  </span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item full">
                  <span class="info-label">创建时间</span>
                  <span class="info-value">{{ parseTime(item.createTime) }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <el-button
                type="primary"
                size="small"
                icon="Edit"
                @click="handleUpdate(item)"
                class="btn-primary"
              >编辑</el-button>
              <div class="footer-actions">
                <el-tooltip content="关联通道">
                  <el-button type="success" text bg size="small" icon="Connection" @click="handleAssociated(item)"/>
                </el-tooltip>
                <template v-if="item.enable === 1">
                  <el-tooltip v-if="item.status === 0" content="上线">
                    <el-button type="primary" text bg size="small" icon="Connection" @click="handleRegister(item)"/>
                  </el-tooltip>
                  <el-tooltip v-if="item.status === 1" content="注销">
                    <el-button type="warning" text bg size="small" icon="SwitchButton" @click="handleUnregister(item)"/>
                  </el-tooltip>
                  <el-tooltip v-if="item.status === 1" content="推送通道">
                    <el-button type="info" text bg size="small" icon="Upload" @click="handlePushCatalog(item)"/>
                  </el-tooltip>
                </template>
                <el-tooltip content="删除">
                  <el-button type="danger" text bg size="small" icon="Delete" @click="handleDelete(item)"/>
                </el-tooltip>
              </div>
            </div>
        </div>
      </div>
      <el-empty v-else description="暂无平台数据" />
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="900px" append-to-body draggable destroy-on-close class="glass-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入平台名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="enable">
              <el-radio-group v-model="form.enable">
                <el-radio :value="0">禁用</el-radio>
                <el-radio :value="1">启用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-divider">
          <div class="section-divider-icon-wrapper">
            <el-icon class="section-divider-icon"><Monitor/></el-icon>
          </div>
          <div class="section-divider-title">平台配置</div>
          <div class="section-divider-line"/>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台国标编码" prop="serverGbId">
              <el-input v-model="form.serverGbId" placeholder="请输入平台国标编码"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台域" prop="serverGbDomain">
              <el-input v-model="form.serverGbDomain" placeholder="请输入平台域"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务器IP" prop="serverIp">
              <el-input v-model="form.serverIp" placeholder="请输入服务器IP地址">
                <template #prefix>
                  <el-icon><Location/></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务器端口" prop="serverPort">
              <el-input-number v-model="form.serverPort" :min="1" :max="65535" placeholder="请输入服务器端口" style="width: 100%;"/>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-divider">
          <div class="section-divider-icon-wrapper">
            <el-icon class="section-divider-icon"><Camera/></el-icon>
          </div>
          <div class="section-divider-title">设备配置</div>
          <div class="section-divider-line"/>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备国标编码" prop="deviceGbId">
              <el-input v-model="form.deviceGbId" placeholder="请输入设备国标编码"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备IP" prop="deviceIp">
              <el-input v-model="form.deviceIp" placeholder="请输入设备IP地址">
                <template #prefix>
                  <el-icon><Location/></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备端口" prop="devicePort">
              <el-input v-model="form.devicePort" placeholder="请输入设备端口"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="传输协议" prop="transport">
              <el-radio-group v-model="form.transport">
                <el-radio-button value="UDP">UDP</el-radio-button>
                <el-radio-button value="TCP">TCP</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-divider">
          <div class="section-divider-icon-wrapper">
            <el-icon class="section-divider-icon"><Lock/></el-icon>
          </div>
          <div class="section-divider-title">SIP认证</div>
          <div class="section-divider-line"/>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入SIP认证用户名">
                <template #prefix>
                  <el-icon><User/></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入SIP认证密码" show-password>
                <template #prefix>
                  <el-icon><Key/></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册有效期(秒)" prop="expires">
              <el-input v-model="form.expires" placeholder="请输入注册有效期">
                <template #suffix>
                  <span class="input-suffix">秒</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="心跳超时(秒)" prop="keepTimeout">
              <el-input v-model="form.keepTimeout" placeholder="请输入心跳超时时间">
                <template #suffix>
                  <span class="input-suffix">秒</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-divider">
          <div class="section-divider-icon-wrapper">
            <el-icon class="section-divider-icon"><Setting/></el-icon>
          </div>
          <div class="section-divider-title">扩展配置</div>
          <div class="section-divider-line"/>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行政区划" prop="civilCode">
              <el-input v-model="form.civilCode" placeholder="请输入行政区划编码"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字符编码" prop="characterSet">
              <el-radio-group v-model="form.characterSet">
                <el-radio-button value="GB2312">GB2312</el-radio-button>
                <el-radio-button value="UTF-8">UTF-8</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备厂商" prop="manufacturer">
              <el-input v-model="form.manufacturer" placeholder="请输入设备厂商"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号" prop="model">
              <el-input v-model="form.model" placeholder="请输入设备型号"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="安装地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入安装地址">
            <template #prefix>
              <el-icon><Position/></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-divider class="form-divider">功能设置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="云台控制" prop="ptz">
              <el-switch v-model="form.ptz" :active-value="1" :inactive-value="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用RTCP" prop="rtcp">
              <el-switch v-model="form.rtcp" :active-value="1" :inactive-value="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="消息通道" prop="asMessageChannel">
              <el-switch v-model="form.asMessageChannel" :active-value="1" :inactive-value="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动推送通道" prop="autoPushChannel">
              <el-switch v-model="form.autoPushChannel" :active-value="1" :inactive-value="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="查询分组目录" prop="catalogWithGroup">
              <el-switch v-model="form.catalogWithGroup" :active-value="1" :inactive-value="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="查询区域目录" prop="catalogWithRegion">
              <el-switch v-model="form.catalogWithRegion" :active-value="1" :inactive-value="0"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="关联通道" v-model="associatedOpen" width="1300px" append-to-body destroy-on-close class="glass-dialog">
      <associated-channel :platform-id="associatedPlatformId" v-if="associatedOpen"/>
    </el-dialog>
  </div>
</template>

<script setup name="Platform">
import {listPlatform, getPlatform, delPlatform, addPlatform, updatePlatform, unregisterPlatform, registerPlatform, pushCatalog} from '@/api/qs/platform';
import AssociatedChannel from './associatedChannel.vue';
import {
  Monitor,
  Camera,
  Lock,
  Setting,
  Location,
  User,
  Key,
  Position,
  SwitchButton,
  Upload
} from '@element-plus/icons-vue';

const {proxy} = getCurrentInstance();

const showSearch = ref(true);
const viewMode = ref('card');
const loading = ref(true);
const open = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const platformList = ref([]);
const associatedOpen = ref(false);
const associatedPlatformId = ref(null);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: null,
  serverGbId: null,
  status: null,
  enable: null
});

const form = ref({});

const rules = ref({
  name: [{required: true, message: '平台名称不能为空', trigger: 'blur'}],
  serverGbId: [{required: true, message: '平台国标编码不能为空', trigger: 'blur'}]
});

function getList() {
  loading.value = true;
  listPlatform(queryParams.value).then(response => {
    platformList.value = response.rows.map(row => ({
      ...row,
      checked: false
    }));
    total.value = response.total;
    loading.value = false;
  });
}

function cancel() {
  open.value = false;
  reset();
}

function reset() {
  form.value = {
    id: null,
    enable: 1,
    name: null,
    serverGbId: null,
    serverGbDomain: null,
    serverIp: null,
    serverPort: null,
    deviceGbId: '34020000001320000001',
    deviceIp: null,
    devicePort: null,
    username: '34020000001320000001',
    password: null,
    expires: 3600,
    keepTimeout: 60,
    transport: 'UDP',
    civilCode: null,
    manufacturer: null,
    model: null,
    address: null,
    characterSet: 'GB2312',
    ptz: 1,
    rtcp: 1,
    status: 0,
    catalogGroup: null,
    registerWay: null,
    secrecy: null,
    asMessageChannel: 1,
    catalogWithPlatform: 1,
    catalogWithGroup: 0,
    catalogWithRegion: 0,
    autoPushChannel: 1,
    sendStreamIp: null,
    serverId: null
  };
  proxy.resetForm('formRef');
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm('queryRef');
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

function handleCardSelection() {
  const selected = platformList.value.filter(item => item.checked);
  ids.value = selected.map(item => item.id);
  single.value = selected.length !== 1;
  multiple.value = !selected.length;
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加国标GB28181平台配置';
}

function handleAssociated(row) {
  associatedPlatformId.value = row.id;
  associatedOpen.value = true;
}

function handleUpdate(row) {
  reset();
  const id = row.id || ids.value[0];
  getPlatform(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = '修改国标GB28181平台配置';
  });
}

function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePlatform(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addPlatform(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}

function handleDelete(row) {
  const id = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除国标GB28181平台配置编号为"' + id + '"的数据项？').then(() => {
    return delPlatform(id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess('删除成功');
  }).catch(() => {
  });
}

function handleRegister(row) {
  proxy.$modal.confirm('是否确认上线平台"' + row.name + '"？').then(() => {
    return registerPlatform(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess('上线成功');
  }).catch(() => {
  });
}

function handleUnregister(row) {
  proxy.$modal.confirm('是否确认注销平台"' + row.name + '"？').then(() => {
    return unregisterPlatform(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess('注销成功');
  }).catch(() => {
  });
}

function handlePushCatalog(row) {
  proxy.$modal.confirm('是否确认推送通道到平台"' + row.name + '"？').then(() => {
    return pushCatalog(row.id);
  }).then(() => {
    proxy.$modal.msgSuccess('推送成功');
  }).catch(() => {
  });
}

function handleEnableChange(row) {
  const text = row.enable === 1 ? '启用' : '禁用';
  proxy.$modal.confirm('是否确认' + text + '平台"' + row.name + '"？').then(() => {
    return updatePlatform({id: row.id, enable: row.enable});
  }).then(() => {
    proxy.$modal.msgSuccess(text + '成功');
  }).catch(() => {
    row.enable = row.enable === 1 ? 0 : 1;
  });
}

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
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

.query-form {
  padding: 14px 16px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 0 !important;
  animation: fadeInUp 0.4s ease-out 0.15s both;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;

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

.toolbar-row {
  padding: 6px 0;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 14px;
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

.table-wrapper {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out 0.25s both;
  transition: box-shadow 0.3s;
}

.table-wrapper:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.06);
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

.table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
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

.table-actions .el-button--danger,
.table-actions .el-button--danger[text],
.table-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.table-actions .el-button--success,
.table-actions .el-button--success[text],
.table-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.table-actions .el-button--warning,
.table-actions .el-button--warning[text],
.table-actions .el-button--warning[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-warning) !important;
  border-color: var(--el-color-warning) !important;
}

.table-actions .el-button--info,
.table-actions .el-button--info[text],
.table-actions .el-button--info[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-info) !important;
  border-color: var(--el-color-info) !important;
}

.input-suffix {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.form-divider {
  margin: 20px 0;
  border-color: var(--el-border-color-lighter);

  :deep(.el-divider__text) {
    background: var(--el-fill-color-light);
    padding: 0 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 28px 0 20px;
  animation: fadeInUp 0.4s ease-out 0.15s both;
}

.section-divider-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--el-color-primary-light-6) 0%, var(--el-color-primary-light-4) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(64, 158, 255, 0.18);
}

.section-divider-icon {
  font-size: 18px;
  color: #ffffff;
}

.section-divider-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--el-color-primary-light-4) 0%, transparent 100%);
}

.card-view {
  animation: fadeInUp 0.4s ease-out 0.25s both;
}

/* 4列网格布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1400px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1000px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .card-grid { grid-template-columns: 1fr; }
}

.platform-card {
  background: var(--el-bg-color-overlay);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  animation: cardFadeIn 0.4s ease-out both;
  display: flex;
  flex-direction: column;

  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.04 + 0.25}s;
    }
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: var(--el-color-primary-light-4);
  }

  &.is-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary), 0 8px 28px var(--el-color-primary-light-6);
  }

  &.is-online {
    .card-header {
      background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, var(--el-bg-color-overlay) 100%);
    }
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(135deg, var(--el-fill-color-lighter) 0%, var(--el-bg-color-overlay) 100%);
  transition: background 0.3s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.card-checkbox {
  flex-shrink: 0;

  :deep(.el-checkbox__input) {
    .el-checkbox__inner {
      border-color: var(--el-border-color-light);
      background: var(--el-bg-color);
    }
  }

  :deep(.el-checkbox__input.is-checked) {
    .el-checkbox__inner {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }
}

.platform-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--el-color-primary-light-5) 0%, var(--el-color-primary-light-3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--el-color-primary-light-6);

  .el-icon {
    font-size: 20px;
    color: #ffffff;
  }
}

.platform-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--el-fill-color-lighter);
  flex-shrink: 0;

  &.online {
    background: var(--el-color-success-light-8);
  }

  &.offline {
    background: var(--el-color-danger-light-8);
  }
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--el-color-danger);
  flex-shrink: 0;
  box-shadow: 0 0 0 4px var(--el-color-danger-light-9);

  &.online {
    background: var(--el-color-success);
    box-shadow: 0 0 0 4px var(--el-color-success-light-9);
  }

  &.offline {
    background: var(--el-color-danger);
    box-shadow: 0 0 0 4px var(--el-color-danger-light-9);
  }

  &.pulse {
    animation: statusPulse 2s ease-in-out infinite;
  }

  &.breathe {
    animation: statusBreathe 2s ease-in-out infinite;
  }
}

@keyframes statusPulse {
  0%, 100% {
    box-shadow: 0 0 0 4px var(--el-color-success-light-9), 0 0 0 0 rgba(16, 185, 129, 0.4);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 0 4px var(--el-color-success-light-9), 0 0 0 12px rgba(16, 185, 129, 0);
    opacity: 0.8;
  }
}

@keyframes statusBreathe {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-body {
  padding: 16px;
  flex: 1;
}

.info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.full {
    flex: 0 0 100%;
  }
}

.info-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 6px 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.card-footer {
  padding: 0 16px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 14px;
}

.btn-primary {
  flex: 1;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  gap: 6px;
}

.footer-actions .el-button {
  color: #ffffff !important;
}

.footer-actions .el-button--primary,
.footer-actions .el-button--primary[text],
.footer-actions .el-button--primary[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}

.footer-actions .el-button--danger,
.footer-actions .el-button--danger[text],
.footer-actions .el-button--danger[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.footer-actions .el-button--success,
.footer-actions .el-button--success[text],
.footer-actions .el-button--success[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}

.footer-actions .el-button--warning,
.footer-actions .el-button--warning[text],
.footer-actions .el-button--warning[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-warning) !important;
  border-color: var(--el-color-warning) !important;
}

.footer-actions .el-button--info,
.footer-actions .el-button--info[text],
.footer-actions .el-button--info[text][bg] {
  color: #ffffff !important;
  background-color: var(--el-color-info) !important;
  border-color: var(--el-color-info) !important;
}
</style>