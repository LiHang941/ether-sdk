import { ConnectInfo } from '../ConnectInfo';
import { AddressInfo } from './vo';
import { providers } from 'ethers';
export declare class BaseService {
    protected provider: providers.Provider;
    protected connectInfo: ConnectInfo;
    protected addressInfo: AddressInfo;
    constructor(connectInfo: ConnectInfo);
}
