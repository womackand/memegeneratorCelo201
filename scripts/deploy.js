const hre = require("hardhat");

async function main() {
  const decimals = 1; // 1 decimal 0.1
  const mintFee = 1; // 0.1 celo
  const MemeNFT = await hre.ethers.getContractFactory("MemeNFT");
  const memeNFT = await MemeNFT.deploy(mintFee, decimals);

  await memeNFT.deployed();

  console.log("MemeNFTContract deployed to:", memeNFT.address);
  storeContractData(memeNFT);
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/MemeNFT-address.json",
    JSON.stringify({ MemeNFT: contract.address }, undefined, 2)
  );

  const MemeNFTContract = artifacts.readArtifactSync("MemeNFT");

  fs.writeFileSync(
    contractsDir + "/MemeNFT.json",
    JSON.stringify(MemeNFTContract, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
