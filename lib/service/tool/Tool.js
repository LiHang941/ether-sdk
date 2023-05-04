"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trace = exports.TraceTool = exports.getValue = exports.showApprove = exports.eqAddress = exports.calculateGasMargin = exports.retry = exports.isNullOrBlank = exports.sleep = exports.convertAmount1 = exports.convertAmount = exports.convertBigNumber1 = exports.convertBigNumber = exports.MAXIMUM_U256 = exports.ZERO_ADDRESS = exports.SLEEP_MS = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const BasicException_1 = require("../../BasicException");
const lodash_1 = __importDefault(require("lodash"));
/**
 * 轮询休眠时长 ms
 */
exports.SLEEP_MS = 1000;
/**
 * 0 地址
 */
exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
/**
 * uint(-1)
 */
exports.MAXIMUM_U256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
/**
 *  b / 1e18
 * @param bnAmount
 * @param precision
 */
const convertBigNumber = (bnAmount, precision = 1e18) => {
    return new bignumber_js_1.default(bnAmount).dividedBy(new bignumber_js_1.default(precision)).toFixed();
};
exports.convertBigNumber = convertBigNumber;
/**
 *  b / (10 ** decimals)
 * @param bnAmount
 * @param decimals
 */
const convertBigNumber1 = (bnAmount, decimals = 18) => {
    return new bignumber_js_1.default(bnAmount).dividedBy(new bignumber_js_1.default('10').pow(decimals)).toFixed();
};
exports.convertBigNumber1 = convertBigNumber1;
/**
 * b * 1e18
 * @param bnAmount
 * @param precision
 */
const convertAmount = (bnAmount, precision = 1e18) => {
    return new bignumber_js_1.default(bnAmount).multipliedBy(new bignumber_js_1.default(precision)).toFixed();
};
exports.convertAmount = convertAmount;
/**
 * amount * (10 ** decimals)
 * @param amount
 * @param decimals
 */
const convertAmount1 = (amount, decimals = 18) => {
    return new bignumber_js_1.default(amount).multipliedBy(new bignumber_js_1.default('10').pow(decimals)).toFixed();
};
exports.convertAmount1 = convertAmount1;
/**
 * 休眠指定时间
 * @param ms
 */
const sleep = async (ms) => {
    return await new Promise((resolve) => setTimeout(() => {
        resolve(1);
    }, ms));
};
exports.sleep = sleep;
/**
 * 判断算法未空字符串
 * @param value
 */
const isNullOrBlank = (value) => {
    return !value || value === undefined || value === '' || value.length === 0;
};
exports.isNullOrBlank = isNullOrBlank;
/**
 * 重试
 * @param func
 * @param retryCount
 */
const retry = async (func, retryCount = 3) => {
    let count = retryCount;
    do {
        try {
            return await func();
        }
        catch (e) {
            if (count > 0) {
                count--;
            }
            if (count <= 0) {
                throw new BasicException_1.BasicException(e.toString(), e);
            }
            console.error('retry', e);
            await (0, exports.sleep)(exports.SLEEP_MS);
        }
    } while (true);
};
exports.retry = retry;
function calculateGasMargin(value) {
    return parseInt(new bignumber_js_1.default(value).multipliedBy(1.2).toFixed(0, bignumber_js_1.default.ROUND_DOWN), 10);
}
exports.calculateGasMargin = calculateGasMargin;
function eqAddress(addr0, addr1) {
    return addr0.toLowerCase() === addr1.toLowerCase();
}
exports.eqAddress = eqAddress;
function showApprove(balanceInfo) {
    const amount = (0, exports.convertBigNumber1)(balanceInfo.allowance, balanceInfo.decimals);
    return new bignumber_js_1.default(amount).comparedTo('100000000') <= 0;
}
exports.showApprove = showApprove;
function getValue(obj, path, defaultValue) {
    return lodash_1.default.get(obj, path, defaultValue) || defaultValue;
}
exports.getValue = getValue;
/**
 * 日志工具
 */
class TraceTool {
    constructor() {
        this.logShow = true;
        this.errorShow = true;
        this.debugShow = true;
    }
    setLogShow(b) {
        this.logShow = b;
    }
    setErrorShow(b) {
        this.errorShow = b;
    }
    setDebugShow(b) {
        this.debugShow = b;
    }
    log(...args) {
        // tslint:disable-next-line:no-console
        console.log(...args);
    }
    print(...args) {
        if (this.logShow) {
            this.log(...args);
        }
    }
    error(...args) {
        if (this.errorShow) {
            this.log(...args);
        }
    }
    debug(...args) {
        if (this.debugShow) {
            this.log(...args);
        }
    }
}
exports.TraceTool = TraceTool;
exports.Trace = new TraceTool();
