import { ConnectInfo } from '../../ConnectInfo';
export declare enum ChainType {
    bsc = "bsc",
    matic = "matic",
    arbitrum = "arbitrum"
}
export declare const ChainTypeList: ChainType[];
export interface ChainInfo {
    chainId: number;
    scan: string;
    rpc: string;
    multicall: string;
    chainName: string;
    chainType: ChainType;
    chainToken: string;
}
/**
 * 地址信息
 */
export declare class AddressInfo {
    private readonly chain;
    private readonly chainMap;
    private chainInsMap;
    env: string;
    constructor(chains: ChainInfo[]);
    getDefaultChain(): ChainInfo;
    getAllChain(): ChainInfo[];
    getChainInfo(chain: number | ChainType | string): ChainInfo;
    readonlyConnectInfo(chain: ChainInfo): ConnectInfo;
    getEtherscanAddress(chainInfo: ChainInfo, address: string): string;
    getEtherscanTx(chainInfo: ChainInfo, tx: string): string;
    getEtherscanLink(chainInfo: ChainInfo, data: string, type: 'transaction' | 'token' | 'address' | 'block'): string;
}
