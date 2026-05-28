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
 * 查询设备配置
 * @param deviceId 设备ID
 * @param configType 配置类型，多个用/分隔
 */
export function queryDeviceConfig(deviceId: string, configType: string): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/config/${deviceId}`,
    method: 'get',
    params: { configType },
    timeout: 30000
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

/**
 * 修改设备配置
 * @param deviceId 设备ID
 * @param config 配置数据
 */
export function updateDeviceConfig(deviceId: string, config: any): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/config/${deviceId}`,
    method: 'post',
    data: config,
    timeout: 30000
  })
}

/**
 * 查询看守位
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 */
export function queryHomePosition(deviceId: string, channelId?: string): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/homePosition/${deviceId}`,
    method: 'get',
    params: { channelId },
    timeout: 30000
  })
}

/**
 * 设置看守位
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param config 看守位配置
 */
export function updateHomePosition(deviceId: string, channelId?: string, config?: any): Promise<AjaxResult<any>> {
  return request({
    url: `/gb28181/device/homePosition/${deviceId}`,
    method: 'post',
    params: { channelId },
    data: config,
    timeout: 30000
  })
}

/**
 * 查询巡航轨迹列表
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 */
export function queryCruiseTrackList(deviceId: string, channelId?: string): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/cruiseTrackList/${deviceId}`,
        method: 'get',
        params: { channelId },
        timeout: 30000
    })
}

/**
 * 查询巡航轨迹
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param number 轨迹编号：0-第一条轨迹，1-第二条轨迹
 */
export function queryCruiseTrack(deviceId: string, channelId?: string, number?: number): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/cruiseTrack/${deviceId}`,
        method: 'get',
        params: { channelId, number },
        timeout: 30000
    })
}

/**
 * PTZ精准状态查询
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 */
export function queryPTZPosition(deviceId: string, channelId?: string): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/ptzPosition/${deviceId}`,
        method: 'get',
        params: { channelId },
        timeout: 30000
    })
}

/**
 * 存储卡状态查询
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 */
export function querySDCardStatus(deviceId: string, channelId?: string): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/sdCardStatus/${deviceId}`,
        method: 'get',
        params: { channelId },
        timeout: 30000
    })
}

/**
 * 开始巡航
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param cruiseId 巡航组号
 */
export function startCruise(deviceId: string, channelId?: string, cruiseId?: number): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/cruise/start/${deviceId}`,
        method: 'get',
        params: { channelId, cruiseId },
        timeout: 30000
    })
}

/**
 * 停止巡航
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param cruiseId 巡航组号
 */
export function stopCruise(deviceId: string, channelId?: string, cruiseId?: number): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/cruise/stop/${deviceId}`,
        method: 'get',
        params: { channelId, cruiseId },
        timeout: 30000
    })
}

/**
 * 报警复位控制
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param alarmMethod 报警方式（可选），0-全部，1-电话报警，2-设备报警，3-短信报警，4-GPS报警，5-视频报警，6-设备故障报警，7-其他报警
 * @param alarmType 报警类型（可选）
 */
export function alarmResetControl(deviceId: string, channelId?: string, alarmMethod?: string, alarmType?: string): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/alarmReset/${deviceId}`,
        method: 'post',
        params: { channelId, alarmMethod, alarmType },
        timeout: 30000
    })
}

/**
 * 强制关键帧控制
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 */
export function iFrameControl(deviceId: string, channelId?: string): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/iFrame/${deviceId}`,
        method: 'post',
        params: { channelId },
        timeout: 30000
    })
}

/**
 * 看守位控制
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param deviceConfig 设备配置，包含看守位配置
 */
export function homePositionControl(deviceId: string, channelId?: string, deviceConfig?: any): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/homePosition/control/${deviceId}`,
        method: 'post',
        params: { channelId },
        data: deviceConfig,
        timeout: 30000
    })
}

/**
 * PTZ精准控制
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param ptzPreciseCtrl PTZ精准控制参数
 */
export function ptzPreciseControl(deviceId: string, channelId?: string, ptzPreciseCtrl?: any): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/ptzPrecise/${deviceId}`,
        method: 'post',
        params: { channelId },
        data: ptzPreciseCtrl,
        timeout: 30000
    })
}

/**
 * 设备软件升级控制
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param firmware 设备固件版本
 * @param fileURL 升级文件的完整路径
 * @param manufacturer 设备厂商
 * @param sessionID 会话ID
 */
export function deviceUpgradeControl(deviceId: string, channelId?: string, firmware?: string, fileURL?: string, manufacturer?: string, sessionID?: string): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/deviceUpgrade/${deviceId}`,
        method: 'post',
        params: { channelId, firmware, fileURL, manufacturer, sessionID },
        timeout: 30000
    })
}

/**
 * 存储卡格式化控制
 * @param deviceId 设备ID
 * @param channelId 通道ID（可选）
 * @param sdCardId SD卡编号（0表示所有存储卡）
 */
export function formatSDCardControl(deviceId: string, channelId?: string, sdCardId?: number): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/formatSDCard/${deviceId}`,
        method: 'post',
        params: { channelId, sdCardId },
        timeout: 30000
    })
}

/**
 * 目标跟踪控制
 * @param deviceId 设备国标编号（球机通道）
 * @param channelId 通道国标编号（可选，指球机通道）
 * @param targetTrack 跟踪类型：Auto/Manual/Stop
 * @param deviceId2 目标设备编码（可选，指全景相机中的全景通道ID）
 * @param targetArea 目标区域（可选，手动跟踪时需要）
 */
export function targetTrackControl(deviceId: string, channelId?: string, targetTrack?: string, deviceId2?: string, targetArea?: any): Promise<AjaxResult<any>> {
    return request({
        url: `/gb28181/device/targetTrack/${deviceId}`,
        method: 'post',
        params: { channelId, targetTrack, deviceId2 },
        data: targetArea,
        timeout: 30000
    })
}
