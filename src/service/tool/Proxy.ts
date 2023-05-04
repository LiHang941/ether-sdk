// ERROR 栈

import { Trace } from './Tool';
import { BasicException } from '../../BasicException';
import lodash from 'lodash';
import {Cache} from './Cache';
export class ErrorInfo {
  error: Error;
  msg: string;
  method: string;
  args: any;
  target: any;
}

let availableErrorHandler: (error: ErrorInfo) => void = (error: ErrorInfo) => {
  Trace.error('availableErrorHandler', error);
};

/**
 * 注册 交易异常处理回调
 * @param errorHandler
 */
export function registerTransactionErrorHandler(errorHandler: (error: ErrorInfo) => void) {
  availableErrorHandler = errorHandler;
}

/**
 * 异常处理控制器
 * @param e
 * @param method
 * @param args
 * @param target
 */
export function errorHandlerController(e: Error, method: string, args: any, target: any) {
  try {
    const errorInfo = new ErrorInfo();
    errorInfo.error = e;
    errorInfo.method = method;
    try {
      errorInfo.args = JSON.stringify(args);
    } catch (e) {
      errorInfo.args = args;
    }
    errorInfo.target = target;

    if (e instanceof BasicException) {
      errorInfo.msg = e.msg;
    } else {
      errorInfo.msg = e.toString();
    }
    availableErrorHandler(errorInfo);
  } catch (e) {
    Trace.error(e);
  }
}

let cache = new Cache(10 * 1000);

export function clearCache() {
   cache = new Cache(10 * 1000);
}

/**
 * 对象代理
 * @param obj
 */
export function createProxy<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, propKey: string) {
      const ins = target[propKey];

      if (ins && (ins.proxyEnable || ins.logEnable || ins.methodCache)) {
        // tslint:disable-next-line:only-arrow-functions
        return function () {
          const args = arguments;

          const showError= (err)=>{
            if (ins.proxyEnable) {
              errorHandlerController(err, propKey, args, target);
            }
            if (ins.logEnable) {
              errorHandlerController(err, propKey, args, target);
              Trace.debug(`${(target.constructor as any).CACHE_KEY}.${propKey}`, 'args=', args, 'error', err);
            }
          }

          const showLog = (data)=>{
            if (ins.logEnable) {
              Trace.debug(
                `${(target.constructor as any).CACHE_KEY}.${propKey} `,
                'args=',
                args,
                'result',
                data,
              );
            }
          }

          const call = ( saveCache:(data:any)=>void =(data)=>{
            // do nothing
          })=>{
            const res = ins.apply(target, args);
            if (res instanceof Promise) {
              return new Promise((resolve, reject) => {
                res
                  .then((data) => {
                    showLog(data);
                    saveCache(data);
                    resolve(data);
                  })
                  .catch((err) => {
                    showError(err);
                    reject(err);
                  });
              });
            } else {
              showLog(res);
              saveCache(res);
              return res;
            }
          }

          // 不能使用箭头函数，获取到的 arguments 不是请求的
          try {
            if (ins.methodCache){
              const ttl = ins.methodCacheTTL
              const compiled = lodash.template(ins.methodCacheKey);
              const key = compiled(args);

              const data = cache.get(key);
              if (data){
                Trace.debug("hit cache",key,data)
                return Promise.resolve(data)
              }else {
                Trace.debug("miss cache",key)
              }
              return call((v:any)=> {
                Trace.debug("save cache",key,v,ttl)
                cache.put(key, v, ttl)
              })
            }else {
              return call()
            }
          } catch (err) {
            showError(err);
            throw err;
          }
        };
      } else {
        // 非方法对象，直接返回
        return ins;
      }
    },
  });
}
