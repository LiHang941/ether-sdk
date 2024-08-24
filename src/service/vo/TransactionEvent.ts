import type { Provider, TransactionReceipt } from 'ethers6'
import type { ConnectInfo } from '../../ConnectInfo'

/**
 * -交易信息
 *
 * 要等待交易上链可以使用   await event.confirm()
 *
 */
export class TransactionEvent {
  public provider: Provider
  public connectInfo: ConnectInfo
  public _hash: string

  constructor(connectInfo: ConnectInfo, hash: string) {
    this.provider = connectInfo.provider
    this.connectInfo = connectInfo
    this._hash = hash
  }

  /**
   * 获取交易HASH
   */
  hash(): string {
    return this._hash
  }

  scan(): string {
    return this.connectInfo.addressInfo.getEtherscanTx(this.connectInfo.chainInfo(),this._hash)
  }

  /**
   * 等待交易上链,如果有错误则会直接抛出 BasicException
   */
  async confirm(): Promise<TransactionReceipt> {
    const transactionReceipt = await this.connectInfo.tx().checkTransactionError(this._hash)
    return transactionReceipt
  }
}
