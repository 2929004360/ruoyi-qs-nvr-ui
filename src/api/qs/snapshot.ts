import request from '@/utils/request'
import type {AjaxResult, TableDataInfo} from '@/types'
import type {QsDeviceSnapshot, SnapshotQueryParams} from '@/types/api/qs/snapshot'

// 查询设备抓图列表
export function listSnapshot(query: SnapshotQueryParams): Promise<TableDataInfo<QsDeviceSnapshot[]>> {
    return request({
        url: '/qs/snapshot/list',
        method: 'get',
        params: query
    })
}

// 查询设备抓图详细
export function getSnapshot(id: number): Promise<AjaxResult<QsDeviceSnapshot>> {
    return request({
        url: '/qs/snapshot/' + id,
        method: 'get'
    })
}

// 删除设备抓图
export function delSnapshot(id: number | number[]): Promise<AjaxResult> {
    return request({
        url: '/qs/snapshot/' + id,
        method: 'delete'
    })
}

// 导出设备抓图
export function exportSnapshot(query: SnapshotQueryParams): Promise<AjaxResult> {
    return request({
        url: '/qs/snapshot/export',
        method: 'get',
        params: query
    })
}

// 从流中抓图并保存
export function captureFromStream(data: {
    deviceId: number;
    app: string;
    stream: string;
    snapshotType?: string;
}): Promise<AjaxResult<QsDeviceSnapshot>> {
    return request({
        url: '/qs/snapshot/captureFromStream',
        method: 'post',
        params: data
    })
}