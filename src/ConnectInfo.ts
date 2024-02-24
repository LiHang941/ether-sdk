import {
  AddressInfo,
  clearCache,
  createProxy,
  Erc20Service,
  MultiCallContract,
  Trace,
  TransactionService
} from "./service";
import { BasicException } from './BasicException';
import { providers, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { getCurrentAddressInfo } from './Constant';
import { WalletConnect } from './WalletConnect';
import BigNumber from 'bignumber.js';

export type Newable<T extends object> = new (...args) => T;

export class ConnectInfo {
  private _provider: providers.JsonRpcProvider;
  private _wallet: Signer;
  private _status: boolean;
  private _msg: string;

  private _account: string;
  private _chainId: number;

  public walletConnect: WalletConnect;

  private _addressInfo: AddressInfo;

  private _instanceCache: Map<string, any> = new Map<string, any>();

  public create<T extends object>(clazz: Newable<T>, ...args): T {
    const cacheKey = (clazz as any).CACHE_KEY;
    if (!cacheKey) {
      const instance = new clazz(this, ...args);
      return instance as T;
    }
    const key = `${cacheKey}_${JSON.stringify(args)}`;
    const element = this._instanceCache.get(key);
    if (element != null) {
      return element as T;
    } else {
      const instance = createProxy<T>(new clazz(this, ...args));
      this._instanceCache.set(key, instance);
      return instance as T;
    }
  }

  clear() {
    this._instanceCache.clear();
    clearCache()
  }

  /**
   * 获取 ERC20 API
   */
  erc20(): Erc20Service {
    return this.create(Erc20Service);
  }

  /**
   * 获取交易API
   */
  tx(): TransactionService {
    return this.create(TransactionService);
  }

  /**
   * multiCall service
   */
  multiCall(): MultiCallContract {
    return this.create(MultiCallContract);
  }

  get provider(): providers.JsonRpcProvider {
    if (this._status) {
      return this._provider;
    }
    throw new BasicException('Wallet not connected!');
  }

  set provider(value: providers.JsonRpcProvider) {
    this._provider = value;
  }

  /**
   * 获取连接的状态
   */
  get status(): boolean {
    return this._status;
  }

  set status(value: boolean) {
    this._status = value;
  }

  /**
   * 获取连接的消息
   */
  get msg(): string {
    return this._msg;
  }

  set msg(value: string) {
    this._msg = value;
  }

  /**
   * 获取连接的地址
   */
  get account(): string {
    return this._account;
  }

  set account(value: string) {
    this._account = value;
  }

  /**
   * 获取连接的网络ID
   */
  get chainId(): number {
    return this._chainId;
  }

  set chainId(value: number) {
    this._chainId = value;
  }

  /**
   * 获取连接的地址信息
   */
  get addressInfo(): AddressInfo {
    return this._addressInfo;
  }

  set addressInfo(value: AddressInfo) {
    this._addressInfo = value;
  }

  set wallet(value: Signer) {
    this._wallet = value;
  }

  getWalletOrProvider(): Signer | Provider {
    return this._wallet || this._provider;
  }

  getWallet(): Signer {
    return this._wallet || this.provider.getSigner();
  }

  getScan(): string {
    return this.addressInfo.scan;
  }


  async addToken(tokenAddress) {
    const token = await this.erc20().getTokenInfo(tokenAddress);
    Trace.debug('token info', token);
    try {
      const wasAdded = await this.provider.send('wallet_watchAsset', {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimal,
        },
      } as any);
      if (wasAdded) {
        return true;
      }
    } catch (error) {
      Trace.error(error);
    }
    return false;
  }
}
