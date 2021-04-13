import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Action, actions } from '../redux/actions';
import { State } from '../redux/reducer';

import { OrderDetails, OrderDetailsProps } from '../components/order_details';
import { AsyncProcessState, BaseCurrency, Omit } from '../types';
import { OrderSwapDetails, OrderSwapDetailsProps } from '../components/order_swap_details';

type DispatchProperties = 'onBaseCurrencySwitchEth' | 'onBaseCurrencySwitchUsd';

interface ConnectedState extends Omit<OrderSwapDetailsProps, DispatchProperties> {}
const mapStateToProps = (state: State, _ownProps: LatestSwapQuoteOrderDetailsProps): ConnectedState => ({
    // use the worst case quote info
    swapQuote: state.latestApiSwapQuote,
    selectedTokenUnitAmount: state.selectedTokenAmountOut,
    ethUsdPrice: state.ethUsdPrice,
    tokenIn: state.selectedTokenIn,
    tokenOut: state.selectedTokenOut,
    isLoading: state.quoteRequestState === AsyncProcessState.Pending,
    tokenName: state.selectedTokenOut === undefined ? undefined : state.selectedTokenOut.name,
    baseCurrency: state.baseCurrency,
    account: state.providerState.account,
});

interface ConnectedDispatch extends Pick<OrderDetailsProps, DispatchProperties> {}
const mapDispatchToProps = (dispatch: Dispatch<Action>): ConnectedDispatch => ({
    onBaseCurrencySwitchEth: () => {
        dispatch(actions.updateBaseCurrency(BaseCurrency.ETH));
    },
    onBaseCurrencySwitchUsd: () => {
        dispatch(actions.updateBaseCurrency(BaseCurrency.USD));
    },
});

export interface LatestSwapQuoteOrderDetailsProps {}
export const LatestSwapQuoteOrderDetails: React.ComponentClass<LatestSwapQuoteOrderDetailsProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(OrderSwapDetails);
