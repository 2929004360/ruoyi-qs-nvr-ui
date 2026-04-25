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
