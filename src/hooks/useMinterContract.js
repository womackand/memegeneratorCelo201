import { useContract } from "./useContract";
import MemeNFTAbi from "../contracts/MemeNFT.json";
import MemeNFTContractAddress from "../contracts/MemeNFT-address.json";

// export interface for NFT contract
export const useMinterContract = () =>
  useContract(MemeNFTAbi.abi, MemeNFTContractAddress.MemeNFT);
