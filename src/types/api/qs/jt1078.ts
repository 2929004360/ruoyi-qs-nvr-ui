/**
 * JT1078 设备信息
 */
export interface Jt1078Device {
  /**
   * 设备id
   */
  deviceId?: string;

  /**
   * 设备手机号
   */
  mobileNo?: string;

  /**
   * 车牌号
   */
  plateNo?: string;

  /**
   * 机构id
   */
  agencyId?: number;

  /**
   * 司机id(人脸识别)
   */
  driverId?: number;

  /**
   * 协议版本号
   */
  protocolVersion?: number;

  /**
   * 实时状态
   */
  location?: any;

  /**
   * 省域ID
   */
  provinceId?: number;

  /**
   * 市县域ID
   */
  cityId?: number;

  /**
   * 制造商ID
   */
  makerId?: string;

  /**
   * 终端型号
   */
  deviceModel?: string;

  /**
   * 车牌颜色
   */
  plateColor?: number | string;

  /**
   * 在线
   */
  online?: boolean;
}

