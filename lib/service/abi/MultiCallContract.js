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
const BaseService_1 = require("../BaseService");
const ConnectInfo_1 = require("../../ConnectInfo");
const abi_1 = require("../../abi");
const mulcall_1 = require("../../mulcall");
const lodash_1 = require("lodash");
let MultiCallContract = class MultiCallContract extends BaseService_1.BaseService {
    constructor(connectInfo) {
        super(connectInfo);
        const address = this.connectInfo.addressInfo.multicall;
        this.multicall2Instance = new mulcall_1.MulContract(address, abi_1.Multicall2);
        this.multiCallInstance = new mulcall_1.Provider(this.connectInfo.provider, address);
    }
    async singleCall(shapeWithLabel) {
        const [res] = await this.call(...[shapeWithLabel]);
        return res;
    }
    async call(...shapeWithLabels) {
        const calls = [];
        shapeWithLabels.forEach((relay) => {
            const pairs = (0, lodash_1.toPairs)(relay);
            pairs.forEach(([key, value]) => {
                if (typeof value !== 'string') {
                    calls.push(value);
                }
            });
        });
        const res = await this.multiCallInstance.all(calls);
        let index = 0;
        const data = shapeWithLabels.map((relay) => {
            const pairs = (0, lodash_1.toPairs)(relay);
            pairs.forEach((obj) => {
                if (typeof obj[1] !== 'string') {
                    obj[1] = res[index];
                    index++;
                }
            });
            return (0, lodash_1.fromPairs)(pairs);
        });
        return data;
    }
};
MultiCallContract = __decorate([
    (0, tool_1.CacheKey)('MultiCallContract'),
    __metadata("design:paramtypes", [ConnectInfo_1.ConnectInfo])
], MultiCallContract);
exports.MultiCallContract = MultiCallContract;
