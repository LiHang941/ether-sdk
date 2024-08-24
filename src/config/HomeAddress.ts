import {updateCurrentAddressInfo} from '../Constant'
import {ConnectManager} from '../WalletConnect'
import {AddressInfo, ChainInfo, ChainType, Trace} from '../service'
import addressConfig from './address.json'

let initAddressFun = (ENV: 'test' | 'prod'):void => {
  if (ENV === 'test') {
   throw new Error(`${ENV} is not support`)
  } else if (ENV === 'prod' || ENV === 'prod_node') {
    throw new Error(`${ENV} is not support`)
  } else {
    throw new Error(`${ENV} is not support`)
  }
  Trace.debug('address config init', ENV)
}


export function setInitAddress(fn: (ENV: 'test' | 'prod') => void) {
  initAddressFun = fn
}

export function initAddress(ENV: 'test' | 'prod'): void {
  initAddressFun(ENV)
}
