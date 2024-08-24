import type { Contract } from 'ethers6';
import type { ContractCall } from './types';
export declare const CHUNK_SIZE = 200;
export declare function multicallExecute<T>(multicall: Contract, calls: ContractCall<T>[]): Promise<T[]>;
