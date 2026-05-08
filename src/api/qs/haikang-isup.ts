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