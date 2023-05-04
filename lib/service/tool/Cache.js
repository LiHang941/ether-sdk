"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor(ttl) {
        this.ttl = 0;
        this.data = {};
        this.ttl = ttl;
    }
    now() { return (new Date()).getTime(); }
    nuke(key) {
        delete this.data[key];
        return this;
    }
    get(key) {
        let val = null;
        const obj = this.data[key];
        if (obj) {
            if (obj.expires === 0 || this.now() < obj.expires) {
                val = obj.val;
            }
            else {
                val = null;
                this.nuke(key);
            }
        }
        return val;
    }
    del(key) {
        const oldVal = this.get(key);
        this.nuke(key);
        return oldVal;
    }
    put(key, val = null, ttl = 0) {
        if (ttl === 0)
            ttl = this.ttl;
        const expires = (ttl === 0) ? 0 : (this.now() + ttl);
        const oldVal = this.del(key);
        if (val !== null) {
            this.data[key] = {
                expires,
                val,
            };
        }
        return oldVal;
    }
}
exports.Cache = Cache;
