import {AbstractBaseWallet, ConnectCallback, ConnectorNames, eventBus} from "./BaseWallet";
import get from "lodash/get";
import {BasicException} from "../BasicException";
import {BrowserProvider} from "ethers6";
import {ConnectManager, WalletConnect} from "../WalletConnect";
import {useVisibilityChange} from "./UseVisibilityChange";
import {Trace} from "../service";

export abstract class AbsMetaMaskProvider extends AbstractBaseWallet {
  abstract downloadLink(): string | undefined;

  abstract id(): ConnectorNames ;

  callBack: ConnectCallback;

  async getWalletConnect(): Promise<WalletConnect> {
    const _ethereum = this.provider()
    if (!_ethereum)
      throw new BasicException('Check your wallet!')
    await _ethereum.enable()
    const walletConnect = new WalletConnect(new BrowserProvider(_ethereum, 'any'), _ethereum);

    walletConnect.switchNetwork = async (_chainId) => {
      Trace.debug("switchNetwork", _chainId);
      if (!useVisibilityChange.current) {
        throw new BasicException('Please switch wallet network')
      }
      return this.addMetamaskChain(_chainId)
    }
    walletConnect.connectCallBack = () => {
    }
    walletConnect.disconnectCallBack = () => {
      eventBus.emit("disconnect", "User disconnected the wallet");
    }

    const provider = walletConnect.provider;
    provider.on("accountsChanged", (accounts: any[]) => {
      eventBus.emit("accountsChanged", accounts);
    });
    provider.on("chainChanged", (chainIdHex: string) => {
      eventBus.emit("chainChanged", chainIdHex);
    });
    provider.on("disconnect", () => {
      eventBus.emit("disconnect", "User disconnected the wallet");
    })
    return walletConnect;
  }


  installed(): boolean {
    return this.provider() !== undefined
  }

  provider(): any {
    if (typeof window === "undefined") {
      return undefined
    }
    return get(window, 'ethereum');
  }

  async addMetamaskChain(chainId: number) {
    const chainName = ConnectManager.getChainName(chainId);
    if (!chainName) {
      return
    }

    const _ethereum = this.provider()
    if (!_ethereum)
      return

    const data = ConnectManager.chainMap[chainName]
    if (!data)
      return

    let addEthereumChainParams
    let switchParams
    if (typeof data === 'string') {
      addEthereumChainParams = undefined
      switchParams = undefined
    } else {
      addEthereumChainParams = data
      switchParams = [
        {
          chainId: data[0].chainId,
        },
      ]
    }
    try {
      await _ethereum.request({
        method: "wallet_switchEthereumChain",
        params: switchParams,
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await _ethereum.request({
            method: "wallet_addEthereumChain",
            params: addEthereumChainParams,
          });
        } catch (addError) {
          throw new BasicException('Failed to add chain to MetaMask')
        }
      } else {
        throw new BasicException('Failed to switch chain')
      }
    }
  }
}

export class MetaMaskProvider extends AbsMetaMaskProvider {
  downloadLink() {
    return "https://metamask.io/download/"
  }

  id() {
    return ConnectorNames.MetaMask
  }
}

export class InjectedWallet extends AbsMetaMaskProvider {

  downloadLink() {
    return ""
  }

  id() {
    return ConnectorNames.Injected
  }
}

export const metamaskProvider = new MetaMaskProvider()
export const injectedWallet = new InjectedWallet()
