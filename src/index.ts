require("dotenv").config();

//http dependencies
import express from "express";
const http = require("http");
const moment = require("moment-timezone");

// ethereum dependencies
import { ethers, utils as ethersUtils } from "ethers";
const { parseUnits, formatUnits } = ethersUtils;
import { legos } from "@studydefi/money-legos";
import { formatEther } from "ethers/lib/utils";
import { provider } from "./web3/provider";
import {
  getUniswapV2Prices,
  getUniswapV2WETHAddress,
} from "./exchanges/uniswapv2";
import { getKyberPrices } from "./exchanges/kyber";
import { getSushiSwapPrices } from "./exchanges/sushiswap";
import { IToken } from "./interfaces";
import { mainToken, tokens } from "./tokens";

// SERVER CONFIG
const PORT = process.env.PORT || 5000;
const app = express();
const server = http
  .createServer(app)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// ETHERS CONFIG

// Contracts

interface IPairPrices {
  inputTokenAddress: string;
  outputTokenAddress: string;
  inputAmount: ethers.BigNumber;
  outputAmount: ethers.BigNumber;
}

const getPairPrices = async ({
  inputTokenAddress,
  outputTokenAddress,
  inputAmount,
  outputAmount,
}: IPairPrices) => {
  const { amount: uniswapAmount, invertedAmount: uniswapInvertedAmount } =
    await getUniswapV2Prices({
      inputTokenAddress,
      outputTokenAddress,
      inputAmount,
      outputAmount,
    });
  const { amount: sushiswapAmount, invertedAmount: sushiswapInvertedAmount } =
    await getSushiSwapPrices({
      inputTokenAddress,
      outputTokenAddress,
      inputAmount,
      outputAmount,
    });

  const {
    expectedAmount: kyberExpectedAmount,
    slippageAmount: kyberSlippageAmount,
    invertedExpectedAmount: kyberInvertedExpectedAmount,
    invertedSlippageAmount: kyberInvertedSlippageAmount,
  } = await getKyberPrices({
    inputTokenAddress,
    outputTokenAddress,
    inputAmount,
    outputAmount,
  });

  return {
    uniswapAmount,
    uniswapInvertedAmount,
    sushiswapAmount,
    sushiswapInvertedAmount,
    kyberExpectedAmount,
    kyberSlippageAmount,
    kyberInvertedExpectedAmount,
    kyberInvertedSlippageAmount,
  };
};

interface CheckPairArgs {
  inputTokenSymbol: string;
  inputTokenAddress: string;
  inputTokenDecimals: number;
  outputTokenSymbol: string;
  outputTokenAddress: string;
  outputTokenDecimals: number;
  inputAmount: ethers.BigNumber;
  outputAmount: ethers.BigNumber;
}

async function checkPair({
  inputTokenSymbol,
  inputTokenAddress,
  inputTokenDecimals,
  outputTokenSymbol,
  outputTokenAddress,
  outputTokenDecimals,
  inputAmount,
  outputAmount,
}: CheckPairArgs) {
  const {
    kyberExpectedAmount,
    kyberInvertedExpectedAmount,
    kyberInvertedSlippageAmount,
    kyberSlippageAmount,
    uniswapAmount,
    uniswapInvertedAmount,
    sushiswapAmount,
    sushiswapInvertedAmount,
  } = await getPairPrices({
    inputTokenAddress,
    outputTokenAddress,
    inputAmount,
    outputAmount,
  });

  // const uniToKyberSwap = uniswapAmount.mul(kyberInvertedExpectedAmount);
  // const kyberToUniSwap = kyberExpectedAmount.mul(uniswapInvertedAmount);
  // console.log(formatEther(uniToKyberSwap));
  // console.log(formatEther(kyberToUniSwap));
  // console.log(
  //   `Uniswap to Kyber ${inputTokenSymbol}/${outputTokenSymbol}:${
  //     uniToKyberSwap * 100
  //   }%`
  // );
  // console.log(
  //   `Kyber to Uniswap ${inputTokenSymbol}/${outputTokenSymbol}:${
  //     kyberToUniSwap * 100
  //   }%`
  // );
  console.table([
    {
      "Input Token": inputTokenSymbol,
      "Output Token": outputTokenSymbol,
      "Input Amount": formatUnits(inputAmount),
      "Uniswap Return": formatUnits(uniswapAmount, outputTokenDecimals),
      "Sushiswap Return": formatUnits(sushiswapAmount, outputTokenDecimals),
      "Kyber Expected Rate": formatUnits(kyberExpectedAmount, 18),
      "Kyber Min Return": formatUnits(kyberSlippageAmount, 18),
      Timestamp: moment().tz("America/Chicago").format(),
    },
    {
      "Input Token": outputTokenSymbol,
      "Output Token": inputTokenSymbol,
      "Input Amount": formatUnits(inputAmount, 18),
      "Uniswap Return": formatUnits(uniswapInvertedAmount, inputTokenDecimals),
      "Sushiswap Return": formatUnits(
        sushiswapInvertedAmount,
        inputTokenDecimals
      ),
      "Kyber Expected Rate": formatUnits(kyberInvertedExpectedAmount, 18),
      "Kyber Min Return": formatUnits(kyberInvertedSlippageAmount, 18),
      Timestamp: moment().tz("America/Chicago").format(),
    },
  ]);
}

const monitorPrices = async (mainToken: IToken, tokens: IToken[]) => {
  const { symbol: mainTokenSymbol, address: mainTokenAddress } = mainToken;
  const { decimals: mainTokenDecimals } = mainToken;

  for (const token of tokens) {
    const { symbol: tokenSymbol, address: tokenAddress } = token;
    const { decimals: tokenDecimals } = token;

    await checkPair({
      inputTokenSymbol: mainTokenSymbol,
      inputTokenAddress: mainTokenAddress,
      inputTokenDecimals: mainTokenDecimals,
      outputTokenSymbol: tokenSymbol,
      outputTokenAddress: tokenAddress,
      outputTokenDecimals: tokenDecimals,
      inputAmount: parseUnits("1", mainTokenDecimals),
      outputAmount: parseUnits("1", tokenDecimals),
    });
  }
};

let priceMonitor: ReturnType<typeof setInterval>;
let monitoringPrice = false;
const run = async () => {
  async function monitorPrice() {
    if (monitoringPrice) {
      return;
    }

    console.log("Checking prices...");
    monitoringPrice = true;

    try {
      // ADD YOUR CUSTOM TOKEN PAIRS HERE!!!

      // Uniswap V2 uses wrapped eth
      await monitorPrices(mainToken, tokens);
    } catch (error) {
      console.error(error);
      monitoringPrice = false;
      clearInterval(priceMonitor);
      return;
    }

    monitoringPrice = false;
  }

  // Check markets every n seconds
  const POLLING_INTERVAL = process.env.POLLING_INTERVAL
    ? Number(process.env.POLLING_INTERVAL)
    : 3000; // 3 Seconds
  priceMonitor = setInterval(async () => {
    await monitorPrice();
  }, POLLING_INTERVAL);
};

run();
