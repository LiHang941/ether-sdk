import type { Contract } from 'ethers6'
import chunk from 'lodash/chunk'
import { Trace } from '../service'
import type { ContractCall } from './types'
import { Abi } from './abi'

export const CHUNK_SIZE = 200

export async function multicallExecute<T>(
  multicall: Contract,
  calls: ContractCall<T>[],
): Promise<T[]> {
  const callRequests = await Promise.all( calls.map(async (call) => {
    const callData = await call.callData()
    return {
      target: call.contract.address,
      callData,
    }
  }))

  const callRequestsChuck = chunk(callRequests, CHUNK_SIZE)
  try {
    const response = []
    for (const callChuck of callRequestsChuck) {
      const result = await multicall.tryAggregate.staticCall(false, callChuck)
      response.push(...result)
    }
    const callCount = calls.length
    const callResult = [] as any
    for (let i = 0; i < callCount; i++) {
      const outputs = calls[i].outputs
      const result = response[i]
      if (result.success) {
        const params = Abi.decode(outputs, result.returnData)
        callResult.push(params)
      }
      else {
        callResult.push(undefined)
      }
    }
    return callResult
  }
  catch (e) {
    Trace.error('multicall call error', e)
    throw e
  }
}
