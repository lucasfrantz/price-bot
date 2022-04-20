import { ethers } from "ethers";

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL
);
