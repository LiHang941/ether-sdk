"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractBaseWallet = exports.eventBus = exports.EventBus = exports.resetWalletConnectStatus = exports.ConnectorNameList = exports.ConnectorNames = void 0;
const service_1 = require("../service");
const WalletConnect_1 = require("../WalletConnect");
const Constant_1 = require("../Constant");
const SdkProvider_1 = require("../SdkProvider");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const lodash_1 = require("lodash");
var ConnectorNames;
(function (ConnectorNames) {
    ConnectorNames["MetaMask"] = "MetaMask";
    ConnectorNames["Injected"] = "Injected";
    ConnectorNames["WalletConnect"] = "WalletConnect";
})(ConnectorNames || (exports.ConnectorNames = ConnectorNames = {}));
exports.ConnectorNameList = Object.values(ConnectorNames);
const resetWalletConnectStatus = (id) => {
    const params = {
        walletConnect: 'unlink',
        walletName: id,
        walletAddress: null,
        network: null,
    };
    return params;
};
exports.resetWalletConnectStatus = resetWalletConnectStatus;
class EventBus {
    constructor() {
        this.events = {};
    }
    emit(eventName, data) {
        // console.log("EVENT", eventName);
        if (this.events[eventName]) {
            this.events[eventName].forEach((fn) => {
                try {
                    fn(data);
                }
                catch (e) {
                    service_1.Trace.error("TOPIC", eventName, data, e);
                }
            });
        }
    }
    on(eventName, fn) {
        // console.log("ON", eventName, fn);
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    }
    resetOn(eventName, fn) {
        this.events[eventName] = [];
        this.events[eventName].push(fn);
    }
    resetOff(eventName) {
        delete this.events[eventName];
    }
    off(eventName, fn) {
        if (this.events[eventName]) {
            for (let i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    // console.log("REMOVE", eventName, i, fn);
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    }
}
exports.EventBus = EventBus;
exports.eventBus = new EventBus();
class AbstractBaseWallet {
    constructor() {
        this.chainChangedDebounce = (0, lodash_1.debounce)(async (chainIdHex) => {
            service_1.Trace.log('chainChanged ', chainIdHex);
            let chainId;
            try {
                chainId = parseInt(chainIdHex);
            }
            catch (e) {
                chainId = -1;
            }
            const allChain = (0, Constant_1.getCurrentAddressInfo)().getAllChain();
            const chainInfo = allChain.find(item => new bignumber_js_1.default(item.chainId).comparedTo(chainId) == 0);
            if (!chainInfo) {
                this.statusUpdateCallback((0, exports.resetWalletConnectStatus)(this.id()));
            }
            await this.updateWallet(await this.getWalletConnect());
        }, 100);
        this.accountsChangedDebounce = (0, lodash_1.debounce)(async (accounts) => {
            service_1.Trace.log('accountsChanged', accounts);
            await this.updateWallet(await this.getWalletConnect());
        }, 100);
        this.disconnectCallbackDebounce = (0, lodash_1.debounce)(async (error) => {
            service_1.Trace.log('disconnectCallback', error);
            this.disconnect(error);
        }, 100);
        this.statusUpdateCallbackDebounce = (0, lodash_1.debounce)((status) => {
            service_1.Trace.log('statusUpdateCallback', status);
            this.callBack.statusUpdate(status);
        }, 500);
    }
    resetConnect() {
        this.callBack = undefined;
        WalletConnect_1.ConnectManager.disConnect();
    }
    chainChanged(chainIdHex) {
        this.chainChangedDebounce.call(this, chainIdHex);
    }
    accountsChanged(accounts) {
        this.accountsChangedDebounce.call(this, accounts);
    }
    disconnectCallback(error) {
        this.disconnectCallbackDebounce.call(this, error);
    }
    statusUpdateCallback(status) {
        this.statusUpdateCallbackDebounce.call(this, status);
    }
    async connect(callBack) {
        this.callBack = callBack;
        const walletConnect = await this.getWalletConnect();
        await this.updateWallet(walletConnect);
        exports.eventBus.resetOn("accountsChanged", (accounts) => {
            this.accountsChanged(accounts);
        });
        exports.eventBus.resetOn("chainChanged", (chainIdHex) => {
            this.chainChanged(chainIdHex);
        });
        exports.eventBus.resetOn("disconnect", (error) => {
            this.disconnectCallback(error);
        });
        return await WalletConnect_1.ConnectManager.connect(walletConnect);
    }
    async updateWallet(walletConnect) {
        try {
            const connectInfo = await WalletConnect_1.ConnectManager.connect(walletConnect);
            let chainInfo;
            try {
                chainInfo = (0, Constant_1.getCurrentAddressInfo)().getChainInfo(connectInfo.chainId);
            }
            catch (e) {
                chainInfo = (0, Constant_1.getCurrentAddressInfo)().getChainInfo(SdkProvider_1.SdkProvider.currentChainType);
            }
            if (chainInfo.chainType !== SdkProvider_1.SdkProvider.currentChainType) {
                SdkProvider_1.SdkProvider.fastSetChainType(chainInfo.chainType);
                this.callBack.chainUpdate(chainInfo.chainType);
            }
            service_1.Trace.log('connectInfo', connectInfo.chainId);
            if (connectInfo.chainId === chainInfo.chainId) {
                const walletConnectStatus = (0, exports.resetWalletConnectStatus)(this.id());
                walletConnectStatus.walletConnect = 'connect';
                walletConnectStatus.walletName = this.id();
                walletConnectStatus.walletAddress = connectInfo.account;
                walletConnectStatus.network = chainInfo.chainType;
                this.statusUpdateCallback(walletConnectStatus);
            }
            else {
                try {
                    this.callBack.loading(true);
                    await walletConnect.switchNetwork(chainInfo.chainId);
                }
                finally {
                    this.callBack.loading(false);
                }
            }
        }
        catch (e) {
            service_1.Trace.error(e);
            this.disconnect(e.message);
        }
    }
    disconnect(error) {
        this.statusUpdateCallback({
            ...(0, exports.resetWalletConnectStatus)(this.id()),
            walletName: null,
            walletConnect: 'unlink',
            error,
        });
        WalletConnect_1.ConnectManager.disConnect();
    }
}
exports.AbstractBaseWallet = AbstractBaseWallet;
