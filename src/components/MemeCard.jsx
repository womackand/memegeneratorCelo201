import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useContractKit } from "@celo-tools/use-contractkit";
import MemeNFTContractAddress from "../contracts/MemeNFT-address.json";
import { Card, Col, Badge, Stack } from "react-bootstrap";
import { truncateAddress } from "../utils";
import Identicon from "./ui/Identicon";
import { sendMemeToFriend } from "../utils/minter";
import {
  NotificationSuccess,
  NotificationError,
  NotificationInfo,
} from "./ui/Notifications";
import { toast } from "react-toastify";

const MemeCard = ({ meme, minterContract }) => {
  const { index, owner, stringId, image, header, footer } = meme;

  const [imgUrl, setImgUrl] = React.useState(() => "");

  const getImg = async () => {
    try {
      const res = await axios.get(image);
      const base64Url = await res.data;
      setImgUrl(() => base64Url);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getImg();
  });

  const [addressTo, setAddress] = React.useState("");
  const { performActions } = useContractKit();
  const [loading, setLoading] = React.useState(false);

  const btnDisabled = () => addressTo === "";

  const sendMeme = async () => {
    setLoading(true);
    try {
      toast.info(<NotificationInfo text="Sending meme...." />);
      await sendMemeToFriend(
        minterContract,
        performActions,
        addressTo,
        meme.index
      );
      toast.success(<NotificationSuccess text="sent successfully...." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to send meme." />);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await sendMeme();
  };

  return (
    <Col key={index}>
      <Card className=" h-150">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <a
              href={`https://alfajores-blockscout.celo-testnet.org/address/${owner}/transactions`}
              target="_blank"
              rel="noreferrer"
              className="font-monospace text-secondary"
            >
              {truncateAddress(owner)}
            </a>
            <Badge bg="secondary" className="ms-auto">
              {index}
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3 ">
          <img src={imgUrl} alt={"meme-nft"} style={{ objectFit: "fill" }} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Stack direction="horizontal" gap={1}>
            <a
              href={`https://alfajores-blockscout.celo-testnet.org/token/${MemeNFTContractAddress.MemeNFT}/instance/${index}/token-transfers`}
              target="_blank"
              rel="noreferrer"
              className="font-monospace text-secondary"
            >
              {truncateAddress(stringId)}
            </a>
          </Stack>

          <hr />
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="text" className="d-flex">
                Friend Address
              </label>
              <input
                type="text"
                value={addressTo}
                className="form-control form-control-sm"
                onChange={(e) => setAddress(e.target.value)}
                id="text"
                autoFocus
                autoComplete="off"
              />{" "}
              <button
                type="submit"
                disabled={btnDisabled()}
                className="btn btn-primary btn-block w-100 text-center mt-1 mb-3"
              >
                {loading ? (
                  <i className="fa-solid fa-spinner fa-spin-pulse fa-xl"></i>
                ) : (
                  "Send Meme"
                )}
              </button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </Col>
  );
};

MemeCard.propTypes = {
  // props passed into this component
  meme: PropTypes.instanceOf(Object).isRequired,
};

export default MemeCard;
