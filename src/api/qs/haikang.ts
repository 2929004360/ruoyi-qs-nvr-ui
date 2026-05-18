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
