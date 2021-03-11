import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { State } from '../redux/reducer';
import { TokenInfo } from '../types';

import { ERC20TokenSelector } from '../components/erc20_token_selector';
import { Action, actions } from '../redux/actions';

export interface AvailableERC20TokenSelectorProps {
    onTokenSelect?: (token: TokenInfo, isIn: boolean) => void;
    isIn: boolean;
}

interface ConnectedState {
    tokens: TokenInfo[];
}

interface ConnectedDispatch {
    onTokenSelect: (token: TokenInfo, isIn: boolean) => void;
}

const mapStateToProps = (state: State, _ownProps: AvailableERC20TokenSelectorProps): ConnectedState => ({
    tokens: state.availableTokens,
});

const mapDispatchToProps = (
    dispatch: Dispatch<Action>,
    ownProps: AvailableERC20TokenSelectorProps,
): ConnectedDispatch => ({
    onTokenSelect: (token: TokenInfo, isIn: boolean) => {
        if(isIn){
            dispatch(actions.updateSelectedTokenIn(token));
        }else{
            dispatch(actions.updateSelectedTokenOut(token));
        }

    
        dispatch(actions.resetAmount());
        if (ownProps.onTokenSelect) {
            ownProps.onTokenSelect(token, isIn);
        }
    },
});

export const AvailableERC20TokenSelector: React.ComponentClass<AvailableERC20TokenSelectorProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ERC20TokenSelector);
