"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressInfo = exports.ChainTypeList = exports.ChainType = void 0;
const ethers6_1 = require("ethers6");
const ConnectInfo_1 = require("../../ConnectInfo");
var ChainType;
(function (ChainType) {
    ChainType["bsc"] = "bsc";
    ChainType["matic"] = "matic";
    ChainType["arbitrum"] = "arbitrum";
})(ChainType || (exports.ChainType = ChainType = {}));
exports.ChainTypeList = Object.values(ChainType);
/**
 * 地址信息
 */
class AddressInfo {
    constructor(chains) {
        this.chainInsMap = {};
        this.chainMap = {};
        chains.forEach(chain => {
            this.chainMap[chain.chainType] = chain;
        });
        this.chain = chains[0];
    }
    getDefaultChain() {
        return this.chain;
    }
    getAllChain() {
        return Object.values(this.chainMap);
    }
    getChainInfo(chain) {
        const chainInfo = Object.values(this.chainMap).find(it => {
            return it.chainId === chain || it.chainType === chain || it.chainName === chain;
        });
        if (!chainInfo) {
            throw new Error('Chain not found');
        }
        return chainInfo;
    }
    readonlyConnectInfo(chain) {
        if (typeof this.chainInsMap[chain.chainId] === 'undefined') {
            const provider = new ethers6_1.JsonRpcProvider(chain.rpc, chain.chainId, {
                staticNetwork: new ethers6_1.Network(chain.chainName, chain.chainId),
                batchMaxCount: 1
            });
            const connectInfo = new ConnectInfo_1.ConnectInfo();
            connectInfo.provider = provider;
            connectInfo.wallet = undefined;
            connectInfo.status = true;
            connectInfo.addressInfo = this;
            connectInfo.writeState = false;
            connectInfo.chainId = chain.chainId;
            this.chainInsMap[chain.chainId] = connectInfo;
        }
        return this.chainInsMap[chain.chainId];
    }
    getEtherscanAddress(chainInfo, address) {
        return this.getEtherscanLink(chainInfo, address, 'address');
    }
    getEtherscanTx(chainInfo, tx) {
        return this.getEtherscanLink(chainInfo, tx, 'transaction');
    }
    getEtherscanLink(chainInfo, data, type) {
        const prefix = chainInfo.scan;
        switch (type) {
            case 'transaction': {
                return `${prefix}/tx/${data}`;
            }
            case 'token': {
                return `${prefix}/token/${data}`;
            }
            case 'block': {
                return `${prefix}/block/${data}`;
            }
            case 'address':
            default: {
                return `${prefix}/address/${data}`;
            }
        }
    }
}
exports.AddressInfo = AddressInfo;
