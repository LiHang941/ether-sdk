import { ConnectInfo, PrivateWallet, WalletConnect } from '../../src';
import { ethers } from 'ethers';


export const connect = async (env: 'dev' | 'prod' | 'arbi-dev' | 'arbi' = 'dev'): Promise<ConnectInfo> => {
  const privateKey = '';
  let rpcUrl = '';
  if (env === 'dev') {
    rpcUrl = 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
  } else if (env === 'prod') {
    rpcUrl = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
  } else if (env === 'arbi-dev') {
    rpcUrl = 'https://goerli-rollup.arbitrum.io/rpc';
  } else if (env === 'arbi') {
    rpcUrl = 'https://arb1.arbitrum.io/rpc';
  }
  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const connectProvider = new PrivateWallet();
  connectProvider.provider = provider;
  connectProvider.wallet = wallet;
  return await new WalletConnect(connectProvider).connect();
};
