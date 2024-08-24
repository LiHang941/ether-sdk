import { ConnectManager } from './WalletConnect';
import { AddressInfo, apiProvider, ApiProvider, ChainType } from './service';
import { initAddress } from './config';
import { getCurrentAddressInfo } from './Constant';
import { ConnectInfo } from './ConnectInfo';

export class SdkProvider {

  private static initConfigState = false;

  public static currentChainType = ChainType.mantle;

  static initConfig(ENV: 'test' | 'prod'): void {
    SdkProvider.initConfigState = false;
    initAddress(ENV);
    SdkProvider.initConfigState = true;
  }

  static checkInitConfig(): void {
    if (SdkProvider.initConfigState) {
      return;
    }
    throw new Error('SdkProvider not init');
  }


  static async setChainType(chainType: ChainType) {
    const oldChain = SdkProvider.currentChainType;
    if (oldChain === chainType) {
      return;
    }
    if (ConnectManager.checkConnect()) {
      const chainInfo = getCurrentAddressInfo().getChainInfo(chainType);
      try {
        await ConnectManager.getWalletConnect().switchNetwork(
          chainInfo.chainId,
        );
        SdkProvider.currentChainType = chainType;
      } catch (e: any) {
        await ConnectManager.disConnect();
        SdkProvider.currentChainType = chainType;
      }
    } else {
      SdkProvider.currentChainType = chainType;
    }
  }


  static fastSetChainType(chainType: ChainType) {
    const oldChain = SdkProvider.currentChainType;
    if (oldChain === chainType) {
      return;
    }
    SdkProvider.currentChainType = chainType;
  }

  /**
   * @name 获取API
   */
  static getApi(): ApiProvider {
    SdkProvider.checkInitConfig();
    return apiProvider;
  }

  /**
   * 获取配置
   */
  static getConfig(): AddressInfo {
    SdkProvider.checkInitConfig();
    return getCurrentAddressInfo();
  }

  /**
   * @name 获取当前钱包链接
   */
  static connect(): ConnectInfo {
    SdkProvider.checkInitConfig();
    return ConnectManager.getConnect();
  }

  static async disconnect() {
    SdkProvider.checkInitConfig();
    await ConnectManager.disConnect();
  }

  static checkConnect(): boolean {
    return ConnectManager.checkConnect();
  }

  static userAddress(): string | undefined {
    if (ConnectManager.checkConnect()) {
      return ConnectManager.getConnect().account;
    } else {
      return undefined;
    }
  }

}
