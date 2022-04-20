import { legos } from "@studydefi/money-legos";
import { IToken } from "./interfaces";

export const mainToken: IToken = {
  symbol: legos.erc20.weth.symbol,
  address: legos.erc20.weth.address,
  decimals: legos.erc20.weth.decimals,
};

export const tokens: IToken[] = [
  {
    symbol: legos.erc20.bat.symbol,
    address: legos.erc20.bat.address,
    decimals: legos.erc20.bat.decimals,
  },
  {
    symbol: legos.erc20.dai.symbol,
    address: legos.erc20.dai.address,
    decimals: legos.erc20.dai.decimals,
  },
  // {
  //   symbol: "KNC",
  //   address: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
  //   decimals: 18,
  // },
  {
    symbol: "LINK",
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    decimals: 18,
  },
  {
    symbol: legos.erc20.usdc.symbol,
    address: legos.erc20.usdc.address,
    decimals: legos.erc20.usdc.decimals,
  },
];
