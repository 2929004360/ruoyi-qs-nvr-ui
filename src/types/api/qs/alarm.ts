import type {AjaxResult, TableDataInfo} from '../common'

export interface QsDeviceAlarm {
    id?: number
    deviceId?: number
    deviceCode?: string
    deviceName?: string
    alarmType?: string
    alarmLevel?: string
    sdkType?: string
    channel?: number
    alarmTime?: string
    alarmContent?: string
    imageUrl?: string
    handled?: number
    handler?: string
    handleTime?: string
    remark?: string
    createBy?: string
    createTime?: string
    updateBy?: string
    updateTime?: string
}

export interface AlarmQueryParams {
    deviceId?: number
    deviceCode?: string
    deviceName?: string
    alarmType?: string
    alarmLevel?: string
    sdkType?: string
    channel?: number
    handled?: number
    pageNum?: number
    pageSize?: number
    beginTime?: string
    endTime?: string
}
