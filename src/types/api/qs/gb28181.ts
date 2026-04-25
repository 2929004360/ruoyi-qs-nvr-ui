/**
 * 国标设备/平台
 */
export interface Gb28181Device {
  /**
   * 数据库自增ID
   */
  id?: number;

  /**
   * 设备国标编号
   */
  deviceId?: string;

  /**
   * 名称
   */
  name?: string;

  /**
   * 生产厂商
   */
  manufacturer?: string;

  /**
   * 型号
   */
  model?: string;

  /**
   * 固件版本
   */
  firmware?: string;

  /**
   * 传输协议（UDP/TCP）
   */
  transport?: string;

  /**
   * 数据流传输模式
   * UDP:udp传输
   * TCP-ACTIVE：tcp主动模式
   * TCP-PASSIVE：tcp被动模式
   */
  streamMode?: string;

  /**
   * IP
   */
  ip?: string;

  /**
   * 端口
   */
  port?: number;

  /**
   * wan地址
   */
  hostAddress?: string;

  /**
   * 是否在线，true为在线，false为离线
   */
  onLine?: boolean;

  /**
   * 注册时间
   */
  registerTime?: string;

  /**
   * 心跳时间
   */
  keepaliveTime?: string;

  /**
   * 心跳间隔
   */
  heartBeatInterval?: number;

  /**
   * 心跳超时次数
   */
  heartBeatCount?: number;

  /**
   * 定位功能支持情况。取值:0-不支持;1-支持 GPS定位;2-支持北斗定位(可选,默认取值为0
   */
  positionCapability?: number;

  /**
   * 通道个数
   */
  channelCount?: number;

  /**
   * 注册有效期
   */
  expires?: number;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新时间
   */
  updateTime?: string;

  /**
   * 设备使用的媒体id, 默认为null
   */
  mediaServerId?: string;

  /**
   * 字符集, 支持 UTF-8 与 GB2312
   */
  charset?: string;

  /**
   * 目录订阅周期，0为不订阅
   */
  subscribeCycleForCatalog?: number;

  /**
   * 移动设备位置订阅周期，0为不订阅
   */
  subscribeCycleForMobilePosition?: number;

  /**
   * 移动设备位置信息上报时间间隔,单位:秒,默认值5
   */
  mobilePositionSubmissionInterval?: number;

  /**
   * 报警订阅周期，0为不订阅
   */
  subscribeCycleForAlarm?: number;

  /**
   * 是否开启ssrc校验，默认关闭，开启可以防止串流
   */
  ssrcCheck?: boolean;

  /**
   * 地理坐标系， 目前支持 WGS84,GCJ02
   */
  geoCoordSys?: string;

  /**
   * 密码
   */
  password?: string;

  /**
   * 收流IP
   */
  sdpIp?: string;

  /**
   * SIP交互IP（设备访问平台的IP）
   */
  localIp?: string;

  /**
   * 是否作为消息通道
   */
  asMessageChannel?: boolean;

  /**
   * 设备注册的事务信息
   */
  sipTransactionInfo?: any;

  /**
   * 控制语音对讲流程，释放收到ACK后发流
   */
  broadcastPushAfterAck?: boolean;

  /**
   * 所属服务Id
   */
  serverId?: string;
}

/**
 * 国标28181通道信息
 */
export interface Gb28181Channel {
  // ==================== 数据库字段（gb前缀） ====================
  /**
   * 国标-数据库自增ID
   */
  gbId?: number;

  /**
   * 国标-编码
   */
  gbDeviceId?: string;

  /**
   * 国标-名称
   */
  gbName?: string;

  /**
   * 国标-设备厂商
   */
  gbManufacturer?: string;

  /**
   * 国标-设备型号
   */
  gbModel?: string;

  /**
   * 国标-设备归属
   */
  gbOwner?: string;

  /**
   * 国标-行政区域
   */
  gbCivilCode?: string;

  /**
   * 国标-警区
   */
  gbBlock?: string;

  /**
   * 国标-安装地址
   */
  gbAddress?: string;

  /**
   * 国标-是否有子设备
   */
  gbParental?: number;

  /**
   * 国标-父节点ID
   */
  gbParentId?: string;

  /**
   * 国标-信令安全模式
   */
  gbSafetyWay?: number;

