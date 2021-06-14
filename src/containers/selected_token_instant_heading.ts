import { BigNumber } from '@0x/utils';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { State } from '../redux/reducer';
import {  AsyncProcessState, OrderState, TokenBalance, TokenInfo } from '../types';

import { InstantTokenHeading } from '../components/instant_token_heading';

export interface InstantHeadingProps {
    onSelectTokenClick?: (token?: TokenInfo) => void;
    isIn: boolean;
}

interface ConnectedState {
    selectedTokenIn?: TokenInfo;
    selectedTokenInBalance?: TokenBalance;
    selectedTokenOutBalance?: TokenBalance;
    selectedTokenAmountIn?: BigNumber;
    selectedTokenOut?: TokenInfo;
    selectedTokenAmountOut?: BigNumber;
    totalEthBaseUnitAmount?: BigNumber;
    ethUsdPrice?: BigNumber;
    quoteRequestState: AsyncProcessState;
    swapOrderState: OrderState;
}

const mapStateToProps = (state: State, _ownProps: InstantHeadingProps): ConnectedState => ({
    selectedTokenIn: state.selectedTokenIn,
    selectedTokenInBalance: state.selectedTokenInBalance,
    selectedTokenAmountIn: state.selectedTokenAmountIn,
    selectedTokenOut: state.selectedTokenOut,
    selectedTokenAmountOut: state.selectedTokenAmountOut,
    selectedTokenOutBalance: state.selectedTokenOutBalance,
    totalEthBaseUnitAmount: new BigNumber(0),
    ethUsdPrice: state.ethUsdPrice,
    quoteRequestState: state.quoteRequestState,
    swapOrderState: state.swapOrderState,
});

export const SelectedTokenInstantHeading = connect(mapStateToProps)(
    InstantTokenHeading,
);
