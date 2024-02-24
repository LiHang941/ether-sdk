"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressInfo = void 0;
const ethers_1 = require("ethers");
const ConnectInfo_1 = require("../../ConnectInfo");
const WalletConnect_1 = require("../../WalletConnect");
/**
 * 地址信息
 */
class AddressInfo {
    constructor() {
        this.readonlyConnectInfoInstance = null;
    }
    readonlyConnectInfo() {
        const currentConnect = (0, WalletConnect_1.getCurrentConnect)();
        if (currentConnect != null && currentConnect.status) {
            return currentConnect;
        }
        if (this.readonlyConnectInfoInstance == null) {
            const provider = new ethers_1.providers.StaticJsonRpcProvider(this.rpc, this.chainId);
            const connectInfo = new ConnectInfo_1.ConnectInfo();
            connectInfo.provider = provider;
            connectInfo.wallet = null;
            connectInfo.status = true;
            connectInfo.addressInfo = this;
            this.readonlyConnectInfoInstance = connectInfo;
        }
        return this.readonlyConnectInfoInstance;
    }
    getEtherscanAddress(address) {
        return `${this.scan}/address/${address}`;
    }
    getEtherscanTx(tx) {
        return `${this.scan}/tx/${tx}`;
    }
}
exports.AddressInfo = AddressInfo;
