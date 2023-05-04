import { ConnectInfo } from './ConnectInfo';
import { Trace } from './service';
import { ethers, providers, Wallet } from 'ethers';
import { getCurrentAddressInfo } from './Constant';
import { BasicException } from './BasicException';
import WalletConnectProvider from "@walletconnect/web3-provider";

export class PrivateWallet {
  provider: providers.JsonRpcProvider;
  wallet: Wallet;
}


export type WalletType = PrivateWallet | providers.Web3Provider | { provider: any };


let currentConnect:ConnectInfo = null;

export const getCurrentConnect = ():ConnectInfo =>{
  return currentConnect;
}

export class WalletConnect {
  // 钱包链接名称
  wallet: WalletType;
  connectInfo: ConnectInfo;

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

  static async connectMetaMask(ethereum): Promise<WalletConnect> {
    const provider = new providers.Web3Provider(ethereum, 'any');
    return new WalletConnect(provider);
  }
   static async connectWalletconnect(): Promise<WalletConnect> {
    const provider = new WalletConnectProvider({
      rpc: {
          1: 'https://mainnet.infura.io/v3/f6a9e5c4490849bb998a0c54718678f9',
          42: 'https://kovan.infura.io/v3/f6a9e5c4490849bb998a0c54718678f9',
          4: 'https://rinkeby.infura.io/v3/f6a9e5c4490849bb998a0c54718678f9',
          56: 'https://bsc-dataseed.binance.org/',
          256: 'https://http-testnet.hecochain.com',
          128: 'https://http-mainnet-node.huobichain.com',
          97: 'https://data-seed-prebsc-2-s1.binance.org:8545/',
          66: 'https://exchainrpc.okex.org',
          65: 'https://exchaintestrpc.okex.org',
          80001: 'https://naughty-blackwell:waffle-sprawl-math-used-ripple-snarl@nd-311-035-380.p2pify.com',
          42161: 'https://arb1.arbitrum.io/rpc',
          137: 'https://polygon-rpc.com/',
          10: 'https://mainnet.optimism.io',
          250: 'https://rpc.ftm.tools/',
          421611: 'https://rinkeby.arbitrum.io/rpc',
        },
      qrcodeModalOptions: {
        mobileLinks: [
          'mathwallet',
          'bitkeep',
          'rainbow',
          'metamask',
          'argent',
          'trust',
          'imtoken',
          'pillar',
          'tokenpocket',
        ],
      },
    });
    await provider.enable();
    // @ts-ignore
    const walletConnectProvider = new providers.Web3Provider(provider, 'any');
    return new WalletConnect(walletConnectProvider);
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
