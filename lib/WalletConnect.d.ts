import { ConnectInfo } from './ConnectInfo';
import { providers, Wallet } from 'ethers';
export declare class PrivateWallet {
    provider: providers.JsonRpcProvider;
    wallet: Wallet;
}
export declare type WalletType = PrivateWallet | providers.Web3Provider | {
    provider: any;
};
export declare const getCurrentConnect: () => ConnectInfo;
export declare class WalletConnect {
    wallet: WalletType;
    connectInfo: ConnectInfo;
    constructor(walletName: WalletType);
    disConnect(): void;
    update(): void;
    privateWallet(): Promise<void>;
    web3Provider(): Promise<void>;
    static connectMetaMask(ethereum: any): Promise<WalletConnect>;
    static connectWalletconnect(): Promise<WalletConnect>;
    /**
     * 链接钱包
     * @returns
     */
    connect(): Promise<ConnectInfo>;
}
