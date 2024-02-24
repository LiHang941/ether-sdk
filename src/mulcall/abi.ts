import {AbiCoder, ParamType} from '@ethersproject/abi';
import {BytesLike} from '@ethersproject/bytes';
import {keccak256} from '@ethersproject/keccak256';
import {toUtf8Bytes} from '@ethersproject/strings';
import {Trace} from "../service";

export class Abi {
  public static encode(name: string, inputs: ParamType[], params: any[]) {
    try {
      const functionSignature = getFunctionSignature(name, inputs)
      const functionHash = keccak256(toUtf8Bytes(functionSignature))
      const functionData = functionHash.substring(2, 10)
      const abiCoder = new AbiCoder()
      const argumentString = abiCoder.encode(inputs, params)
      const argumentData = argumentString.substring(2)
      const inputData = `0x${functionData}${argumentData}`
      return inputData
    } catch (e) {
      Trace.error('Abi encode error', name, inputs, params, e)
      throw e
    }
  }
  public static decode(outputs: ReadonlyArray<string | ParamType>, data: BytesLike) {
    try {
      const abiCoder = new AbiCoder()
      let params = abiCoder.decode(outputs, data)
      const newParams: any[] = []
      for (let i = 0; i < outputs.length; i++) {
        newParams[i] = params[i]
        const output = outputs[i]
        if (typeof output !== 'string' && output.name !== '')
          (newParams as any)[output.name] = params[i]
      }
      params = outputs.length === 1 ? params[0] : newParams
      params = dataToString(params)
      return params
    } catch (e) {
      Trace.error('Abi decode error', outputs, data, e)
      return undefined
    }
  }
}
const dataToString = (data: any) => {
  if (Array.isArray(data)) {
    const result: any[] = []
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key))
        result[key] = dataToString(data[key])
    }
    return result
  } else {
    if (isNullOrUndefined(data))
      data = undefined
    else
      data = data.toString()
  }
  return data
}
export function isNullOrUndefined(value: any) {
  return value === undefined || value === null
}

function getFunctionSignature(name: string, inputs: ParamType[]): any {
  const types = []
  for (const input of inputs) {
    if (input.type === 'tuple') {
      const tupleString = getFunctionSignature('', input.components as ParamType[])
      types.push(tupleString)
      continue
    }
    if (input.type === 'tuple[]') {
      const tupleString = getFunctionSignature('', input.components as ParamType[])
      const arrayString = `${tupleString}[]`
      types.push(arrayString)
      continue
    }
    types.push(input.type)
  }
  const typeString = types.join(',')
  const functionSignature = `${name}(${typeString})`
  return functionSignature
}
