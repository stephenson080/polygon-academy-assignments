import { Card, Icon } from "semantic-ui-react";

type Props = {
    rate: number
    tokenBal: number
}
export default function LoanContractMetaData({rate, tokenBal}: Props) {
  return (
    <Card style={{margin: '30px 0'}}>
      <Card.Content header="About Our Loan" />
      <Card.Content description={`Our Loan Contract has about ${tokenBal} USDC Token `} />
      <Card.Content extra>
        <Icon name="user" />{rate} USDC Token for 1 Matic
      </Card.Content>
    </Card>
  );
}
