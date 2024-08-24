import { AbstractBaseWallet, ConnectCallback, ConnectorNames } from "./BaseWallet";
import { WalletConnect } from "../WalletConnect";
export declare abstract class AbsMetaMaskProvider extends AbstractBaseWallet {
    abstract downloadLink(): string | undefined;
    abstract id(): ConnectorNames;
    callBack: ConnectCallback;
    getWalletConnect(): Promise<WalletConnect>;
    installed(): boolean;
    provider(): any;
    addMetamaskChain(chainId: number): Promise<void>;
}
export declare class MetaMaskProvider extends AbsMetaMaskProvider {
    downloadLink(): string;
    id(): ConnectorNames;
}
export declare class InjectedWallet extends AbsMetaMaskProvider {
    downloadLink(): string;
    id(): ConnectorNames;
}
export declare const metamaskProvider: MetaMaskProvider;
export declare const injectedWallet: InjectedWallet;
