import { BaseService } from '../BaseService';
import { ConnectInfo } from '../../ConnectInfo';
import { TransactionEvent } from '../vo';
import { Contract } from 'ethers';
import { MulContract } from '../../mulcall';
export declare class ERC20 extends BaseService {
    erc20Instance: MulContract;
    erc20Contract: Contract;
    constructor(connectInfo: ConnectInfo, token: string);
    allowance(owner: string, sender: string): Promise<string>;
    approve(spender: string, value: string): Promise<TransactionEvent>;
    transfer(to: string, value: string): Promise<TransactionEvent>;
    transferFrom(from: string, to: string, value: string): Promise<TransactionEvent>;
    totalSupply(): Promise<string>;
    balanceOf(owner: string): Promise<string>;
    name(): Promise<string>;
    symbol(): Promise<string>;
    decimals(): Promise<number>;
}
