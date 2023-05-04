import { ConnectInfo } from "../../ConnectInfo";
/**
 * 地址信息
 */
export declare class AddressInfo {
    /**
     * chainID
     */
    chainId: number;
    /**
     * 链上区块浏览器地址
     */
    scan: string;
    rpc: string;
    multicall: string;
    readonlyConnectInfoInstance: ConnectInfo;
    readonlyConnectInfo(): ConnectInfo;
    getEtherscanAddress(address: any): string;
    getEtherscanTx(tx: any): string;
}
