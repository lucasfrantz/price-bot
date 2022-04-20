import { ethers } from "ethers";
import { IPairPrices } from "../../interfaces";
import { provider } from "../../web3/provider";

const uniswapV2 = new ethers.Contract(
  process.env.UNISWAPV2_ROUTER_ADDRESS ?? "",
  [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",

    "function WETH() external pure returns (address)",
  ],
  provider
);

export const getUniswapV2WETHAddress = async () => {
  return await uniswapV2.WETH();
};

export const getUniswapV2Prices = async ({
  inputTokenAddress,
  outputTokenAddress,
  inputAmount,
}: IPairPrices) => {
  const path = [inputTokenAddress, outputTokenAddress];
  const amounts = await uniswapV2.getAmountsOut(inputAmount, path);
  const invertedAmounts = await uniswapV2.getAmountsOut(
    inputAmount,
    path.reverse()
  );
  const amount = amounts[1];
  const invertedAmount = invertedAmounts[1];

  return { amount, invertedAmount };
};
