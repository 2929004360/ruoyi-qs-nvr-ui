<template>
  <div>
    <div class="user-info-head" @click="editCropper()">
      <img :src="options.img" title="点击上传头像" class="avatar-img" />
      <div class="avatar-overlay">
        <el-icon class="upload-icon"><Upload /></el-icon>
        <span>更换头像</span>
      </div>
    </div>
    <el-dialog :title="title" v-model="open" width="800px" append-to-body class="avatar-cropper-dialog" @opened="modalOpened" @close="closeDialog">
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @realTime="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button circle size="small" :icon="Upload" title="选择图片" />
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button circle size="small" :icon="Plus" title="放大" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button circle size="small" :icon="Minus" title="缩小" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button circle size="small" :icon="RefreshLeft" title="左旋转" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button circle size="small" :icon="RefreshRight" title="右旋转" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { uploadAvatar } from '@/api/system/user'
import useUserStore from '@/store/modules/user'
import { Upload, Plus, Minus, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'

const userStore = useUserStore()
const { proxy } = getCurrentInstance() as any
const cropper = ref<InstanceType<typeof VueCropper>>()

const open = ref(false)
const visible = ref(false)
const title = ref('修改头像')

//图片裁剪数据
const options = reactive<any>({
  img: userStore.avatar, // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  outputType: 'png', // 默认生成截图为PNG格式
  previews: {} //预览数据
})

const previews = ref<any>({})

/** 编辑头像 */
function editCropper() {
  open.value = true
}
/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true
}
/** 覆盖默认上传行为 */
function requestUpload() {}
/** 向左旋转 */
function rotateLeft() {
  cropper.value?.rotateLeft()
}
/** 向右旋转 */
function rotateRight() {
  cropper.value?.rotateRight()
}
/** 图片缩放 */
function changeScale(num: any) {
  num = num || 1
  cropper.value?.changeScale(num)
}
/** 上传预处理 */
function beforeUpload(file: any) {
  if (file.type.indexOf('image/') == -1) {
    proxy.$modal.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.img = reader.result
    }
  }
}
/** 上传图片 */
function uploadImg() {
  cropper.value?.getCropBlob((data: any) => {
    let formData = new FormData()
    formData.append('avatarfile', data, Date.now() + 'avatar.png')
    uploadAvatar(formData).then((response: any) => {
      open.value = false
      options.img = import.meta.env.VITE_APP_BASE_API + response.imgUrl
      userStore.avatar = options.img
      ElMessage.success('修改成功')
      visible.value = false
    })
  })
}
/** 实时预览 */
function realTime(data: any) {
  previews.value = data
}
/** 关闭窗口 */
function closeDialog() {
  options.img = userStore.avatar
  options.visible = false
}
</script>

<style scoped lang="scss">
.user-info-head {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .avatar-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--el-bg-color);
    box-shadow: 0 0 0 4px var(--el-color-primary-light-8),
      0 8px 24px rgba(0, 0, 0, 0.12);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.35s ease;
  }

  &:hover .avatar-img {
    transform: scale(1.05);
    box-shadow: 0 0 0 6px var(--el-color-primary-light-7),
      0 12px 32px rgba(0, 0, 0, 0.18);
  }

  .avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    transition: all 0.35s ease;
    pointer-events: none;
    margin: 3px; // offset for border

    .upload-icon {
      font-size: 24px;
      transform: translateY(4px);
      transition: transform 0.35s ease;
    }
  }

  &:hover .avatar-overlay {
    background: rgba(0, 0, 0, 0.45);
    opacity: 1;

    .upload-icon {
      transform: translateY(0);
    }
  }
}

html.dark .user-info-head {
  .avatar-img {
    box-shadow: 0 0 0 4px var(--el-color-primary-light-5),
      0 8px 24px rgba(0, 0, 0, 0.35);
  }

  &:hover .avatar-img {
    box-shadow: 0 0 0 6px var(--el-color-primary-light-3),
      0 12px 32px rgba(0, 0, 0, 0.45);
  }
}

.avatar-upload-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 3px solid var(--el-bg-color);

  img {
    width: 200px;
    height: 200px;
  }
}

html.dark .avatar-upload-preview {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  border-color: var(--el-border-color-darker);
}
</style>

<style lang="scss">
.avatar-cropper-dialog {
  .el-dialog__header {
    margin-right: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .el-dialog__body {
    padding: 20px;
  }

  .vue-cropper {
    border-radius: 12px;
    overflow: hidden;
    background-image: none;
    background: var(--el-fill-color-light);
  }

  html.dark & {
    .vue-cropper {
      background: rgba(255, 255, 255, 0.04);
    }
  }
}
</style>
