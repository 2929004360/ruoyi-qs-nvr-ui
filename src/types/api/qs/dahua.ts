/** 大华设备 */
export interface DaHuaDevice {
  /** 设备ID */
  deviceId?: string;
  /** ip */
  ip?: string;
  /** 设备登录id */
  port?: string;
}

/** 大华设备详细信息 */
export interface DaHuaDeviceInfo {
  /** 序列号 */
  serialNumber?: string;
  /** 报警输入端口数 */
  alarmInPortNum?: number;
  /** 报警输出端口数 */
  alarmOutPortNum?: number;
  /** 硬盘数量 */
  diskNum?: number;
  /** DVR类型 */
  dvrType?: number;
  /** 通道数量 */
  channelNum?: number;
  /** 登录超时时间(分钟) */
  limitLoginTime?: number;
  /** 剩余登录次数 */
  leftLogTimes?: number;
  /** 解锁剩余时间(秒) */
  lockLeftTime?: number;
}

/** 大华设备系统参数 */
export interface DaHuaSystemParam {
  /** 视频制式 */
  videoStandard?: number;
  /** 国家/地区配置 */
  country?: string;
}

/** 大华设备视频参数 */
export interface DaHuaVideoParam {
  /** 码流类型 */
  formatType?: number;
  /** 视频使能 */
  videoEnable?: number;
  /** 视频压缩格式 */
  compression?: number;
  /** 视频宽度 */
  width?: number;
  /** 视频高度 */
  height?: number;
  /** 码流控制模式 */
  bitRateControl?: number;
  /** 视频码流(kbps) */
  bitRate?: number;
  /** 视频帧率 */
  frameRate?: number;
  /** I帧间隔 */
  iframeInterval?: number;
  /** 图像质量 */
  imageQuality?: number;
}

/** 大华设备视频输入参数 */
export interface DaHuaDeviceVideoParam {
  /** 亮度 */
  brightness?: number;
  /** 对比度 */
  contrast?: number;
  /** 饱和度 */
  saturation?: number;
  /** 色度 */
  chroma?: number;
  /** 锐度 */
  sharpness?: number;
  /** 色调 */
  hue?: number;
  /** 增益 */
  gain?: number;
  /** 黑白模式 */
  blackWhiteMode?: number;
}

/** 存储设备分区信息 */
export interface DaHuaStoragePartition {
  name?: string;
  totalSpace?: number;
  freeSpace?: number;
  totalSpaceGB?: number;
  freeSpaceGB?: number;
  state?: number;
}

/** 存储设备信息 */
export interface DaHuaStorageDevice {
  name?: string;
  totalSpace?: number;
  freeSpace?: number;
  usedSpace?: number;
  totalSpaceGB?: number;
  freeSpaceGB?: number;
  usedSpaceGB?: number;
  usagePercent?: number;
  mediaType?: number;
  mediaTypeDesc?: string;
  busType?: number;
  busTypeDesc?: string;
  volumeType?: number;
  volumeTypeDesc?: string;
  state?: number;
  stateDesc?: string;
  physicNo?: number;
  logicNo?: number;
  parent?: string;
  module?: string;
  serial?: string;
  firmware?: string;
  partitionNum?: number;
  opState?: number;
  opStateDesc?: string;
  partitions?: DaHuaStoragePartition[];
}

/** 大华设备存储信息 */
export interface DaHuaStorageInfo {
  storageDevices?: DaHuaStorageDevice[];
}

/** 大华设备系统资源信息 */
export interface DaHuaSystemResourceInfo {
  success?: boolean;
  errorMessage?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  /** IP通道接入速度 */
  ipChannelIn?: number;
  /** 网络剩余能力 */
  netRemain?: number;
  /** 网络总能力 */
  netCapability?: number;
  /** 远程预览能力 */
  previewRemain?: number;
  /** 远程回放能力 */
  playBackRemain?: number;
  /** 远程发送能力 */
  netSendRemain?: number;
  /** 解码能力 */
  decodeAbility?: number;
}

/** 硬盘信息 */
export interface DaHuaDiskInfo {
  /** 硬盘编号 */
  diskNumber?: number;
  /** 分区号 */
  partitionNumber?: number;
  /** 卷名 */
  volume?: number;
  /** 剩余容量 */
  freeSpace?: number;
  /** 状态 */
  status?: number;
  /** 信号 */
  signal?: number;
  /** 磁盘类型 */
  diskType?: number;
  /** 磁盘状态 */
  diskStatus?: number;
}

/** 大华设备SD卡信息 */
export interface DaHuaSDCardInfo {
    success?: boolean;
    errorMessage?: string;
    exists?: boolean;
    totalSpace?: number;
    freeSpace?: number;
    usedSpace?: number;
    totalSpaceGB?: number;
    freeSpaceGB?: number;
    usedSpaceGB?: number;
    usagePercent?: number;
    state?: number;
    stateDesc?: string;
    /** 硬盘数量 */
    diskCount?: number;
    /** 硬盘信息列表 */
    diskList?: DaHuaDiskInfo[];
}

