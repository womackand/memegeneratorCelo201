import React from "react";
import { useCallback, useState, useEffect } from "react";
import { useContractKit } from "@celo-tools/use-contractkit";
import { getUserMemes } from "../utils/minter";
import MemeCard from "./MemeCard";
import Loader from "../components/ui/Loader";
import { Row, Modal } from "react-bootstrap";

const MemeModal = ({ show, handleClose, minterContract }) => {
  const [loading, setLoading] = useState(false);
  const { address } = useContractKit();
  const [UserMemes, setUserMemes] = useState([]);

  const getUserAssets = useCallback(async () => {
    try {
      setLoading(true);
      // fetch all nfts from the smart contract
      //@ts-ignore
      const allMemes = await getUserMemes(minterContract, address);
      if (!allMemes) return;
      setUserMemes(allMemes);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract, address]);

  useEffect(() => {
    getUserAssets();
  }, [getUserAssets]);

  return (
    <Modal
      size="lg"
      show={show}
      onHide={handleClose}
      animation={false}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">Your Memes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className="mb-5">
            {!loading ? (
              <div className="container-fluid">
                <div className="row justify-content-center align-items-center gap-2">
                  <Row xs={1} sm={2} lg={3}>
                    {UserMemes.length !== 0 ? (
                      UserMemes.map((meme, key) => {
                        return (
                          <div className="col-md-3 col-10" key={key}>
                            <MemeCard
                              meme={meme}
                              key={meme.index}
                              minterContract={minterContract}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <p className="text-center display-5 text-muted">
                          No Memes Available
                        </p>
                      </>
                    )}
                  </Row>
                </div>
              </div>
            ) : (
              <Loader />
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MemeModal;
