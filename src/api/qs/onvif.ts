import request from '@/utils/request'
import {AjaxResult} from "@/types";

/**
 * 查询ONVIF设备录像列表
 * @param deviceIp 设备IP
 * @param username 用户名
 * @param password 密码
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function queryOnvifRecord(
    deviceIp: string,
    username: string,
    password: string,
    startTime: string,
    endTime: string
): Promise<AjaxResult<any>> {
    return request({
        url: `/onvif/device/queryRecord`,
        method: 'get',
        params: {
            deviceIp,
            username,
            password,
            startTime,
            endTime
        },
        timeout: 30000
    })
}
