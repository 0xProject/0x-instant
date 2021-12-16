import { BigNumber } from '@0x/utils';
import { Dispatch } from 'redux';

import {
    AccountReady,
    ActionsUnion,
    AddressAndEthBalanceInWei,
    BaseCurrency,
    ProviderState,
    ProviderType,
    StandardSlidingPanelContent,
    SwapQuoteResponse,
    SwapStep,
    TokenBalance,
    TokenInfo,
} from '../types';
import { analytics } from '../util/analytics';
import { providerStateFactory } from '../util/provider_state_factory';

import { asyncData } from './async_data';
import { State } from './reducer';

export interface PlainAction<T extends string> {
    type: T;
}

export interface ActionWithPayload<T extends string, P> extends PlainAction<T> {
    data: P;
}

export type Action = ActionsUnion<typeof actions>;

function createAction<T extends string>(type: T): PlainAction<T>;
function createAction<T extends string, P>(type: T, data: P): ActionWithPayload<T, P>;
function createAction<T extends string, P>(type: T, data?: P): PlainAction<T> | ActionWithPayload<T, P> {
    return data === undefined ? { type } : { type, data };
}

export enum ActionTypes {
    SetAccountStateLoading = 'SET_ACCOUNT_STATE_LOADING',
    SetAccountStateLocked = 'SET_ACCOUNT_STATE_LOCKED',
    SetAccountStateReady = 'SET_ACCOUNT_STATE_READY',
    SetAccountStateNone = 'SET_ACCOUNT_STATE_NONE',
    SetIsIn = 'SET_IS_IN',
    SetUISwapStep = 'SET_UI_SWAP_STEP',
    UpdateAccountEthBalance = 'UPDATE_ACCOUNT_ETH_BALANCE',
    UpdateEthUsdPrice = 'UPDATE_ETH_USD_PRICE',
    UpdateSelectedTokenAmountIn = 'UPDATE_SELECTED_TOKEN_UNIT_AMOUNT_IN',
    UpdateSelectedTokenAmountOut = 'UPDATE_SELECTED_TOKEN_UNIT_AMOUNT_OUT',
    SetSwapOrderStateNone = 'SET_SWAP_ORDER_STATE_NONE',
    SetSwapOrderStateValidating = 'SET_SWAP_ORDER_STATE_VALIDATING',
    SetSwapOrderStateProcessing = 'SET_SWAP_ORDER_STATE_PROCESSING',
    SetSwapOrderStateFailure = 'SET_SWAP_ORDER_STATE_FAILURE',
    SetSwapOrderStateSuccess = 'SET_SWAP_ORDER_STATE_SUCCESS',
    SetApproveTokenStateNone = 'SET_APPROVE_TOKEN_STATE_NONE',
    SetApproveTokenStateValidating = 'SET_APPROVE_TOKEN_STATE_VALIDATING',
    SetApproveTokenStateProcessing = 'SET_APPROVE_TOKEN_STATE_PROCESSING',
    SetApproveTokenStateFailure = 'SET_APPROVE_TOKEN_STATE_FAILURE',
    SetApproveTokenStateSuccess = 'SET_APPROVE_TOKEN_STATE_SUCCESS',
    UpdateLatestSwapQuote = 'UPDATE_LATEST_SWAP_QUOTE',
    UpdateLatestApiSwapQuote = 'UPDATE_LATEST_API_SWAP_QUOTE',
    UpdateSelectedTokenIn = 'UPDATE_SELECTED_TOKEN_IN',
    UpdateSelectedTokenInBalance = 'UPDATE_SELECTED_TOKEN_IN_BALANCE',
    UpdateSelectedTokenOutBalance = 'UPDATE_SELECTED_TOKEN_OUT_BALANCE',
    UpdateSelectedTokenOut = 'UPDATE_SELECTED_TOKEN_OUT',
    UpdateTokenBalances = 'UPDATE_TOKEN_BALANCES',
    SetAvailableTokens = 'SET_AVAILABLE_TOKENS',
    SetQuoteRequestStatePending = 'SET_QUOTE_REQUEST_STATE_PENDING',
    SetQuoteRequestStateFailure = 'SET_QUOTE_REQUEST_STATE_FAILURE',
    SetApiQuoteRequestStatePending = 'SET_API_QUOTE_REQUEST_STATE_PENDING',
    SetApiQuoteRequestStateFailure = 'SET_API_QUOTE_REQUEST_STATE_FAILURE',
    SetErrorMessage = 'SET_ERROR_MESSAGE',
    HideError = 'HIDE_ERROR',
    ClearError = 'CLEAR_ERROR',
    ResetAmount = 'RESET_AMOUNT',
    OpenStandardSlidingPanel = 'OPEN_STANDARD_SLIDING_PANEL',
    CloseStandardSlidingPanel = 'CLOSE_STANDARD_SLIDING_PANEL',
    UpdateBaseCurrency = 'UPDATE_BASE_CURRENCY',
    SetProviderState = 'SET_PROVIDER_STATE',
    SetIsStepWithApprove = 'SET_IS_STEP_WITH_APPROVE',
}

