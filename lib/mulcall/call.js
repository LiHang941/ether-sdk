"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.all = void 0;
const contracts_1 = require("@ethersproject/contracts");
const abi_1 = require("./abi");
const multicall_1 = require("./abi/multicall");
async function all(calls, multicallAddress, provider) {
    const multicall = new contracts_1.Contract(multicallAddress, multicall_1.multicallAbi, provider);
    const callRequests = calls.map((call) => {
        const callData = abi_1.Abi.encode(call.name, call.inputs, call.params);
        return {
            target: call.contract.address,
            callData,
        };
    });
    const response = await multicall.tryAggregate(false, callRequests);
    const callCount = calls.length;
    const callResult = [];
    for (let i = 0; i < callCount; i++) {
        const outputs = calls[i].outputs;
        const result = response[i];
        if (result.success) {
            const params = abi_1.Abi.decode(outputs, result.returnData);
            callResult.push(params);
        }
        else {
            callResult.push(undefined);
        }
    }
    return callResult;
}
exports.all = all;
