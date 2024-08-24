"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectInfo = void 0;
const service_1 = require("./service");
const BasicException_1 = require("./BasicException");
class ConnectInfo {
    constructor() {
        this.writeState = true;
        this.connectMethod = 'RPC';
    }
    create(clazz, ...args) {
        return (0, service_1.mixProxyByConnect)(clazz, this, ...args);
    }
    chainInfo() {
        return this.addressInfo.getChainInfo(this.chainId);
    }
    clear() {
        (0, service_1.clearCache)();
    }
    get provider() {
        if (this.status)
            return this._provider;
        throw new BasicException_1.BasicException('Wallet not connected!');
    }
    set provider(value) {
        this._provider = value;
    }
    /**
     * multiCall service
     */
    multiCall() {
        return this.create(service_1.MultiCallContract);
    }
    // eslint-disable-next-line accessor-pairs
    getWalletOrProvider() {
        return (this.wallet || this._provider);
    }
    /**
     * 获取 ERC20 API
     */
    erc20() {
        return this.create(service_1.Erc20Service);
    }
    /**
     * 获取交易API
     */
    tx() {
        return this.create(service_1.TransactionService);
    }
    async addToken(tokenAddress) {
        const token = await this.erc20().getTokenInfo(tokenAddress);
        service_1.Trace.debug('token info', token);
        try {
            const wasAdded = await this.provider.send('wallet_watchAsset', {
                type: 'ERC20',
                options: {
                    address: token.address,
                    symbol: token.symbol,
                    decimals: token.decimal,
                },
            });
            if (wasAdded)
                return true;
        }
        catch (error) {
            service_1.Trace.error(error);
        }
        return false;
    }
}
exports.ConnectInfo = ConnectInfo;
