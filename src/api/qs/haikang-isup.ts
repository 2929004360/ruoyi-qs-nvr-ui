import request from '@/utils/request'
import {HaikangIsupDevice} from "@/types/api";
import {AjaxResult} from "@/types";

// 查询海康isup设备列表
export function listHaiKangIsupDevice(): Promise<AjaxResult<HaikangIsupDevice[]>> {
    return request({
        url: '/haikangIsup/device/list',
        method: 'get',
    })
}

/**
 * 查询海康ISUP设备录像列表
 * @param deviceId 设备ID
 * @param channelId 通道ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function queryHaiKangIsupRecord(
    deviceId: number,
    channelId: number,
    startTime: string,
    endTime: string
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getRecMonth/${deviceId}/${channelId}`,
        method: 'get',
        params: {
            startTime,
            endTime
        },
        timeout: 30000
    })
}

/**
 * 重启海康ISUP设备
 * @param deviceId 设备ID
 */
export function rebootHaiKangIsupDevice(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/rebootHaiKangDevice/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP设备时间
 * @param deviceId 设备ID
 */
export function getHaiKangIsupDevTime(deviceId: number): Promise<AjaxResult<string>> {
    return request({
        url: `/haikangIsup/device/getHaiKangDevTime/${deviceId}`,
        method: 'get'
    })
}

/**
 * 设置海康ISUP设备时间
 * @param deviceId 设备ID
 * @param time 时间，格式为 yyyy-MM-dd HH:mm:ss
 */
export function setHaiKangIsupDevTime(deviceId: number, time: string): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/setHaiKangDevTime/${deviceId}`,
        method: 'get',
        params: { time }
    })
}

/**
 * 海康ISUP设备抓图并保存
 * @param deviceId 设备ID
 * @param channelId 通道ID
 * @param snapshotType 抓图类型
 */
export function captureHaiKangIsupAndSave(deviceId: number, channelId: number, snapshotType: string): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/captureAndSave/${deviceId}/${channelId}`,
        method: 'post',
        params: { snapshotType }
    })
}

/**
 * 海康ISUP设备录像下载请求参数
 */
export interface HaikangIsupRecordDownloadRequest {
    id: number;
    channelId: number;
    startTime: string;
    endTime: string;
    recordFileType?: number;
}

/**
 * 海康ISUP设备录像直接下载到用户电脑
 * @param data 下载请求
 */
export function downloadHaikangIsupRecordDirect(data: HaikangIsupRecordDownloadRequest): Promise<any> {
    return request({
        url: '/haikangIsup/device/downloadRecordDirect',
        method: 'post',
        data: data,
        responseType: 'blob',
        timeout: 300000
    })
}

/**
 * 获取海康ISUP设备信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupDeviceInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupDeviceInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP存储信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupStorageInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupStorageInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP SD卡信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupSDCardInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupSDCardInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP码率信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupBitrateInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupBitrateInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP网络状态信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupNetworkStatusInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupNetworkStatusInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP软件版本信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupSoftwareVersionInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupSoftwareVersionInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP电源状态信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupPowerStateInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupPowerStateInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP摄像头属性信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupCameraInfo(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupCameraInfo/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP系统参数
 * @param deviceId 设备ID
 */
export function getHaiKangIsupSystemParam(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupSystemParam/${deviceId}`,
        method: 'get'
    })
}

/**
 * 获取海康ISUP视频参数
 * @param deviceId 设备ID
 * @param streamType 流类型
 */
export function getHaiKangIsupVideoParam(deviceId: number, streamType?: string): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupVideoParam/${deviceId}`,
        method: 'get',
        params: { streamType }
    })
}

/**
 * 获取海康系统状态信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupSystemStatus(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupSystemStatus/${deviceId}`,
        method: 'get'
    });
}

/**
 * 获取海康设备信息（XML格式）
 * @param deviceId 设备ID
 */
export function getHaiKangIsupDeviceInfoXml(deviceId: number): Promise<AjaxResult<any>> {
    return request({
        url: `/haikangIsup/device/getHaiKangIsupDeviceInfoXml/${deviceId}`,
        method: 'get'
    });
}

/**
 * 海康设备远程升级请求参数
 */
export interface HaiKangIsupUpgradeRequest {
    deviceId: number;
    ftpServerIp: string;
    ftpServerPort?: number;
    ftpAccount?: string;
    ftpPassword?: string;
    fileName: string;
    channel?: number;
}

/**
 * 海康设备远程升级
 * @param request 升级请求参数
 */
export function upgradeHaiKangIsupDevice(data: HaiKangIsupUpgradeRequest): Promise<AjaxResult<any>> {
  return request({
    url: '/haikangIsup/device/upgradeHaiKangIsupDevice',
    method: 'post',
    data: data
  });
}

/**
 * 获取海康ISUP设备配置信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupDeviceConfig(deviceId: number): Promise<AjaxResult<any>> {
  return request({
    url: `/haikangIsup/device/getHaiKangIsupDeviceConfig/${deviceId}`,
    method: 'get'
  });
}

/**
 * 设置海康ISUP设备配置信息
 * @param deviceId 设备ID
 * @param config 配置信息
 */
export function setHaiKangIsupDeviceConfig(deviceId: number, config: any): Promise<AjaxResult<any>> {
  return request({
    url: `/haikangIsup/device/setHaiKangIsupDeviceConfig/${deviceId}`,
    method: 'post',
    data: config
  });
}

/**
 * 获取海康ISUP版本信息
 * @param deviceId 设备ID
 */
export function getHaiKangIsupVersionInfo(deviceId: number): Promise<AjaxResult<any>> {
  return request({
    url: `/haikangIsup/device/getHaiKangIsupVersionInfo/${deviceId}`,
    method: 'get'
  });
}

