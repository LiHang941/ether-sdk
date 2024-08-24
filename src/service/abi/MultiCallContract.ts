import { CacheKey } from '../tool'
import type { ConnectInfo } from '../../ConnectInfo'
import { Multicall2Abi } from '../../abi'

import type { ContractCall } from '../../mulcall'
import { multicallExecute } from '../../mulcall'
import { BaseAbi } from './BaseAbi'

export type ShapeWithLabel = Record<string, ContractCall<any>|string>;
export type ContractCallResult<T> = T extends ContractCall<infer U> ? U : never;
export type CallObjResult<T extends ShapeWithLabel[]> = {
  [K in keyof T]: {
    [P in keyof T[K]]: T[K][P] extends ContractCall<any>
      ? ContractCallResult<T[K][P]>
      : T[K][P];
  };
};

@CacheKey('MultiCallContract')
export class MultiCallContract extends BaseAbi {
  constructor(connectInfo: ConnectInfo) {
    super(connectInfo, connectInfo.chainInfo().multicall as string, Multicall2Abi)
  }

  async  multicallExecute<T>(
    calls: ContractCall<T>[],
  ): Promise<T[]> {
    const res = await multicallExecute(this.contract, calls)
    return res
  }


  async callObj<T extends ShapeWithLabel[]>(...shapeWithLabels: T): Promise<CallObjResult<T>> {
    const calls: ContractCall<unknown>[] = [];
    for (const shapeWithLabel of shapeWithLabels) {
      for (const key in shapeWithLabel) {
        if (Object.prototype.hasOwnProperty.call(shapeWithLabel, key)) {
          if (typeof shapeWithLabel[key] !== 'string') {
            calls.push(shapeWithLabel[key] as ContractCall<unknown>);
          }
        }
      }
    }
    const callResult = await this.multicallExecute(calls);
    let index = 0;
    const result: CallObjResult<T>[number][] = []
    for (const shapeWithLabel of shapeWithLabels) {
      const resultItem: Partial<CallObjResult<T>[number][keyof T[number]]> = {};
      for (const key in shapeWithLabel) {
        if (Object.prototype.hasOwnProperty.call(shapeWithLabel, key)) {
          const value = shapeWithLabel[key];
          if (typeof value === 'string') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            resultItem[key] = value;
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            resultItem[key] = callResult[index];
            index++;
          }
        }
      }
      result.push( resultItem as CallObjResult<T>[number]);
    }
    return result as unknown as CallObjResult<T>;
  }

  multicall_getCurrentBlockTimestamp() :ContractCall<string>{
    return this.mulContract.getCurrentBlockTimestamp()
  }

  multicall_getBlockNumber() :ContractCall<string>{
    return this.mulContract.getBlockNumber()
  }

  multicall_getEthBalance(user: string) :ContractCall<string>{
    return this.mulContract.getEthBalance(user)
  }
}
