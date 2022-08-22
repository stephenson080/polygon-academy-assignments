import "../App.css";
import { Button, Container, Form } from "semantic-ui-react";
import { toast, TypeOptions } from 'react-toastify';
import {v4 as uuid} from  'uuid'
import { providers, utils } from "ethers";
import { useCallback, useEffect, useState, useRef } from "react";
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
  const [currentAcct, setCurrentAcct] = useState<string>("");
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [accountBal, setAccountBal] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const toastRef = useRef<any>(null)
  const [trxData, setTrxdata] = useState<TransactionData>({
    amount: "",
    receiverAdd: "",
  });
  const [allTrxs, setAlltrxs] = useState<Transaction[]>([]);

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
          if (!res) continue
          const trx: Transaction = {
            hash: res.hash,
            from: res.from,
            timestamp: res.timestamp ? res.timestamp.toString() : "",
            to: res.to ? res.to : "",
            value: res.value ? utils.formatEther(res.value) : "0.00",
          };
          
          trxState.push(trx);
          
        }
        
        setAlltrxs([...trxState]);
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
  }, [isConnected]);

  useEffect(() => {
    setAcctBal();
  }, [isConnected, setAcctBal]);

  async function autoConnect() {
    try {
      const { provider, currentAddress } = await autoConnectWallet();
      setProvider(provider);
      setCurrentAcct(currentAddress);

      setIsConnected(true);
    } catch (error: any) {
      setIsConnected(false);
      setShowError(true);
    }
  }
  function disconnect() {
    if (isConnected) {
      setIsConnected(false);
      setCurrentAcct("");
      setAccountBal("0.0");
      return;
    }
    getConnection();
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

  async function makeTransaction() {
    try {
      setLoading(true);
      showToast('Please wait... Your Transaction is being processed', undefined, true)
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
      showToast('Transaction Success! Your assets is on it way', 'success', false)
      setTrxdata({ amount: "", receiverAdd: "" });
      
    } catch (error: any) {
      showToast(JSON.parse(JSON.stringify(error.message)),'error', false)
    } finally {
      setAcctBal();
      setLoading(false);
    }
  }

  function showToast(message: string, type?: TypeOptions, isLoading?: boolean ){
    if (!toastRef.current){
      toastRef.current = toast(message, { isLoading, type, autoClose: false  })
      return
    }
    
    const newId = uuid()
    toast.update(toastRef.current, { type, autoClose: 5000, isLoading, render: message, toastId: newId})
    toastRef.current = newId
  }
  if (showError) {
    return <ErrorModal retry={getConnection} />;
  }
  return (
    <div style={{ backgroundColor: "whitesmoke" }}>
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
                width: "90%",
                margin: "20px auto",
                maxWidth: "380px",
                padding: "20px",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                borderRadius: "10px",
              }}
            >
              <h3 style={{ textAlign: "left" }}>Make A Transaction</h3>
              <Form
                style={{ marginTop: "20px" }}
                // error={uiState.error}
              >
                <Form.Input
                  // error={uiState.titleError}
                  required
                  type="text"
                  style={{ width: "100%" }}
                  label="Receiver's Address"
                  size="big"
                  placeholder="Enter Address..."
                  value={trxData.receiverAdd}
                  onChange={(e) =>
                    setTrxdata({ ...trxData, receiverAdd: e.target.value })
                  }
                />
                <Form.Input
                  // error={uiState.titleError}
                  required
                  type="text"
                  style={{ width: "100%" }}
                  label="Amount"
                  size="big"
                  placeholder="Enter Amount in Matic"
                  value={trxData.amount}
                  onChange={(e) =>
                    setTrxdata({ ...trxData, amount: e.target.value })
                  }
                />
                <Button
                  disabled={loading}
                  color='purple'
                  fluid
                  onClick={makeTransaction}
                >
                  Transact
                </Button>
              </Form>
            </div>
            <AllTransactions allTrxs={allTrxs} />
            <h1></h1>
          </div>
        )}
      </Container>
    </div>
  );
}

export default WalletPage;
