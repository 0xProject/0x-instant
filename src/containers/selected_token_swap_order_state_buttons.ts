import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { SwapOrderStateButtons } from '../components/swap_order_state_buttons';
import { Action, actions } from '../redux/actions';
import { State } from '../redux/reducer';
import { AccountState, AffiliateInfo, ApproveProcessState, OrderProcessState, SwapQuoteResponse, SwapStep, TokenBalance, TokenInfo, ZeroExInstantError } from '../types';
import { analytics } from '../util/analytics';
import { errorFlasher } from '../util/error_flasher';
import { etherscanUtil } from '../util/etherscan';

interface ConnectedState {
    accountAddress?: string;
    accountEthBalanceInWei?: BigNumber;
    swapQuote?: SwapQuoteResponse;
    step: SwapStep;
    swapOrderProcessingState: OrderProcessState;
    approveProcessingState: ApproveProcessState;
    web3Wrapper: Web3Wrapper;
    affiliateInfo?: AffiliateInfo;
    selectedToken?: TokenInfo;
    tokenBalanceIn?: TokenBalance;
    tokenBalanceOut?: TokenBalance;
    onViewTransaction: () => void;
    onSuccess?: (txHash: string) => void;
}

// TODO(dave4506) expand errors and failures to be richer + other errors introducted in v3 of the protocol
interface ConnectedDispatch {
    onValidationPending: (swapQuote: SwapQuoteResponse) => void;
    onApproveValidationPending: (token: TokenInfo) => void;
    onSignatureDenied: (swapQuote: SwapQuoteResponse) => void;
    onSwapProcessing: (
        swapQuote: SwapQuoteResponse,
        txHash: string,
        startTimeUnix: number,
        expectedEndTimeUnix: number,
    ) => void;
    onSwapSuccess: (swapQuote: SwapQuoteResponse, txHash: string) => void;
    onSwapFailure: (swapQuote: SwapQuoteResponse, txHash: string) => void;
    onApproveTokenProcessing: (
        token: TokenInfo,
        txHash: string,
        startTimeUnix: number,
        expectedEndTimeUnix: number,
    ) => void;
    onApproveTokenSuccess: (token: TokenInfo, txHash: string) => void;
    onApproveTokenFailure: (token: TokenInfo, txHash: string) => void;
    onRetry: () => void;
    onValidationFail: (
        swapQuote: SwapQuoteResponse,
        errorMessage: ZeroExInstantError,
    ) => void;
    onApproveValidationFail: (
        token: TokenInfo,
        errorMessage: ZeroExInstantError,
    ) => void;
    onChangeStep: (step: SwapStep) => void;
}
export interface SelectedTokenSwapOrderStateButtonsProps {
    onShowPanelStep: (step: SwapStep) => void;
    onClosePanelStep: (step: SwapStep) => void;
}
const mapStateToProps = (state: State, _ownProps: SelectedTokenSwapOrderStateButtonsProps): ConnectedState => {
    const web3Wrapper = state.providerState.web3Wrapper;
    const chainId = state.network;
    const step = state.swapStep || SwapStep.Swap;
    const account = state.providerState.account;
    const accountAddress = account.state === AccountState.Ready ? account.address : undefined;
    const accountEthBalanceInWei = account.state === AccountState.Ready ? account.ethBalanceInWei : undefined;
    const selectedToken = state.selectedTokenIn;
    const tokenBalanceIn = state.selectedTokenInBalance;
    const tokenBalanceOut = state.selectedTokenOutBalance;
    return {
        accountAddress,
        accountEthBalanceInWei,
        swapOrderProcessingState: state.swapOrderState.processState,
        approveProcessingState: state.approveState.processState,
        web3Wrapper,
        swapQuote: state.latestApiSwapQuote,
        affiliateInfo: state.affiliateInfo,
        selectedToken,
        step,
        tokenBalanceIn,
        tokenBalanceOut,
        onSuccess: state.onSuccess,
        onViewTransaction: () => {
            if (
                state.swapOrderState.processState === OrderProcessState.Processing ||
                state.swapOrderState.processState === OrderProcessState.Success ||
                state.swapOrderState.processState === OrderProcessState.Failure
            ) {
                const etherscanUrl = etherscanUtil.getEtherScanTxnAddressIfExists(state.swapOrderState.txHash, chainId);
                if (etherscanUrl) {
                    analytics.trackTransactionViewed(state.swapOrderState.processState);

                    window.open(etherscanUrl, '_blank');
                    return;
                }
            }
            if (
                state.approveState.processState === ApproveProcessState.Processing ||
                state.approveState.processState === ApproveProcessState.Success ||
                state.approveState.processState === ApproveProcessState.Failure
            ) {
                const etherscanUrl = etherscanUtil.getEtherScanTxnAddressIfExists(state.approveState.txHash, chainId);
                if (etherscanUrl) {
                    analytics.trackApproveTransactionViewed(state.approveState.processState);
                    window.open(etherscanUrl, '_blank');
                    return;
                }
            }

        },
    };
};

