import {mixProxy} from '../../tool'

import type {BaseApi} from '../base/BaseApi'
import {BASE_API} from '../base/BaseApi'


/**
 * 请求基类 详细信息查看
 */
export class ApiProvider {
  public baseApi: BaseApi

  constructor() {
    this.baseApi = BASE_API
  }
}

export const apiProvider = new ApiProvider()
