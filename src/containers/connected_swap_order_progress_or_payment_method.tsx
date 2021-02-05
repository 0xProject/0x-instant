import * as React from 'react';
import { connect } from 'react-redux';

import { State } from '../redux/reducer';
import { OrderProcessState } from '../types';

import { ConnectedAccountPaymentMethod } from './connected_account_payment_method';
import { SelectedTokenSwapOrderProgress } from './selected_token_swap_order_progress';

interface SwapOrderProgressOrPaymentMethodProps {
    orderProcessState: OrderProcessState;
}
export const SwapOrderProgressOrPaymentMethod = (props: SwapOrderProgressOrPaymentMethodProps) => {
    const { orderProcessState } = props;
    if (
        orderProcessState === OrderProcessState.Processing ||
        orderProcessState === OrderProcessState.Success ||
        orderProcessState === OrderProcessState.Failure
    ) {
        return <SelectedTokenSwapOrderProgress />;
    } else {
        return <ConnectedAccountPaymentMethod />;
    }
    return null;
};

interface ConnectedState extends SwapOrderProgressOrPaymentMethodProps {}

export interface ConnectedSwapOrderProgressOrPaymentMethodProps {}
const mapStateToProps = (state: State, _ownProps: ConnectedSwapOrderProgressOrPaymentMethodProps): ConnectedState => ({
    orderProcessState: state.swapOrderState.processState,
});
export const ConnectedSwapOrderProgressOrPaymentMethod: React.ComponentClass<
    ConnectedSwapOrderProgressOrPaymentMethodProps
> = connect(mapStateToProps)(SwapOrderProgressOrPaymentMethod);
