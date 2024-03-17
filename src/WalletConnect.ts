import {ConnectInfo} from './ConnectInfo';
import { sleep, Trace } from './service';
import {providers, Wallet} from 'ethers';
import {getCurrentAddressInfo} from './Constant';
import {BasicException} from './BasicException';


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
  disconnectCallBack: () => void = null;
  connectCallBack: () => void = null;

  constructor(walletName: WalletType) {
    this.wallet = walletName;
    const connectInfo = new ConnectInfo();
    connectInfo.status = false;
    connectInfo.msg = 'Check your wallet!';
    this.connectInfo = connectInfo;
  }

  switchNetwork:(chainId: number)=>void =(chainId)=> {
    const [chainName,] = Object.entries(ConnectManager.chainMap).find(([key, value]) => {
      if (typeof value === 'string') {
        return chainId === parseInt(value, 16);
      }else {
        return chainId === parseInt(value[0].chainId,16);
      }
    })
    ConnectManager.addMetamaskChain(chainName);
  }

  disConnect() {
    if (this.disconnectCallBack){
      try {
        this.disconnectCallBack()
      }catch (e){
        Trace.error(e)
      }
    }

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

      if (this.connectCallBack){
        try {
          this.connectCallBack()
        }catch (e){
          Trace.error(e)
        }
      }

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
    modal:any,
    currentChainId: number
  ): Promise<WalletConnect> {
    let walletProvider: any;
    let open = false
    while (true) {
      const isConnected = modal.getIsConnected();
      const state = modal.getState();
      Trace.debug("isConnected", isConnected, state);
      if (!isConnected) {
        if (!state.open) {
          if (open){
            throw new BasicException("User rejected the request");
          }
          await modal.open({
            view: "Connect",
          });
        } else {
          open = true
        }
        await sleep(1000);
        continue;
      } else {
        walletProvider = modal.getWalletProvider();
      }
      Trace.debug("walletProvider", walletProvider);

      if (walletProvider) {
        if (modal.getState().selectedNetworkId !== currentChainId) {
          await modal.switchNetwork(currentChainId);
          continue;
        }
      }
      if (walletProvider) {
        await modal.close();
        break;
      }
    }
    Trace.debug("connect walletProvider", walletProvider);
    const walletConnectProvider = new providers.Web3Provider(
      walletProvider,
      "any"
    );
    const walletConnect = new WalletConnect(walletConnectProvider);
    walletConnect.provider = walletConnectProvider;

    walletConnect.switchNetwork = (_chainId) => {
      modal.switchNetwork(_chainId);
    }
    walletConnect.disconnectCallBack = () => {
      modal.close().catch();
      modal.disconnect().catch();
    };
    walletConnect.connectCallBack = ()=>{
      modal.close().catch();
    }

    let account: any = await walletConnectProvider.getSigner().getAddress();
    let chainId: any = (await walletConnectProvider.getNetwork()).chainId;
    modal.subscribeProvider((newState) => {
      if (newState && newState.provider) {
        if (newState.chainId !== chainId) {
          walletConnectProvider.emit("chainChanged", newState.chainId);
          chainId = newState.chainId;
          return;
        }
        if (account !== newState.address) {
          walletConnectProvider.emit("accountsChanged", [newState.address]);
          account = newState.address;
          return;
        }
      }
    });
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

  public static chainMap:Record<string, any> = {
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
