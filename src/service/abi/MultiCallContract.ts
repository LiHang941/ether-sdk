import { CacheKey } from '../tool';
import { BaseService } from '../BaseService';
import { ConnectInfo } from '../../ConnectInfo';
import { Multicall2 } from '../../abi';

import { ContractCall, MulContract, Provider } from '../../mulcall';
import { fromPairs, toPairs } from 'lodash';
import {BaseAbi} from "./BaseAbi";

export interface ShapeWithLabel {
  [item: string]: ContractCall | string;
}

@CacheKey('MultiCallContract')
export class MultiCallContract extends BaseAbi {
  public multiCallInstance: Provider;

  constructor(connectInfo: ConnectInfo) {
    super(connectInfo,connectInfo.addressInfo.multicall,Multicall2);
    this.multiCallInstance = new Provider(this.connectInfo.provider, this.connectInfo.addressInfo.multicall);
  }

  async singleCall(shapeWithLabel: ShapeWithLabel): Promise<any> {
    const [res] = await this.call(...[shapeWithLabel]);
    return res;
  }

  async call(...shapeWithLabels: ShapeWithLabel[]): Promise<any[]> {
    const calls = [];
    shapeWithLabels.forEach((relay) => {
      const pairs = toPairs(relay);
      pairs.forEach(([key, value]) => {
        if (typeof value !== 'string') {
          calls.push(value as ContractCall);
        }
      });
    });
    const res = await this.multiCallInstance.all(calls);
    let index = 0;

    const data = shapeWithLabels.map((relay) => {
      const pairs = toPairs(relay);
      pairs.forEach((obj) => {
        if (typeof obj[1] !== 'string') {
          obj[1] = res[index];
          index++;
        }
      });
      return fromPairs(pairs) as any;
    });
    return data;
  }
}
