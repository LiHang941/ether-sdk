"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletProvider = void 0;
const BaseWallet_1 = require("./BaseWallet");
const MetaMaskProvider_1 = require("./MetaMaskProvider");
class WalletProvider {
    static connect(connectorNames, callBack) {
        return WalletProvider._connect(connectorNames, callBack);
    }
    static _connect(connectorNames, callBack) {
        if (connectorNames === BaseWallet_1.ConnectorNames.MetaMask) {
            return MetaMaskProvider_1.metamaskProvider.connect(callBack);
        }
        if (connectorNames === BaseWallet_1.ConnectorNames.Injected) {
            return MetaMaskProvider_1.injectedWallet.connect(callBack);
        }
        throw new Error('connectorNames not found');
    }
    static wallets() {
        return [
            MetaMaskProvider_1.metamaskProvider,
            MetaMaskProvider_1.injectedWallet /*,
            walletConnectProvider*/
        ].map(it => {
            return {
                id: it.id(),
                downloadLink: it.downloadLink(),
                installed: it.installed()
            };
        });
    }
}
exports.WalletProvider = WalletProvider;
