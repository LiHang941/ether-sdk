import BigNumber from 'bignumber.js';
import { BasicException } from '../../BasicException';
import lodash from 'lodash';
/**
 * 轮询休眠时长 ms
 */
export const SLEEP_MS: number = 1000;

/**
 * 0 地址
 */
export const ZERO_ADDRESS: string = '0x0000000000000000000000000000000000000000';

/**
 * uint(-1)
 */
export const MAXIMUM_U256: string = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

/**
 *  b / 1e18
 * @param bnAmount
 * @param precision
 */
export const convertBigNumber = (bnAmount: string | number, precision: number = 1e18) => {
  return new BigNumber(bnAmount).dividedBy(new BigNumber(precision)).toFixed();
};

/**
 *  b / (10 ** decimals)
 * @param bnAmount
 * @param decimals
 */
export const convertBigNumber1 = (bnAmount: string | number, decimals: string | number = 18) => {
  return new BigNumber(bnAmount).dividedBy(new BigNumber('10').pow(decimals)).toFixed();
};

/**
 * b * 1e18
 * @param bnAmount
 * @param precision
 */
export const convertAmount = (bnAmount: string | number, precision: number = 1e18) => {
  return new BigNumber(bnAmount).multipliedBy(new BigNumber(precision)).toFixed();
};

/**
 * amount * (10 ** decimals)
 * @param amount
 * @param decimals
 */
export const convertAmount1 = (amount: string | number, decimals: number = 18) => {
  return new BigNumber(amount).multipliedBy(new BigNumber('10').pow(decimals)).toFixed();
};

/**
 * 休眠指定时间
 * @param ms
 */
export const sleep = async (ms: number) => {
  return await new Promise((resolve) =>
    setTimeout(() => {
      resolve(1);
    }, ms),
  );
};

/**
 * 判断算法未空字符串
 * @param value
 */
export const isNullOrBlank = (value: string) => {
  return !value || value === undefined || value === '' || value.length === 0;
};

/**
 * 重试
 * @param func
 * @param retryCount
 */
export const retry = async (func: () => any, retryCount: number = 3) => {
  let count = retryCount;
  do {
    try {
      return await func();
    } catch (e) {
      if (count > 0) {
        count--;
      }
      if (count <= 0) {
        throw new BasicException(e.toString(), e);
      }
      console.error('retry', e);
      await sleep(SLEEP_MS);
    }
  } while (true);
};

export function calculateGasMargin(value: string): number {
  return parseInt(new BigNumber(value).multipliedBy(1.2).toFixed(0, BigNumber.ROUND_DOWN), 10);
}

export function eqAddress(addr0: string, addr1: string): boolean {
  return addr0.toLowerCase() === addr1.toLowerCase();
}

export function showApprove(balanceInfo: { allowance: string | number; decimals: string | number }): boolean {
  const amount = convertBigNumber1(balanceInfo.allowance, balanceInfo.decimals);
  return new BigNumber(amount).comparedTo('100000000') <= 0;
}

export function getValue(obj: any, path: string, defaultValue: any): any {
  return lodash.get(obj, path, defaultValue) || defaultValue;
}

/**
 * 日志工具
 */
export class TraceTool {
  private logShow = true;
  private errorShow = true;
  private debugShow = true;

  public setLogShow(b: boolean) {
    this.logShow = b;
  }

  public setErrorShow(b: boolean) {
    this.errorShow = b;
  }

  public setDebugShow(b: boolean) {
    this.debugShow = b;
  }

  public log(...args) {
    // tslint:disable-next-line:no-console
    console.log(...args);
  }

  public print(...args) {
    if (this.logShow) {
      this.log(...args);
    }
  }

  public error(...args) {
    if (this.errorShow) {
      this.log(...args);
    }
  }

  public debug(...args) {
    if (this.debugShow) {
      this.log(...args);
    }
  }
}

export const Trace = new TraceTool();
