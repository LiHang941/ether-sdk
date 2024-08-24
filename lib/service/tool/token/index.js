"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.BaseCurrency = void 0;
const vo_1 = require("../../vo");
const Tool_1 = require("../Tool");
const Constant_1 = require("../../../Constant");
const math_1 = require("../math");
/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
class BaseCurrency {
    /**
     * Constructs an instance of the base class `BaseCurrency`.
     * @param chainId the chain ID on which this currency resides
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    constructor(chainId, decimals, symbol, name) {
        (0, math_1.invariant)(Number.isSafeInteger(chainId), 'CHAIN_ID');
        (0, math_1.invariant)(decimals >= 0 && decimals < 255 && Number.isInteger(decimals), 'DECIMALS');
        this.chainId = chainId;
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
    }
}
exports.BaseCurrency = BaseCurrency;
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
class Token extends BaseCurrency {
    static fromSerialized(serializedToken) {
        return new Token(serializedToken.chainId, serializedToken.address, serializedToken.decimals, serializedToken.symbol, serializedToken.name, serializedToken.logoURI);
    }
    constructor(chainId, address, decimals, symbol, name, logoURI) {
        super(chainId, decimals, symbol, name);
        this.address = address;
        this.logoURI = logoURI;
        this.isNative = this.address === vo_1.ETH_ADDRESS;
        this.isToken = !this.isNative;
    }
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other) {
        return !(0, Tool_1.isNullOrUndefined)(other) && this.chainId === other.chainId && this.address === other.address;
    }
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other) {
        (0, math_1.invariant)(this.chainId === other.chainId, 'CHAIN_IDS');
        // console.log('this.address', this.address, other?.address)
        // invariant(this.address !== other?.address, 'ADDRESSES')
        return this.erc20Address().toLowerCase() < other?.erc20Address().toLowerCase();
    }
    get wrapped() {
        if (this.isNative)
            throw new Error('CANNOT_WRAP_NATIVE');
        return this;
    }
    get serialize() {
        return {
            address: this.address,
            chainId: this.chainId,
            decimals: this.decimals,
            symbol: this.symbol,
            name: this.name,
            logoURI: this.logoURI,
        };
    }
    erc20Address() {
        if (this.address === vo_1.ETH_ADDRESS) {
            throw new Error('CANNOT_WRAP_NATIVE');
        }
        else {
            return this.address;
        }
    }
    iconUrl() {
        return this.logoURI ? this.logoURI : vo_1.DEFAULT_ICON;
    }
    scanUrl() {
        const currentAddressInfo = (0, Constant_1.getCurrentAddressInfo)();
        const chainInfo = currentAddressInfo.getChainInfo(this.chainId);
        return this.address === vo_1.ETH_ADDRESS ? '' : currentAddressInfo.getEtherscanAddress(chainInfo, this.address);
    }
}
exports.Token = Token;
