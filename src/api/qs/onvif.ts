import request from '@/utils/request'
import {OnvifDevice, WSDiscoveryDevice, WSOnvifDevice} from "@/types/api";
import {AjaxResult} from "@/types";

// 获取onvif设备列表
export function getOnvifDeviceList(): Promise<AjaxResult<WSDiscoveryDevice[]>> {
    return request({
        url: '/onvif/device/getOnvifDeviceList',
        method: 'get',
        timeout: 20000
    })
}

// 验证登录onvif设备
export function onvifLogin(data: WSOnvifDevice): Promise<AjaxResult<OnvifDevice>> {
    return request({
        url: '/onvif/device/login',
        method: 'post',
        data,
        timeout: 20000
    })
}

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
