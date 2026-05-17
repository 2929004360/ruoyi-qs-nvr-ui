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
