import { multicallAbi } from './abi/multicall';
import { MulContract } from './contract';

export function getEthBalance(address: string, multicallAddress: string) {
  const multicall = new MulContract(multicallAddress, multicallAbi);
  return multicall.getEthBalance(address);
}
