import {updateCurrentAddressInfo} from '../Constant'
import {ConnectManager} from '../WalletConnect'
import {AddressInfo, ChainInfo, ChainType, Trace} from '../service'
import addressConfig from './address.json'

export function initAddress(ENV: 'test' | 'prod'): void {
  if (ENV === 'test') {

    const maintle: ChainInfo = {
      chainId: 5003,
      chainName: 'Mantle Testnet',
      scan: 'https://explorer.sepolia.mantle.xyz',
      rpc: 'https://rpc.sepolia.mantle.xyz/',
      multicall: "0x521751C88EafdCAEd9cAbb4dB35a1400D6933428",
      chainType: ChainType.mantle,
      chainToken: "MNT",
    }

    const addressInfo = new AddressInfo([maintle])
    addressInfo.env = ENV
    updateCurrentAddressInfo(addressInfo)
    ConnectManager.chainMap['Mantle Testnet'] = [
      {
        chainId: '0x138b',
        chainName: 'Mantle Testnet',
        nativeCurrency: {
          name: 'MNT',
          symbol: 'MNT',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.testnet.mantle.xyz'],
        blockExplorerUrls: ['https://explorer.testnet.mantle.xyz/'],
      },
    ]

  } else if (ENV === 'prod' || ENV === 'prod_node') {
    throw new Error(`${ENV} is not support`)
  } else {
    throw new Error(`${ENV} is not support`)
  }
  Trace.debug('address config init', ENV)


}
