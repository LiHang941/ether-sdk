"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Abi = void 0;
const abi_1 = require("@ethersproject/abi");
const keccak256_1 = require("@ethersproject/keccak256");
const strings_1 = require("@ethersproject/strings");
class Abi {
    static encode(name, inputs, params) {
        const functionSignature = getFunctionSignature(name, inputs);
        const functionHash = (0, keccak256_1.keccak256)((0, strings_1.toUtf8Bytes)(functionSignature));
        const functionData = functionHash.substring(2, 10);
        const abiCoder = new abi_1.AbiCoder();
        const argumentString = abiCoder.encode(inputs, params);
        const argumentData = argumentString.substring(2);
        const inputData = `0x${functionData}${argumentData}`;
        return inputData;
    }
    static decode(outputs, data) {
        const abiCoder = new abi_1.AbiCoder();
        let params = abiCoder.decode(outputs, data);
        params = outputs.length === 1 ? params[0] : params;
        const dataToString = (it) => {
            if (Array.isArray(it)) {
                const result = [];
                for (const key in it) {
                    if (it.hasOwnProperty(key)) {
                        const v = it[key];
                        if (v) {
                            result[key] = dataToString(v);
                        }
                        else {
                            result[key] = v;
                        }
                    }
                }
                return result;
            }
            else {
                if (it) {
                    it = it.toString();
                }
            }
            return it;
        };
        params = dataToString(params);
        return params;
    }
}
exports.Abi = Abi;
function getFunctionSignature(name, inputs) {
    const types = [];
    for (const input of inputs) {
        if (input.type === 'tuple') {
            const tupleString = getFunctionSignature('', input.components);
            types.push(tupleString);
            continue;
        }
        if (input.type === 'tuple[]') {
            const tupleString = getFunctionSignature('', input.components);
            const arrayString = `${tupleString}[]`;
            types.push(arrayString);
            continue;
        }
        types.push(input.type);
    }
    const typeString = types.join(',');
    const functionSignature = `${name}(${typeString})`;
    return functionSignature;
}
