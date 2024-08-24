import {BrowserProvider, type JsonRpcApiProvider, type Signer} from 'ethers6'
import {ConnectInfo} from './ConnectInfo'
import {Trace} from './service'
import {getCurrentAddressInfo} from './Constant'
import {BasicException} from './BasicException'


export class WalletConnect {
  // 钱包链接名称
  wallet!: any
  connectInfo!: ConnectInfo
  provider?: any

  disconnectCallBack: () => void = undefined;
  connectCallBack: () => void = undefined;

  callConnect():void {
    setTimeout(()=>{
      if (this.connectCallBack){
        try {
          this.connectCallBack()
        }catch (e){
          Trace.error(e)
        }
      }
    },0)
  }
  disConnectCall():void{
    setTimeout(()=>{
      if (this.disconnectCallBack){
        try {
          this.disconnectCallBack()
        }catch (e){
          Trace.error(e)
        }
      }
    },0)
  }

  async getChainId(): Promise<number> {
    const web3Provider = this.wallet as BrowserProvider
    return Number.parseInt((await web3Provider.getNetwork()).chainId.toString())
  }

  async getAccount(): Promise<string> {
    const web3Provider = this.wallet as BrowserProvider
    return await (await web3Provider.getSigner()).getAddress();
  }

  async getWallet(): Promise<Signer> {
    const web3Provider = this.wallet as BrowserProvider
    return await web3Provider.getSigner()
  }
  async getApiProvider(): Promise<JsonRpcApiProvider> {
    return this.wallet as BrowserProvider;
  }
   switchNetwork:(chainId: number)=>Promise<void> =(chainId)=> {
    console.log('switchNetwork',chainId)
    return Promise.resolve()
  }

  constructor(walletType: any, provider: any = undefined) {
    this.wallet = walletType
    this.provider = provider
  }

  disConnect() {
    this.disConnectCall()
    const connectInfo = this.connectInfo
    connectInfo.status = false
    connectInfo.msg = 'Check your wallet!'
    this.update()
  }

  update() {
    const connectInfo = this.connectInfo
    connectInfo.walletConnect = this
    if (typeof connectInfo.account === 'undefined' || connectInfo.account === '') {
      connectInfo.status = false
    }
    const currentAddressInfo = getCurrentAddressInfo()
    if (connectInfo.status) {
      connectInfo.account = connectInfo.account.toLowerCase()
      connectInfo.addressInfo = currentAddressInfo
      Trace.debug('connect success ', this.connectInfo.account, this.connectInfo.chainId)
      this.callConnect()
    }
    if (connectInfo.status) {
      connectInfo.clear()
    }
  }



  async init() {
    const connectInfo = this.connectInfo
    connectInfo.chainId = await this.getChainId()
    connectInfo.account = await this.getAccount()
    connectInfo.wallet = await this.getWallet()
    connectInfo.provider = await this.getApiProvider()
    connectInfo.msg = 'success'
    connectInfo.status = true
    this.update()
  }


  /**
   * 链接钱包
   * @returns ConnectInfo
   */
  async connect(): Promise<ConnectInfo> {
    try {
      const connectInfo = new ConnectInfo()
      connectInfo.status = false
      connectInfo.msg = 'Check your wallet!'
      this.connectInfo = connectInfo
      await this.init()
      return this.connectInfo
    } catch (e: any) {
      this.connectInfo.status = false
      this.connectInfo.msg = e.message || e.toString()
      this.update()
      throw e
    }
  }
}

export class ConnectManager {
  private static connectInfo: ConnectInfo
  private static walletConnect: WalletConnect

  public static chainMap: Record<string, any> = {
    rinkeby: '0x4',
    mainnet: '0x1',
    goerli: '0x5',
    sepolia: '0xaa36a7'
  }

  /**
   * 初始化
   * @param wallet
   */
  static async connect(wallet: WalletConnect): Promise<ConnectInfo> {
    ConnectManager.walletConnect = wallet
    ConnectManager.connectInfo = await wallet.connect()
    return ConnectManager.connectInfo
  }

  /**
   * 断开连接
   */
  static async disConnect() {
    if (ConnectManager.walletConnect) {
      ConnectManager.walletConnect.disConnect()
      ConnectManager.walletConnect = undefined
    }
    if (ConnectManager.connectInfo)
      ConnectManager.connectInfo = undefined
  }

  /**
   * 获取连接
   */
  static getConnect() {
    if (ConnectManager.connectInfo) {
      if (ConnectManager.connectInfo.status)
        return ConnectManager.connectInfo
    }
    throw new BasicException('Wallet not connected')
  }

  static checkConnect() {
    if (ConnectManager.connectInfo) {
      if (ConnectManager.connectInfo.status)
        return true
    }
    return false
  }

  static getWalletConnect() {
    return ConnectManager.walletConnect
  }


  static getChainName(chainId: number): string {
    const [chainName,] = Object.entries(ConnectManager.chainMap).find(([_key, value]) => {
      if (typeof value === 'string') {
        return chainId === parseInt(value, 16);
      }else {
        return chainId === parseInt(value[0].chainId,16);
      }
    })
    return chainName;
  }
}
