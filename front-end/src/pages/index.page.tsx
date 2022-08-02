import { Button, Container } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

type Props = {
  currentAddress: string;
};
export default function IndexPage({ currentAddress }: Props) {
  const navigate = useNavigate();
  async function connectWallet() {
    try {
      if (!window.ethereum) alert("Please Install Metamask");
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13881", // '0x3830303031'
            blockExplorerUrls: ["https://mumbai.polygonscan.com"], // ['https://mumbai.polygonscan.com']
            chainName: "Mumbai Testnet", // 'Mumbai Testnet'
            nativeCurrency: {
              decimals: 18,
              name: "Polygon",
              symbol: "MATIC",
            },
            rpcUrls: ["https://matic-mumbai.chainstacklabs.com"], // ['https://matic-mumbai.chainstacklabs.com']
          },
        ],
      });
      navigate("/wallet");
    } catch (error: any) {
      alert(`Something went wrong: ${error.message}`);
    }
  }
  return (
    <div>
      <Header
        isConnected={false}
        accountBal="0.00"
        currentAcct={currentAddress}
        connectDisconnectWallet={connectWallet}
      />
      <Container>
        <h1 style={{ textAlign: "center", margin: "40px 0 20px 0" }}>
          Please connect your Wallet to continue
        </h1>
        <div
          style={{
            margin: "10px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            onClick={connectWallet}
            color='purple'
          >
            Connect Wallet
          </Button>
        </div>
      </Container>
    </div>
  );
}
