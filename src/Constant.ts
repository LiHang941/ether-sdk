import { AddressInfo,  Trace } from './service';
import { BasicException } from './BasicException';



let currentAddressInfo = null;

export function updateCurrentAddressInfo(addressInfo:AddressInfo):void {
  currentAddressInfo = addressInfo
  Trace.print('updateCurrentAddressInfo', currentAddressInfo)
}


export function getCurrentAddressInfo(): AddressInfo {
  if (currentAddressInfo === null) {
    throw new BasicException('not initialized');
  }
  return currentAddressInfo;
}
