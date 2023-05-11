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
    provider: any;
    constructor(walletName: WalletType);
    disConnect(): void;
    update(): void;
    privateWallet(): Promise<void>;
    web3Provider(): Promise<void>;
    static connectMetaMask(): Promise<WalletConnect>;
    static getEthereum(): any;
    static connectWalletconnect(): Promise<WalletConnect>;
    /**
     * 链接钱包
     * @returns
     */
    connect(): Promise<ConnectInfo>;
}
export declare class ConnectManager {
    private static connectInfo;
    private static walletConnect;
    static chainMap: {
        rinkeby: string;
        mainnet: string;
    };
    /**
     * 初始化
     * @param wallet
     */
    static connect(wallet: WalletConnect): Promise<ConnectInfo>;
    /**
     * 断开连接
     */
    static disConnect(): Promise<void>;
    /**
     * 获取连接
     */
    static getConnect(): ConnectInfo;
    static addMetamaskChain(chainName: string): void;
}