export const actions = {
    setAccountStateLoading: () => createAction(ActionTypes.SetAccountStateLoading),
    setAccountStateLocked: () => createAction(ActionTypes.SetAccountStateLocked),
    setAccountStateNone: () => createAction(ActionTypes.SetAccountStateNone),
    setAccountStateReady: (address: string) => createAction(ActionTypes.SetAccountStateReady, address),
    setIsIn: (isIn: boolean) => createAction(ActionTypes.SetIsIn, isIn),
    updateAccountEthBalance: (addressAndBalance: AddressAndEthBalanceInWei) =>
        createAction(ActionTypes.UpdateAccountEthBalance, addressAndBalance),
    updateEthUsdPrice: (price?: BigNumber) => createAction(ActionTypes.UpdateEthUsdPrice, price),
    updateSelectedTokenAmountOut: (amount?: BigNumber) => createAction(ActionTypes.UpdateSelectedTokenAmountOut, amount),
    updateSelectedTokenAmountIn: (amount?: BigNumber) => createAction(ActionTypes.UpdateSelectedTokenAmountIn, amount),
    setSwapOrderStateNone: () => createAction(ActionTypes.SetSwapOrderStateNone),
    setSwapOrderStateValidating: () => createAction(ActionTypes.SetSwapOrderStateValidating),
    setSwapOrderStateProcessing: (txHash: string, startTimeUnix: number, expectedEndTimeUnix: number) =>
        createAction(ActionTypes.SetSwapOrderStateProcessing, { txHash, startTimeUnix, expectedEndTimeUnix }),
    setSwapOrderStateFailure: (txHash: string) => createAction(ActionTypes.SetSwapOrderStateFailure, txHash),
    setSwapOrderStateSuccess: (txHash: string) => createAction(ActionTypes.SetSwapOrderStateSuccess, txHash),
    setApproveTokenStateSuccess: (txHash: string) => createAction(ActionTypes.SetApproveTokenStateSuccess, txHash),
    setApproveTokenStateNone: () => createAction(ActionTypes.SetApproveTokenStateNone),
    setApproveTokenStateValidating: () => createAction(ActionTypes.SetApproveTokenStateValidating),
    setApproveTokenStateProcessing: (txHash: string, startTimeUnix: number, expectedEndTimeUnix: number) =>
        createAction(ActionTypes.SetApproveTokenStateProcessing, { txHash, startTimeUnix, expectedEndTimeUnix }),
    setApproveTokenStateFailure: (txHash: string) => createAction(ActionTypes.SetApproveTokenStateFailure, txHash),
    updateLatestApiSwapQuote: (swapQuote?: SwapQuoteResponse) =>
        createAction(ActionTypes.UpdateLatestApiSwapQuote, swapQuote),
    updateSelectedTokenIn: (token: TokenInfo) => createAction(ActionTypes.UpdateSelectedTokenIn, token),
    updateSelectedTokenOut: (token: TokenInfo) => createAction(ActionTypes.UpdateSelectedTokenOut, token),
    updateSelectedTokenInBalance: (tokenBalance: TokenBalance) => createAction(ActionTypes.UpdateSelectedTokenInBalance, tokenBalance),
    updateSelectedTokenOutBalance: (tokenBalance: TokenBalance) => createAction(ActionTypes.UpdateSelectedTokenOutBalance, tokenBalance),
    setAvailableTokens: (availableTokens: TokenInfo[]) => createAction(ActionTypes.SetAvailableTokens, availableTokens),
    setQuoteRequestStatePending: () => createAction(ActionTypes.SetQuoteRequestStatePending),
    setQuoteRequestStateFailure: () => createAction(ActionTypes.SetQuoteRequestStateFailure),
    setApiQuoteRequestStatePending: () => createAction(ActionTypes.SetApiQuoteRequestStatePending),
    setApiQuoteRequestStateFailure: () => createAction(ActionTypes.SetApiQuoteRequestStateFailure),
    setErrorMessage: (errorMessage: string) => createAction(ActionTypes.SetErrorMessage, errorMessage),
    hideError: () => createAction(ActionTypes.HideError),
    clearError: () => createAction(ActionTypes.ClearError),
    resetAmount: () => createAction(ActionTypes.ResetAmount),
    openStandardSlidingPanel: (content: StandardSlidingPanelContent) =>
        createAction(ActionTypes.OpenStandardSlidingPanel, content),
    closeStandardSlidingPanel: () => createAction(ActionTypes.CloseStandardSlidingPanel),
    updateBaseCurrency: (baseCurrency: BaseCurrency) => createAction(ActionTypes.UpdateBaseCurrency, baseCurrency),
    setProviderState: (providerState: ProviderState) => createAction(ActionTypes.SetProviderState, providerState),
    setUISwapStep: (swapStep: SwapStep) => createAction(ActionTypes.SetUISwapStep, swapStep),
    setIsStepWithApprove: (isStepWithApprove: boolean) => createAction(ActionTypes. SetIsStepWithApprove, isStepWithApprove),
    updateTokenBalances: (tokenBalances: TokenBalance[]) => createAction(ActionTypes.UpdateTokenBalances, tokenBalances),
};

