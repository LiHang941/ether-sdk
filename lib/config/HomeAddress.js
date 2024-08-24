"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAddress = exports.setInitAddress = void 0;
const Constant_1 = require("../Constant");
const WalletConnect_1 = require("../WalletConnect");
const service_1 = require("../service");
let initAddressFun = (ENV) => {
    if (ENV === 'test') {
        const maintle = {
            chainId: 5003,
            chainName: 'Mantle Testnet',
            scan: 'https://explorer.sepolia.mantle.xyz',
            rpc: 'https://rpc.sepolia.mantle.xyz/',
            multicall: "0x521751C88EafdCAEd9cAbb4dB35a1400D6933428",
            chainType: service_1.ChainType.mantle,
            chainToken: "MNT",
        };
        const addressInfo = new service_1.AddressInfo([maintle]);
        addressInfo.env = ENV;
        (0, Constant_1.updateCurrentAddressInfo)(addressInfo);
        WalletConnect_1.ConnectManager.chainMap['Mantle Testnet'] = [
            {
                chainId: '0x138b',
                chainName: 'Mantle Testnet',
                nativeCurrency: {
                    name: 'MNT',
                    symbol: 'MNT',
                    decimals: 18,
                },
                rpcUrls: ['https://rpc.testnet.mantle.xyz'],
                blockExplorerUrls: ['https://explorer.testnet.mantle.xyz/'],
            },
        ];
    }
    else if (ENV === 'prod' || ENV === 'prod_node') {
        throw new Error(`${ENV} is not support`);
    }
    else {
        throw new Error(`${ENV} is not support`);
    }
    service_1.Trace.debug('address config init', ENV);
};
function setInitAddress(fn) {
    initAddressFun = fn;
}
exports.setInitAddress = setInitAddress;
function initAddress(ENV) {
    initAddressFun(ENV);
}
exports.initAddress = initAddress;
