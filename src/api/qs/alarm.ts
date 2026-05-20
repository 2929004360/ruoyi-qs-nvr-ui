import request from '@/utils/request'
import type {AjaxResult, TableDataInfo} from '@/types'
import type {QsDeviceAlarm, AlarmQueryParams} from '@/types/api/qs/alarm'

// 查询设备告警列表
export function listAlarm(query: AlarmQueryParams): Promise<TableDataInfo<QsDeviceAlarm[]>> {
    return request({
        url: '/qs/alarm/list',
        method: 'get',
        params: query
    })
}

// 查询设备告警详细
export function getAlarm(id: number): Promise<AjaxResult<QsDeviceAlarm>> {
    return request({
        url: '/qs/alarm/' + id,
        method: 'get'
    })
}

// 修改设备告警
export function updateAlarm(data: QsDeviceAlarm): Promise<AjaxResult> {
    return request({
        url: '/qs/alarm',
        method: 'put',
        data: data
    })
}

// 删除设备告警
export function delAlarm(id: number | number[]): Promise<AjaxResult> {
    return request({
        url: '/qs/alarm/' + id,
        method: 'delete'
    })
}

// 导出设备告警
export function exportAlarm(query: AlarmQueryParams): Promise<AjaxResult> {
    return request({
        url: '/qs/alarm/export',
        method: 'get',
        params: query
    })
}

// 批量处理设备告警
export function batchHandleAlarm(data: QsDeviceAlarm): Promise<AjaxResult> {
    console.log('=== 调用批量处理告警 API ===')
    console.log('发送的数据:', data)
    return request({
        url: '/qs/alarm/batchHandle',
        method: 'put',
        data: data
    })
}
