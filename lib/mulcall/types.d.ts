import type { ParamType } from 'ethers6';
export interface ContractCall<T> {
    contract: {
        address: string;
    };
    name: string;
    inputs: ParamType[];
    outputs: ParamType[];
    params: any[];
    callData(): Promise<string>;
    result?: T;
}
