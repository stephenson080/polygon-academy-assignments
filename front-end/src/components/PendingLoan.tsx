import { providers } from "ethers";
import { useState } from "react";
import { Button, Divider } from "semantic-ui-react";
import contract, { Loan } from "../blockchain/loan-contract";
import tokenContract from "../blockchain/USDCToken";

type Props = {
  pendingLoan: Loan | null;
  provider: providers.Web3Provider | undefined;
  currentAddress: string;
};
export default function PendingLoan({
  pendingLoan,
  provider,
  currentAddress,
}: Props) {
  const [loading, setLoading] = useState(false);
  async function approveContractToSendTokens() {
    try {
      if (!provider) throw new Error("Your are not connected to Metamask");

      setLoading(true);
      const signer = provider.getSigner(currentAddress);
      const netToken = pendingLoan!.tokenAmount - pendingLoan!.allowance;
      await tokenContract.approveContract(
        contract.address,
        netToken,
        signer
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  async function repayLoanHandler() {
    try {
      if (!provider) throw new Error("Your are not connected to Metamask");
      setLoading(true);
      const signer = provider.getSigner(currentAddress);
      await contract.repayYourLoan(currentAddress, signer);
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }
  if (!pendingLoan) return null;
  return (
    <div style={{ margin: "20px 0", backgroundColor: "white", padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          margin: "10px 0",
        }}
      >
        <h3>Pending Loan</h3>
        <Button
          onClick={() =>
            pendingLoan.allowance - pendingLoan.tokenAmount
              ? approveContractToSendTokens()
              : repayLoanHandler()
          }
          loading={loading}
          disabled={loading}
          color="purple"
        >
          {pendingLoan.allowance < pendingLoan.tokenAmount
            ? "Approve Token"
            : "Repay Loan"}
        </Button>
      </div>
      <Divider />
      <div style={{ margin: "20px 0" }}>
        <p>
          We Found A Loan which have not paid. You can only repay this loan
          before you can make another loan request
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <h4>Amount of Token to pay Back:</h4>
          <p>{pendingLoan.tokenAmount} USDC</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <h4>Interest To Pay:</h4>
          <p>{pendingLoan.interest} matic</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <h4>your Collateral:</h4>
          <p>{pendingLoan.collateral} matic</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <h5>
            <strong>Allowance</strong> (Amount of Token our Contract can
            transfer back to you):
          </h5>
          <p>{pendingLoan.allowance} USDC</p>
        </div>
        <Divider />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <h4>Net Matic to Pay you:</h4>
          <p>
            {(pendingLoan.collateral - pendingLoan.interest).toFixed(3)} matic{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
