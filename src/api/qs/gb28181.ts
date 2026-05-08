import request from '@/utils/request'
import type { AjaxResult } from '@/types'
import type { Gb28181Device, Gb28181Channel } from '@/types/api/qs/gb28181'

/**
 * 获取所有国标设备
 */
export function getAllDevices(): Promise<AjaxResult<Gb28181Device[]>> {
  return request({
    url: '/gb28181/device/getAllDevices',
    method: 'get'
  })
}

/**
 * 根据国标设备获取所有通道
 * @param gbDeviceId 设备编号
 */
export function getChannelsByDeviceId(gbDeviceId: string): Promise<AjaxResult<Gb28181Channel[]>> {
  return request({
    url: `/gb28181/device/getChannelsByDeviceId/${gbDeviceId}`,
    method: 'get'
  })
}

/**
 * 查询设备录像列表
 * @param deviceId 设备ID
 * @param channelId 通道ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function queryDeviceRecord(
  deviceId: string,
  channelId: string,
  startTime: string,
  endTime: string
): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/queryRecord/${deviceId}/${channelId}`,
    method: 'get',
    params: {
      startTime,
      endTime
    },
    timeout: 30000
  })
}
