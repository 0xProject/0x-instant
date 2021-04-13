

import * as React from 'react';
import { connect } from 'react-redux';

import { State } from '../redux/reducer';


import { ReviewSwapStep } from "../components/steps/review_swap_step";
import { Token } from '@0x/types';
import {  SwapQuoteResponse, Account } from '../types';



interface ConnectedState {
    swapQuote?: SwapQuoteResponse;
    tokenIn?: Token;
    tokenOut?: Token;
    account: Account;
}

const mapStateToProps = (state: State): ConnectedState => ({
    swapQuote: state.latestApiSwapQuote,
    tokenIn: state.selectedTokenIn,
    tokenOut: state.selectedTokenOut,
    account:  state.providerState.account,
});

export const  ReviewSwapStepContainer: React.ComponentClass = connect(mapStateToProps)(
   ReviewSwapStep
);
