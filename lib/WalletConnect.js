"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectManager = exports.WalletConnect = exports.getCurrentConnect = exports.PrivateWallet = void 0;
const ConnectInfo_1 = require("./ConnectInfo");
const service_1 = require("./service");
const ethers_1 = require("ethers");
const Constant_1 = require("./Constant");
const BasicException_1 = require("./BasicException");
const ethers5_1 = require("@web3modal/ethers5");
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
        this.disconnectCallBack = null;
        this.connectCallBack = null;
        this.switchNetwork = (chainId) => {
            const [chainName,] = Object.entries(ConnectManager.chainMap).find(([key, value]) => {
                if (typeof value === 'string') {
                    return chainId === parseInt(value, 16);
                }
                else {
                    return chainId === parseInt(value[0].chainId, 16);
                }
            });
            ConnectManager.addMetamaskChain(chainName);
        };
        this.wallet = walletName;
        const connectInfo = new ConnectInfo_1.ConnectInfo();
        connectInfo.status = false;
        connectInfo.msg = 'Check your wallet!';
        this.connectInfo = connectInfo;
    }
    disConnect() {
        if (this.disconnectCallBack) {
            try {
                this.disconnectCallBack();
            }
            catch (e) {
                service_1.Trace.error(e);
            }
        }
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
            if (this.connectCallBack) {
                try {
                    this.connectCallBack();
                }
                catch (e) {
                    service_1.Trace.error(e);
                }
            }
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
    static async connectMetaMask() {
        const _ethereum = WalletConnect.getEthereum();
        if (!_ethereum) {
            throw new BasicException_1.BasicException("Check your wallet!");
        }
        await _ethereum.enable();
        const provider = new ethers_1.providers.Web3Provider(_ethereum, 'any');
        const walletConnect = new WalletConnect(provider);
        walletConnect.provider = _ethereum;
        return walletConnect;
    }
    static getEthereum() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return window.ethereum;
    }
    static async connectWalletconnect(metadata, projectId, mainnet) {
        const modal = (0, ethers5_1.createWeb3Modal)({
            ethersConfig: (0, ethers5_1.defaultConfig)({ metadata }),
            chains: [mainnet],
            defaultChain: mainnet,
            projectId,
        });
        let walletProvider;
        let open = false;
        while (true) {
            const isConnected = modal.getIsConnected();
            const state = modal.getState();
            service_1.Trace.debug("isConnected", isConnected, state);
            if (!isConnected) {
                if (!state.open) {
                    if (open) {
                        throw new BasicException_1.BasicException("User rejected the request");
                    }
                    await modal.open({
                        view: "Connect",
                    });
                }
                else {
                    open = true;
                }
                await (0, service_1.sleep)(1000);
                continue;
            }
            else {
                walletProvider = modal.getWalletProvider();
            }
            service_1.Trace.debug("walletProvider", walletProvider);
            if (walletProvider) {
                if (modal.getState().selectedNetworkId !== mainnet.chainId) {
                    await modal.switchNetwork(mainnet.chainId);
                    continue;
                }
            }
            if (walletProvider) {
                await modal.close();
                break;
            }
        }
        service_1.Trace.debug("connect walletProvider", walletProvider);
        const walletConnectProvider = new ethers_1.providers.Web3Provider(walletProvider, "any");
        const walletConnect = new WalletConnect(walletConnectProvider);
        walletConnect.provider = walletConnectProvider;
        walletConnect.switchNetwork = (_chainId) => {
            modal.switchNetwork(_chainId);
        };
        walletConnect.disconnectCallBack = () => {
            modal.close().catch();
            modal.disconnect().catch();
        };
        walletConnect.connectCallBack = () => {
            modal.close().catch();
        };
        let account = await walletConnectProvider.getSigner().getAddress();
        let chainId = (await walletConnectProvider.getNetwork()).chainId;
        modal.subscribeProvider((newState) => {
            if (newState && newState.provider) {
                if (newState.chainId !== chainId) {
                    walletConnectProvider.emit("chainChanged", newState.chainId);
                    chainId = newState.chainId;
                    return;
                }
                if (account !== newState.address) {
                    walletConnectProvider.emit("accountsChanged", [newState.address]);
                    account = newState.address;
                    return;
                }
            }
        });
        return walletConnect;
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
        return ConnectManager.connectInfo;
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
    static addMetamaskChain(chainName) {
        // @ts-ignore
        const _ethereum = WalletConnect.getEthereum();
        if (!_ethereum) {
            return;
        }
        const data = ConnectManager.chainMap[chainName];
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            _ethereum
                .request({
                method: 'wallet_switchEthereumChain',
                params: [
                    {
                        chainId: data,
                    },
                ],
            })
                .catch();
            return;
        }
        _ethereum.request({ method: 'wallet_addEthereumChain', params: data }).catch();
    }
}
exports.ConnectManager = ConnectManager;
ConnectManager.chainMap = {
    rinkeby: '0x4',
    mainnet: '0x1',
};
