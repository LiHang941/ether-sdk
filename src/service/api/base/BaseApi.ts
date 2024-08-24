import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { Variables } from 'graphql-request'
import { request } from 'graphql-request'
import { Trace } from '../../tool'
import { BasicException } from '../../../BasicException'
import { getCurrentAddressInfo } from '../../../Constant'
import type { ConnectInfo } from '../../../ConnectInfo'
import {AddressInfo, ChainInfo, ChainType} from '../../vo'
import {GQLParams} from "../gql";

export class BaseApi {
  async request<T = any>(
    path: string,
    method: 'get' | 'post' | 'put' | 'delete',
    data: any,
    config: any = {
      headers: {},
    },
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      const requestUrl = path
      const req = {
        url: requestUrl,
        method,
        params: undefined,
        data: undefined,
        headers: {},
      } as AxiosRequestConfig
      if (['get', 'delete'].includes(method.toLowerCase()))
        req.params = data
      else
        req.data = data

      if (config.headers)
        req.headers = config.headers

      axios(req)
        .then((res) => {
          Trace.debug(`request success ${method} ${requestUrl} data =`, data, `result = `, res.data)
          resolve(res.data as T)
        })
        .catch((err) => {
          Trace.debug(`request error ${method} ${requestUrl} data =`, data, `error = `, err)
          const msg = 'Network Error'
          reject(msg)
        })
    })
  }

  async graphBase<T = any, V = Variables>(fullUrl: string, query: string, variables: V): Promise<T> {
    Trace.debug(`graph node request: ${fullUrl}`, query, variables)
    try {
      const t = await request<T>(fullUrl, query, variables as any)
      Trace.debug(`graph node request success data =`, t)
      return t
    }
    catch (e) {
      Trace.debug('graph node request error', e)
      throw new BasicException('Request failed', e as any)
    }
  }

  connectInfo(chainInfo:ChainInfo): ConnectInfo {
    return getCurrentAddressInfo().readonlyConnectInfo(chainInfo)
  }

  getCurrentConnectInfo(chainType:ChainType): ConnectInfo {
    const addressInfo = BASE_API.address();
    const chainInfo = addressInfo.getChainInfo(chainType);
    return getCurrentAddressInfo().readonlyConnectInfo(chainInfo)
  }

  address(): AddressInfo {
    return getCurrentAddressInfo()
  }
}

export const BASE_API = new BaseApi()
