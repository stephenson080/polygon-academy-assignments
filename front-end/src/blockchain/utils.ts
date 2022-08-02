import { providers, utils } from "ethers";
export async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error('Please Install Metamask extention')
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13881", // '0x3830303031'
            blockExplorerUrls: ["https://mumbai.polygonscan.com"], // ['https://mumbai.polygonscan.com']
            chainName: "Mumbai Testnet", // 'Mumbai Testnet'
            nativeCurrency: {
              decimals: 18,
              name: "Polygon",
              symbol: "MATIC",
            },
            rpcUrls: ["https://matic-mumbai.chainstacklabs.com"], // ['https://matic-mumbai.chainstacklabs.com']
          },
        ],
      });
      const polygonProvider = new providers.Web3Provider(window.ethereum!);

      await polygonProvider.send("eth_requestAccounts", []);
      const accounts : string[] = await polygonProvider.listAccounts();

      return {provider: polygonProvider, currentAddress: accounts[0] }
    } catch (error: any) {
      throw error
    }
}

export async function autoConnectWallet(){
    try {
        if (!window.ethereum) throw new Error('Please Install Metamask extention')
        const polygonProvider = new providers.Web3Provider(window.ethereum!);
        const network = await polygonProvider.detectNetwork();
        if (network.name !== "maticmum") throw new Error('You can Only connect Polygon Mumbai Testnet')
        const accounts = await window.ethereum!.request({
          method: "eth_accounts",
        });
        if (accounts.length <= 0) throw new Error('No Account Found. Try Opening your Metamask Wallet')
        return {provider: polygonProvider, currentAddress: accounts[0]}
      } catch (error: any) {
        console.log('jkjksjks', error)
        throw error
      }
}