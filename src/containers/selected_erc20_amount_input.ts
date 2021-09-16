import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ERC20AmountInput, ERC20AmountInputProps } from '../components/erc20_amount_input';
import { Action, actions } from '../redux/actions';
import { State } from '../redux/reducer';
import { ColorOption } from '../style/theme';
import {  AffiliateInfo, Omit, OrderProcessState, QuoteFetchOrigin, TokenInfo } from '../types';
import { apiQuoteUpdater } from '../util/api_quote_updater';

export interface SelectedERC20AmountInputProps {
    fontColor?: ColorOption;
    startingFontSizePx: number;
    onSelectTokenClick?: () => void;
    isInInput: boolean;
}

interface ConnectedState {
    valueIn?: BigNumber;
    valueOut?: BigNumber;
    tokenIn?: TokenInfo;
    tokenOut?: TokenInfo;
    takerAddress?: string;
    isInputDisabled: boolean;
    numberOfTokensAvailable?: number;
    canSelectOtherToken: boolean;
    affiliateInfo?: AffiliateInfo;
}

interface ConnectedDispatch {
    updateApiSwapQuote: (value?: BigNumber, tokenIn?: TokenInfo, tokenOut?: TokenInfo, isIn?: boolean, takerAddress?: string, affiliateInfo?: AffiliateInfo) => void;
}

type ConnectedProps = Omit<ERC20AmountInputProps, keyof SelectedERC20AmountInputProps>;

type FinalProps = ConnectedState & ConnectedProps & SelectedERC20AmountInputProps;

const mapStateToProps = (state: State, _ownProps: SelectedERC20AmountInputProps): ConnectedState => {
    const processState = state.swapOrderState.processState;
    const isInputEnabled = processState === OrderProcessState.None || processState === OrderProcessState.Failure;
    const isInputDisabled = !isInputEnabled;
    const selectedTokenIn = state.selectedTokenIn;
    const selectedTokenOut = state.selectedTokenOut;
    const selectedTokenAmountIn = state.selectedTokenAmountIn;
    const selectedTokenAmountOut = state.selectedTokenAmountOut;
    const affiliateInfo = state.affiliateInfo;

    const numberOfTokensAvailable = state.availableTokens === undefined ? undefined : state.availableTokens.length;
    const canSelectOtherToken =
        numberOfTokensAvailable && numberOfTokensAvailable > 1
            ? isInputEnabled || processState === OrderProcessState.Success
            : false;

    let valueIn;
    if (selectedTokenIn && selectedTokenAmountIn) {
        valueIn = Web3Wrapper.toUnitAmount(selectedTokenAmountIn, selectedTokenIn.decimals).decimalPlaces(4).precision(4);
    }
    let valueOut;
    if (selectedTokenOut && selectedTokenAmountOut) {
        valueOut = Web3Wrapper.toUnitAmount(selectedTokenAmountOut, selectedTokenOut.decimals).decimalPlaces(4).precision(4);
    }

    return {
        valueIn,
        valueOut,
        tokenIn: selectedTokenIn,
        tokenOut: selectedTokenOut,
        isInputDisabled,
        numberOfTokensAvailable,
        canSelectOtherToken,
        affiliateInfo,
    };
};

const debouncedUpdateSwapApiQuoteAsync = _.debounce(apiQuoteUpdater.updateSwapQuoteAsync.bind(apiQuoteUpdater), 200, {
    trailing: true,
}) as typeof apiQuoteUpdater.updateSwapQuoteAsync;

const mapDispatchToProps = (
    dispatch: Dispatch<Action>,
    _ownProps: SelectedERC20AmountInputProps,
): ConnectedDispatch => ({
    updateApiSwapQuote: (value, tokenIn, tokenOut, isIn, takerAddress, affiliateInfo) => {
        // Update the input
        let valueBase;
        if (isIn) {
            valueBase = Web3Wrapper.toBaseUnitAmount(value, tokenIn.decimals);
            dispatch(actions.updateSelectedTokenAmountIn(valueBase));
        } else {
            valueBase = Web3Wrapper.toBaseUnitAmount(value, tokenOut.decimals);
            dispatch(actions.updateSelectedTokenAmountOut(valueBase));
        }

        dispatch(actions.setIsIn(isIn));

        // invalidate the last swap quote.
        dispatch(actions.updateLatestApiSwapQuote(undefined));
        // reset our swap state
        dispatch(actions.setSwapOrderStateNone());

        if (valueBase !== undefined && valueBase.isGreaterThan(0) && tokenIn !== undefined && tokenOut !== undefined) {
            // even if it's debounced, give them the illusion it's loading
            dispatch(actions.setQuoteRequestStatePending());
            // tslint:disable-next-line:no-floating-promises
            debouncedUpdateSwapApiQuoteAsync( dispatch, isIn, takerAddress, tokenIn, tokenOut, valueBase, QuoteFetchOrigin.Manual,  {
                setPending: true,
                dispatchErrors: true,
            }, true, affiliateInfo);
        }
    },
});

const mergeProps = (
    connectedState: ConnectedState,
    connectedDispatch: ConnectedDispatch,
    ownProps: SelectedERC20AmountInputProps,
): FinalProps => {
    return {
        ...ownProps,
        tokenIn: connectedState.tokenIn,
        tokenOut: connectedState.tokenOut,
        valueIn: connectedState.valueIn,
        valueOut: connectedState.valueOut,
        onChange: (value?: BigNumber, tokenIn?: TokenInfo, tokenOut?: TokenInfo, isIn?: boolean, takerAddress?: string) => {
            connectedDispatch.updateApiSwapQuote(value, tokenIn, tokenOut, isIn, takerAddress, connectedState.affiliateInfo);
        },
        isInputDisabled: connectedState.isInputDisabled,
        numberOfTokensAvailable: connectedState.numberOfTokensAvailable,
        canSelectOtherToken: connectedState.canSelectOtherToken,
    };
};

export const SelectedERC20AmountInput = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
)(ERC20AmountInput);
