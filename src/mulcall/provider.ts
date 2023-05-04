import { Provider as EthersProvider } from '@ethersproject/abstract-provider';
import { all } from './call';
import { getEthBalance } from './calls';
import { ContractCall } from './types';

export class Provider {
  private _provider: EthersProvider;
  private _multicallAddress: string;

  constructor(provider: EthersProvider, multicallAddress: string) {
    this._provider = provider;
    this._multicallAddress = multicallAddress;
  }

  public getEthBalance(address: string) {
    if (!this._provider) {
      throw new Error('Provider should be initialized before use.');
    }
    return getEthBalance(address, this._multicallAddress);
  }

  public async all<T extends any[] = any[]>(calls: ContractCall[]) {
    if (!this._provider) {
      throw new Error('Provider should be initialized before use.');
    }
    return all<T>(calls, this._multicallAddress, this._provider);
  }
}
