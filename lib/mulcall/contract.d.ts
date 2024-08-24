import { Fragment, FunctionFragment, type JsonFragment } from 'ethers6';
import { ContractCall } from "./types";
export interface MulContractConfig {
}
export type CallFunction = (...args: Array<any>) => ContractCall<unknown>;
export declare class MulContract {
    private readonly _address;
    private readonly _abi;
    private readonly _functions;
    private readonly _mulContractConfig;
    get address(): string;
    get abi(): Fragment[];
    get functions(): FunctionFragment[];
    get mulContractConfig(): MulContractConfig;
    constructor(address: string, abi: JsonFragment[] | string[] | Fragment[], config?: MulContractConfig);
    [method: string]: CallFunction | any;
}
