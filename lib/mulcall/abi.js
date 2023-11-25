"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrUndefined = exports.Abi = void 0;
const abi_1 = require("@ethersproject/abi");
const keccak256_1 = require("@ethersproject/keccak256");
const strings_1 = require("@ethersproject/strings");
const service_1 = require("../service");
class Abi {
    static encode(name, inputs, params) {
        try {
            const functionSignature = getFunctionSignature(name, inputs);
            const functionHash = (0, keccak256_1.keccak256)((0, strings_1.toUtf8Bytes)(functionSignature));
            const functionData = functionHash.substring(2, 10);
            const abiCoder = new abi_1.AbiCoder();
            const argumentString = abiCoder.encode(inputs, params);
            const argumentData = argumentString.substring(2);
            const inputData = `0x${functionData}${argumentData}`;
            return inputData;
        }
        catch (e) {
            service_1.Trace.error('Abi encode error', name, inputs, params, e);
            throw e;
        }
    }
    static decode(outputs, data) {
        try {
            const abiCoder = new abi_1.AbiCoder();
            let params = abiCoder.decode(outputs, data);
            const newParams = [];
            for (let i = 0; i < outputs.length; i++) {
                newParams[i] = params[i];
                const output = outputs[i];
                if (typeof output !== 'string' && output.name !== '')
                    newParams[output.name] = params[i];
            }
            params = outputs.length === 1 ? params[0] : newParams;
            params = dataToString(params);
            return params;
        }
        catch (e) {
            service_1.Trace.error('Abi decode error', outputs, data, e);
            return undefined;
        }
    }
}
exports.Abi = Abi;
const dataToString = (data) => {
    if (Array.isArray(data)) {
        const result = [];
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key))
                result[key] = dataToString(data[key]);
        }
        return result;
    }
    else {
        if (isNullOrUndefined(data))
            data = undefined;
        else
            data = data.toString();
    }
    return data;
};
function isNullOrUndefined(value) {
    return value === undefined || value === null;
}
exports.isNullOrUndefined = isNullOrUndefined;
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
