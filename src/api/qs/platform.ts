import request from '@/utils/request'
import type {AjaxResult, TableDataInfo} from '@/types'
import type {QsDevice} from '@/types/api'

export interface QsGb28181Platform {
  id?: number
  enable?: number
  name?: string
  serverGbId?: string
  serverGbDomain?: string
  serverIp?: string
  serverPort?: number
  deviceGbId?: string
  deviceIp?: string
  devicePort?: string
  username?: string
  password?: string
  expires?: string
  keepTimeout?: string
  transport?: string
  civilCode?: string
  manufacturer?: string
  model?: string
  address?: string
  characterSet?: string
  ptz?: number
  rtcp?: number
  status?: number
  catalogGroup?: number
  registerWay?: number
  secrecy?: number
  createTime?: string
  updateTime?: string
  asMessageChannel?: number
  catalogWithPlatform?: number
  catalogWithGroup?: number
  catalogWithRegion?: number
  autoPushChannel?: number
  sendStreamIp?: string
  serverId?: string
}

export interface PlatformQueryParams {
  pageNum?: number
  pageSize?: number
  name?: string
  serverGbId?: string
  status?: number
  enable?: number
}

export function listPlatform(query: PlatformQueryParams): Promise<TableDataInfo<QsGb28181Platform[]>> {
  return request({
    url: '/qs/platform/list',
    method: 'get',
    params: query
  })
}

export function getPlatform(id: number): Promise<AjaxResult<QsGb28181Platform>> {
  return request({
    url: '/qs/platform/' + id,
    method: 'get'
  })
}

export function addPlatform(data: QsGb28181Platform): Promise<AjaxResult> {
  return request({
    url: '/qs/platform',
    method: 'post',
    data: data
  })
}

export function updatePlatform(data: QsGb28181Platform): Promise<AjaxResult> {
  return request({
    url: '/qs/platform',
    method: 'put',
    data: data
  })
}

export function delPlatform(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/qs/platform/' + id,
    method: 'delete'
  })
}

export interface PlatformChannelLinkRequest {
  platformId?: number
  deviceIds?: number[]
  allLink?: boolean
}

export interface DeviceQueryParams {
  page?: number
  count?: number
  deviceName?: string
  ipAddress?: string
  type?: string
  deviceStatus?: string
}

export function listPlatformDevice(query: DeviceQueryParams, platformId?: number, hasLink?: boolean): Promise<TableDataInfo<QsDevice[]>> {
  return request({
    url: '/qs/platformChannel/deviceList',
    method: 'get',
    params: {...query, platformId, hasLink}
  })
}

export function linkDevice(data: PlatformChannelLinkRequest): Promise<AjaxResult> {
  return request({
    url: '/qs/platformChannel/link',
    method: 'post',
    data: data
  })
}

export function unlinkDevice(data: PlatformChannelLinkRequest): Promise<AjaxResult> {
  return request({
    url: '/qs/platformChannel/unlink',
    method: 'post',
    data: data
  })
}

export function registerPlatform(id: number): Promise<AjaxResult> {
  return request({
    url: '/qs/platform/cascade/start/' + id,
    method: 'post'
  })
}

export function unregisterPlatform(id: number): Promise<AjaxResult> {
  return request({
    url: '/qs/platform/cascade/stop/' + id,
    method: 'post'
  })
}

export function pushCatalog(id: number): Promise<AjaxResult> {
  return request({
    url: '/qs/platform/cascade/pushCatalog/' + id,
    method: 'post'
  })
}
