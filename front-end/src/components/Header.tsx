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
    <Container>
      <Menu secondary stackable>
        <Link  to ='#'>
        <Menu.Item name="Polygon Academy Task 2" />
        </Link>
        
        <Link to="/wallet">
          <Menu.Item
            name="Wallet"
            active={location.pathname === "/wallet" && true}
          />
        </Link>
        
        <Link to='/loan'>
        <Menu.Item
          name="Get Loan"
          active={location.pathname === "/loan" && true}
        />
        </Link>
        <Link to='/media'>
        <Menu.Item
          name="Blog"
          active={location.pathname === "/media" && true}
        />
        </Link>

        <Menu.Menu position="right">
          <Menu.Item color={isConnected ? "green" : "orange"}>
            {isConnected ? `${currentAcct.slice(0, 8)}..., Your Bal: ${accountBal} matic`
              : "No Wallet Connected"}
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
      </Menu>
    </Container>
  );
}
