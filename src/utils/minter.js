import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";

const auth =
  "Basic " +
  Buffer.from(
    process.env.REACT_APP_PROJECT_ID +
      ":" +
      process.env.REACT_APP_PROJECT_SECRET
  ).toString("base64");

const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

// mint meme NFT
export const createNft = async (
  minterContract,
  performActions,
  { id, ipfsUrl, header, footer }
) => {
  let status = false;
  await performActions(async (kit) => {
    if (!ipfsUrl) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      stringId: id,
      image: ipfsUrl,
      header: header ? header : "",
      footer: footer ? footer : "",
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);

      // IPFS url for uploaded metadata
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      const mintFee = await minterContract.methods.getMintFee().call();

      // mint the NFT and save the IPFS url to the blockchain
      await minterContract.methods
        .safeMint(defaultAccount, url)
        .send({ from: defaultAccount, value: mintFee });

      status = true;
    } catch (error) {
      status = false;
    }
  });

  return status;
};

export const sendMemeToFriend = async (
  minterContract,
  performActions,
  addressTo,
  tokenID
) => {
  await performActions(async (kit) => {
    if (!addressTo) return;
    const { defaultAccount } = kit;
    try {
      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .sendMeme(addressTo, tokenID)
        .send({ from: defaultAccount });

      return transaction;
    } catch (error) {
      console.log("Error in sending meme: ", error);
    }
  });
};

// function to upload a file to IPFS
export const uploadToIpfs = async (file) => {
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

// fetch all user owned memes on the smart contract
export const getUserMemes = async (minterContract, address) => {
  try {
    const memes = [];
    const userMemes = await minterContract.methods
      .getUserMemeIds(address)
      .call();
    for (let i = 0; i < userMemes.length; i++) {
      const meme = new Promise(async (resolve) => {
        const tokenID = userMemes[i];
        const res = await minterContract.methods.tokenURI(tokenID).call();
        console.log(res);
        const meta = await fetchNftMeta(res);
        const owner = await fetchNftOwner(minterContract, tokenID);
        resolve({
          index: tokenID,
          owner: owner,
          stringId: meta?.data.stringId,
          image: meta?.data.image,
          header: meta?.data.header,
          footer: meta?.data.footer,
        });
      });
      memes.push(meme);
    }
    return Promise.all(memes);
  } catch (e) {
    console.log({ e });
  }
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};
