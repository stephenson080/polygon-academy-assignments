import { providers, utils, Contract } from "ethers";
import USDCTokenABI from "../contracts/UDSCABI.json";

class USDCToken {
  contract;
  address = '0xe11A86849d99F524cAC3E7A0Ec1241828e332C62'

  constructor() {
    const provider = new providers.Web3Provider(window.ethereum!);
    this.contract = new Contract(
      this.address,
      USDCTokenABI,
      provider
    );
  }

  async getBalanceOf(address: string) {
    const bal = await this.contract.balanceOf(address);
    return +utils.formatEther(bal);
  }

  async approveContract(
    address: string,
    tokenAmount: number,
    signer: providers.JsonRpcSigner
  ) {
    try {
      const { hash } = await this.contract
        .connect(signer)
        .approve(address, utils.parseEther(tokenAmount.toString()));
      let trans: string[] = [];
      const existingTrx = localStorage.getItem("trxs");
      if (existingTrx) {
        trans = JSON.parse(existingTrx);
      }
      trans.push(hash);
      localStorage.setItem("trxs", JSON.stringify(trans));
    } catch (error) {
      throw error;
    }
  }

  async getAllowance(owner: string, spender: string) {
    const amount = await this.contract.allowance(owner, spender);
    return +utils.formatEther(amount);
  }
}

export default new USDCToken();
