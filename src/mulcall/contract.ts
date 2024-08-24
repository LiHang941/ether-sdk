import {Fragment, FunctionFragment, type JsonFragment, type ParamType} from 'ethers6'
import {ContractCall} from "./types";
import {Abi} from "./abi";

export interface MulContractConfig {
}

export type CallFunction = (...args: Array<any>) => ContractCall<unknown>;

export class MulContract {
  private readonly _address: string
  private readonly _abi: Fragment[]
  private readonly _functions: FunctionFragment[]
  private readonly _mulContractConfig: MulContractConfig

  get address() {
    return this._address
  }

  get abi() {
    return this._abi
  }

  get functions() {
    return this._functions
  }


  get mulContractConfig(): MulContractConfig {
    return this._mulContractConfig;
  }

  constructor(address: string, abi: JsonFragment[] | string[] | Fragment[], config: MulContractConfig = undefined) {
    this._address = address

    this._abi = toFragment(abi)

    this._functions = this._abi.filter(it => it)
      .filter(x => x.type === 'function')
      .map(x => FunctionFragment.from(x))
    const callFunctions = this._functions
      .filter(x => x.stateMutability === 'pure' || x.stateMutability === 'view')

    for (const callFunction of callFunctions) {
      const {name, inputs} = callFunction
      const methodName = name + "(" + inputs.map(it => it.type).join(",") + ")"
      const getCall = makeCallFunction(this, callFunction)
      if (!this[name]) {
        defineReadOnly(this, name, getCall)
      }
      if (methodName) {
        defineReadOnly(this, methodName, getCall)
      }
    }

    if (config) {
      this._mulContractConfig = config

    } else {
      this._mulContractConfig = {}
    }
  }

  [method: string]: CallFunction | any;
}

function toFragment(abi: JsonFragment[] | string[] | Fragment[]): Fragment[] {
  return abi.map((item: JsonFragment | string | Fragment) => Fragment.from(item))
}

function makeCallFunction(contract: MulContract, callFunction: FunctionFragment): CallFunction {
  return (...params: any[]) => {
    const {address} = contract
    const call: ContractCall<unknown> = {
      contract: {
        address,
      },
      name: callFunction.name,
      inputs: callFunction.inputs as ParamType[],
      outputs: callFunction.outputs as ParamType[],
      params,
      callData(): Promise<string> {
        return Promise.resolve("")
      }
    }
    call.callData = async () => {
      return Abi.encode(callFunction.name, call.inputs, call.params)
    }
    return call
  }
}

function defineReadOnly(object: object, name: string, value: unknown) {
  Object.defineProperty(object, name, {
    enumerable: true,
    value,
    writable: false,
  })
}
