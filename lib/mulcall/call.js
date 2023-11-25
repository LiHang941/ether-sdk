"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.all = exports.CHUNK_SIZE = void 0;
const contracts_1 = require("@ethersproject/contracts");
const abi_1 = require("./abi");
const multicall_1 = require("./abi/multicall");
const chunk_1 = __importDefault(require("lodash/chunk"));
exports.CHUNK_SIZE = 255;
async function all(calls, multicallAddress, provider) {
    const multicall = new contracts_1.Contract(multicallAddress, multicall_1.multicallAbi, provider);
    const callRequests = calls.map((call) => {
        const callData = abi_1.Abi.encode(call.name, call.inputs, call.params);
        return {
            target: call.contract.address,
            callData,
        };
    });
    const response = [];
    const callRequestsChuck = (0, chunk_1.default)(callRequests, exports.CHUNK_SIZE);
    for (const callChuck of callRequestsChuck) {
        const result = await multicall.tryAggregate(false, callChuck, { gasLimit: 30000000 });
        response.push(...result);
    }
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
