/**
 * ABI
 */
import type { JsonFragment } from 'ethers6'
import IERC20AbiJSON from './IERC20.json'
import Multicall2AbiJSON from './Multicall2.json'


export const IERC20Abi = IERC20AbiJSON as JsonFragment[]
export const Multicall2Abi = Multicall2AbiJSON as JsonFragment[]
