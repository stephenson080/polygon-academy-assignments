import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Loan", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneYearLoanFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const interestRate = 500;
    const Loan = await ethers.getContractFactory("LoanContract");
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("Token H", "thk", 100, 10000);
    const loanInstance = await Loan.deploy(interestRate, token.address);

    await token.sendUserSomeToken(
      loanInstance.address,
      token.totalSupply(),
      owner.address
    );

    return {
      loanInstance,
      owner,
      otherAccount,
      interestRate,
      token,
      tokenAdd: token.address,
    };
  }

  describe("Deployment", function () {
    it("Stablecoin holder sholud be equal to owner address", async function () {
      const { loanInstance, owner } = await loadFixture(
        deployOneYearLoanFixture
      );
      expect(await loanInstance.stableCoinHolder()).to.equal(owner.address);
    });

    it("Interest Rate should be equal to what was set", async function () {
      const { loanInstance, interestRate } = await loadFixture(
        deployOneYearLoanFixture
      );
      expect(await loanInstance.STABLECOIN_TO_ETHER_RATE()).to.equal(
        interestRate
      );
    });
  });

  describe("Loan Transaction", function () {
    it("New Contract Balance should be equal to old balance minus token transferred", async function () {
      const { loanInstance, token, interestRate, owner } =
        await loadFixture(deployOneYearLoanFixture);
      const oldContractBalance = ethers.utils.formatEther(
        await token.getBalance(loanInstance.address)
      );
      const tokenAmount = 40;
      const amountOFEthToSend = ethers.utils.parseEther((tokenAmount / interestRate).toString());
      await loanInstance.requestLoan(owner.address, tokenAmount, {
        value: amountOFEthToSend,
      });
      const newContractBalance = ethers.utils.formatEther(
        await token.getBalance(loanInstance.address)
      );

      const customerBal = ethers.utils.formatEther(
        await token.getBalance(owner.address)
      );

      expect(+customerBal).to.equal(+oldContractBalance - +newContractBalance)
      
    });

    it("do some task", async function () {
      const { loanInstance, otherAccount, token, owner, interestRate } = await loadFixture(
        deployOneYearLoanFixture
      );

      const oldContractBalance = ethers.utils.formatEther(
        await token.balanceOf(loanInstance.address)
      );
      const oldAcctBalance = ethers.utils.formatEther(
        await token.balanceOf(owner.address)
      );
      const oldContractEtherBalance = ethers.utils.formatEther(
        await ethers.provider.getBalance(loanInstance.address)
      );
      const oldAcctEtherBalance = ethers.utils.formatEther(
        await ethers.provider.getBalance(owner.address)
      );
      
      console.log(oldContractBalance, oldContractEtherBalance, oldAcctBalance, oldAcctEtherBalance)

      const tokenAmount = 40;
      const amountOFEthToSend = ethers.utils.parseEther((tokenAmount / interestRate).toString());

      await loanInstance.requestLoan(owner.address, tokenAmount, {
        value: amountOFEthToSend,
      });

      await token.approve(loanInstance.address, ethers.utils.parseEther(tokenAmount.toString()))

      await loanInstance.repayLoan(owner.address, {from: owner.address});

      const newContractBalance = ethers.utils.formatEther(
        await token.balanceOf(loanInstance.address)
      );

      const newAcctBalance = ethers.utils.formatEther(
        await token.balanceOf(owner.address)
      );

      const newContractEtherBalance = ethers.utils.formatEther(
        await ethers.provider.getBalance(loanInstance.address)
      );
      const newAcctEtherBalance = ethers.utils.formatEther(
        await ethers.provider.getBalance(owner.address)
      );

      console.log(newAcctBalance, newContractBalance, newAcctEtherBalance, newContractEtherBalance)
    
    });
  });

  describe("Event", function(){
    it("Should emit Request Loan event", async function () {
      const { loanInstance, otherAccount, interestRate } = await loadFixture(
        deployOneYearLoanFixture
      );
      const tokenAmount = 40;
      const amountOFEthToSend = ethers.utils.parseEther((tokenAmount / interestRate).toString());

      await expect(
        loanInstance.requestLoan(otherAccount.address, tokenAmount, { value: amountOFEthToSend })
      )
        .to.emit(loanInstance, "LoanRequest")
        .withArgs(
          otherAccount.address,
          await loanInstance.borrowers(otherAccount.address)
        );
    });
  })
    
});
