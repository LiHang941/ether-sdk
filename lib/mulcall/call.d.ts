import { Provider } from '@ethersproject/providers';
import { ContractCall } from './types';
export declare const CHUNK_SIZE = 255;
export declare function all<T extends any[] = any[]>(calls: ContractCall[], multicallAddress: string, provider: Provider): Promise<T>;
