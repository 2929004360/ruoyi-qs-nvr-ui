import request from '@/utils/request'
import type { AjaxResult } from '@/types'
import type { Jt1078Device } from '@/types/api/qs/jt1078'

export function getAllDevice(): Promise<AjaxResult<Jt1078Device[]>> {
  return request({
    url: '/jt1078/device/allList',
    method: 'get'
  })
}
