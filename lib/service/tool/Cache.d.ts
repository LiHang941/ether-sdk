export declare class Cache {
    ttl: number;
    data: {};
    constructor(ttl: number);
    now(): number;
    nuke(key: any): this;
    get(key: any): any;
    del(key: any): any;
    put(key: any, val?: any, ttl?: number): any;
}
