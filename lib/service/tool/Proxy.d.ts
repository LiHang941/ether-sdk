export declare class ErrorInfo {
    error: Error;
    msg: string;
    method: string;
    args: any;
    target: any;
}
/**
 * 注册 交易异常处理回调
 * @param errorHandler
 */
export declare function registerTransactionErrorHandler(errorHandler: (error: ErrorInfo) => void): void;
/**
 * 异常处理控制器
 * @param e
 * @param method
 * @param args
 * @param target
 */
export declare function errorHandlerController(e: Error, method: string, args: any, target: any): void;
export declare function clearCache(): void;
/**
 * 对象代理
 * @param obj
 */
export declare function createProxy<T extends object>(obj: T): T;
