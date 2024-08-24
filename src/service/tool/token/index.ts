import {DEFAULT_ICON, ETH_ADDRESS} from "../../vo";
import {isNullOrUndefined} from "../Tool";
import {getCurrentAddressInfo} from "../../../Constant";
import { invariant } from '../math';

/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
export abstract class BaseCurrency {
  /**
   * Returns whether the currency is native to the chain and must be wrapped (e.g. Ether)
   */
  public abstract readonly isNative: boolean

  /**
   * Returns whether the currency is a token that is usable in MagmaSwap without wrapping
   */
  public abstract readonly isToken: boolean

  /**
   * The chain ID on which this currency resides
   */
  public readonly chainId: number

  /**
   * The decimals used in representing currency amounts
   */
  public readonly decimals: number

  /**
   * The symbol of the currency, i.e. a short textual non-unique identifier
   */
  public readonly symbol: string

  /**
   * The name of the currency, i.e. a descriptive textual non-unique identifier
   */
  public readonly name?: string

  /**
   * Constructs an instance of the base class `BaseCurrency`.
   * @param chainId the chain ID on which this currency resides
   * @param decimals decimals of the currency
   * @param symbol symbol of the currency
   * @param name of the currency
   */
  protected constructor(chainId: number, decimals: number, symbol: string, name?: string) {
    invariant(Number.isSafeInteger(chainId), 'CHAIN_ID')
    invariant(decimals >= 0 && decimals < 255 && Number.isInteger(decimals), 'DECIMALS')

    this.chainId = chainId
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
  }

  /**
   * Returns whether this currency is functionally equivalent to the other currency
   * @param other the other currency
   */
  public abstract equals(other: Token): boolean

  /**
   * Return the wrapped version of this currency that can be used with the MagmaSwap contracts. Currencies must
   * implement this to be used in MagmaSwap
   */
  public abstract get wrapped(): Token
}

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol: string
  name?: string
  logoURI?: string
}

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export class Token extends BaseCurrency {
  public readonly isNative: boolean
  public readonly isToken: boolean

  /**
   * The contract address on the chain on which this token lives
   */
  public readonly address: string

  public readonly logoURI?: string

  static fromSerialized(serializedToken: SerializedToken) {
    return new Token(serializedToken.chainId, serializedToken.address, serializedToken.decimals, serializedToken.symbol, serializedToken.name, serializedToken.logoURI)
  }

  public constructor(
    chainId: number,
    address: string,
    decimals: number,
    symbol: string,
    name?: string,
    logoURI?: string,
  ) {
    super(chainId, decimals, symbol, name)
    this.address = address
    this.logoURI = logoURI
    this.isNative = this.address === ETH_ADDRESS
    this.isToken = !this.isNative
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */
  public equals(other: Token): boolean {
    return !isNullOrUndefined(other) && this.chainId === other.chainId && this.address === other.address
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  public sortsBefore(other: Token): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS')

    // console.log('this.address', this.address, other?.address)
    // invariant(this.address !== other?.address, 'ADDRESSES')
    return this.erc20Address().toLowerCase() < other?.erc20Address().toLowerCase()
  }

  public get wrapped(): Token {
    if (this.isNative)
      throw new Error('CANNOT_WRAP_NATIVE')

    return this
  }

  public get serialize(): SerializedToken {
    return {
      address: this.address,
      chainId: this.chainId,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
      logoURI: this.logoURI,
    }
  }

  public erc20Address(): string {
    if ( this.address === ETH_ADDRESS){
      throw new Error('CANNOT_WRAP_NATIVE')
    }else {
      return this.address
    }
  }

  public iconUrl(): string {
    return this.logoURI ? this.logoURI : DEFAULT_ICON
  }

  public scanUrl(): string {
    const currentAddressInfo = getCurrentAddressInfo();
    const chainInfo = currentAddressInfo.getChainInfo(this.chainId);
    return this.address === ETH_ADDRESS ? '' : currentAddressInfo.getEtherscanAddress(chainInfo,this.address)
  }
}

