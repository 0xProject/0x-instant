import { SwapQuoter } from '@0x/asset-swapper';
import { BigNumber } from '@0x/utils';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ERC20AmountInput, ERC20AmountInputProps } from '../components/erc20_amount_input';

import { Action, actions } from '../redux/actions';
import { State } from '../redux/reducer';
import { ColorOption } from '../style/theme';
import {  Omit, OrderProcessState, QuoteFetchOrigin, TokenInfo } from '../types';
import { apiQuoteUpdater } from '../util/api_quote_updater';

export interface SelectedERC20AmountInputProps {
    fontColor?: ColorOption;
    startingFontSizePx: number;
    onSelectTokenClick?: (token?: TokenInfo) => void;
}

interface ConnectedState {
    value?: BigNumber;
    token?: TokenInfo;
    takerAddress?: string;
    isInputDisabled: boolean;
    numberOfTokensAvailable?: number;
    canSelectOtherToken: boolean;
}

interface ConnectedDispatch {
    updateSwapQuote: (value?: BigNumber, token?: TokenInfo, takerAddress?: string) => void;
}

type ConnectedProps = Omit<ERC20AmountInputProps, keyof SelectedERC20AmountInputProps>;

type FinalProps = ConnectedProps & SelectedERC20AmountInputProps;

const mapStateToProps = (state: State, _ownProps: SelectedERC20AmountInputProps): ConnectedState => {
    const processState = state.swapOrderState.processState;
    const isInputEnabled = processState === OrderProcessState.None || processState === OrderProcessState.Failure;
    const isInputDisabled = !isInputEnabled;
    const selectedToken = state.selectedToken;
    
    const numberOfTokensAvailable = state.availableTokens === undefined ? undefined : state.availableTokens.length;
    const canSelectOtherToken =
        numberOfTokensAvailable && numberOfTokensAvailable > 1
            ? isInputEnabled || processState === OrderProcessState.Success
            : false;

 
    return {
        value: state.selectedTokenUnitAmount,
        token: selectedToken,
        isInputDisabled,
        numberOfTokensAvailable,
        canSelectOtherToken,
    };
};

const debouncedUpdateSwapQuoteAsync = _.debounce(apiQuoteUpdater.updateSwapQuoteAsync.bind(apiQuoteUpdater), 200, {
    trailing: true,
}) as typeof apiQuoteUpdater.updateSwapQuoteAsync;

const mapDispatchToProps = (
    dispatch: Dispatch<Action>,
    _ownProps: SelectedERC20AmountInputProps,
): ConnectedDispatch => ({
    updateSwapQuote: (value, token, takerAddress) => {
        // Update the input
        dispatch(actions.updateSelectedAssetAmount(value));
        // invalidate the last swap quote.
        dispatch(actions.updateLatestSwapQuote(undefined));
        // reset our swap state
        dispatch(actions.setSwapOrderStateNone());

        if (value !== undefined && value.isGreaterThan(0) && token !== undefined) {
            // even if it's debounced, give them the illusion it's loading
            dispatch(actions.setQuoteRequestStatePending());
            // tslint:disable-next-line:no-floating-promises
            debouncedUpdateSwapQuoteAsync( dispatch, takerAddress, token, value, QuoteFetchOrigin.Manual,  {
                setPending: true,
                dispatchErrors: true,
            });
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
        token: connectedState.token,
        value: connectedState.value,
        onChange: (value?: BigNumber, token?: TokenInfo, takerAddress?: string) => {
            connectedDispatch.updateSwapQuote(value, token, takerAddress);
        },
        isInputDisabled: connectedState.isInputDisabled,
        numberOfTokensAvailable: connectedState.numberOfTokensAvailable,
        canSelectOtherToken: connectedState.canSelectOtherToken,
    };
};

export const SelectedERC20AmountInput: React.ComponentClass<SelectedERC20AmountInputProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
)(ERC20AmountInput);
