import { AddressInfo, ApiProvider, ChainType } from './service';
import { ConnectInfo } from './ConnectInfo';
export declare class SdkProvider {
    private static initConfigState;
    static currentChainType: ChainType;
    static initConfig(ENV: 'test' | 'prod'): void;
    static checkInitConfig(): void;
    static setChainType(chainType: ChainType): Promise<void>;
    static fastSetChainType(chainType: ChainType): void;
    /**
     * @name 获取API
     */
    static getApi(): ApiProvider;
    /**
     * 获取配置
     */
    static getConfig(): AddressInfo;
    /**
     * @name 获取当前钱包链接
     */
    static connect(): ConnectInfo;
    static disconnect(): Promise<void>;
    static checkConnect(): boolean;
    static userAddress(): string | undefined;
}
