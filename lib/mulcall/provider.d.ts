import { Provider as EthersProvider } from '@ethersproject/abstract-provider';
import { ContractCall } from './types';
export declare class Provider {
    private _provider;
    private _multicallAddress;
    constructor(provider: EthersProvider, multicallAddress: string);
    getEthBalance(address: string): any;
    all<T extends any[] = any[]>(calls: ContractCall[]): Promise<T>;
}
