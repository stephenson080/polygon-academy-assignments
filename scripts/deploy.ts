import { ethers  } from "hardhat";
import {config as con} from 'dotenv'

con()

async function main() {

  const LoanContract = await ethers.getContractFactory("LoanContract");
  const loanContractInstance= await LoanContract.deploy(1000000, process.env.TOKEN_ADDRESS!)
  
  await loanContractInstance.deployed()

  console.log("Contract deployed to: ", loanContractInstance.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
