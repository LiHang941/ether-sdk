import { ConnectInfo } from '../ConnectInfo';
import { BaseService } from './BaseService';
import { TransactionEvent } from './vo';
import { Contract } from 'ethers';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
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
    sendContractTransaction(contract: Contract, method: string, args?: any[], config?: {
        gasPrice?: string;
        gasLimit?: number;
        fromAddress?: string;
        value?: number | string;
    }): Promise<TransactionEvent>;
    private sendRpcTransaction;
    convertErrorMsg(e: any): string;
    /**
     *
     * @param txId
     * @param message
     */
    transactionErrorHandler(txId: string, message?: string): Promise<{
        message: string;
        error: Error;
    }>;
    /**
     * 等待几个区块
     * @param web3
     * @param count
     */
    sleepBlock(count?: number): Promise<void>;
}
