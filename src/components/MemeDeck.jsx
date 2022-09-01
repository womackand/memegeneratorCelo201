import { useContractKit } from "@celo-tools/use-contractkit";
import React from "react";
import domtoimage from "dom-to-image";
import { uploadToIpfs, createNft } from "../utils/minter";
import { toast } from "react-toastify";
import {
  NotificationSuccess,
  NotificationInfo,
  NotificationError,
} from "./ui/Notifications";

export default function MemeDeck({ memes, minterContract, updateBalance }) {
  /* performActions : used to run smart contract interactions in order
   *  address : fetch the address of the connected wallet
   */
  const { performActions } = useContractKit();
  const [loading, setLoading] = React.useState(false);
  const [uploadData, setUploadData] = React.useState("");

  const deleteMeme = (event) => {
    if (!event.target.closest(".meme")) return;
    event.target.parentElement.remove();
  };

  const generate = async (data) => {
    // upload image to ipfs
    toast.info(<NotificationInfo text="Uploading meme...." />);
    try {
      setLoading(true);
      var node = document.getElementById(`${data.id}`);
      domtoimage.toPng(node).then(async function (blob) {
        const ipfsUrl = await uploadToIpfs(blob);
        if (!ipfsUrl) {
          toast.error(<NotificationError text="Failed to upload meme" />);
          return;
        }
        const { id, header, footer } = data;
        const _uploadData = { id, ipfsUrl, header, footer };
        setUploadData(_uploadData);
      });
    } catch (error) {
      toast.error(<NotificationError text={`${error}`} />);
      setLoading(false);
    }
  };

  const generateMeme = React.useCallback(
    async (_uploadData) => {
      try {
        // create an nft functionality
        const result = await createNft(
          minterContract,
          performActions,
          _uploadData
        );

        if (result) {
          toast.success(<NotificationSuccess text="Meme uploaded...." />);
        } else {
          toast.error(<NotificationError text="Meme not uploaded" />);
        }
        updateBalance();
      } catch (error) {
        toast.error(<NotificationError text={`${error}`} />);
      } finally {
        setLoading(false);
      }
    },
    [minterContract, performActions, updateBalance]
  );

  React.useEffect(() => {
    if (uploadData) {
      generateMeme(uploadData);
      setUploadData("");
    }
  }, [uploadData, generateMeme]);

  return (
    <>
      <>
        <div className="meme-deck d-flex flex-wrap align-items-start">
          <div className="meme-deck-scroll d-flex flex-wrap justify-content-center align-items-start">
            {memes.length !== 0 &&
              memes.map((meme) => (
                <div className="meme bounceIn" key={meme.id}>
                  <div
                    className="meme_details"
                    onClick={deleteMeme}
                    id={meme.id}
                  >
                    <span className="header-text">{meme.header}</span>
                    <span className="footer-text">{meme.footer}</span>
                    <img src={meme.image} alt="meme" />
                  </div>
                  <button
                    onClick={() => generate(meme)}
                    className="btn btn-primary w-100 btn-lg text-uppercase"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin-pulse fa-xl"></i>
                      </>
                    ) : (
                      "mint nft"
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </>
    </>
  );
}
