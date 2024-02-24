import { providers } from "ethers";
import { ConnectInfo } from "../../ConnectInfo";
import { getCurrentConnect } from "../../WalletConnect";

/**
 * 地址信息
 */
export class AddressInfo {

  /**
   * chainID
   */
  public chainId: number;

  /**
   * 链上区块浏览器地址
   */
  public scan: string;

  public rpc: string;

  public multicall: string;


  public readonlyConnectInfoInstance: ConnectInfo = null;

  public readonlyConnectInfo(): ConnectInfo {
    const currentConnect = getCurrentConnect();
    if (currentConnect != null && currentConnect.status) {
      return currentConnect;
    }

    if (this.readonlyConnectInfoInstance == null) {
      const provider = new providers.StaticJsonRpcProvider(this.rpc,this.chainId);
      const connectInfo = new ConnectInfo();
      connectInfo.provider = provider;
      connectInfo.wallet = null;
      connectInfo.status = true;
      connectInfo.addressInfo = this;
      this.readonlyConnectInfoInstance = connectInfo;
    }
    return this.readonlyConnectInfoInstance;
  }

  getEtherscanAddress(address): string {
    return `${this.scan}/address/${address}`;
  }

  getEtherscanTx(tx): string {
    return `${this.scan}/tx/${tx}`;
  }


}
