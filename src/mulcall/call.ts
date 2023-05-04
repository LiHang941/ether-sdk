import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';

import { Abi } from './abi';
import { multicallAbi } from './abi/multicall';
import { ContractCall } from './types';

export async function all<T extends any[] = any[]>(
  calls: ContractCall[],
  multicallAddress: string,
  provider: Provider,
): Promise<T> {
  const multicall = new Contract(multicallAddress, multicallAbi, provider);
  const callRequests = calls.map((call) => {
    const callData = Abi.encode(call.name, call.inputs, call.params);
    return {
      target: call.contract.address,
      callData,
    };
  });
  const response = await multicall.tryAggregate(false, callRequests);
  const callCount = calls.length;
  const callResult = [] as T;

  for (let i = 0; i < callCount; i++) {
    const outputs = calls[i].outputs;
    const result = response[i];
    if (result.success) {
      const params = Abi.decode(outputs, result.returnData);
      callResult.push(params);
    } else {
      callResult.push(undefined);
    }
  }
  return callResult;
}
