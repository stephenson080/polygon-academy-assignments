import { Container, Button, Dimmer, Loader } from "semantic-ui-react";

import { providers, utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import Header from "../components/Header";
import ErrorModal from "../components/ErrorModal";

import contract, { Post } from "../blockchain/media-contract";
import { autoConnectWallet, connectWallet } from "../blockchain/utils";
import AddPost from "../components/AddPost";
import PostCard from "../components/Post";

export default function MediaPage() {
  const [currentAcct, setCurrentAcct] = useState<string>("");
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [accountBal, setAccountBal] = useState("0.00");
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
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
      setCurrentAcct("");
      setAccountBal("0.0");
      return;
    }
    getConnection();
  }

  useEffect(() => {
    if (isConnected) {
      getAllPostsHandler();
    }
  }, [isConnected]);

  async function getAllPostsHandler() {
    try {
      const fetchedPosts = await contract.getAllPost();
      setPosts(fetchedPosts);
    } catch (error: any) {
      console.log(error.message);
    }
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

  async function likePostById(_id: string) {
    try {
      setLoading(true);
      const signer = provider?.getSigner(currentAcct);
      await contract.likePost(_id, signer!);
      setLoading(false);
    } catch (error: any) {
      console.log(error.message);
    }
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
          <div
            style={{
              width: "90%",
              margin: "20px auto",
              maxWidth: "650px",
              padding: "20px",
              backgroundColor: "white",
            }}
          >
            <AddPost
              showModal={showModal}
              closeModal={() => setShowModal(false)}
              provider={provider!}
              currentAddress={currentAcct}
            />
            <Dimmer active={loading}>
              <Loader size="massive" indeterminate>
                Please Wait...
              </Loader>
            </Dimmer>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                margin: "40px 0 20px 0",
              }}
            >
              <h3>All Feeds</h3>
              <div style={{ marginLeft: "auto" }}>
                <Button onClick={() => setShowModal(true)} color="purple">
                  Add New Post
                </Button>
              </div>
            </div>
            <div>
              {posts.map((post) => (
                <PostCard likePost={likePostById} key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
