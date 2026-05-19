import request from '@/utils/request'
import {AjaxResult} from "@/types";

/**
 * 查询海康SDK设备录像列表
 * @param deviceId 设备ID
 * @param channelId 通道ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function queryHaiKangRecord(
    deviceId: number,
    channelId: number,
    startTime: string,
    endTime: string
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getRecMonth/${deviceId}/${channelId}`,
        method: 'get',
        params: {
            startTime,
            endTime
        },
        timeout: 30000
    })
}

export interface HaikangRecordDownloadRequest {
    id: number;
    channelId: number;
    startTime: string;
    endTime: string;
    recordFileType?: number;
}

/**
 * 海康设备录像直接下载到用户电脑
 * @param data 下载请求
 */
export function downloadHaikangRecordDirect(data: HaikangRecordDownloadRequest): Promise<any> {
    return request({
        url: '/haikang/device/downloadRecordDirect',
        method: 'post',
        data: data,
        responseType: 'blob',
        timeout: 300000
    })
}

/**
 * 海康设备抓图并保存
 * @param deviceId 设备ID
 * @param channelId 通道ID
 * @param snapshotType 抓图类型
 */
export function captureHaikangAndSave(
    deviceId: number,
    channelId: number,
    snapshotType: string = 'manual'
): Promise<AjaxResult<number>> {
    return request({
        url: `/haikang/device/captureAndSave/${deviceId}/${channelId}`,
        method: 'post',
        params: { snapshotType },
        timeout: 30000
    })
}

/**
 * 获取海康设备信息
 * @param deviceId 设备ID
 */
export function getHaiKangDeviceInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangDeviceInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康存储信息
 * @param deviceId 设备ID
 */
export function getHaiKangStorageInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangStorageInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康SD卡信息
 * @param deviceId 设备ID
 */
export function getHaiKangSDCardInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangSDCardInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康码率信息
 * @param deviceId 设备ID
 */
export function getHaiKangBitrateInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangBitrateInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康网络状态信息
 * @param deviceId 设备ID
 */
export function getHaiKangNetworkStatusInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangNetworkStatusInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康软件版本信息
 * @param deviceId 设备ID
 */
export function getHaiKangSoftwareVersionInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangSoftwareVersionInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康录像状态信息
 * @param deviceId 设备ID
 */
export function getHaiKangRecordStateInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangRecordStateInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康电源状态信息
 * @param deviceId 设备ID
 */
export function getHaiKangPowerStateInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangPowerStateInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康报警布撤防信息
 * @param deviceId 设备ID
 */
export function getHaiKangAlarmArmInfo(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangAlarmArmInfo/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康摄像头属性信息
 * @param deviceId 设备ID
 */
export function getHaiKangCameraInfo(
  deviceId: number
): Promise<AjaxResult<any>> {
  return request({
    url: `/haikang/device/getHaiKangCameraInfo/${deviceId}`,
    method: 'get',
    timeout: 30000
  })
}

/**
 * 获取海康RTSP URL
 * @param deviceId 设备ID
 */
export function getHaiKangRtspUrlInfo(
  deviceId: number
): Promise<AjaxResult<any>> {
  return request({
    url: `/haikang/device/getHaiKangRtspUrlInfo/${deviceId}`,
    method: 'get',
    timeout: 30000
  })
}

/**
 * 获取海康系统参数
 * @param deviceId 设备ID
 */
export function getHaiKangSystemParam(
    deviceId: number
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangSystemParam/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 获取海康视频参数
 * @param deviceId 设备ID
 * @param channelId 通道ID
 * @param streamType 码流类型
 */
export function getHaiKangVideoParam(
    deviceId: number,
    channelId: number,
    streamType: string
): Promise<AjaxResult<any>> {
    return request({
        url: `/haikang/device/getHaiKangVideoParam/${deviceId}/${channelId}`,
        method: 'get',
        params: { streamType },
        timeout: 30000
    })
}

/**
 * 获取海康设备时间
 * @param deviceId 设备ID
 */
export function getHaiKangDevTime(
    deviceId: number
): Promise<AjaxResult<string>> {
    return request({
        url: `/haikang/device/getHaiKangDevTime/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}

/**
 * 设置海康设备时间
 * @param deviceId 设备ID
 * @param time 时间（格式：yyyy-MM-dd HH:mm:ss）
 */
export function setHaiKangDevTime(
    deviceId: number,
    time: string
): Promise<AjaxResult<boolean>> {
    return request({
        url: `/haikang/device/setHaiKangDevTime/${deviceId}`,
        method: 'get',
        params: { time },
        timeout: 30000
    })
}

/**
 * 重启海康设备
 * @param deviceId 设备ID
 */
export function rebootHaiKangDevice(
    deviceId: number
): Promise<AjaxResult<boolean>> {
    return request({
        url: `/haikang/device/rebootHaiKangDevice/${deviceId}`,
        method: 'get',
        timeout: 30000
    })
}
