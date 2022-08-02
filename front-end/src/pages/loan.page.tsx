import { Container, Button, Grid } from "semantic-ui-react";
import { providers, utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import Header from "../components/Header";
import ErrorModal from "../components/ErrorModal";

import { autoConnectWallet, connectWallet } from "../blockchain/utils";
import contract, { Loan } from "../blockchain/loan-contract";
import usdcContract from "../blockchain/USDCToken";
import LoanContractMetaData from "../components/LoanContract";
import RequestLoan from "../components/RequestLoan";
import PendingLoan from "../components/PendingLoan";

type LoanContractMeta = {
  rate: number;
  pendingLoan: Loan | null;
  tokenBalance: number;
};

export default function LoanPage() {
  const [currentAcct, setCurrentAcct] = useState<string>("");
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [accountBal, setAccountBal] = useState("0.00");
  //   const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [metaData, setMetaData] = useState<LoanContractMeta>({
    rate: 0,
    pendingLoan: null,
    tokenBalance: 0,
  });

  const autoConnect = useCallback(async () => {
    try {
      const { provider, currentAddress } = await autoConnectWallet();
      setProvider(provider);
      setCurrentAcct(currentAddress);
      setIsConnected(true);
    } catch (error: any) {
      setIsConnected(false);
      setShowError(true);
    }
  }, []);

  const checkNetwork = useCallback(async () => {
    if (!provider) {
      setShowError(true);
      setIsConnected(false);
      return;
    }
    const network = await provider.detectNetwork();
    if (network.name !== "maticmum") {
      setShowError(true);
      setIsConnected(false);
    } else {
      const accounts = await provider.listAccounts();
      setCurrentAcct(accounts[0]);
      setIsConnected(true);
      setShowError(false);
    }
  }, [provider]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: any) => {
        setCurrentAcct(accounts[0]);
      });
      window.ethereum.on("chainChanged", (chainId: string) => {
        checkNetwork();
      });
      autoConnect();
    }
  }, []);
  
  const  setLoanContractData = useCallback(async () =>{
    try {
      let tokenAllowance = 0.0;
      const rate = await contract.getRate();
      const pendingLoan = await contract.getPendingLoan(currentAcct);
      const tokenBal = await usdcContract.getBalanceOf(contract.address);
      if(pendingLoan){
        tokenAllowance = await usdcContract.getAllowance(currentAcct, contract.address)
        pendingLoan.allowance = tokenAllowance
      }
      setMetaData({
        ...metaData,
        rate,
        pendingLoan: pendingLoan,
        tokenBalance: tokenBal,
      });
    } catch (error: any) {
    }
  }, [currentAcct, metaData])

  useEffect(() => {
    if (currentAcct === "") return;
    setLoanContractData();
  }, [currentAcct]);

  const setAcctBal = useCallback(async () => {
    try {
      if (isConnected) {
        const balance = await provider!.getBalance(currentAcct);
        const accountBal = utils.formatEther(balance);
        setAccountBal(accountBal.slice(0, 4));
      }
    } catch (error: any) {
      setIsConnected(false);
    }
  }, [provider, isConnected, currentAcct]);

  useEffect(() => {
    setAcctBal();
  }, [isConnected, setAcctBal]);

  function disconnect() {
    if (isConnected) {
      setIsConnected(false);
      setCurrentAcct('')
      setAccountBal('0.0')
      return;
    }
    getConnection();
  }

  if (showError) {
    return <ErrorModal retry={getConnection} />;
  }

  async function getConnection() {
    try {
      const { provider, currentAddress } = await connectWallet();

      setProvider(provider);
      setCurrentAcct(currentAddress);
      setIsConnected(true);
      setShowError(false);
    } catch (error: any) {
      setIsConnected(false);
      setShowError(true);
    }
  }
  return (
    <div>
      <Header
        isConnected={isConnected}
        accountBal={accountBal}
        currentAcct={currentAcct}
        connectDisconnectWallet={disconnect}
      />

      <Container>
        {!isConnected ? (
          <h1 style={{ margin: "50px 0" }}>
            Connect Wallet to start making Transactions
          </h1>
        ) : (
          <div style={{ margin: "30px 0" }}>
            <RequestLoan
              currentAddress={currentAcct}
              rate={metaData.rate}
              showModal={showModal}
              closeModal={() => setShowModal(false)}
              provider={provider!}
            />
            <Grid>
              <Grid.Row>
                <Grid.Column largeScreen={10} mobile={16}>
                  <PendingLoan
                    currentAddress={currentAcct}
                    provider={provider}
                    pendingLoan={metaData.pendingLoan}
                  />
                  <div style={{ margin: "30px 0" }}>
                    <Button
                      disabled={metaData.pendingLoan ? true : false}
                      color="purple"
                      onClick={() => setShowModal(true)}
                    >
                      Request A Loan Now
                    </Button>
                  </div>
                </Grid.Column>
                <Grid.Column largeScreen={6} mobile={16}>
                  <LoanContractMetaData
                    tokenBal={metaData.tokenBalance}
                    rate={metaData.rate}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        )}
      </Container>
    </div>
  );
}
