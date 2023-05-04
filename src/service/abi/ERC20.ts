import { BaseService } from '../BaseService';
import { ConnectInfo } from '../../ConnectInfo';
import { IERC20 } from '../../abi';
import { TransactionEvent } from '../vo';
import { CacheKey } from '../tool';
import { Contract } from 'ethers';
import { MulContract } from '../../mulcall';

@CacheKey('ERC20')
export class ERC20 extends BaseService {
  public erc20Instance: MulContract;
  public erc20Contract: Contract;

  constructor(connectInfo: ConnectInfo, token: string) {
    super(connectInfo);
    this.erc20Instance = new MulContract(token, IERC20);
    this.erc20Contract = new Contract(token, IERC20, connectInfo.getWalletOrProvider());
  }

  async allowance(owner: string, sender: string): Promise<string> {
    return (await this.erc20Contract.allowance(owner, sender)).toString();
  }

  async approve(spender: string, value: string): Promise<TransactionEvent> {
    return await this.connectInfo.tx().sendContractTransaction(this.erc20Contract, 'approve', [spender, value], {});
  }

  async transfer(to: string, value: string): Promise<TransactionEvent> {
    return await this.connectInfo.tx().sendContractTransaction(this.erc20Contract, 'transfer', [to, value], {});
  }

  async transferFrom(from: string, to: string, value: string): Promise<TransactionEvent> {
    return await this.connectInfo
      .tx()
      .sendContractTransaction(this.erc20Contract, 'transferFrom', [from, to, value], {});
  }

  async totalSupply(): Promise<string> {
    return (await this.erc20Contract.totalSupply()).toString();
  }

  async balanceOf(owner: string): Promise<string> {
    return (await this.erc20Contract.balanceOf(owner)).toString();
  }

  async name(): Promise<string> {
    return (await this.erc20Contract.name()).toString();
  }

  async symbol(): Promise<string> {
    return (await this.erc20Contract.symbol()).toString();
  }

  async decimals(): Promise<number> {
    return parseInt((await this.erc20Contract.decimals()).toString(), 10);
  }
}
