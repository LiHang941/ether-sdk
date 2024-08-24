import {ConnectCallback, ConnectorNames} from "./BaseWallet";
import {injectedWallet, metamaskProvider} from "./MetaMaskProvider";

export interface WalletInstallInfo {
  id: ConnectorNames
  downloadLink: string | undefined
  installed: boolean
}

export class WalletProvider {

  public static connect(connectorNames:ConnectorNames,callBack: ConnectCallback) {
    return WalletProvider._connect(connectorNames,callBack)
  }


  private static _connect(connectorNames:ConnectorNames,callBack: ConnectCallback) {
    if (connectorNames === ConnectorNames.MetaMask) {
      return metamaskProvider.connect(callBack)
    }
    if (connectorNames === ConnectorNames.Injected) {
      return injectedWallet.connect(callBack)
    }
    throw new Error('connectorNames not found')
  }


  public static wallets():WalletInstallInfo[]{
    return [
      metamaskProvider,
      injectedWallet/*,
      walletConnectProvider*/
    ].map(it=>{
      return {
        id:it.id(),
        downloadLink:it.downloadLink(),
        installed:it.installed()
      }
    })
  }

}
