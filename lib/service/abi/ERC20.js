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
exports.ERC20 = void 0;
const BaseService_1 = require("../BaseService");
const ConnectInfo_1 = require("../../ConnectInfo");
const abi_1 = require("../../abi");
const tool_1 = require("../tool");
const ethers_1 = require("ethers");
const mulcall_1 = require("../../mulcall");
let ERC20 = class ERC20 extends BaseService_1.BaseService {
    constructor(connectInfo, token) {
        super(connectInfo);
        this.erc20Instance = new mulcall_1.MulContract(token, abi_1.IERC20);
        this.erc20Contract = new ethers_1.Contract(token, abi_1.IERC20, connectInfo.getWalletOrProvider());
    }
    async allowance(owner, sender) {
        return (await this.erc20Contract.allowance(owner, sender)).toString();
    }
    async approve(spender, value) {
        return await this.connectInfo.tx().sendContractTransaction(this.erc20Contract, 'approve', [spender, value], {});
    }
    async transfer(to, value) {
        return await this.connectInfo.tx().sendContractTransaction(this.erc20Contract, 'transfer', [to, value], {});
    }
    async transferFrom(from, to, value) {
        return await this.connectInfo
            .tx()
            .sendContractTransaction(this.erc20Contract, 'transferFrom', [from, to, value], {});
    }
    async totalSupply() {
        return (await this.erc20Contract.totalSupply()).toString();
    }
    async balanceOf(owner) {
        return (await this.erc20Contract.balanceOf(owner)).toString();
    }
    async name() {
        return (await this.erc20Contract.name()).toString();
    }
    async symbol() {
        return (await this.erc20Contract.symbol()).toString();
    }
    async decimals() {
        return parseInt((await this.erc20Contract.decimals()).toString(), 10);
    }
};
ERC20 = __decorate([
    (0, tool_1.CacheKey)('ERC20'),
    __metadata("design:paramtypes", [ConnectInfo_1.ConnectInfo, String])
], ERC20);
exports.ERC20 = ERC20;
