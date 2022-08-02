import { providers, Contract, utils } from "ethers";
import LoanABI from "../contracts/Loan.sol/LoanContract.json";

export type Loan = {
  active: boolean;
  collateral: number;
  tokenAmount: number;
  interest: number;
  allowance: number
};

class LoanContract {
  contract;
  address = "0x4884ad275aBf41B795d1d898a96C6758eFfe5d1B";
  constructor() {
    const provider = new providers.Web3Provider(window.ethereum!);
    this.contract = new Contract(this.address, LoanABI.abi, provider);
  }

  async getRate() {
    const rateBg = await this.contract.STABLECOIN_TO_ETHER_RATE();
    return +utils.formatEther(rateBg) * Math.pow(10, 18);
  }

  async getPendingLoan(address: string) {
    const { interest, tokenAmount, active, collateral } =
      await this.contract.borrowers(address);
    if (!active) return null;
    const loan: Loan = {
      interest: +utils.formatEther(interest),
      tokenAmount: +utils.formatEther(tokenAmount) * Math.pow(10, 18),
      active,
      collateral: +utils.formatEther(collateral),
      allowance: 0.0
    };
    return loan;
  }

  async requestLoan(
    address: string,
    collateral: string,
    tokenAmount: number,
    signer: providers.JsonRpcSigner
  ) {
    try {
      const { hash } = await this.contract
        .connect(signer)
        .requestLoan(address, tokenAmount, {
          value: utils.parseEther(collateral),
        });
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

  async repayYourLoan(address: string, signer: providers.JsonRpcSigner) {
    try {
      const { hash } = await this.contract.connect(signer).repayLoan(address);
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
}

export default new LoanContract();