export const updateTokenSelect = (token: TokenInfo, isIn: boolean) =>
  async (dispatch: Dispatch<Action>, getState: any) => {
        if (isIn) {
            dispatch(actions.updateSelectedTokenIn(token));
        } else {
            dispatch(actions.updateSelectedTokenOut(token));
        }
        const state = getState() as State;
        const web3Wrapper = state.providerState.web3Wrapper;
        const tokenIn = state.selectedTokenIn;
        const tokenOut = state.selectedTokenOut;
        const address = (state.providerState.account as AccountReady).address;

        asyncData.fetchAccountBalanceAndDispatchToStore(address, web3Wrapper, dispatch, tokenIn, tokenOut);
        dispatch(actions.resetAmount());
};

export const unlockWalletAndDispatchToStore = (providerType: ProviderType) =>
    async (dispatch: Dispatch<Action>, getState: any) => {
        const state = getState() as State;
        const chainId = await state.providerState.web3Wrapper.getChainIdAsync();
        const newProviderState: ProviderState = providerStateFactory.getProviderStateBasedOnProviderType(
            providerType,
            chainId,
        );
        // Updates provider state
        dispatch(actions.setProviderState(newProviderState));
        // Unlocks wallet
        analytics.trackAccountUnlockRequested();
        // tslint:disable-next-line:no-floating-promises
        asyncData.fetchAccountInfoAndDispatchToStore(newProviderState, dispatch, true);
};
