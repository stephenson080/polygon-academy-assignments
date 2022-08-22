# Polygon Academy Tasks

This project contains all polygon's academy tasks. It comes with two smart contracts, tests for the contracts, and scripst that deploys the contracts.

After cloning the repo, run:

```shell
yarn install
```

Then, Try running some of the following tasks:

```shell
yarn cmp // to compile the contracts
yarn test // to run the test scripts
yarn local // to run hardhat node locally
yarn dep:local // to deploy the loan contract on local node
yarn dep:mumbai // to deploy the loan contract on polygon mumbai testnet
yarn dep-media:local // to deploy the social-media contract on local node
yarn dep-media:mumbai // to deploy the social-media contract on polygon mumbai testnet
```

Then,

```shell
    cd front-end
    npm install
```

in the front-end folder, you can open up the loan-contract.ts and media-contract.ts files under src/blockchain folder and exchange the address class field with your deployed contract's addresses for the loan and social-media contracts respectively. Or, you can use the addresses assigned to then by default.

Next, still in the front-end folder, run:

```shell
    npm start // to start-up frontend code
```
