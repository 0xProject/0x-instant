import { MarketBuySwapQuote } from '@0x/asset-swapper';
import { ChainId } from '@0x/contract-addresses';
import { BigNumber } from '@0x/utils';


import { LOADING_ACCOUNT, LOCKED_ACCOUNT, NO_ACCOUNT } from '../constants';

import {
    Account,
    AccountReady,
    AccountState,
    AffiliateInfo,
    ApproveProcessState,
    ApproveState,
    AsyncProcessState,
    BaseCurrency,
    DisplayStatus,
    OrderProcessState,
    OrderState,
    ProviderState,
    StandardSlidingPanelContent,
    StandardSlidingPanelSettings,
    SwapQuoteResponse,
    SwapStep,
    TokenBalance,
    TokenInfo,
} from '../types';

import { Action, ActionTypes } from './actions';

// State that is required and we have defaults for, before props are passed in
export interface DefaultState {
    network: ChainId;
    swapOrderState: OrderState;
    approveState: ApproveState;
    latestErrorDisplayStatus: DisplayStatus;
    quoteRequestState: AsyncProcessState;
    standardSlidingPanelSettings: StandardSlidingPanelSettings;
    baseCurrency: BaseCurrency;
}

// State that is required but needs to be derived from the props
interface PropsDerivedState {
    providerState: ProviderState;
}

// State that is optional
interface OptionalState {
    selectedTokenIn: TokenInfo;
    selectedTokenOut: TokenInfo;
    selectedTokenInBalance: TokenBalance;
    selectedTokenOutBalance: TokenBalance;
    availableTokens: TokenInfo[];
    tokenBalances: TokenBalance[];
    selectedTokenAmountIn: BigNumber;
    selectedTokenAmountOut: BigNumber;
    isIn: boolean;
    ethUsdPrice: BigNumber;
    latestSwapQuote: MarketBuySwapQuote;
    latestApiSwapQuote: SwapQuoteResponse;
    latestErrorMessage: string;
    affiliateInfo: AffiliateInfo;
    walletDisplayName: string;
    swapStep: SwapStep;
    stepWithApprove: boolean;
    onSuccess: (txHash: string) => void;
}

export type State = DefaultState & PropsDerivedState & Partial<OptionalState>;

export const DEFAULT_STATE: DefaultState = {
    network: ChainId.Mainnet,
    swapOrderState: { processState: OrderProcessState.None },
    approveState: { processState: ApproveProcessState.None },
    latestErrorDisplayStatus: DisplayStatus.Hidden,
    quoteRequestState: AsyncProcessState.None,
    standardSlidingPanelSettings: {
        animationState: 'none',
        content: StandardSlidingPanelContent.None,
    },
    baseCurrency: BaseCurrency.USD,
};

