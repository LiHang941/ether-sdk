/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
export declare abstract class BaseCurrency {
    /**
     * Returns whether the currency is native to the chain and must be wrapped (e.g. Ether)
     */
    abstract readonly isNative: boolean;
    /**
     * Returns whether the currency is a token that is usable in MagmaSwap without wrapping
     */
    abstract readonly isToken: boolean;
    /**
     * The chain ID on which this currency resides
     */
    readonly chainId: number;
    /**
     * The decimals used in representing currency amounts
     */
    readonly decimals: number;
    /**
     * The symbol of the currency, i.e. a short textual non-unique identifier
     */
    readonly symbol: string;
    /**
     * The name of the currency, i.e. a descriptive textual non-unique identifier
     */
    readonly name?: string;
    /**
     * Constructs an instance of the base class `BaseCurrency`.
     * @param chainId the chain ID on which this currency resides
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    protected constructor(chainId: number, decimals: number, symbol: string, name?: string);
    /**
     * Returns whether this currency is functionally equivalent to the other currency
     * @param other the other currency
     */
    abstract equals(other: Token): boolean;
    /**
     * Return the wrapped version of this currency that can be used with the MagmaSwap contracts. Currencies must
     * implement this to be used in MagmaSwap
     */
    abstract get wrapped(): Token;
}
export interface SerializedToken {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name?: string;
    logoURI?: string;
}
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export declare class Token extends BaseCurrency {
    readonly isNative: boolean;
    readonly isToken: boolean;
    /**
     * The contract address on the chain on which this token lives
     */
    readonly address: string;
    readonly logoURI?: string;
    static fromSerialized(serializedToken: SerializedToken): Token;
    constructor(chainId: number, address: string, decimals: number, symbol: string, name?: string, logoURI?: string);
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other: Token): boolean;
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other: Token): boolean;
    get wrapped(): Token;
    get serialize(): SerializedToken;
    erc20Address(): string;
    iconUrl(): string;
    scanUrl(): string;
}
