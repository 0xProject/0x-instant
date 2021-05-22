import { State } from "./reducer";




export const getApproveState = (state: State) => state.approveState;
export const getAvailableTokens = (state: State) => state.availableTokens;
export const getLatestApiSwapQuote = (state: State) => state.latestApiSwapQuote;
export const getSelectedTokenIn = (state: State) => state.selectedTokenIn;
export const getSelectedTokenAmountIn = (state: State) => state.selectedTokenAmountIn;
export const getSelectedTokenOut = (state: State) => state.selectedTokenOut;
export const getSelectedTokenAmountOut = (state: State) => state.selectedTokenAmountOut;
export const getBaseCurrency = (state: State) => state.baseCurrency;
export const getEthUsdPrice = (state: State) => state.ethUsdPrice;
export const getAccount = (state: State) => state.providerState.account;
export const getSwapOrderState = (state: State) => state.swapOrderState;
export const getOrderProcessState = (state: State) => state.swapOrderState;
export const getChainId = (state: State) => state.network;
export const getWalletDisplayName = (state: State) => state.walletDisplayName;
export const getSwapStep = (state: State) => state.swapStep;