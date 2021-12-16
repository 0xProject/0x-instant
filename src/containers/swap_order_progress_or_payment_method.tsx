import * as React from 'react';
import { useSelector } from 'react-redux';

import { getSwapOrderState } from '../redux/selectors';
import { OrderProcessState } from '../types';

import { PaymentMethodContainer } from './payment_method';
import { SwapProgressContainer } from './swap_order_progress';

export const SwapOrderProgressOrPaymentMethod = () => {
    const  orderProcessState  = useSelector(getSwapOrderState).processState;
    if (
        orderProcessState === OrderProcessState.Processing ||
        orderProcessState === OrderProcessState.Success ||
        orderProcessState === OrderProcessState.Failure
    ) {
        return <SwapProgressContainer />;
    } else {
        return <PaymentMethodContainer />;
    }
};
