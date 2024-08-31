"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiCallContract = void 0;
const tool_1 = require("../tool");
const abi_1 = require("../../abi");
const mulcall_1 = require("../../mulcall");
const BaseAbi_1 = require("./BaseAbi");
let MultiCallContract = class MultiCallContract extends BaseAbi_1.BaseAbi {
    constructor(connectInfo) {
        super(connectInfo, connectInfo.chainInfo().multicall, abi_1.Multicall2Abi);
    }
    async multicallExecute(calls) {
        const res = await (0, mulcall_1.multicallExecute)(this.contract, calls);
        return res;
    }
    async callObj(...shapeWithLabels) {
        const calls = [];
        for (const shapeWithLabel of shapeWithLabels) {
            for (const key in shapeWithLabel) {
                if (Object.prototype.hasOwnProperty.call(shapeWithLabel, key)) {
                    if (typeof shapeWithLabel[key] !== 'string') {
                        calls.push(shapeWithLabel[key]);
                    }
                }
            }
        }
        const callResult = await this.multicallExecute(calls);
        let index = 0;
        const result = [];
        for (const shapeWithLabel of shapeWithLabels) {
            const resultItem = {};
            for (const key in shapeWithLabel) {
                if (Object.prototype.hasOwnProperty.call(shapeWithLabel, key)) {
                    const value = shapeWithLabel[key];
                    if (typeof value === 'string') {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        resultItem[key] = value;
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        resultItem[key] = callResult[index];
                        index++;
                    }
                }
            }
            result.push(resultItem);
        }
        return result;
    }
    async singleCallObj(call) {
        const res = await this.multicallExecute([call]);
        return res[0];
    }
    multicall_getCurrentBlockTimestamp() {
        return this.mulContract.getCurrentBlockTimestamp();
    }
    multicall_getBlockNumber() {
        return this.mulContract.getBlockNumber();
    }
    multicall_getEthBalance(user) {
        return this.mulContract.getEthBalance(user);
    }
};
exports.MultiCallContract = MultiCallContract;
exports.MultiCallContract = MultiCallContract = __decorate([
    (0, tool_1.CacheKey)('MultiCallContract'),
    __metadata("design:paramtypes", [Function])
], MultiCallContract);
