import { Button, Header, Icon, Modal } from "semantic-ui-react";
type Props = {
  retry: () => void;
};
export default function ErrorModal({ retry }: Props) {
  return (
    <Modal basic open={true} size="small">
      <Header icon>
        <Icon name="archive" color="red"/>
        Error Connect to Network
      </Header>
      <Modal.Content>
        <p>
          OOPS! Please you have to connect to the Polygon testnet to use this app. Click okay to connet to the Network
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button color="green" inverted onClick={() => retry()}>
          <Icon name="checkmark" /> Connect Wallet
        </Button>
      </Modal.Actions>
    </Modal>
  );
}