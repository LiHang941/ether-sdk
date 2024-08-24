import type { Contract, TransactionReceipt } from 'ethers6';
import { Contract as ContractV5 } from 'ethers5';
import type { ConnectInfo } from '../ConnectInfo';
import { BaseService } from './BaseService';
import { TransactionEvent } from './vo';
import { Config } from "./vo/ExtTransactionEvent";
export declare class TransactionService extends BaseService {
    constructor(connectInfo: ConnectInfo);
    defaultErrorMsg: string;
    /**
     * 检查交易
     * @param txId
     */
    checkTransactionError(txId: string): Promise<TransactionReceipt>;
    /**
     * 发送交易
     * @param contract
     * @param method
     * @param args
     * @param config
     */
    sendContractTransaction(contract: Contract | ContractV5, method: string, args?: any[], config?: Config): Promise<TransactionEvent>;
    private sendRpcTransaction;
    private sendExtTransaction;
    convertErrorMsg(e: any): string;
    /**
     *
     * @param txId
     * @param message
     */
    transactionErrorHandler(txId: string, message?: string): Promise<{
        message: string;
        error: Error | undefined;
    }>;
    /**
     * 等待几个区块
     * @param web3
     * @param count
     */
    sleepBlock(count?: number): Promise<void>;
}