/** 大华设备录像状态信息 */
export interface DaHuaRecordStateInfo {
    success?: boolean;
    errorMessage?: string;
    /** 整体录像状态 */
    wholeRecording?: boolean;
    /** 整体编码状态 */
    wholeEncoding?: boolean;
    /** 通道录像状态列表 */
    channelStates?: DaHuaChannelRecordState[];
}

/** 通道录像状态 */
export interface DaHuaChannelRecordState {
    channelId?: number;
    mainStreamRecording?: boolean;
    extraStream1Recording?: boolean;
    extraStream2Recording?: boolean;
    extraStream3Recording?: boolean;
}

/** 大华设备电源状态信息 */
export interface DaHuaPowerStateInfo {
    success?: boolean;
    errorMessage?: string;
    /** 电源数量 */
    powerCount?: number;
    /** 电源状态列表 */
    powerStates?: DaHuaPowerState[];
}

/** 电源状态 */
export interface DaHuaPowerState {
    powerId?: number;
    powerName?: string;
    status?: number;
    statusDesc?: string;
    online?: boolean;
}

/** 大华设备报警布撤防信息 */
export interface DaHuaAlarmArmInfo {
    success?: boolean;
    errorMessage?: string;
    /** 报警通道数量 */
    channelCount?: number;
    /** 报警通道状态列表 */
    channelStates?: DaHuaAlarmChannelState[];
}

/** 报警通道状态 */
export interface DaHuaAlarmChannelState {
    channelId?: number;
    channelName?: string;
    armed?: boolean;
    armType?: number;
    armTypeDesc?: string;
}

/** 大华设备摄像头属性信息 */
export interface DaHuaCameraInfo {
    success?: boolean;
    errorMessage?: string;
    /** 摄像头数量 */
    cameraCount?: number;
    /** 摄像头信息列表 */
    cameraList?: DaHuaCamera[];
}

/** 摄像头信息 */
export interface DaHuaCamera {
    channelId?: number;
    cameraName?: string;
    cameraType?: string;
    online?: boolean;
    status?: number;
    statusDesc?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    firmwareVersion?: string;
    ipAddress?: string;
    port?: number;
}

/** 大华设备RTSP URL信息 */
export interface DaHuaRtspUrlInfo {
    success?: boolean;
    errorMessage?: string;
    /** URL数量 */
    urlCount?: number;
    /** RTSP URL列表 */
    urlList?: DaHuaRtspUrl[];
}

/** RTSP URL */
export interface DaHuaRtspUrl {
    channelId?: number;
    streamType?: string;
    url?: string;
    description?: string;
}

/** 大华设备通道码流信息 */
export interface DaHuaChannelBitrate {
  channelId?: number;
  streamType?: number;
  bitrate?: number;
  bitrateDesc?: string;
}

/** 大华设备码流信息 */
export interface DaHuaBitrateInfo {
  success?: boolean;
  errorMessage?: string;
  channelBitrates?: DaHuaChannelBitrate[];
}

/** 大华设备网络状态信息 */
export interface DaHuaNetworkStatusInfo {
  success?: boolean;
  errorMessage?: string;
  ipAddress?: string;
  subnetMask?: string;
  gateway?: string;
  macAddress?: string;
  linkStatus?: boolean;
  linkStatusDesc?: string;
  dns1?: string;
  dns2?: string;
  /** 网络是否可用 */
  networkAvailable?: boolean;
  /** 是否有无线功能 */
  hasWireless?: boolean;
}

/** 大华设备软件版本信息 */
export interface DaHuaSoftwareVersionInfo {
  success?: boolean;
  errorMessage?: string;
  serialNumber?: string;
  fullVersion?: string;
  deviceModel?: string;
  buildDate?: string;
  hardwareVersion?: string;
  /** 软件版本 */
  softwareVersion?: string;
  /** Web版本 */
  webVersion?: string;
  /** 外围版本 */
  peripheralVersion?: string;
  /** 地理版本 */
  geographyVersion?: string;
  /** 协议版本 */
  protocolVersion?: number;
  /** 软件构建时间 */
  softwareBuildDate?: number;
  /** 外围构建时间 */
  peripheralBuildDate?: number;
  /** 地理构建时间 */
  geographyBuildDate?: number;
  /** 硬件时间 */
  hardwareDate?: number;
  /** Web构建时间 */
  webBuildDate?: number;
}

/** 大华设备录像下载请求 */
export interface DaHuaRecordDownloadRequest {
  /** 设备ID */
  id: number;
  /** 通道ID */
  channelId: number;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 录像文件类型（0-主码流，1-子码流1，2-子码流2），可选 */
  recordFileType?: number;
}

/** 大华设备录像下载响应 */
export interface DaHuaRecordDownloadResponse {
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 文件本地路径 */
  filePath?: string;
  /** 文件访问URL */
  fileUrl?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 下载进度（0-100） */
  progress?: number;
}
