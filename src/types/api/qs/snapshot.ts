import type {AjaxResult, TableDataInfo} from '../common'

export interface QsDeviceSnapshot {
    id?: number
    deviceId?: number
    deviceCode?: string
    deviceName?: string
    fileUrl?: string
    filePath?: string
    fileSize?: number
    fileName?: string
    fileType?: string
    snapshotType?: string
    sdkType?: string
    channel?: number
    captureTime?: string
    width?: number
    height?: number
    latitude?: number
    longitude?: number
    remark?: string
    createBy?: string
    createTime?: string
    updateBy?: string
    updateTime?: string
}

export interface SnapshotQueryParams {
    deviceId?: number
    deviceCode?: string
    deviceName?: string
    snapshotType?: string
    sdkType?: string
    channel?: number
    pageNum?: number
    pageSize?: number
    beginTime?: string
    endTime?: string
}