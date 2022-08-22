import { Table, Container } from "semantic-ui-react";

export interface Transaction {
  hash: string;
  from: string;
  value: string;
  to: string;
  timestamp: string;
}

type Props = {
    allTrxs: Transaction[]
}

export default function AllTransactions({ allTrxs }: Props) {
  return (
    <div
      style={{
        margin: "30px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ textAlign: "left" }}>My Transactions</h3>
      <Container>
        {allTrxs.length === 0 ? (
          <h3>You have no Transaction yet</h3>
        ) : (
          <Table singleLine fixed style={{ width: "90%", boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }} celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={2}>S/N</Table.HeaderCell>
                <Table.HeaderCell width={3}>Transaction Hash</Table.HeaderCell>
                <Table.HeaderCell width={3}>From</Table.HeaderCell>
                <Table.HeaderCell width={3}>To</Table.HeaderCell>
                <Table.HeaderCell width={2}>Value</Table.HeaderCell>
                <Table.HeaderCell width={3}>Timestamp</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {allTrxs.map((t, i) => (
                <Table.Row key={t.hash}>
                  <Table.Cell>{++i}</Table.Cell>
                  <Table.Cell>
                    <p
                      style={{ color: "blueviolet", cursor: "pointer" }}
                      onClick={() =>
                        window.open(
                          `https://mumbai.polygonscan.com/tx/${t.hash}`
                        )
                      }
                    >
                      {t.hash}
                    </p>
                  </Table.Cell>
                  <Table.Cell>{t.from}</Table.Cell>
                  <Table.Cell>{t.to}</Table.Cell>
                  <Table.Cell>{t.value} matic</Table.Cell>
                  <Table.Cell>{t.timestamp}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  );
}
