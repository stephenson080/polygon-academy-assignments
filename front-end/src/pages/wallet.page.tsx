import "../App.css";
import { Input, Container } from "semantic-ui-react";
import { providers, utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import ErrorModal from "../components/ErrorModal";
import AllTransactions, { Transaction } from "../components/Transactions";
import Header from "../components/Header";

import { autoConnectWallet, connectWallet } from "../blockchain/utils";

declare global {
  interface Window {
    ethereum?: any;
  }
}
interface TransactionData {
  amount: string;
  receiverAdd: string;
}

function WalletPage() {
  const [currentAcct, setCurrentAcct] = useState<string>('');
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [accountBal, setAccountBal] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [trxData, setTrxdata] = useState<TransactionData>({
    amount: "",
    receiverAdd: "",
  });
  const [allTrxs, setAlltrxs] = useState<Transaction[]>([]);

  const checkNetwork = useCallback( async () => {
    if (!provider){
      setShowError(true);
      setIsConnected(false);
      return
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
  }, [provider])

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: any) => {
        setCurrentAcct(accounts[0]);
      });
      window.ethereum.on("chainChanged", (chainId: string) => {
        checkNetwork();
      });
    }
    autoConnect();
  }, []);

  const getTransactions = useCallback(async () => {
    try {
      let trxState: Transaction[] = [];
      if (isConnected) {
        const existingTrx = localStorage.getItem("trxs");
        if (!existingTrx) return;
        const trxs: string[] = JSON.parse(existingTrx);
        for (let t of trxs) {
          const res = await provider!.getTransaction(t);
          const trx: Transaction = {
            hash: res.hash,
            from: res.from,
            timestamp: res.timestamp ? res.timestamp.toString() : "",
            to: res.to ? res.to : "",
            value: res.value ? utils.formatEther(res.value) : "0.00",
          };
          trxState.push(trx);
        }
        setAlltrxs(trxState);
      }
    } catch (error) {}
  }, [isConnected, provider]);

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
  }, [provider, currentAcct, isConnected]);

  useEffect(() => {
    getTransactions();
  }, [isConnected, getTransactions]);

  useEffect(() => {
    setAcctBal();
  }, [isConnected, setAcctBal]);

  

  async function autoConnect() {
    try {
      const {provider, currentAddress} = await autoConnectWallet()
      setProvider(provider)
      setCurrentAcct(currentAddress)

      setIsConnected(true)
    } catch (error: any) {
      setIsConnected(false);
      setShowError(true)
    }
  }
  function disconnect() {
    if (isConnected) {
      setIsConnected(false)
      setCurrentAcct('')
      setAccountBal('0.0')
      return
    }
    getConnection();
  }
  async function getConnection() {
    try {
      const {provider, currentAddress} = await connectWallet();

      setProvider(provider);
      setCurrentAcct(currentAddress);
      setIsConnected(true);
      setShowError(false);
    } catch (error: any) {
      setIsConnected(false);
      setShowError(true)
    }
  }

  async function makeTransaction() {
    try {
      setLoading(true);
      const signer = provider!.getSigner(currentAcct);
      const res = await signer.sendTransaction({
        to: trxData.receiverAdd,
        value: utils.parseEther(trxData.amount),
      });
      let trans: string[] = [];
      const existingTrx = localStorage.getItem("trxs");
      if (existingTrx) {
        trans = JSON.parse(existingTrx);
      }
      trans.push(res.hash);
      localStorage.setItem("trxs", JSON.stringify(trans));
      getTransactions();
      setTrxdata({ amount: "", receiverAdd: "" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAcctBal();
      setLoading(false);
    }
  }
  if (showError) {
    return <ErrorModal retry={getConnection} />;
  }
  return (
    <div className="App">
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
          <div>
            <div
              style={{
                marginTop: "30px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3 style={{ textAlign: "left" }}>Make A Transaction</h3>
              <Input
                label={{ basic: false, content: "Address" }}
                labelPosition="right"
                placeholder="Enter Address..."
                style={{ width: "35%", margin: "15px 0" }}
                value={trxData.receiverAdd}
                onChange={(e) =>
                  setTrxdata({ ...trxData, receiverAdd: e.target.value })
                }
              />
              <Input
                action={{
                  color: "purple",
                  labelPosition: "right",
                  icon: "send",
                  content: "Send",
                  onClick: () => makeTransaction(),
                }}
                actionPosition="left"
                placeholder="Enter Amount in ether"
                style={{ width: "35%", margin: "15px 0" }}
                value={trxData.amount}
                onChange={(e) =>
                  setTrxdata({ ...trxData, amount: e.target.value })
                }
                loading={loading}
                disabled={loading}
              />
            </div>
            <AllTransactions allTrxs={allTrxs} />
          </div>
        )}
      </Container>
    </div>
  );
}

export default WalletPage;
