import type { BytesLike, ParamType } from 'ethers6';
import { ethers } from 'ethers6';
export declare class Abi {
    static encode(name: string, inputs: ParamType[], params: any[]): string;
    static decode(outputs: ReadonlyArray<string | ParamType>, data: BytesLike): ethers.Result;
}