export const createReducer = (initialState: State) => {
    const reducer = (state: State = initialState, action: Action): State => {
        switch (action.type) {
            case ActionTypes.SetAccountStateLoading:
                return reduceStateWithAccount(state, LOADING_ACCOUNT);
            case ActionTypes.SetAccountStateLocked:
                return reduceStateWithAccount(state, LOCKED_ACCOUNT);
            case ActionTypes.SetAccountStateNone:
                return reduceStateWithAccount(state, NO_ACCOUNT);
            case ActionTypes.SetAccountStateReady: {
                const address = action.data;
                let newAccount: AccountReady = {
                    state: AccountState.Ready,
                    address,
                };
                const currentAccount = state.providerState.account;
                if (
                    currentAccount.state === AccountState.Ready &&
                    currentAccount.address === address
                ) {
                    newAccount = {
                        ...newAccount,
                        ethBalanceInWei: currentAccount.ethBalanceInWei,
                    };
                }
                return reduceStateWithAccount(state, newAccount);
            }
            case ActionTypes.UpdateAccountEthBalance: {
                const { address, ethBalanceInWei } = action.data;
                const currentAccount = state.providerState.account;
                if (
                    currentAccount.state !== AccountState.Ready ||
                    currentAccount.address !== address
                ) {
                    return state;
                } else {
                    const newAccount: AccountReady = {
                        ...currentAccount,
                        ethBalanceInWei,
                    };
                    return reduceStateWithAccount(state, newAccount);
                }
            }
            case ActionTypes.SetIsIn:
                return {
                    ...state,
                    isIn: action.data,
                };
            case ActionTypes.SetUISwapStep:
                return {
                    ...state,
                    swapStep: action.data,
                };
            case ActionTypes.UpdateEthUsdPrice:
                return {
                    ...state,
                    ethUsdPrice: action.data,
                };
            case ActionTypes.UpdateSelectedTokenAmountOut:
                return {
                    ...state,
                    selectedTokenAmountOut: action.data,
                };
            case ActionTypes.UpdateSelectedTokenAmountIn:
                return {
                    ...state,
                    selectedTokenAmountIn: action.data,
                };
            case ActionTypes.SetQuoteRequestStatePending:
                return {
                    ...state,
                    latestSwapQuote: undefined,
                    quoteRequestState: AsyncProcessState.Pending,
                };
            case ActionTypes.SetQuoteRequestStateFailure:
                return {
                    ...state,
                    latestSwapQuote: undefined,
                    quoteRequestState: AsyncProcessState.Failure,
                };
            case ActionTypes.UpdateLatestApiSwapQuote:
                const newApiSwapQuoteIfExists = action.data;

                return {
                    ...state,
                    latestApiSwapQuote: newApiSwapQuoteIfExists,
                    quoteRequestState: AsyncProcessState.Success,
                };
            case ActionTypes.SetApiQuoteRequestStatePending:
                return {
                    ...state,
                    latestApiSwapQuote: undefined,
                    quoteRequestState: AsyncProcessState.Pending,
                };
            case ActionTypes.SetApiQuoteRequestStateFailure:
                return {
                    ...state,
                    latestApiSwapQuote: undefined,
                    quoteRequestState: AsyncProcessState.Failure,
                };
            case ActionTypes.SetSwapOrderStateNone:
                return {
                    ...state,
                    swapOrderState: { processState: OrderProcessState.None },
                };
            case ActionTypes.SetSwapOrderStateValidating:
                return {
                    ...state,
                    swapOrderState: {
                        processState: OrderProcessState.Validating,
                    },
                };
            case ActionTypes.SetSwapOrderStateProcessing:
                const processingData = action.data;
                const { startTimeUnix, expectedEndTimeUnix } = processingData;
                return {
                    ...state,
                    swapOrderState: {
                        processState: OrderProcessState.Processing,
                        txHash: processingData.txHash,
                        progress: {
                            startTimeUnix,
                            expectedEndTimeUnix,
                        },
                    },
                };
            case ActionTypes.SetSwapOrderStateFailure:
                const failureTxHash = action.data;
                if ('txHash' in state.swapOrderState) {
                    if (state.swapOrderState.txHash === failureTxHash) {
                        const { txHash, progress } = state.swapOrderState;
                        return {
                            ...state,
                            swapOrderState: {
                                processState: OrderProcessState.Failure,
                                txHash,
                                progress,
                            },
                        };
                    }
                }
                return state;
            case ActionTypes.SetSwapOrderStateSuccess:
                const successTxHash = action.data;
                if ('txHash' in state.swapOrderState) {
                    if (state.swapOrderState.txHash === successTxHash) {
                        const { txHash, progress } = state.swapOrderState;
                        return {
                            ...state,
                            swapOrderState: {
                                processState: OrderProcessState.Success,
                                txHash,
                                progress,
                            },
                        };
                    }
                }
                return state;
            case ActionTypes.SetApproveTokenStateNone:
                return {
                    ...state,
                    approveState: { processState: ApproveProcessState.None },
                };
            case ActionTypes.SetApproveTokenStateValidating:
                return {
                    ...state,
                    approveState: {
                        processState: ApproveProcessState.Validating,
                    },
                };
            case ActionTypes.SetApproveTokenStateProcessing:
                return {
                    ...state,
                    approveState: {
                        processState: ApproveProcessState.Processing,
                        txHash: action.data.txHash,
                        progress: {
                            startTimeUnix: action.data.startTimeUnix,
                            expectedEndTimeUnix: action.data.expectedEndTimeUnix,
                        },
                    },
                };
            case ActionTypes.SetApproveTokenStateFailure:
                const failureApproveTxHash = action.data;
                if ('txHash' in state.approveState) {
                    if (state.approveState.txHash === failureApproveTxHash) {
                        const { txHash, progress } = state.approveState;
                        return {
                            ...state,
                            approveState: {
                                processState: ApproveProcessState.Failure,
                                txHash,
                                progress,
                            },
                        };
                    }
                }
                return state;
            case ActionTypes.SetApproveTokenStateSuccess:
                const successApproveTxHash = action.data;
                if ('txHash' in state.approveState) {
                    if (state.approveState.txHash === successApproveTxHash) {
                        const { txHash, progress } = state.approveState;
                        return {
                            ...state,
                            approveState: {
                                processState: ApproveProcessState.Success,
                                txHash,
                                progress,
                            },
                        };
                    }
                }
                return state;


            case ActionTypes.SetErrorMessage:
                return {
                    ...state,
                    latestErrorMessage: action.data,
                    latestErrorDisplayStatus: DisplayStatus.Present,
                };
            case ActionTypes.HideError:
                return {
                    ...state,
                    latestErrorDisplayStatus: DisplayStatus.Hidden,
                };
            case ActionTypes.ClearError:
                return {
                    ...state,
                    latestErrorMessage: undefined,
                    latestErrorDisplayStatus: DisplayStatus.Hidden,
                };
            case ActionTypes.UpdateSelectedTokenIn:
                return {
                    ...state,
                    selectedTokenIn: action.data,
                };
            case ActionTypes.UpdateSelectedTokenOut:
                return {
                    ...state,
                    selectedTokenOut: action.data,
                };
            case ActionTypes.UpdateSelectedTokenInBalance:
                return {
                    ...state,
                    selectedTokenInBalance: action.data,
                };
            case ActionTypes.UpdateSelectedTokenOutBalance:
                return {
                    ...state,
                    selectedTokenOutBalance: action.data,
                };
            case ActionTypes.ResetAmount:
                return {
                    ...state,
                    latestSwapQuote: undefined,
                    quoteRequestState: AsyncProcessState.None,
                    swapOrderState: { processState: OrderProcessState.None },
                    selectedTokenAmountIn: undefined,
                    selectedTokenAmountOut: undefined,
                };
            case ActionTypes.SetAvailableTokens:
                return {
                    ...state,
                    availableTokens: action.data,
                };
            case ActionTypes.OpenStandardSlidingPanel:
                return {
                    ...state,
                    standardSlidingPanelSettings: {
                        content: action.data,
                        animationState: 'slidIn',
                    },
                };
            case ActionTypes.CloseStandardSlidingPanel:
                return {
                    ...state,
                    standardSlidingPanelSettings: {
                        content: state.standardSlidingPanelSettings.content,
                        animationState: 'slidOut',
                    },
                };
            case ActionTypes.UpdateBaseCurrency:
                return {
                    ...state,
                    baseCurrency: action.data,
                };
            case ActionTypes.SetProviderState:
                return {
                    ...state,
                    providerState: action.data,
                };
            case ActionTypes.UpdateTokenBalances:
                return {
                    ...state,
                    tokenBalances: action.data,
                };
            case ActionTypes.SetIsStepWithApprove:
                return {
                    ...state,
                    stepWithApprove: action.data,
                };
            default:
                return state;
        }
    };
    return reducer;
};

const reduceStateWithAccount = (state: State, account: Account) => {
    const oldProviderState = state.providerState;
    const newProviderState: ProviderState = {
        ...oldProviderState,
        account,
    };
    return {
        ...state,
        providerState: newProviderState,
    };
};

const doesSwapQuoteMatchState = (
    swapQuote: SwapQuoteResponse,
    state: State,
): boolean => {
    const selectedTokenIn = state.selectedTokenIn;
    const selectedTokenAmountIn = state.selectedTokenAmountIn;
    const selectedTokenOut = state.selectedTokenOut;
    const selectedTokenAmountOut = state.selectedTokenAmountOut;
    // if no selectedAsset or selectedAssetAmount exists on the current state, return false
    if (
        selectedTokenIn === undefined ||
        selectedTokenAmountIn === undefined ||
        selectedTokenOut === undefined ||
        selectedTokenAmountOut === undefined
    ) {
        return false;
    }

    if (swapQuote === state.latestApiSwapQuote) {
        return true
    }


};
