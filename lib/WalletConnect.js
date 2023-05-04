"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectManager = exports.WalletConnect = exports.getCurrentConnect = exports.PrivateWallet = void 0;
const ConnectInfo_1 = require("./ConnectInfo");
const service_1 = require("./service");
const ethers_1 = require("ethers");
const Constant_1 = require("./Constant");
const BasicException_1 = require("./BasicException");
const web3_provider_1 = __importDefault(require("@walletconnect/web3-provider"));
class PrivateWallet {
}
exports.PrivateWallet = PrivateWallet;
let currentConnect = null;
const getCurrentConnect = () => {
    return currentConnect;
};
exports.getCurrentConnect = getCurrentConnect;
class WalletConnect {
    constructor(walletName) {
        this.wallet = walletName;
        const connectInfo = new ConnectInfo_1.ConnectInfo();
        connectInfo.status = false;
        connectInfo.msg = 'Check your wallet!';
        this.connectInfo = connectInfo;
    }
    disConnect() {
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
            service_1.Trace.debug('connect success ', connectInfo.account);
        }
        if (connectInfo.status) {
            connectInfo.clear();
        }
    }
    // 测试用，直接私钥+rpc链接
    async privateWallet() {
        const connectInfo = this.connectInfo;
        const privateWallet = this.wallet;
        const provider = privateWallet.provider;
        const wallet = privateWallet.wallet;
        connectInfo.chainId = (await provider.getNetwork()).chainId;
        connectInfo.msg = 'success';
        connectInfo.provider = provider;
        connectInfo.account = wallet.address;
        connectInfo.status = true;
        connectInfo.wallet = wallet;
        this.update();
    }
    async web3Provider() {
        const connectInfo = this.connectInfo;
        const web3Provider = this.wallet;
        connectInfo.chainId = (await web3Provider.getNetwork()).chainId;
        connectInfo.msg = 'success';
        connectInfo.provider = web3Provider;
        connectInfo.account = await web3Provider.getSigner().getAddress();
        connectInfo.status = true;
        connectInfo.wallet = web3Provider.getSigner();
        this.update();
    }
    static async connectMetaMask(ethereum) {
        const provider = new ethers_1.providers.Web3Provider(ethereum, 'any');
        return new WalletConnect(provider);
    }
    static async connectWalletconnect() {
        const provider = new web3_provider_1.default({
            rpc: {
                1: 'https://mainnet.infura.io/v3/f6a9e5c4490849bb998a0c54718678f9',
                42: 'https://kovan.infura.io/v3/f6a9e5c4490849bb998a0c54718678f9',
                4: 'https://rinkeby.infura.io/v3/f6a9e5c4490849bb998a0c54718678f9',
                56: 'https://bsc-dataseed.binance.org/',
                256: 'https://http-testnet.hecochain.com',
                128: 'https://http-mainnet-node.huobichain.com',
                97: 'https://data-seed-prebsc-2-s1.binance.org:8545/',
                66: 'https://exchainrpc.okex.org',
                65: 'https://exchaintestrpc.okex.org',
                80001: 'https://naughty-blackwell:waffle-sprawl-math-used-ripple-snarl@nd-311-035-380.p2pify.com',
                42161: 'https://arb1.arbitrum.io/rpc',
                137: 'https://polygon-rpc.com/',
                10: 'https://mainnet.optimism.io',
                250: 'https://rpc.ftm.tools/',
                421611: 'https://rinkeby.arbitrum.io/rpc',
            },
            qrcodeModalOptions: {
                mobileLinks: [
                    'mathwallet',
                    'bitkeep',
                    'rainbow',
                    'metamask',
                    'argent',
                    'trust',
                    'imtoken',
                    'pillar',
                    'tokenpocket',
                ],
            },
        });
        await provider.enable();
        // @ts-ignore
        const walletConnectProvider = new ethers_1.providers.Web3Provider(provider, 'any');
        return new WalletConnect(walletConnectProvider);
    }
    /**
     * 链接钱包
     * @returns
     */
    async connect() {
        try {
            if (this.wallet instanceof PrivateWallet) {
                await this.privateWallet();
            }
            else if (this.wallet instanceof ethers_1.providers.Web3Provider) {
                await this.web3Provider();
            }
            else if (this.wallet.provider) {
                await this.web3Provider();
            }
            else {
                throw new BasicException_1.BasicException('Wallet type error');
            }
            currentConnect = this.connectInfo;
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
        return;
    }
    /**
     * 断开连接
     */
    static async disConnect() {
        if (ConnectManager.walletConnect) {
            ConnectManager.walletConnect.disConnect();
            ConnectManager.walletConnect = null;
        }
        if (ConnectManager.connectInfo) {
            ConnectManager.connectInfo = null;
        }
    }
    /**
     * 获取连接
     */
    static getConnect() {
        if (ConnectManager.connectInfo) {
            if (ConnectManager.connectInfo.status) {
                return ConnectManager.connectInfo;
            }
        }
        throw new Error("Wallet not connected");
    }
}
exports.ConnectManager = ConnectManager;
