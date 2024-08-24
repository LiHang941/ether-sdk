import { ConnectInfo } from "../ConnectInfo";
import { ChainType } from "../service";
import { WalletConnect } from "../WalletConnect";
export declare enum ConnectorNames {
    MetaMask = "MetaMask",
    Injected = "Injected",
    WalletConnect = "WalletConnect"
}
export declare const ConnectorNameList: ConnectorNames[];
export interface WalletConnectStatus {
    walletConnect: 'connect' | 'unlink';
    walletName: ConnectorNames | null;
    walletAddress: string | null;
    network: ChainType | null;
    error?: string;
}
export interface ConnectCallback {
    statusUpdate: (status: WalletConnectStatus) => void;
    chainUpdate: (chainType: ChainType) => void;
    loading: (loading: boolean) => void;
}
export interface BaseWallet {
    id(): ConnectorNames;
    downloadLink(): string | undefined;
    connect(callBack: ConnectCallback): Promise<ConnectInfo>;
    provider(): any;
    installed(): boolean;
    resetConnect(): void;
}
export declare const resetWalletConnectStatus: (id: ConnectorNames) => WalletConnectStatus;
type FN = (data: any) => void;
export declare class EventBus {
    events: Record<string, FN[]>;
    constructor();
    emit(eventName: string, data?: any): void;
    on(eventName: string, fn: FN): void;
    resetOn(eventName: string, fn: FN): void;
    resetOff(eventName: string): void;
    off(eventName: string, fn: FN): void;
}
export declare const eventBus: EventBus;
export declare abstract class AbstractBaseWallet implements BaseWallet {
    abstract downloadLink(): string | undefined;
    abstract installed(): boolean;
    abstract provider(): any;
    abstract id(): ConnectorNames;
    callBack: ConnectCallback;
    abstract getWalletConnect(): Promise<WalletConnect>;
    resetConnect(): void;
    chainChangedDebounce: (chainIdHex: string) => Promise<void>;
    accountsChangedDebounce: (accounts: string[]) => Promise<void>;
    disconnectCallbackDebounce: (error: string) => Promise<void>;
    statusUpdateCallbackDebounce: (status: WalletConnectStatus) => void;
    chainChanged(chainIdHex: string): void;
    accountsChanged(accounts: string[]): void;
    disconnectCallback(error: string): void;
    statusUpdateCallback(status: WalletConnectStatus): void;
    connect(callBack: ConnectCallback): Promise<ConnectInfo>;
    updateWallet(walletConnect: WalletConnect): Promise<void>;
    disconnect(error?: string): void;
}
export {};
