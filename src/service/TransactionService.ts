import { CacheKey, calculateGasMargin, EnableProxy, eqAddress, retry, sleep, SLEEP_MS, Trace } from './tool';
import { ConnectInfo } from '../ConnectInfo';
import { BaseService } from './BaseService';
import { BasicException } from '../BasicException';
import { TransactionEvent } from './vo';
import { Contract } from 'ethers';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
import lodash from 'lodash';
import { getCurrentAddressInfo } from '../Constant';

@CacheKey('TransactionService')
export class TransactionService extends BaseService {
  constructor(connectInfo: ConnectInfo) {
    super(connectInfo);
  }

  defaultErrorMsg = 'Please try again. Confirm the transaction and make sure you are paying enough gas!';

  /**
   * 检查交易
   * @param txId
   */
  @EnableProxy()
  public async checkTransactionError(txId: string): Promise<TransactionReceipt> {
    let count = 1000;
    while (count >= 0) {
      const res = await retry(async () => {
        return await this.provider.getTransactionReceipt(txId);
      });
      if (res != null && res.status != null && res.transactionHash.toLowerCase() === txId.toLowerCase()) {
        if (res.status) {
          return res;
        } else {
          const errorRes = await this.transactionErrorHandler(txId);
          throw new BasicException(errorRes.message, errorRes.error);
        }
      }
      await sleep(SLEEP_MS);
      count--;
    }
  }

  /**
   * 发送交易
   * @param contract
   * @param method
   * @param args
   * @param config
   */
  @EnableProxy()
  public async sendContractTransaction(
    contract: Contract,
    method: string,
    args: any[] = [],
    config: {
      gasPrice?: string;
      gasLimit?: number;
      fromAddress?: string;
      value?: number | string;
    } = {},
  ): Promise<TransactionEvent> {
    const currentChain = getCurrentAddressInfo().chainId;
    const chainId = (await this.connectInfo.provider.getNetwork()).chainId;
    if (chainId !== currentChain) {
      throw new BasicException(`Check your wallet network chain id = ${currentChain}!`);
    }
    return await this.sendRpcTransaction(contract, method, args, config);
  }

  private async sendRpcTransaction(
    contract: Contract,
    method: string,
    args: any[],
    config: { gasPrice?: string; gasLimit?: number; value?: number | string },
  ) {
    try {
      const estimatedGasLimit = await contract.estimateGas[method](...args, config);
      config.gasLimit = calculateGasMargin(estimatedGasLimit.toString());
      const awaitTransactionResponse = contract[method] as (...args: any) => Promise<TransactionResponse>;
      const response = await awaitTransactionResponse(...args, config);
      return new TransactionEvent(this.connectInfo, response.hash);
    } catch (e: any) {
      throw new BasicException(this.convertErrorMsg(e), e);
    }
  }

  convertErrorMsg(e: any): string {
    Trace.error('ERROR', e);
    let recursiveErr = e;
    let reason: string | undefined;
    // for MetaMask
    if (lodash.get(recursiveErr, 'data.message')) {
      reason = lodash.get(recursiveErr, 'data.message');
    } else {
      // tslint:disable-next-line:max-line-length
      // https://github.com/Uniswap/interface/blob/ac962fb00d457bc2c4f59432d7d6d7741443dfea/src/hooks/useSwapCallback.tsx#L216-L222
      while (recursiveErr) {
        reason =
          lodash.get(recursiveErr, 'reason') ||
          lodash.get(recursiveErr, 'data.message') ||
          lodash.get(recursiveErr, 'message') ||
          reason;
        recursiveErr = lodash.get(recursiveErr, 'error') || lodash.get(recursiveErr, 'data.originalError');
      }
    }
    reason = reason || this.defaultErrorMsg;
    const REVERT_STR = 'execution reverted: ';
    const indexInfo = reason.indexOf(REVERT_STR);
    const isRevertedError = indexInfo >= 0;

    if (isRevertedError) {
      reason = reason.substring(indexInfo + REVERT_STR.length);
    }

    let msg = reason;
    /*if (msg === 'AMM._update: TRADINGSLIPPAGE_TOO_LARGE_THAN_LAST_TRANSACTION') {
      msg = 'Trading slippage is too large.';
    } else if (msg === 'Amm.burn: INSUFFICIENT_LIQUIDITY_BURNED') {
      msg = "The no. of tokens you're removing is too small.";
    } else if (msg === 'FORBID_INVITE_YOURSLEF') {
      msg = 'Forbid Invite Yourself';
    } else if (msg.lastIndexOf('INSUFFICIENT_QUOTE_AMOUNT') > 0) {
      msg = 'Slippage is too large now, try again later';
    }
    // 不正常的提示
    else*/
    if (!/[A-Za-z0-9\. _\:：%]+/.test(msg)) {
      msg = this.defaultErrorMsg;
    }
    return msg;
  }

  /**
   *
   * @param txId
   * @param message
   */
  public async transactionErrorHandler(
    txId: string,
    message: string = this.defaultErrorMsg,
  ): Promise<{
    message: string;
    error: Error;
  }> {
    let error = null;
    let errorCode = '';
    try {
      const txData = await this.provider.getTransaction(txId);
      try {
        const s = await this.provider.call(txData, txData.blockNumber);
        Trace.debug(s);
      } catch (e) {
        errorCode = this.convertErrorMsg(e);
        error = e;
        Trace.debug('transactionErrorHandler ERROR ', txId, e);
      }
    } catch (e) {
      error = e;
      Trace.debug('transactionErrorHandler ERROR ', txId, e);
    }
    if (errorCode !== '') {
      message = errorCode;
    }
    return {
      error,
      message,
    };
  }

  /**
   * 等待几个区块
   * @param web3
   * @param count
   */
  public async sleepBlock(count: number = 1) {
    const fistBlock = await retry(async () => {
      return await this.provider.getBlockNumber();
    });
    while (true) {
      const lastBlock = await retry(async () => {
        return await this.provider.getBlockNumber();
      });
      if (lastBlock - fistBlock >= count) {
        return;
      }
      await sleep(SLEEP_MS);
    }
  }
}
