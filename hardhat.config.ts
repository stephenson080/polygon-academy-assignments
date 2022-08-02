import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import {config as con} from 'dotenv'

con()

const accounts : any[] = [process.env.ACCOUNTPK1 ,process.env.ACCOUNTPK2,  process.env.ACCOUNTPK3 ]

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {

    },
    mumbai: {
      url: process.env.MUMBAI_URL,
      accounts: accounts
    }
  }
};

export default config;
