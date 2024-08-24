import type { Provider } from 'ethers6';
import type { ConnectInfo } from '../ConnectInfo';
import type { AddressInfo } from './vo';
export declare class BaseService {
    protected provider: Provider;
    protected connectInfo: ConnectInfo;
    protected addressInfo: AddressInfo;
    constructor(connectInfo: ConnectInfo);
}
