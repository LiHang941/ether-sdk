import {ConnectInfo} from './ConnectInfo';
import {Trace} from './service';
import {providers, Wallet} from 'ethers';
import {getCurrentAddressInfo} from './Constant';
import {BasicException} from './BasicException';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'
import type { Provider } from '@web3modal/scaffold-utils/dist/types/exports/ethers';


export class PrivateWallet {
  provider: providers.JsonRpcProvider;
  wallet: Wallet;
}


export type WalletType = PrivateWallet | providers.Web3Provider | { provider: any };


let currentConnect: ConnectInfo = null;

export const getCurrentConnect = (): ConnectInfo => {
  return currentConnect;
}

export class WalletConnect {
  // 钱包链接名称
  wallet: WalletType;
  connectInfo: ConnectInfo;
  provider: any;

  constructor(walletName: WalletType) {
    this.wallet = walletName;
    const connectInfo = new ConnectInfo();
    connectInfo.status = false;
    connectInfo.msg = 'Check your wallet!';
    this.connectInfo = connectInfo;
  }

  disConnect() {
    const connectInfo = this.connectInfo;
    connectInfo.status = false;
    connectInfo.msg = 'Check your wallet!';
    this.update();
  }

  update() {
    const connectInfo = this.connectInfo;
    connectInfo.walletConnect = this;
    if (typeof connectInfo.account === 'undefined' || connectInfo.account === '') {
      connectInfo.status = false;
    }
    const currentAddressInfo = getCurrentAddressInfo();
    if (connectInfo.status) {
      connectInfo.account = connectInfo.account.toLowerCase();
      connectInfo.addressInfo = currentAddressInfo;
      Trace.debug('connect success ', connectInfo.account);
    }
    if (connectInfo.status) {
      connectInfo.clear();
    }
  }

  // 测试用，直接私钥+rpc链接
  async privateWallet() {
    const connectInfo = this.connectInfo;
    const privateWallet = this.wallet as PrivateWallet;
    const provider = privateWallet.provider;
    const wallet = privateWallet.wallet;
    connectInfo.chainId = (await provider.getNetwork()).chainId;
    connectInfo.msg = 'success';
    connectInfo.provider = provider;
    connectInfo.account = wallet.address;
    connectInfo.status = true;
    connectInfo.wallet = wallet;
    this.update();
  }

  async web3Provider() {
    const connectInfo = this.connectInfo;
    const web3Provider = this.wallet as providers.Web3Provider;
    connectInfo.chainId = (await web3Provider.getNetwork()).chainId;
    connectInfo.msg = 'success';
    connectInfo.provider = web3Provider;
    connectInfo.account = await web3Provider.getSigner().getAddress();
    connectInfo.status = true;
    connectInfo.wallet = web3Provider.getSigner();
    this.update();
  }

  static async connectMetaMask(): Promise<WalletConnect> {
    const _ethereum = WalletConnect.getEthereum();
    if (!_ethereum) {
      throw new BasicException("Check your wallet!");
    }
    await _ethereum.enable()
    const provider = new providers.Web3Provider(_ethereum, 'any');
    const walletConnect = new WalletConnect(provider);
    walletConnect.provider = _ethereum;
    return walletConnect;
  }

  static getEthereum(): any {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return window.ethereum;
  }


  static async connectWalletconnect(
    metadata:{
      name: string,
      description: string,
      url: string, // origin must match your domain & subdomain
      icons: string[]
    },
    projectId: string,
    mainnet: {
      rpcUrl: string;
      explorerUrl: string;
      currency: string;
      name: string;
      chainId: number;
    }
  ): Promise<WalletConnect> {

    const modal = createWeb3Modal({
      ethersConfig: defaultConfig({ metadata }),
      chains: [mainnet],
      projectId,
      enableAnalytics: true // Optional - defaults to your Cloud configuration
    })

    let walletProvider:Provider = modal.getWalletProvider();
    if (!walletProvider){
      await modal.open()
      walletProvider = await new Promise<Provider>((resolve, reject) => {
        modal.subscribeProvider((newState) => {
          Trace.debug('walletConnectProvider', newState);
          if (newState && newState.provider) {
            resolve(newState.provider)
          }
        })
      })
    }
    const walletConnectProvider = new providers.Web3Provider(walletProvider, 'any')
    const walletConnect = new WalletConnect(walletConnectProvider);
    walletConnect.provider = walletConnectProvider;
    return walletConnect;
  }

  /**
   * 链接钱包
   * @returns
   */
  async connect(): Promise<ConnectInfo> {
    try {
      if (this.wallet instanceof PrivateWallet) {
        await this.privateWallet();
      } else if (this.wallet instanceof providers.Web3Provider) {
        await this.web3Provider();
      } else if (this.wallet.provider) {
        await this.web3Provider();
      } else {
        throw new BasicException('Wallet type error');
      }
      currentConnect = this.connectInfo;
      return this.connectInfo;
    } catch (e) {
      this.connectInfo.status = false;
      this.connectInfo.msg = e.message || e.toString();
      this.update();
      throw e;
    }
  }
}

export class ConnectManager {
  private static connectInfo: ConnectInfo;
  private static walletConnect: WalletConnect;

  public static chainMap = {
    rinkeby: '0x4',
    mainnet: '0x1',
  };

  /**
   * 初始化
   * @param wallet
   */
  static async connect(wallet: WalletConnect): Promise<ConnectInfo> {
    ConnectManager.walletConnect = wallet
    ConnectManager.connectInfo = await wallet.connect();
    return ConnectManager.connectInfo
  }

  /**
   * 断开连接
   */
  static async disConnect() {

    if (ConnectManager.walletConnect) {
      ConnectManager.walletConnect.disConnect()
      ConnectManager.walletConnect = null
    }
    if (ConnectManager.connectInfo) {
      ConnectManager.connectInfo = null;
    }
  }

  /**
   * 获取连接
   */
  static getConnect() {
    if (ConnectManager.connectInfo) {
      if (ConnectManager.connectInfo.status) {
        return ConnectManager.connectInfo;
      }
    }
    throw new Error("Wallet not connected");
  }


  static addMetamaskChain(chainName: string) {
    // @ts-ignore
    const _ethereum = WalletConnect.getEthereum();
    if (!_ethereum) {
      return;
    }

    const data = ConnectManager.chainMap[chainName];
    if (!data) {
      return;
    }

    if (typeof data === 'string') {
      _ethereum
        .request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: data,
            },
          ],
        })
        .catch();
      return;
    }
    _ethereum.request({ method: 'wallet_addEthereumChain', params: data }).catch();
  }

}
