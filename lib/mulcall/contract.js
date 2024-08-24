"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulContract = void 0;
const ethers6_1 = require("ethers6");
const abi_1 = require("./abi");
class MulContract {
    get address() {
        return this._address;
    }
    get abi() {
        return this._abi;
    }
    get functions() {
        return this._functions;
    }
    get mulContractConfig() {
        return this._mulContractConfig;
    }
    constructor(address, abi, config = undefined) {
        this._address = address;
        this._abi = toFragment(abi);
        this._functions = this._abi.filter(it => it)
            .filter(x => x.type === 'function')
            .map(x => ethers6_1.FunctionFragment.from(x));
        const callFunctions = this._functions
            .filter(x => x.stateMutability === 'pure' || x.stateMutability === 'view');
        for (const callFunction of callFunctions) {
            const { name, inputs } = callFunction;
            const methodName = name + "(" + inputs.map(it => it.type).join(",") + ")";
            const getCall = makeCallFunction(this, callFunction);
            if (!this[name]) {
                defineReadOnly(this, name, getCall);
            }
            if (methodName) {
                defineReadOnly(this, methodName, getCall);
            }
        }
        if (config) {
            this._mulContractConfig = config;
        }
        else {
            this._mulContractConfig = {};
        }
    }
}
exports.MulContract = MulContract;
function toFragment(abi) {
    return abi.map((item) => ethers6_1.Fragment.from(item));
}
function makeCallFunction(contract, callFunction) {
    return (...params) => {
        const { address } = contract;
        const call = {
            contract: {
                address,
            },
            name: callFunction.name,
            inputs: callFunction.inputs,
            outputs: callFunction.outputs,
            params,
            callData() {
                return Promise.resolve("");
            }
        };
        call.callData = async () => {
            return abi_1.Abi.encode(callFunction.name, call.inputs, call.params);
        };
        return call;
    };
}
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value,
        writable: false,
    });
}
