import request from '@/utils/request'
import type { AjaxResult } from '@/types'
import type { Jt1078Device } from '@/types/api/qs/jt1078'

export function getAllDevice(): Promise<AjaxResult<Jt1078Device[]>> {
  return request({
    url: '/jt1078/device/allList',
    method: 'get'
  })
}

/**
 * 查询JT1078设备录像列表
 * @param mobileNo 手机号
 * @param channelNo 通道号
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function queryJt1078Record(
    mobileNo: string,
    channelNo: number,
    startTime: string,
    endTime: string
): Promise<AjaxResult<any>> {
    return request({
        url: `/jt1078/queryRecord/${mobileNo}/${channelNo}`,
        method: 'get',
        params: {
            startTime,
            endTime
        },
        timeout: 30000
    })
}
