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

/**
 * 刷新设备状态和通道
 * @param gbDeviceId 国标设备ID
 */
export function refreshDevice(gbDeviceId: string): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/refresh/${gbDeviceId}`,
    method: 'post'
  })
}

/**
 * 远程重启设备
 * @param gbDeviceId 国标设备ID
 */
export function rebootGb28181Device(gbDeviceId: string): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/reboot/${gbDeviceId}`,
    method: 'post'
  })
}

/**
 * 录像控制
 * @param gbDeviceId 国标设备ID
 * @param channelId 通道国标编号
 * @param recordCmd 录像命令：0-停止录像，1-开始录像，2-定时录像
 * @param streamNumber 码流类型：0-主码流，1-子码流1，2-子码流2，以此类推，缺省为0
 */
export function recordCmd(gbDeviceId: string, channelId: string, recordCmd: string, streamNumber?: number): Promise<AjaxResult<any>> {
  return request({
    url: '/gb28181/device/record/cmd',
    method: 'post',
    params: {
      gbDeviceId,
      channelId,
      recordCmd,
      streamNumber
    }
  })
}

/**
 * 查询设备状态
 * @param deviceId 设备ID
 */
export function queryDeviceStatus(deviceId: string): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/status/${deviceId}`,
    method: 'get'
  })
}

/**
 * 查询设备信息
 * @param deviceId 设备ID
 */
export function queryDeviceInfo(deviceId: string): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/info/${deviceId}`,
    method: 'get'
  })
}

/**
 * 订阅设备目录
 * @param qsDeviceId QsDevice主键ID
 */
export function subscribeCatalog(qsDeviceId: number): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/subscribe/catalog/${qsDeviceId}`,
    method: 'get'
  })
}

/**
 * 取消订阅设备目录
 * @param qsDeviceId QsDevice主键ID
 */
export function unsubscribeCatalog(qsDeviceId: number): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/unsubscribe/catalog/${qsDeviceId}`,
    method: 'get'
  })
}
