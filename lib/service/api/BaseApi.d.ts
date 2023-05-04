import { ConnectInfo } from '../../ConnectInfo';
import { AddressInfo } from '../vo';
export declare class BaseApi {
    request<T = any>(path: string, method: 'get' | 'post' | 'put' | 'delete', data: any, config?: any): Promise<T>;
    connectInfo(): ConnectInfo;
    address(): AddressInfo;
}
export declare const BASE_API: BaseApi;
