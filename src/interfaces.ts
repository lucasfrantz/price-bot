import { ethers } from "ethers";

export interface Immutables {
  factory: string;
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  maxLiquidityPerTick: ethers.BigNumber;
}

export interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

export interface IPairPrices {
  inputTokenAddress: string;
  outputTokenAddress: string;
  inputAmount: ethers.BigNumber;
}

export interface IToken {
  symbol: string;
  address: string;
  decimals: number;
}
