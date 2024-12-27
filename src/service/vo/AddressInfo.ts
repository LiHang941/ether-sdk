import {JsonRpcProvider, Network} from 'ethers6'
import {ConnectInfo} from '../../ConnectInfo'


export enum ChainType {
  bsc = 'bsc',
  matic = 'matic',
  arbitrum = 'arbitrum',
}

export const ChainTypeList = Object.values(ChainType)

export interface ChainInfo {
  chainId: number
  scan: string
  rpc: string
  multicall: string
  chainName: string
  chainType: ChainType,
  chainToken: string,
}


/**
 * 地址信息
 */
export class AddressInfo {

  private readonly chain!: ChainInfo

  private readonly chainMap!: Record<ChainType, ChainInfo>

  private chainInsMap: Record<number, ConnectInfo> = {}

  env!:string

  constructor(chains: ChainInfo[]) {
    this.chainMap = {} as Record<ChainType, ChainInfo>
    chains.forEach(chain => {
      this.chainMap[chain.chainType] = chain
    })
    this.chain = chains[0]
  }

  getDefaultChain() {
    return this.chain
  }
  getAllChain():ChainInfo[] {
    return Object.values(this.chainMap)
  }

  getChainInfo(chain: number | ChainType | string) {
    const chainInfo = Object.values(this.chainMap).find(it => {
      return it.chainId === chain || it.chainType === chain || it.chainName === chain
    });
    if (!chainInfo) {
      throw new Error('Chain not found')
    }
    return chainInfo
  }




  public readonlyConnectInfo(chain: ChainInfo): ConnectInfo {
    if (typeof this.chainInsMap[chain.chainId] === 'undefined') {
      const provider = new JsonRpcProvider(chain.rpc, chain.chainId, {
        staticNetwork: new Network(chain.chainName, chain.chainId),
        batchMaxCount: 1
      })
      const connectInfo = new ConnectInfo()
      connectInfo.provider = provider
      connectInfo.wallet = undefined
      connectInfo.status = true
      connectInfo.addressInfo = this
      connectInfo.writeState = false
      connectInfo.chainId = chain.chainId
      this.chainInsMap[chain.chainId] = connectInfo
    }
    return this.chainInsMap[chain.chainId]
  }

  getEtherscanAddress(chainInfo: ChainInfo, address: string): string {
    return this.getEtherscanLink(chainInfo, address, 'address')
  }

  getEtherscanTx(chainInfo: ChainInfo, tx: string): string {
    return this.getEtherscanLink(chainInfo, tx, 'transaction')
  }

  getEtherscanLink(
    chainInfo: ChainInfo,
    data: string,
    type: 'transaction' | 'token' | 'address' | 'block',
  ): string {
    const prefix = chainInfo.scan

    switch (type) {
      case 'transaction': {
        return `${prefix}/tx/${data}`
      }
      case 'token': {
        return `${prefix}/token/${data}`
      }
      case 'block': {
        return `${prefix}/block/${data}`
      }
      case 'address':
      default: {
        return `${prefix}/address/${data}`
      }
    }
  }
}
