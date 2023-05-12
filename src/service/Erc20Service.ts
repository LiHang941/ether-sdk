import { CacheKey, MAXIMUM_U256, Trace } from './tool';
import BigNumber from 'bignumber.js';
import { ConnectInfo } from '../ConnectInfo';
import { BaseService } from './BaseService';
import { ETH_ADDRESS, TransactionEvent } from './vo';
import { ERC20, MultiCallContract } from './abi';

@CacheKey('Erc20Service')
export class Erc20Service extends BaseService {
  constructor(connectInfo: ConnectInfo) {
    super(connectInfo);
  }

  /**
   * 获取 ERC20的余额
   * @param address
   * @param user
   */
  async getBalance(address: string, user: string): Promise<{ amount: string; value: string; decimal: number }> {
    if (address === ETH_ADDRESS) {
      return this.getEthBalance(user);
    }
    const tokenIns = this.connectInfo.create(ERC20, address);
    const result = await this.connectInfo.multiCall().singleCall({
      balance: tokenIns.mulContract.balanceOf(user),
      decimals: tokenIns.mulContract.decimals(),
    });

    const decimal = Number(result.decimals);
    const amount = new BigNumber(result.balance).dividedBy(new BigNumber(10).pow(decimal)).toFixed();
    Trace.debug('Get ERC20 balance', user, result);
    return {
      amount,
      value: result.balance,
      decimal,
    };
  }

  /**
   * 获取 ETH的余额
   * @param user
   */
  async getEthBalance(user: string): Promise<{ amount: string; value: string; decimal: number }> {
    const balance = await this.connectInfo.provider.getBalance(user);
    const decimal = 18;
    const amount = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(decimal)).toFixed();
    Trace.debug('Get ETH balance', user, balance);
    return {
      amount,
      value: balance.toString(),
      decimal,
    };
  }

  /**
   * 获取Token的信息
   * @param address
   */
  async getTokenInfo(address: string): Promise<{ name: string; symbol: string; decimal: number; address: string }> {
    const tokenIns = this.connectInfo.create(ERC20, address);
    const result = await this.connectInfo.multiCall().singleCall({
      name: tokenIns.mulContract.name(),
      symbol: tokenIns.mulContract.symbol(),
      decimal: tokenIns.mulContract.decimals(),
      address: address.toLowerCase(),
    });
    return {
      name: result.name,
      symbol: result.symbol,
      decimal: parseInt(result.decimal, 10),
      address: result.address,
    };
  }

  /**
   * 获取ERC20的信息
   * @param erc20AddressList
   */
  async getErc20Info(
    ...erc20AddressList: string[]
  ): Promise<{ name: string; symbol: string; decimal: number; decimals: number; address: string; id: string }[]> {
    const [...resultList] = await this.connectInfo.multiCall().call(
      ...erc20AddressList.map((erc20Address) => {
        const tokenIns = this.connectInfo.create(ERC20, erc20Address);
        return {
          name: tokenIns.mulContract.name(),
          symbol: tokenIns.mulContract.symbol(),
          decimals: tokenIns.mulContract.decimals(),
          address: erc20Address.toLowerCase(),
        };
      }),
    );

    return resultList.map((result) => {
      const data = {
        name: result.name,
        symbol: result.symbol,
        decimal: Number(result.decimals),
        decimals: Number(result.decimals),
        address: result.address,
        id: result.address,
      };
      Trace.debug('Get currency information', data);
      return data;
    });
  }

  /**
   * 获取合约币允许操作的金额
   * @param exchangeAddress 交易地址
   * @param tokenAddress 币地址
   * @param userAddress  用户地址
   */
  async getAllowance(
    exchangeAddress: string,
    tokenAddress: string,
    userAddress: string,
  ): Promise<{ amount: string; decimal: number; value: string; showApprove: boolean }> {
    if (tokenAddress === ETH_ADDRESS) {
      return {
        amount: MAXIMUM_U256,
        value: MAXIMUM_U256,
        decimal: 18,
        showApprove: false,
      };
    }

    const tokenIns = this.connectInfo.create(ERC20, tokenAddress);
    const result = await this.connectInfo.multiCall().singleCall({
      allowance: tokenIns.mulContract.allowance(userAddress, exchangeAddress),
      decimals: tokenIns.mulContract.decimals(),
    });
    const allowanceBalance = result.allowance;
    const decimal = Number(result.decimals);
    const amount = new BigNumber(allowanceBalance).div(10 ** decimal);
    Trace.debug('Get Allowance Amount', exchangeAddress, tokenAddress, userAddress, result, decimal, amount.toFixed());
    return {
      amount: amount.toFixed(),
      value: allowanceBalance,
      decimal,
      showApprove: new BigNumber(amount).comparedTo('100000000') <= 0,
    };
  }

  /**
   * totalSupply
   * @param tokenAddress 币地址
   */
  async totalSupply(tokenAddress: string): Promise<{ amount: string }> {
    const tokenIns = this.connectInfo.create(ERC20, tokenAddress);
    const value = await tokenIns.totalSupply();
    Trace.debug('Get totalSupply Amount', value);
    return {
      amount: value.toString(),
    };
  }

  /**
   * 添加允许合约操作的金额
   * @param exchangeAddress
   * @param tokenAddress
   * @return 交易hash
   */
  async approve(exchangeAddress: string, tokenAddress: string): Promise<TransactionEvent> {
    const tokenIns = this.connectInfo.create(ERC20, tokenAddress);
    return tokenIns.approve(exchangeAddress, MAXIMUM_U256);
  }

  /**
   * 批量获取余额
   * @param user
   * @param tokens
   */
  async batchGetBalance(
    user: string,
    tokens: string[],
  ): Promise<{ [item: string]: { address: string; amount: string; value: string; decimal: number } }> {
    const multiCall = this.connectInfo.create(MultiCallContract);
    const result = await this.connectInfo.multiCall().call(
      ...tokens.map((it) => {
        const tokenIns = this.connectInfo.create(ERC20, it);
        if (it === ETH_ADDRESS) {
          return {
            address: ETH_ADDRESS,
            balance: multiCall.mulContract.getEthBalance(user),
            decimals: '18',
          };
        }
        return {
          address: it,
          balance: tokenIns.mulContract.balanceOf(user),
          decimals: tokenIns.mulContract.decimals(),
        };
      }),
    );

    const data = {};
    result.forEach((it) => {
      data[it.address] = {
        address: it.address,
        amount: new BigNumber(it.balance || '0').div(10 ** parseInt(it.decimals || '0', 10)).toFixed(),
        value: it.balance || '0',
        decimal: parseInt(it.decimals || '0', 10),
      };
    });
    return data;
  }

  /**
   * ERC20转账
   * @param tokenAddress
   * @param to
   * @param amount
   * @return 交易hash
   */
  async transfer(tokenAddress: string, to: string, amount: string | number | BigNumber): Promise<TransactionEvent> {
    const tokenIns = this.connectInfo.create(ERC20, tokenAddress);
    const decimal = await tokenIns.decimals();
    const value = new BigNumber(amount).multipliedBy(10 ** decimal).toFixed(0, BigNumber.ROUND_DOWN);
    return tokenIns.transfer(to, value);
  }

  /**
   * MINT
   * @deprecated
   * @param tokenAddress
   * @param to
   * @param amount
   * @return 交易hash
   */
  async mint(tokenAddress: string, to: string, amount: string | number | BigNumber): Promise<TransactionEvent> {
    throw new Error('Not impl');
  }
}
