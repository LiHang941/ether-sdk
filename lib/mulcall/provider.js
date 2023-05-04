"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const call_1 = require("./call");
const calls_1 = require("./calls");
class Provider {
    constructor(provider, multicallAddress) {
        this._provider = provider;
        this._multicallAddress = multicallAddress;
    }
    getEthBalance(address) {
        if (!this._provider) {
            throw new Error('Provider should be initialized before use.');
        }
        return (0, calls_1.getEthBalance)(address, this._multicallAddress);
    }
    async all(calls) {
        if (!this._provider) {
            throw new Error('Provider should be initialized before use.');
        }
        return (0, call_1.all)(calls, this._multicallAddress, this._provider);
    }
}
exports.Provider = Provider;
