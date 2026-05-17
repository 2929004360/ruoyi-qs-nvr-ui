import request from '@/utils/request'
import {DaHuaDevice, DaHuaDeviceInfo, DaHuaSystemParam, DaHuaVideoParam, DaHuaDeviceVideoParam} from "@/types/api/qs/dahua";
import {AjaxResult} from "@/types";

// 查询大华设备列表
export function listDaHuaDevice(): Promise<AjaxResult<DaHuaDevice[]>> {
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

/**
 * 大华设备获取时间
 * @param ip 设备IP
 */
export function getDaHuaTime(ip: string): Promise<AjaxResult<string>> {
  return request({
    url: `/dahua/device/getTime/${ip}`,
    method: 'post'
  })
}

/**
 * 大华设备设置时间
 * @param id 设备ID
 * @param date 日期时间
 * @param type 类型
 */
export function setDaHuaTime(id: number, date: string, type: boolean): Promise<AjaxResult<boolean>> {
  return request({
    url: `/dahua/device/setTime/${id}`,
    method: 'get',
    params: {
      date,
      type
    }
  })
}

/**
 * 大华设备重启
 * @param id 设备ID
 */
export function rebootDaHuaDevice(id: number): Promise<AjaxResult<boolean>> {
  return request({
    url: `/dahua/device/reboot/${id}`,
    method: 'get'
  })
}

/**
 * 获取大华设备详细信息
 * @param id 设备ID
 */
export function getDaHuaDeviceInfo(id: number): Promise<AjaxResult<DaHuaDeviceInfo>> {
  return request({
    url: `/dahua/device/deviceInfo/${id}`,
    method: 'get'
  })
}

/**
 * 获取大华设备详细信息(通过IP)
 * @param ip 设备IP
 */
export function getDaHuaDeviceInfoByIp(ip: string): Promise<AjaxResult<DaHuaDeviceInfo>> {
  return request({
    url: `/dahua/device/deviceInfoByIp/${ip}`,
    method: 'get'
  })
}

/**
 * 获取大华设备系统参数
 * @param id 设备ID
 */
export function getDaHuaSystemParam(id: number): Promise<AjaxResult<DaHuaSystemParam>> {
  return request({
    url: `/dahua/device/systemParam/${id}`,
    method: 'get'
  })
}

/**
 * 获取大华设备视频参数
 * @param id 设备ID
 * @param channelId 通道ID
 * @param streamType 码流类型
 */
export function getDaHuaVideoParam(id: number, channelId: number, streamType: number): Promise<AjaxResult<DaHuaVideoParam>> {
  return request({
    url: `/dahua/device/videoParam/${id}/${channelId}`,
    method: 'get',
    params: {
      streamType
    }
  })
}

/**
 * 获取大华设备视频输入参数
 * @param id 设备ID
 * @param channelId 通道ID
 */
export function getDaHuaDeviceVideoParam(id: number, channelId: number): Promise<AjaxResult<DaHuaDeviceVideoParam>> {
  return request({
    url: `/dahua/device/deviceVideoParam/${id}/${channelId}`,
    method: 'get'
  })
}

/**
 * 设置大华设备视频参数
 * @param id 设备ID
 * @param channelId 通道ID
 * @param streamType 码流类型
 * @param param 视频参数
 */
export function setDaHuaVideoParam(id: number, channelId: number, streamType: number, param: DaHuaVideoParam): Promise<AjaxResult<boolean>> {
  return request({
    url: `/dahua/device/videoParam/${id}/${channelId}`,
    method: 'put',
    params: {
      streamType
    },
    data: param
  })
}

/**
 * 设置大华设备视频输入参数
 * @param id 设备ID
 * @param channelId 通道ID
 * @param param 视频输入参数
 */
export function setDaHuaDeviceVideoParam(id: number, channelId: number, param: DaHuaDeviceVideoParam): Promise<AjaxResult<boolean>> {
  return request({
    url: `/dahua/device/deviceVideoParam/${id}/${channelId}`,
    method: 'put',
    data: param
  })
}