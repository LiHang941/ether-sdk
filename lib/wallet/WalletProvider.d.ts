import { ConnectCallback, ConnectorNames } from "./BaseWallet";
export interface WalletInstallInfo {
    id: ConnectorNames;
    downloadLink: string | undefined;
    installed: boolean;
}
export declare class WalletProvider {
    static connect(connectorNames: ConnectorNames, callBack: ConnectCallback): Promise<import("..").ConnectInfo>;
    private static _connect;
    static wallets(): WalletInstallInfo[];
}
