import type {JsonRpcApiProvider, Provider, Signer} from 'ethers6'
import {
  AddressInfo, ChainInfo,
  clearCache,
  Erc20Service,
  mixProxyByConnect,
  MultiCallContract,
  Newable,
  Trace,
  TransactionService,
} from './service'
import {BasicException} from './BasicException'
import type {WalletConnect} from './WalletConnect'


export class ConnectInfo {
  private _provider: JsonRpcApiProvider
  public wallet!: Signer
  public status!: boolean
  public msg!: string
  public account!: string
  public chainId!: number
  public walletConnect!: WalletConnect
  public addressInfo!: AddressInfo
  public writeState: boolean = true

  public connectMethod: 'RPC' | 'EXT' = 'RPC';

  public create<T extends object>(clazz: Newable<T>, ...args: any[]): T {
    return mixProxyByConnect<T>(clazz, this, ...args)
  }

  chainInfo():ChainInfo{
    return this.addressInfo.getChainInfo(this.chainId)
  }

  clear() {
    clearCache()
  }


  get provider(): JsonRpcApiProvider {
    if (this.status)
      return this._provider as JsonRpcApiProvider

    throw new BasicException('Wallet not connected!')
  }

  set provider(value: JsonRpcApiProvider) {
    this._provider = value
  }

  /**
   * multiCall service
   */
  multiCall(): MultiCallContract {
    return this.create(MultiCallContract)
  }

  // eslint-disable-next-line accessor-pairs
  getWalletOrProvider(): Signer | Provider {
    return (this.wallet || this._provider) as Signer | Provider
  }

  /**
   * 获取 ERC20 API
   */
  erc20(): Erc20Service {
    return this.create(Erc20Service)
  }

  /**
   * 获取交易API
   */
  tx(): TransactionService {
    return this.create(TransactionService)
  }

  async addToken(tokenAddress: string): Promise<boolean> {
    const token = await this.erc20().getTokenInfo(tokenAddress)
    Trace.debug('token info', token)
    try {
      const wasAdded = await this.provider.send('wallet_watchAsset', {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimal,
        },
      } as any)
      if (wasAdded)
        return true
    } catch (error) {
      Trace.error(error)
    }
    return false
  }
}
