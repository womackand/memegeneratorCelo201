import React from "react";
import Robot from "./Robot";
import MemeDeck from "./MemeDeck";
import MemeModal from "./MemeModal";
import { v4 as uuid4 } from "uuid";
import { useMinterContract } from "../hooks";

export default function GeneratorForm({ updateBalance }) {
  const [memeUrl, setMemeUrl] = React.useState(
    "https://i.postimg.cc/K8P7wWyd/Business-Cat2.webp"
  );
  const [btnText, setBtnText] = React.useState("Generate");
  const [sparks, setSparks] = React.useState("");
  const [vibrate, setVibrate] = React.useState("");
  const [memes, setMemes] = React.useState([]);
  const [imageHelper, setImageHelper] = React.useState("");
  const [imgFile, setImageFile] = React.useState("");
  const [memeHeader, setMemeHeader] = React.useState("");
  const [memeFooter, setMemeFooter] = React.useState("");
  const [btnDisabled, setBtnDisabled] = React.useState(false);

  const minterContract = useMinterContract();

  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    const img = new Image();
    if (imgFile) {
      img.src = imgFile;
    } else {
      img.src = memeUrl;
    }

    img.onerror = () => {
      let hasImage = false;
      setImageHelper("d-block");
      console.log("Error: ", hasImage);
    };

    img.onload = () => {
      setImageHelper("");
      // update button text
      setBtnDisabled(true);
      setBtnText("Generating...");
      // turn on robot sparks
      setSparks("blink-1");
      setSparks("blink-1");
      // start container shake
      setVibrate("vibrate-1");
      // output meme and stop animations
      setTimeout(() => {
        setBtnDisabled(false);
        setBtnText("Generate");
        setSparks("");
        setVibrate("");
        setImageFile("");
        document.getElementById("imgFile").value = null;

        // Generate meme
        setMemes((prevMemes) => [
          ...prevMemes,
          {
            id: uuid4(),
            image: imgFile ? imgFile : memeUrl,
            header: memeHeader ? memeHeader : "",
            footer: memeFooter ? memeFooter : "",
          },
        ]);
      }, 2500);
    };
  };
  return (
    <>
      <div className={"form-container " + vibrate}>
        <div className="form-container-inner">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="screw screw-top screw-top-left screw-paused"></div>
            <h1 className="mb-0">Meme Nft Generator</h1>
            <div className="screw screw-top screw-top-right screw-paused"></div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="headerText" className="d-flex">
                Header text
              </label>
              <input
                type="text"
                value={memeHeader}
                onChange={(e) => setMemeHeader(e.target.value)}
                className="form-control form-control-sm"
                id="headerText"
                maxLength="65"
                autoFocus
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="footerText">Footer text</label>
              <input
                type="text"
                value={memeFooter}
                onChange={(e) => setMemeFooter(e.target.value)}
                className="form-control form-control-sm"
                id="footerText"
                maxLength="65"
                autoComplete="off"
              />
            </div>
            <small className="text-muted">Required</small>
            <div className="form-group">
              <label htmlFor="footerText">Select an image file</label>
              <input
                type="file"
                accept="image/*"
                name="Choose Image"
                onChange={(e) =>
                  setImageFile(URL.createObjectURL(e.target.files[0]))
                }
                className="form-control form-control-sm"
                id="imgFile"
                maxLength="65"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="memeURL"
                className="d-flex justify-content-between align-items-baseline"
              >
                Or Enter An Image URL{" "}
              </label>

              <input
                type="url"
                className="form-control form-control-sm"
                id="memeURL"
                onChange={(e) => setMemeUrl(e.target.value)}
                value={memeUrl}
                placeholder="http//..."
                autoComplete="off"
                required
              />

              <small
                id="memeHelper"
                className={"form-text text-muted text-initial " + imageHelper}
              >
                <strong>Link error:</strong> No image found...
              </small>
            </div>
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                disabled={btnDisabled}
                className="btn btn-primary btn-block w-100 text-center mt-1 mb-3"
              >
                {btnText}
              </button>
            </div>
          </form>
          <div className="d-flex justify-content-between">
            <div className="screw screw-bottom screw-bottom-left screw-paused"></div>
            <div className="screw screw-bottom screw-bottom-right screw-paused"></div>
          </div>
          <Robot sparks={sparks} />
        </div>
      </div>

      <>
        <div className="d-flex your-nfts">
          <button
            onClick={handleShow}
            className="btn btn-primary btn-block text-center mt-1 mb-3"
          >
            View your memes
          </button>
        </div>
      </>

      <MemeDeck
        memes={memes}
        minterContract={minterContract}
        updateBalance={updateBalance}
      />

      {show ? (
        <MemeModal
          show={show}
          handleClose={handleClose}
          minterContract={minterContract}
        />
      ) : (
        ""
      )}
    </>
  );
}
