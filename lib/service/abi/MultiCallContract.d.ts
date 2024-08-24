import type { ConnectInfo } from '../../ConnectInfo';
import type { ContractCall } from '../../mulcall';
import { BaseAbi } from './BaseAbi';
export type ShapeWithLabel = Record<string, ContractCall<any> | string>;
export type ContractCallResult<T> = T extends ContractCall<infer U> ? U : never;
export type CallObjResult<T extends ShapeWithLabel[]> = {
    [K in keyof T]: {
        [P in keyof T[K]]: T[K][P] extends ContractCall<any> ? ContractCallResult<T[K][P]> : T[K][P];
    };
};
export declare class MultiCallContract extends BaseAbi {
    constructor(connectInfo: ConnectInfo);
    multicallExecute<T>(calls: ContractCall<T>[]): Promise<T[]>;
    callObj<T extends ShapeWithLabel[]>(...shapeWithLabels: T): Promise<CallObjResult<T>>;
    multicall_getCurrentBlockTimestamp(): ContractCall<string>;
    multicall_getBlockNumber(): ContractCall<string>;
    multicall_getEthBalance(user: string): ContractCall<string>;
}
