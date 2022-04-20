import { legos } from "@studydefi/money-legos";
import { ethers } from "ethers";
import { IPairPrices } from "../../interfaces";
import { provider } from "../../web3/provider";

const kyber = new ethers.Contract(
  legos.kyber.network.address,
  legos.kyber.network.abi,
  provider
);

export const getKyberPrices = async ({
  inputTokenAddress,
  outputTokenAddress,
  inputAmount,
  outputAmount,
}: IPairPrices) => {
  const { expectedRate: expectedAmount, slippageRate: slippageAmount } =
    await kyber.getExpectedRate(
      inputTokenAddress,
      outputTokenAddress,
      inputAmount
    );
  const {
    expectedRate: invertedExpectedAmount,
    slippageRate: invertedSlippageAmount,
  } = await kyber.getExpectedRate(
    outputTokenAddress,
    inputTokenAddress,
    outputAmount
  );

  return {
    expectedAmount,
    slippageAmount,
    invertedExpectedAmount,
    invertedSlippageAmount,
  };
};
