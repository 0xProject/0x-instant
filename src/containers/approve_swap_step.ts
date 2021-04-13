

import * as React from 'react';
import { connect } from 'react-redux';

import { State } from '../redux/reducer';


import { ApproveSwapStep } from "../components/steps/approve_swap_step";
import {  Account, TokenInfo } from '../types';



interface ConnectedState {
    account: Account;
    tokenApprove: TokenInfo;
}

const mapStateToProps = (state: State): ConnectedState => ({
    account:  state.providerState.account,
    tokenApprove: state.selectedTokenIn,
});

export const  ApproveSwapStepContainer: React.ComponentClass = connect(mapStateToProps)(
   ApproveSwapStep
);
