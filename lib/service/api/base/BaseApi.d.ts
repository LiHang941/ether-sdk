import type { Variables } from 'graphql-request';
import type { ConnectInfo } from '../../../ConnectInfo';
import { AddressInfo, ChainInfo, ChainType } from '../../vo';
export declare class BaseApi {
    request<T = any>(path: string, method: 'get' | 'post' | 'put' | 'delete', data: any, config?: any): Promise<T>;
    graphBase<T = any, V = Variables>(fullUrl: string, query: string, variables: V): Promise<T>;
    connectInfo(chainInfo: ChainInfo): ConnectInfo;
    getCurrentConnectInfo(chainType: ChainType): ConnectInfo;
    address(): AddressInfo;
}
export declare const BASE_API: BaseApi;
