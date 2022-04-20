import { ethers } from "ethers";
import { IPairPrices } from "../../interfaces";
import { provider } from "../../web3/provider";

const sushiswap = new ethers.Contract(
  process.env.SUSHISWAP_ROUTER_ADDRESS ?? "",
  [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",

    "function WETH() external pure returns (address)",
  ],
  provider
);

export const getSushiSwapPrices = async ({
  inputTokenAddress,
  outputTokenAddress,
  inputAmount,
}: IPairPrices) => {
  const path = [inputTokenAddress, outputTokenAddress];
  const amounts = await sushiswap.getAmountsOut(inputAmount, path);
  const invertedAmounts = await sushiswap.getAmountsOut(
    inputAmount,
    path.reverse()
  );
  const amount = amounts[1];
  const invertedAmount = invertedAmounts[1];

  return { amount, invertedAmount };
};