  /**
   * 国标-注册方式
   */
  gbRegisterWay?: number;

  /**
   * 国标-证书序列号
   */
  gbCertNum?: string;

  /**
   * 国标-证书有效标识
   */
  gbCertifiable?: number;

  /**
   * 国标-无效原因码(有证书且证书无效的设备必选)
   */
  gbErrCode?: number;

  /**
   * 国标-证书终止有效期(有证书且证书无效的设备必选)
   */
  gbEndTime?: string;

  /**
   * 国标-保密属性(必选)缺省为0;0-不涉密,1-涉密
   */
  gbSecrecy?: number;

  /**
   * 国标-设备/系统IPv4/IPv6地址
   */
  gbIpAddress?: string;

  /**
   * 国标-设备/系统端口
   */
  gbPort?: number;

  /**
   * 国标-设备口令
   */
  gbPassword?: string;

  /**
   * 国标-设备状态
   */
  gbStatus?: string;

  /**
   * 国标-经度 WGS-84坐标系
   */
  gbLongitude?: number;

  /**
   * 国标-纬度 WGS-84坐标系
   */
  gbLatitude?: number;

  /**
   * GPS海拔
   */
  gpsAltitude?: number;

  /**
   * GPS速度
   */
  gpsSpeed?: number;

  /**
   * GPS方向
   */
  gpsDirection?: number;

  /**
   * GPS时间
   */
  gpsTime?: string;

  /**
   * 国标-虚拟组织所属的业务分组ID
   */
  gbBusinessGroupId?: string;

  /**
   * 国标-摄像机结构类型,标识摄像机类型: 1-球机; 2-半球; 3-固定枪机; 4-遥控枪机;5-遥控半球;6-多目设备的全景/拼接通道;7-多目设备的分割通道; 99-移动设备（非标）98-会议设备（非标）
   */
  gbPtzType?: number;

  /**
   * -摄像机位置类型扩展。1-省际检查站、2-党政机关、3-车站码头、4-中心广场、5-体育场馆、6-商业中心、7-宗教场所、8-校园周边、9-治安复杂区域、10-交通干线。当目录项为摄像机时可选。
   */
  gbPositionType?: number;

  /**
   * 国标-摄像机安装位置室外、室内属性。1-室外、2-室内。
   */
  gbRoomType?: number;

  /**
   * 国标-用途属性
   */
  gbUseType?: number;

  /**
   * 国标-摄像机补光属性。1-无补光;2-红外补光;3-白光补光;4-激光补光;9-其他
   */
  gbSupplyLightType?: number;

  /**
   * 国标-摄像机监视方位(光轴方向)属性。1-东(西向东)、2-西(东向西)、3-南(北向南)、4-北(南向北)、5-东南(西北到东南)、6-东北(西南到东北)、7-西南(东北到西南)、8-西北(东南到西北)
   */
  gbDirectionType?: number;

  /**
   * 国标-摄像机支持的分辨率,可多值
   */
  gbResolution?: string;

  /**
   * 国标-下载倍速(可选),可多值
   */
  gbDownloadSpeed?: string;

  /**
   * 国标-空域编码能力,取值0-不支持;1-1级增强(1个增强层);2-2级增强(2个增强层);3-3级增强(3个增强层)
   */
  gbSvcSpaceSupportMod?: number;

  /**
   * 国标-时域编码能力,取值0-不支持;1-1级增强;2-2级增强;3-3级增强(可选)
   */
  gbSvcTimeSupportMode?: number;

  /**
   * 二进制保存的录制计划, 每一位表示每个小时的前半个小时
   */
  recordPLan?: number;

  /**
   * 关联的数据类型
   */
  dataType?: number;

  /**
   * 关联的设备ID
   */
  dataDeviceId?: number;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新时间
   */
  updateTime?: string;

  /**
   * 流唯一编号，存在表示正在直播
   */
  streamId?: string;

  /**
   * 是否支持对讲 1支持,0不支持
   */
  enableBroadcast?: number;

  /**
   * 抽稀后的图层层级
   */
  mapLevel?: number;

  // ==================== 国标协议字段（无gb前缀） ====================
  /**
   * 数据库自增ID
   */
  id?: number;

