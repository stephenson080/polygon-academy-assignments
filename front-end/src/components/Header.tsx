import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { Container, Button, Menu } from "semantic-ui-react";

type Props = {
  isConnected: boolean;
  currentAcct: string;
  accountBal: string;
  connectDisconnectWallet: () => void;
};
export default function Header({
  isConnected,
  accountBal,
  currentAcct,
  connectDisconnectWallet,
}: Props) {
  const location = useLocation();
  return (
    <Menu inverted stackable>
      <Container>
        <Link to="/wallet">
          <Menu.Item as="h3" name="Polygon Academy" />
        </Link>

        <Link to="/wallet">
          <Menu.Item
            as="h3"
            name="Wallet"
            active={location.pathname === "/wallet" && true}
          />
        </Link>

        <Link to="/loan">
          <Menu.Item
            as="h3"
            name="Get Loan"
            active={location.pathname === "/loan" && true}
          />
        </Link>
        <Link to="/media">
          <Menu.Item
            as="h3"
            name="Blog"
            active={location.pathname === "/media" && true}
          />
        </Link>

        <Menu.Menu position="right">
          <Menu.Item as="h3">
            <strong style={{color: isConnected ? "#7CFC00" : "white"}}>{isConnected
              ? `${currentAcct.slice(0, 8)}..., Your Bal: ${accountBal} matic`
              : "No Wallet Connected"}</strong>
          </Menu.Item>
          <Menu.Item>
            <Button
              onClick={connectDisconnectWallet}
              color={isConnected ? "red" : "purple"}
            >
              {isConnected ? "Disconnect Wallet" : "ConnectWallet"}
            </Button>
          </Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>
  );
}
