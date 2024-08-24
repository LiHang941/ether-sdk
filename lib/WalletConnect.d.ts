import { type JsonRpcApiProvider, type Signer } from 'ethers6';
import { ConnectInfo } from './ConnectInfo';
export declare class WalletConnect {
    wallet: any;
    connectInfo: ConnectInfo;
    provider?: any;
    disconnectCallBack: () => void;
    connectCallBack: () => void;
    callConnect(): void;
    disConnectCall(): void;
    getChainId(): Promise<number>;
    getAccount(): Promise<string>;
    getWallet(): Promise<Signer>;
    getApiProvider(): Promise<JsonRpcApiProvider>;
    switchNetwork: (chainId: number) => Promise<void>;
    constructor(walletType: any, provider?: any);
    disConnect(): void;
    update(): void;
    init(): Promise<void>;
    /**
     * 链接钱包
     * @returns ConnectInfo
     */
    connect(): Promise<ConnectInfo>;
}
export declare class ConnectManager {
    private static connectInfo;
    private static walletConnect;
    static chainMap: Record<string, any>;
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
    static checkConnect(): boolean;
    static getWalletConnect(): WalletConnect;
    static getChainName(chainId: number): string;
}
