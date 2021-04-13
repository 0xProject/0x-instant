import * as React from 'react';
import { connect } from 'react-redux';
import { SwapOrderProgress } from '../components/swap_order_progress';

import { State } from '../redux/reducer';
import { OrderProcessState } from '../types';

interface SwapOrderProgressOrPaymentMethodProps {
    orderProcessState: OrderProcessState;
}

interface ConnectedState extends SwapOrderProgressOrPaymentMethodProps {}

export interface ConnectedSwapOrderProgressOrPaymentMethodProps {}
const mapStateToProps = (state: State, _ownProps: ConnectedSwapOrderProgressOrPaymentMethodProps): ConnectedState => ({
    orderProcessState: state.swapOrderState.processState,
});
export const SwapProgressContainer: React.ComponentClass<
    ConnectedSwapOrderProgressOrPaymentMethodProps
> = connect(mapStateToProps)(SwapOrderProgress);
