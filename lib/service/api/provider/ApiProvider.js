"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiProvider = exports.ApiProvider = void 0;
const BaseApi_1 = require("../base/BaseApi");
/**
 * 请求基类 详细信息查看
 */
class ApiProvider {
    constructor() {
        this.baseApi = BaseApi_1.BASE_API;
    }
}
exports.ApiProvider = ApiProvider;
exports.apiProvider = new ApiProvider();
