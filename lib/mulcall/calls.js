"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthBalance = void 0;
const multicall_1 = require("./abi/multicall");
const contract_1 = require("./contract");
function getEthBalance(address, multicallAddress) {
    const multicall = new contract_1.MulContract(multicallAddress, multicall_1.multicallAbi);
    return multicall.getEthBalance(address);
}
exports.getEthBalance = getEthBalance;
