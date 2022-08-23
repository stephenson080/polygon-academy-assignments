import { Modal, Form, Container, Icon, Button } from "semantic-ui-react";
import { useState, useRef } from "react";
import { toast, TypeOptions } from "react-toastify";
import { v4 as uuid } from "uuid";

import contract from "../blockchain/loan-contract";
import { providers } from "ethers";

type Props = {
  showModal: boolean;
  currentAddress: string;
  rate: number;
  provider: providers.Web3Provider;
  contractTokenBal: number
  closeModal: () => void;
  refresh: () => void
};
interface UIState {
  tokenError: boolean;
  loading: boolean;
  addressError: boolean;
  readyToAddToken: boolean;
}
interface State {
  collateral: string;
  tokenAmount: string;
  address: string;
}
export default function RequestLoan({
  showModal,
  currentAddress,
  rate,
  closeModal,
  provider,
  refresh,
  contractTokenBal
}: Props) {
  const [uiState, setUistate] = useState<UIState>({
    loading: false,
    tokenError: false,
    addressError: false,
    readyToAddToken: false,
  });
  const [state, setState] = useState<State>({
    collateral: "",
    tokenAmount: "",
    address: currentAddress,
  });
  const toastRef = useRef<any>(null);

  function showToast(message: string, type?: TypeOptions, isLoading?: boolean) {
    if (!toastRef.current) {
      toastRef.current = toast(message, { isLoading, type, autoClose: false });
      return;
    }

    const newId = uuid();
    toast.update(toastRef.current, {
      type,
      autoClose: 5000,
      isLoading,
      render: message,
      toastId: newId,
    });
    toastRef.current = newId;
  }

  async function addTokenToMetamask() {
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: contract.address, // The address that the token is at.
            symbol: "USDC", // A ticker symbol or shorthand, up to 5 chars.
            decimals: "18", // The number of decimals in the token
            // image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        showToast(`Success! Token Added to Metamask`, "success", false);
      } else {
        showToast(`Token was not added`, "warning", false);
      }
    } catch (error: any) {
      showToast(JSON.parse(JSON.stringify(error.message)), "error", false);
    }
  }

  async function requestALoan() {
    try {
      setUistate({
        ...uiState,
        loading: true,
        readyToAddToken: false,
      });
      const signer = provider.getSigner(currentAddress);
      await contract.requestLoan(
        state.address,
        state.collateral,
        +state.tokenAmount,
        signer
      );
      refresh()
      setUistate({
        ...uiState,
        readyToAddToken: true,
      });
      showToast(
        `Transaction Success! ${state.tokenAmount} USDC is on it way`,
        "success",
        false
      );
    } catch (error: any) {
      showToast(JSON.parse(JSON.stringify(error.message)), "error", false);
      setUistate({
        ...uiState,
        readyToAddToken: false,
      });
    } finally {
      setUistate({
        ...uiState,
        loading: false,
      });
    }
  }

  return (
    <Modal size="small" dimmer open={showModal}>
      <Modal.Header style={{ backgroundColor: "purple", color: "white" }}>
        {" "}
        <Icon
          loading={uiState.loading}
          name={uiState.loading ? "asterisk" : "add circle"}
        />{" "}
        {uiState.loading
          ? "Processing Transaction... Please Wait!"
          : `Request Loan`}
      </Modal.Header>
      <Modal.Content>
        <Container>
          <h5 style={{ marginLeft: "28px" }}>
            Fill in the Form to Request for a Loan{" "}
              <p>
                If you have not added USDC to Metamask, you can do that{" "}
                <strong onClick={addTokenToMetamask} style={{ color: "purple", cursor: 'pointer' }}>Here</strong>
              </p>
          </h5>
          <Form
            style={{ marginTop: "55px", marginLeft: "28px" }}
            loading={uiState.loading}
            // error={uiState.error}
          >
            <Form.Input
              disabled
              error={uiState.addressError}
              type="text"
              style={{ width: "100%" }}
              label="Your Address"
              size="big"
              placeholder="enter your Address"
              value={state.address}
              onChange={(e) => {
                if (!e.target.value) {
                  setUistate({ ...uiState, addressError: true });
                  return;
                }
                setState({
                  ...state,
                  address: e.target.value,
                });
                setUistate({ ...uiState, addressError: false });
              }}
            />
            <h5>Amount of Token in Loan Contract: {contractTokenBal}</h5>
            <Form.Input
              error={uiState.tokenError}
              required
              type="text"
              style={{ width: "100%" }}
              label="Amount of Token you want"
              size="big"
              placeholder="enter Token"
              value={state.tokenAmount}
              onChange={(e) => {
                const numberReG = new RegExp("/^[0-9]+$/");
                if (numberReG.test(e.target.value)) {
                  setUistate({ ...uiState, tokenError: true });
                  return;
                }
                const collateral = +e.target.value / rate;
                if (+e.target.value > contractTokenBal){
                  setUistate({ ...uiState, tokenError: true });
                  setState({
                    ...state,
                    tokenAmount: e.target.value,
                    collateral: collateral.toString().slice(0, 10),
                  });
                  return;
                }
                
                setState({
                  ...state,
                  tokenAmount: e.target.value,
                  collateral: collateral.toString().slice(0, 10),
                });
                setUistate({ ...uiState, tokenError: false });
              }}
            />
            <Form.Input
              required
              type="text"
              style={{ width: "80%" }}
              label="Collateral (Matic)"
              size="big"
              placeholder="enter amount in matic"
              value={state.collateral}
              disabled
            />
          </Form>
        </Container>
      </Modal.Content>
      <Modal.Actions>
        <Button
          disabled={uiState.loading ? true : false}
          negative
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          disabled={uiState.loading ? true : false}
          positive
          onClick={requestALoan}
        >
          Request
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
