import { ethers  } from "hardhat";
import {config as con} from 'dotenv'

con()

async function main() {

  const SocialMediaContract = await ethers.getContractFactory('SocialMedia')
  const instance = await SocialMediaContract.deploy()
  
  await instance.deployed()

  console.log("Contract deployed to: ", instance.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
