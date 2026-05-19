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