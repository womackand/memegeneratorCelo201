import React from "react";
import Cover from "./components/ui/Cover";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/wallet";
import { useBalance, useMinterContract } from "./hooks";
import { useContractKit } from "@celo-tools/use-contractkit";
import GeneratorForm from "./components/GeneratorForm";
import robotImg from "./images/robot.png";
import { Nav } from "react-bootstrap";

const App = function AppWrapper() {
  /*
    address : fetch the connected wallet address
    destroy: terminate connection to user wallet
    connect : connect to the celo blockchain
   */
  const { address, destroy, connect } = useContractKit();

  //  fetch user's celo balance using hook
  const { balance, getBalance } = useBalance();

  //  initialize the NFT mint contract
  const minterContract = useMinterContract();

  return (
    <>
      <Notification />

      {address ? (
        <div className="container-fluid">
          <Nav className="justify-content-end">
            <Nav.Item>
              {/*display user wallet*/}
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <GeneratorForm
            minterContract={minterContract}
            updateBalance={getBalance}
          />
        </div>
      ) : (
        //  if user wallet is not connected display cover page
        <Cover
          name="NFT MEME GENERATOR"
          coverImg={robotImg}
          connect={connect}
        />
      )}
    </>
  );
};

export default App;
