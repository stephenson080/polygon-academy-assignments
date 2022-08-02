import { Modal, Form, Container, Icon, Button } from "semantic-ui-react";
import { useState, useEffect } from "react";

import contract from '../blockchain/loan-contract'
import { providers } from "ethers";

type Props = {
  showModal: boolean;
  currentAddress: string;
  rate: number;
  provider: providers.Web3Provider
  closeModal: () => void;
};
interface UIState {
  tokenError: boolean;
  loading: boolean;
  addressError: boolean;
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
  provider
}: Props) {
  const [uiState, setUistate] = useState<UIState>({
    loading: false,
    tokenError: false,
    addressError: false,
  });
  const [state, setState] = useState<State>({
    collateral: "",
    tokenAmount: "",
    address: currentAddress,
  });

  async function requestALoan(){
    try {
        setUistate({
            ...uiState,
            loading: true
        })
        const signer = provider.getSigner(currentAddress)
        await contract.requestLoan(state.address, state.collateral, +state.tokenAmount, signer)
    } catch (error) {
        console.log(error)
    }
    finally {
        setUistate({
            ...uiState,
            loading: false
        })
    }
}

  return (
    <Modal size="small" dimmer open={showModal}>
      <Modal.Header style={{ backgroundColor: "blue", color: "white" }}>
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
            Fill in the Form to Request for a Loan
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
                  return
                }
                setState({
                  ...state,
                  address: e.target.value,
                });
                setUistate({ ...uiState, addressError: false });
              }}
            />
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
                const numberReG = new RegExp('/^[0-9]+$/');
                if (numberReG.test(e.target.value)) {
                  setUistate({ ...uiState, tokenError: true });
                  return;
                }
                const collateral = +e.target.value / rate;
                setState({
                  ...state,
                  tokenAmount: e.target.value,
                  collateral: collateral.toString().slice(0, 4),
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
