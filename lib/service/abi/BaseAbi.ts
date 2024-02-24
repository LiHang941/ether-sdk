import { ConnectInfo } from '../../ConnectInfo';
import { AddressInfo } from '../vo';
import {Contract, providers} from 'ethers';
import {MulContract} from "../../mulcall";
import {Fragment, JsonFragment} from "@ethersproject/abi";

export class BaseAbi {
  protected provider: providers.Provider;
  protected connectInfo: ConnectInfo;
  protected addressInfo: AddressInfo;

  public mulContract: MulContract;
  public contract: Contract;

  constructor(connectInfo: ConnectInfo,address:string,abi:JsonFragment[] | string[] | Fragment[]) {
    this.provider = connectInfo.provider;
    this.connectInfo = connectInfo;
    this.addressInfo = connectInfo.addressInfo;

    this.mulContract = new MulContract(address, abi);
    this.contract = new Contract(address, abi, connectInfo.getWalletOrProvider());
  }


}