const mapDispatchToProps = (
    dispatch: Dispatch<Action>,
    _ownProps: SelectedTokenSwapOrderStateButtonsProps,
): ConnectedDispatch => ({
    onValidationPending: (swapQuote: SwapQuoteResponse) => {
        dispatch(actions.setSwapOrderStateValidating());
    },
    onApproveValidationPending: (token: TokenInfo) => {
        dispatch(actions.setApproveTokenStateValidating());
    },
    onSwapProcessing: (
        swapQuote: SwapQuoteResponse,
        txHash: string,
        startTimeUnix: number,
        expectedEndTimeUnix: number,
    ) => {
        dispatch(actions.setSwapOrderStateProcessing(txHash, startTimeUnix, expectedEndTimeUnix));
    },
    onSwapSuccess: (swapQuote: SwapQuoteResponse, txHash: string) => dispatch(actions.setSwapOrderStateSuccess(txHash)),
    onSwapFailure: (swapQuote: SwapQuoteResponse, txHash: string) => dispatch(actions.setSwapOrderStateFailure(txHash)),
    onSignatureDenied: () => {
        dispatch(actions.resetAmount());
        const errorMessage = 'You denied this transaction';
        errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
    },
    onValidationFail: (swapQuote, error) => {
        dispatch(actions.setSwapOrderStateNone());
        if (error === ZeroExInstantError.InsufficientETH) {
            const errorMessage = "You don't have enough ETH";
            errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
        } else if (error === ZeroExInstantError.CouldNotSubmitTransaction) {
            const errorMessage = 'Could not submit transaction';
            errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
        } else {
            errorFlasher.flashNewErrorMessage(dispatch);
        }
    },
    onApproveValidationFail: (_token, error) => {
        dispatch(actions.setApproveTokenStateNone());
        if (error === ZeroExInstantError.InsufficientETH) {
            const errorMessage = "You don't have enough ETH";
            errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
        } else if (error === ZeroExInstantError.CouldNotSubmitTransaction) {
            const errorMessage = 'Could not submit transaction';
            errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
        } else {
            errorFlasher.flashNewErrorMessage(dispatch);
        }
    },
    onApproveTokenProcessing: (
        token: TokenInfo,
        txHash: string,
        startTimeUnix: number,
        expectedEndTimeUnix: number,
    ) => {
        dispatch(actions.setApproveTokenStateProcessing(txHash, startTimeUnix, expectedEndTimeUnix));
    },
    onApproveTokenSuccess: ( token: TokenInfo, txHash: string) => dispatch(actions.setApproveTokenStateSuccess(txHash)),
    onApproveTokenFailure: ( token: TokenInfo, txHash: string) => dispatch(actions.setApproveTokenStateFailure(txHash)),

    onRetry: () => {
        dispatch(actions.resetAmount());
    },
    onChangeStep: (step: SwapStep) => {
        dispatch(actions.setUISwapStep(step));
    },
});

const mergeProps = (
    connectedState: ConnectedState,
    connectedDispatch: ConnectedDispatch,
    ownProps: SelectedTokenSwapOrderStateButtonsProps,
) => {
    return {
        ...ownProps,
        ...connectedState,
        ...connectedDispatch,
        onSwapSuccess: (swapQuote: SwapQuoteResponse, txHash: string) => {
            connectedDispatch.onSwapSuccess(swapQuote, txHash);
            if (connectedState.onSuccess) {
                connectedState.onSuccess(txHash);
            }
        },
        onApproveTokenSuccess: (token: TokenInfo, txHash: string) => {
            connectedDispatch.onApproveTokenSuccess(token, txHash);
            if (connectedState.onSuccess) {
                connectedState.onSuccess(txHash);
            }
        },
    };
};

export const SelectedTokenSwapOrderStateButtons = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
)(SwapOrderStateButtons);
