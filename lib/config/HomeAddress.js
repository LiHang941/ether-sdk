"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAddress = exports.setInitAddress = void 0;
const service_1 = require("../service");
let initAddressFun = (ENV) => {
    if (ENV === 'test') {
        throw new Error(`${ENV} is not support`);
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
