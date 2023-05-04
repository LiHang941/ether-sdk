"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulContract = void 0;
const abi_1 = require("@ethersproject/abi");
class MulContract {
    constructor(address, abi) {
        this._address = address;
        this._abi = toFragment(abi);
        this._functions = this._abi.filter((x) => x.type === 'function').map((x) => abi_1.FunctionFragment.from(x));
        const callFunctions = this._functions.filter((x) => x.stateMutability === 'pure' || x.stateMutability === 'view');
        for (const callFunction of callFunctions) {
            const { name } = callFunction;
            const getCall = makeCallFunction(this, name);
            if (!this[name]) {
                defineReadOnly(this, name, getCall);
            }
        }
    }
    get address() {
        return this._address;
    }
    get abi() {
        return this._abi;
    }
    get functions() {
        return this._functions;
    }
}
exports.MulContract = MulContract;
function toFragment(abi) {
    return abi.map((item) => abi_1.Fragment.from(item));
}
function makeCallFunction(contract, name) {
    return (...params) => {
        const { address } = contract;
        const { inputs } = contract.functions.find((f) => f.name === name);
        const { outputs } = contract.functions.find((f) => f.name === name);
        return {
            contract: {
                address,
            },
            name,
            inputs,
            outputs,
            params,
        };
    };
}
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value,
        writable: false,
    });
}
