import request from '@/utils/request'
import {DaHuaDevice} from "@/types/api/qs/dahua";
import {AjaxResult} from "@/types";

// 查询大华设备列表
export function listDaHusDevice(): Promise<AjaxResult<DaHuaDevice[]>> {
    return request({
        url: '/dahua/device/list',
        method: 'get',
    })
}

/**
 * 查询大华设备录像列表
 * @param id 设备ID
 * @param channelId 通道ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function queryDaHuaRecord(
  id: number,
  channelId: number,
  startTime: string,
  endTime: string
): Promise<AjaxResult<any>> {
  return request({
    url: `/dahua/device/queryRecord/${id}/${channelId}`,
    method: 'get',
    params: {
      startTime,
      endTime
    },
    timeout: 30000
  })
}