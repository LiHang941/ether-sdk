"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectManager = exports.WalletConnect = void 0;
const ConnectInfo_1 = require("./ConnectInfo");
const service_1 = require("./service");
const Constant_1 = require("./Constant");
const BasicException_1 = require("./BasicException");
class WalletConnect {
    callConnect() {
        setTimeout(() => {
            if (this.connectCallBack) {
                try {
                    this.connectCallBack();
                }
                catch (e) {
                    service_1.Trace.error(e);
                }
            }
        }, 0);
    }
    disConnectCall() {
        setTimeout(() => {
            if (this.disconnectCallBack) {
                try {
                    this.disconnectCallBack();
                }
                catch (e) {
                    service_1.Trace.error(e);
                }
            }
        }, 0);
    }
    async getChainId() {
        const web3Provider = this.wallet;
        return Number.parseInt((await web3Provider.getNetwork()).chainId.toString());
    }
    async getAccount() {
        const web3Provider = this.wallet;
        return await (await web3Provider.getSigner()).getAddress();
    }
    async getWallet() {
        const web3Provider = this.wallet;
        return await web3Provider.getSigner();
    }
    async getApiProvider() {
        return this.wallet;
    }
    constructor(walletType, provider = undefined) {
        this.disconnectCallBack = undefined;
        this.connectCallBack = undefined;
        this.switchNetwork = (chainId) => {
            console.log('switchNetwork', chainId);
            return Promise.resolve();
        };
        this.wallet = walletType;
        this.provider = provider;
    }
    disConnect() {
        this.disConnectCall();
        const connectInfo = this.connectInfo;
        connectInfo.status = false;
        connectInfo.msg = 'Check your wallet!';
        this.update();
    }
    update() {
        const connectInfo = this.connectInfo;
        connectInfo.walletConnect = this;
        if (typeof connectInfo.account === 'undefined' || connectInfo.account === '') {
            connectInfo.status = false;
        }
        const currentAddressInfo = (0, Constant_1.getCurrentAddressInfo)();
        if (connectInfo.status) {
            connectInfo.account = connectInfo.account.toLowerCase();
            connectInfo.addressInfo = currentAddressInfo;
            service_1.Trace.debug('connect success ', this.connectInfo.account, this.connectInfo.chainId);
            this.callConnect();
        }
        if (connectInfo.status) {
            connectInfo.clear();
        }
    }
    async init() {
        const connectInfo = this.connectInfo;
        connectInfo.chainId = await this.getChainId();
        connectInfo.account = await this.getAccount();
        connectInfo.wallet = await this.getWallet();
        connectInfo.provider = await this.getApiProvider();
        connectInfo.msg = 'success';
        connectInfo.status = true;
        this.update();
    }
    /**
     * 链接钱包
     * @returns ConnectInfo
     */
    async connect() {
        try {
            const connectInfo = new ConnectInfo_1.ConnectInfo();
            connectInfo.status = false;
            connectInfo.msg = 'Check your wallet!';
            this.connectInfo = connectInfo;
            await this.init();
            return this.connectInfo;
        }
        catch (e) {
            this.connectInfo.status = false;
            this.connectInfo.msg = e.message || e.toString();
            this.update();
            throw e;
        }
    }
}
exports.WalletConnect = WalletConnect;
class ConnectManager {
    /**
     * 初始化
     * @param wallet
     */
    static async connect(wallet) {
        ConnectManager.walletConnect = wallet;
        ConnectManager.connectInfo = await wallet.connect();
        return ConnectManager.connectInfo;
    }
    /**
     * 断开连接
     */
    static async disConnect() {
        if (ConnectManager.walletConnect) {
            ConnectManager.walletConnect.disConnect();
            ConnectManager.walletConnect = undefined;
        }
        if (ConnectManager.connectInfo)
            ConnectManager.connectInfo = undefined;
    }
    /**
     * 获取连接
     */
    static getConnect() {
        if (ConnectManager.connectInfo) {
            if (ConnectManager.connectInfo.status)
                return ConnectManager.connectInfo;
        }
        throw new BasicException_1.BasicException('Wallet not connected');
    }
    static checkConnect() {
        if (ConnectManager.connectInfo) {
            if (ConnectManager.connectInfo.status)
                return true;
        }
        return false;
    }
    static getWalletConnect() {
        return ConnectManager.walletConnect;
    }
    static getChainName(chainId) {
        const [chainName,] = Object.entries(ConnectManager.chainMap).find(([_key, value]) => {
            if (typeof value === 'string') {
                return chainId === parseInt(value, 16);
            }
            else {
                return chainId === parseInt(value[0].chainId, 16);
            }
        });
        return chainName;
    }
}
exports.ConnectManager = ConnectManager;
ConnectManager.chainMap = {
    rinkeby: '0x4',
    mainnet: '0x1',
    goerli: '0x5',
    sepolia: '0xaa36a7'
};
