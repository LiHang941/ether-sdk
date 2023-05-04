import { ConnectInfo } from '../ConnectInfo';
import { AddressInfo } from './vo';
import { providers } from 'ethers';

export class BaseService {
  protected provider: providers.Provider;
  protected connectInfo: ConnectInfo;
  protected addressInfo: AddressInfo;

  constructor(connectInfo: ConnectInfo) {
    this.provider = connectInfo.provider;
    this.connectInfo = connectInfo;
    this.addressInfo = connectInfo.addressInfo;
  }
}
