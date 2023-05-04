import { BaseService } from '../BaseService';
import { ConnectInfo } from '../../ConnectInfo';
import { ContractCall, MulContract, Provider } from '../../mulcall';
export interface ShapeWithLabel {
    [item: string]: ContractCall | string;
}
export declare class MultiCallContract extends BaseService {
    multiCallInstance: Provider;
    multicall2Instance: MulContract;
    constructor(connectInfo: ConnectInfo);
    singleCall(shapeWithLabel: ShapeWithLabel): Promise<any>;
    call(...shapeWithLabels: ShapeWithLabel[]): Promise<any[]>;
}