  /**
   * 父设备编码
   */
  parentDeviceId?: string;

  /**
   * 父设备名称
   */
  parentName?: string;

  /**
   * 编码
   */
  deviceId?: string;

  /**
   * 名称
   */
  name?: string;

  /**
   * 设备厂商
   */
  manufacturer?: string;

  /**
   * 设备型号
   */
  model?: string;

  /**
   * 设备归属
   */
  owner?: string;

  /**
   * 行政区域
   */
  civilCode?: string;

  /**
   * 警区
   */
  block?: string;

  /**
   * 安装地址
   */
  address?: string;

  /**
   * 是否有子设备(必选)1有,0没有
   */
  parental?: number;

  /**
   * 父节点ID
   */
  parentId?: string;

  /**
   * 信令安全模式
   */
  safetyWay?: number;

  /**
   * 注册方式
   */
  registerWay?: number;

  /**
   * 证书序列号
   */
  certNum?: string;

  /**
   * 证书有效标识, 缺省为0;证书有效标识:0:无效 1:有效
   */
  certifiable?: number;

  /**
   * 无效原因码(有证书且证书无效的设备必选)
   */
  errCode?: number;

  /**
   * 证书终止有效期(有证书且证书无效的设备必选)
   */
  endTime?: string;

  /**
   * 保密属性(必选)缺省为0;0-不涉密,1-涉密
   */
  secrecy?: number;

  /**
   * 设备/系统IPv4/IPv6地址
   */
  ipAddress?: string;

  /**
   * 设备/系统端口
   */
  port?: number;

  /**
   * 设备口令
   */
  password?: string;

  /**
   * 设备状态
   */
  status?: string;

  /**
   * 经度 WGS-84坐标系
   */
  longitude?: number;

  /**
   * 纬度 WGS-84坐标系
   */
  latitude?: number;

  /**
   * 摄像机结构类型,标识摄像机类型: 1-球机; 2-半球; 3-固定枪机; 4-遥控枪机;5-遥控半球;6-多目设备的全景/拼接通道;7-多目设备的分割通道
   */
  ptzType?: number;

  /**
   * 摄像机位置类型扩展。1-省际检查站、2-党政机关、3-车站码头、4-中心广场、5-体育场馆、6-商业中心、7-宗教场所、8-校园周边、9-治安复杂区域、10-交通干线
   */
  positionType?: number;

  /**
   * 摄像机安装位置室外、室内属性。1-室外、2-室内。
   */
  roomType?: number;

  /**
   * 用途属性， 1-治安、2-交通、3-重点。
   */
  useType?: number;

  /**
   * 摄像机补光属性。1-无补光;2-红外补光;3-白光补光;4-激光补光;9-其他
   */
  supplyLightType?: number;

  /**
   * 摄像机监视方位(光轴方向)属性。1-东(西向东)、2-西(东向西)、3-南(北向南)、4-北(南向北)、5-东南(西北到东南)、6-东北(西南到东北)、7-西南(东北到西南)、8-西北(东南到西北)
   */
  directionType?: number;

  /**
   * 摄像机支持的分辨率,可多值
   */
  resolution?: string;

  /**
   * 虚拟组织所属的业务分组ID
   */
  businessGroupId?: string;

  /**
   * 下载倍速(可选),可多值
   */
  downloadSpeed?: string;

  /**
   * 空域编码能力,取值0-不支持;1-1级增强(1个增强层);2-2级增强(2个增强层);3-3级增强(3个增强层)
   */
  svcSpaceSupportMod?: number;

  /**
   * 时域编码能力,取值0-不支持;1-1级增强;2-2级增强;3-3级增强(可选)
   */
  svcTimeSupportMode?: number;

  /**
   * 云台类型描述字符串
   */
  ptzTypeText?: string;

  /**
   * 子设备数
   */
  subCount?: number;

  /**
   * 是否含有音频
   */
  hasAudio?: boolean;

  /**
   * 码流标识，优先级高于设备中码流标识，用于选择码流时组成码流标识。默认为null，不设置。可选值: stream/streamnumber/streamprofile/streamMode
   */
  streamIdentification?: string;

  /**
   * 通道类型， 默认0, 0： 普通通道，1 行政区划 2 业务分组/虚拟组织
   */
  channelType?: number;
}
