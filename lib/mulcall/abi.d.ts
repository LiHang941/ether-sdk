import { ParamType } from '@ethersproject/abi';
import { BytesLike } from '@ethersproject/bytes';
export declare class Abi {
    static encode(name: string, inputs: ParamType[], params: any[]): string;
    static decode(outputs: ReadonlyArray<string | ParamType>, data: BytesLike): import("@ethersproject/abi").Result;
}
export declare function isNullOrUndefined(value: any): boolean;
