import { ConnectInfo } from '../../ConnectInfo';
import { providers } from 'ethers';
import { TransactionReceipt } from '@ethersproject/abstract-provider';


/**
 * -交易信息
 *
 * 要等待交易上链可以使用   await event.confirm()
 *
 */
export class TransactionEvent {
  protected provider: providers.Provider;
  protected connectInfo: ConnectInfo;
  protected _hash: string;

  constructor(connectInfo: ConnectInfo, hash: string) {
    this.provider = connectInfo.provider;
    this.connectInfo = connectInfo;
    this._hash = hash;
  }

  /**
   * 获取交易HASH
   */
  hash(): string {
    return this._hash;
  }

  scan(): string {
    return `${this.connectInfo.getScan()}/tx/${this._hash}`;
  }

  /**
   * 等待交易上链,如果有错误则会直接抛出 BasicException
   */
  async confirm(): Promise<TransactionReceipt> {
    const transactionReceipt = await this.connectInfo.tx().checkTransactionError(this._hash);
    return transactionReceipt;
  }
}
