import { ConnectInfo } from '../../ConnectInfo';
import { AddressInfo } from '../vo';
import { Contract, providers } from 'ethers';
import { MulContract } from "../../mulcall";
import { Fragment, JsonFragment } from "@ethersproject/abi";
export declare class BaseAbi {
    protected provider: providers.Provider;
    protected connectInfo: ConnectInfo;
    protected addressInfo: AddressInfo;
    mulContract: MulContract;
    contract: Contract;
    constructor(connectInfo: ConnectInfo, address: string, abi: JsonFragment[] | string[] | Fragment[]);
}
