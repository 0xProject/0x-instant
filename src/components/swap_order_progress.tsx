import * as React from 'react';

import { TimedProgressBar } from './timed_progress_bar';

import { TimeCounter } from './time_counter';
import { Container } from './ui/container';
import { OrderProcessState, OrderState } from '../types';

export interface SwapOrderProgressProps {
    swapOrderState: OrderState;
}

export const SwapOrderProgress: React.StatelessComponent<SwapOrderProgressProps> = props => {
    const { swapOrderState } = props;
    if (
        swapOrderState.processState === OrderProcessState.Processing ||
        swapOrderState.processState === OrderProcessState.Success ||
        swapOrderState.processState === OrderProcessState.Failure
    ) {
        const progress = swapOrderState.progress;
        const hasEnded = swapOrderState.processState !== OrderProcessState.Processing;
        const expectedTimeMs = progress.expectedEndTimeUnix - progress.startTimeUnix;
        return (
            <Container width="100%" padding="20px 20px 0px 20px">
                <Container marginBottom="5px">
                    <TimeCounter estimatedTimeMs={expectedTimeMs} hasEnded={hasEnded} key={progress.startTimeUnix} />
                </Container>
                <TimedProgressBar expectedTimeMs={expectedTimeMs} hasEnded={hasEnded} key={progress.startTimeUnix} />
            </Container>
        );
    }
    return null;
};

SwapOrderProgress.displayName = 'SwapOrderProgress';
