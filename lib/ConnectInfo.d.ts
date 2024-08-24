import type { JsonRpcApiProvider, Provider, Signer } from 'ethers6';
import { AddressInfo, ChainInfo, Erc20Service, MultiCallContract, Newable, TransactionService } from './service';
import type { WalletConnect } from './WalletConnect';
export declare class ConnectInfo {
    private _provider;
    wallet: Signer;
    status: boolean;
    msg: string;
    account: string;
    chainId: number;
    walletConnect: WalletConnect;
    addressInfo: AddressInfo;
    writeState: boolean;
    connectMethod: 'RPC' | 'EXT';
    create<T extends object>(clazz: Newable<T>, ...args: any[]): T;
    chainInfo(): ChainInfo;
    clear(): void;
    get provider(): JsonRpcApiProvider;
    set provider(value: JsonRpcApiProvider);
    /**
     * multiCall service
     */
    multiCall(): MultiCallContract;
    getWalletOrProvider(): Signer | Provider;
    /**
     * 获取 ERC20 API
     */
    erc20(): Erc20Service;
    /**
     * 获取交易API
     */
    tx(): TransactionService;
    addToken(tokenAddress: string): Promise<boolean>;
}
