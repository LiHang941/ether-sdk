"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkProvider = void 0;
const WalletConnect_1 = require("./WalletConnect");
const service_1 = require("./service");
const config_1 = require("./config");
const Constant_1 = require("./Constant");
class SdkProvider {
    static initConfig(ENV) {
        SdkProvider.initConfigState = false;
        (0, config_1.initAddress)(ENV);
        SdkProvider.initConfigState = true;
    }
    static checkInitConfig() {
        if (SdkProvider.initConfigState) {
            return;
        }
        throw new Error('SdkProvider not init');
    }
    static async setChainType(chainType) {
        const oldChain = SdkProvider.currentChainType;
        if (oldChain === chainType) {
            return;
        }
        if (WalletConnect_1.ConnectManager.checkConnect()) {
            const chainInfo = (0, Constant_1.getCurrentAddressInfo)().getChainInfo(chainType);
            try {
                await WalletConnect_1.ConnectManager.getWalletConnect().switchNetwork(chainInfo.chainId);
                SdkProvider.currentChainType = chainType;
            }
            catch (e) {
                await WalletConnect_1.ConnectManager.disConnect();
                SdkProvider.currentChainType = chainType;
            }
        }
        else {
            SdkProvider.currentChainType = chainType;
        }
    }
    static fastSetChainType(chainType) {
        const oldChain = SdkProvider.currentChainType;
        if (oldChain === chainType) {
            return;
        }
        SdkProvider.currentChainType = chainType;
    }
    /**
     * @name 获取API
     */
    static getApi() {
        SdkProvider.checkInitConfig();
        return service_1.apiProvider;
    }
    /**
     * 获取配置
     */
    static getConfig() {
        SdkProvider.checkInitConfig();
        return (0, Constant_1.getCurrentAddressInfo)();
    }
    /**
     * @name 获取当前钱包链接
     */
    static connect() {
        SdkProvider.checkInitConfig();
        return WalletConnect_1.ConnectManager.getConnect();
    }
    static async disconnect() {
        SdkProvider.checkInitConfig();
        await WalletConnect_1.ConnectManager.disConnect();
    }
    static checkConnect() {
        return WalletConnect_1.ConnectManager.checkConnect();
    }
    static userAddress() {
        if (WalletConnect_1.ConnectManager.checkConnect()) {
            return WalletConnect_1.ConnectManager.getConnect().account;
        }
        else {
            return undefined;
        }
    }
}
exports.SdkProvider = SdkProvider;
SdkProvider.initConfigState = false;
SdkProvider.currentChainType = service_1.ChainType.bsc;
