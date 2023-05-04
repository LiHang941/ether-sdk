/**
 * ABI
 */
import IERC20Abi from './IERC20.json';
import Multicall2Abi from './Multicall2.json';
import { JsonFragment } from '@ethersproject/abi';

const IERC20 = IERC20Abi as JsonFragment[];
const Multicall2 = Multicall2Abi as JsonFragment[];


export {
  IERC20,
  Multicall2,
};
