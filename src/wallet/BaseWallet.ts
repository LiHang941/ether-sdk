import {ConnectInfo} from "../ConnectInfo";
import {ChainInfo, ChainType, Trace} from "../service";
import {ConnectManager, WalletConnect} from "../WalletConnect";
import {getCurrentAddressInfo} from "../Constant";
import {SdkProvider} from "../SdkProvider";
import BigNumber from "bignumber.js";
import {debounce} from "lodash";

export enum ConnectorNames {
  MetaMask = 'MetaMask',
  Injected = 'Injected',
  WalletConnect = 'WalletConnect',
}

export const ConnectorNameList = Object.values(ConnectorNames);


export interface WalletConnectStatus {
  walletConnect: 'connect' | 'unlink';
  walletName: ConnectorNames | null;
  walletAddress: string | null; // 钱包地址
  network: ChainType | null;
  error?: string;
}

export interface ConnectCallback {

  statusUpdate: (status: WalletConnectStatus) => void;

  chainUpdate: (chainType: ChainType) => void;

  loading: (loading: boolean) => void;
}


export interface BaseWallet {

  id(): ConnectorNames

  downloadLink(): string | undefined

  connect(callBack: ConnectCallback): Promise<ConnectInfo>

  provider(): any

  installed(): boolean

  resetConnect(): void

}


export const resetWalletConnectStatus = (id: ConnectorNames) => {
  const params: WalletConnectStatus = {
    walletConnect: 'unlink',
    walletName: id,
    walletAddress: null,
    network: null,
  };
  return params;
};


type FN = (data: any) => void;

export class EventBus {
  events: Record<string, FN[]>;

  constructor() {
    this.events = {};
  }

  emit(eventName: string, data?: any) {
    // console.log("EVENT", eventName);
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn: FN) => {
        try {
          fn(data);
        } catch (e) {
          Trace.error("TOPIC", eventName, data, e)
        }
      });
    }
  }

  on(eventName: string, fn: FN) {
    // console.log("ON", eventName, fn);
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }


  resetOn(eventName: string, fn: FN) {
    this.events[eventName] = [];
    this.events[eventName].push(fn);
  }
  resetOff(eventName: string) {
    delete this.events[eventName];
  }

  off(eventName: string, fn: FN) {
    if (this.events[eventName]) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          // console.log("REMOVE", eventName, i, fn);
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  }
}

export const eventBus = new EventBus();


export abstract class AbstractBaseWallet implements BaseWallet {

  abstract downloadLink(): string | undefined;

  abstract installed(): boolean

  abstract provider(): any

  abstract id(): ConnectorNames

  callBack: ConnectCallback

  abstract getWalletConnect(): Promise<WalletConnect>


  resetConnect() {
    this.callBack = undefined
    ConnectManager.disConnect()
  }

  chainChangedDebounce: (chainIdHex: string) => Promise<void> = debounce(async (chainIdHex: string) => {
    Trace.log('chainChanged ', chainIdHex);
    let chainId: number;
    try {
      chainId = parseInt(chainIdHex);
    } catch (e) {
      chainId = -1;
    }
    const allChain = getCurrentAddressInfo().getAllChain();
    const chainInfo = allChain.find(item => new BigNumber(item.chainId).comparedTo(chainId) == 0);
    if (!chainInfo) {
      this.statusUpdateCallback(resetWalletConnectStatus(this.id()));
    }
    await this.updateWallet(await this.getWalletConnect());
  }, 100)

  accountsChangedDebounce: (accounts: string[]) => Promise<void> = debounce(async (accounts: string[]) => {
    Trace.log('accountsChanged', accounts);
    await this.updateWallet(await this.getWalletConnect());
  }, 100)

  disconnectCallbackDebounce: (error: string) => Promise<void> = debounce(async (error: string) => {
    Trace.log('disconnectCallback', error);
    this.disconnect(error);
  }, 100)

  statusUpdateCallbackDebounce: (status: WalletConnectStatus) => void = debounce((status: WalletConnectStatus) => {
    Trace.log('statusUpdateCallback', status)
    this.callBack.statusUpdate(status);
  }, 500)

  chainChanged(chainIdHex: string) {
    this.chainChangedDebounce.call(this, chainIdHex);
  }

  accountsChanged(accounts: string[]) {
    this.accountsChangedDebounce.call(this, accounts);
  }

  disconnectCallback(error: string) {
    this.disconnectCallbackDebounce.call(this, error)
  }

  statusUpdateCallback(status: WalletConnectStatus) {
    this.statusUpdateCallbackDebounce.call(this, status)
  }


  async connect(callBack: ConnectCallback): Promise<ConnectInfo> {
    this.callBack = callBack;
    const walletConnect = await this.getWalletConnect();
    await this.updateWallet(walletConnect);

    eventBus.resetOn("accountsChanged", (accounts: string[]) => {
      this.accountsChanged(accounts)
    });

    eventBus.resetOn("chainChanged", (chainIdHex: string) => {
      this.chainChanged(chainIdHex)
    });

    eventBus.resetOn("disconnect", (error: string) => {
      this.disconnectCallback(error)
    });

    return await ConnectManager.connect(walletConnect);
  }

  async updateWallet(walletConnect: WalletConnect): Promise<void> {
    try {
      const connectInfo = await ConnectManager.connect(walletConnect);
      let chainInfo: ChainInfo
      try {
        chainInfo = getCurrentAddressInfo().getChainInfo(connectInfo.chainId);
      } catch (e) {
        chainInfo = getCurrentAddressInfo().getChainInfo(SdkProvider.currentChainType);
      }

      if (chainInfo.chainType !== SdkProvider.currentChainType) {
        SdkProvider.fastSetChainType(chainInfo.chainType)
        this.callBack.chainUpdate(chainInfo.chainType)
      }
      Trace.log('connectInfo', connectInfo.chainId);
      if (connectInfo.chainId === chainInfo.chainId) {
        const walletConnectStatus = resetWalletConnectStatus(this.id());
        walletConnectStatus.walletConnect = 'connect';
        walletConnectStatus.walletName = this.id();
        walletConnectStatus.walletAddress = connectInfo.account;
        walletConnectStatus.network = chainInfo.chainType;
        this.statusUpdateCallback(walletConnectStatus);
      } else {
        try {
          this.callBack.loading(true);
          await walletConnect.switchNetwork(chainInfo.chainId);
        } finally {
          this.callBack.loading(false);
        }
      }
    } catch (e: any) {
      Trace.error(e);
      this.disconnect(e.message);
    }
  }

  disconnect(error?: string) {
    this.statusUpdateCallback({
      ...resetWalletConnectStatus(this.id()),
      walletName: null,
      walletConnect: 'unlink',
      error,
    });
    ConnectManager.disConnect()
  }


}
