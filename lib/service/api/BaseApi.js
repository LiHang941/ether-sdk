"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_API = exports.BaseApi = void 0;
const axios_1 = __importDefault(require("axios"));
const tool_1 = require("../tool");
const Constant_1 = require("../../Constant");
class BaseApi {
    async request(path, method, data, config = {
        headers: {},
    }) {
        return await new Promise((resolve, reject) => {
            const requestUrl = path;
            const req = {
                url: requestUrl,
                method,
                params: undefined,
                data: undefined,
                headers: {},
            };
            if (['get', 'delete'].indexOf(method.toLowerCase()) > -1) {
                req.params = data;
            }
            else {
                req.data = data;
            }
            if (config.headers) {
                req.headers = config.headers;
            }
            (0, axios_1.default)(req)
                .then((res) => {
                tool_1.Trace.debug(`request success ${method} ${requestUrl} data =`, data, `result = `, res.data);
                resolve(res.data);
            })
                .catch((err) => {
                tool_1.Trace.debug(`request error ${method} ${requestUrl} data =`, data, `error = `, err);
                const msg = 'Network Error';
                reject(msg);
            });
        });
    }
    connectInfo() {
        return (0, Constant_1.getCurrentAddressInfo)().readonlyConnectInfo();
    }
    address() {
        return (0, Constant_1.getCurrentAddressInfo)();
    }
}
exports.BaseApi = BaseApi;
exports.BASE_API = new BaseApi();
