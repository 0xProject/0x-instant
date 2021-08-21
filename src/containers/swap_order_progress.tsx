import * as React from 'react';
import { useSelector } from 'react-redux';

import { TimeCounter } from '../components/time_counter';
import { TimedProgressBar } from '../components/timed_progress_bar';
import { Container } from '../components/ui/container';
import { getSwapOrderState } from '../redux/selectors';
import { OrderProcessState } from '../types';

export const SwapProgressContainer = () => {
    const swapOrderState = useSelector(getSwapOrderState);

    if (
        swapOrderState.processState === OrderProcessState.Processing ||
        swapOrderState.processState === OrderProcessState.Success ||
        swapOrderState.processState === OrderProcessState.Failure
    ) {
        const progress = swapOrderState.progress;
        const hasEnded = swapOrderState.processState !== OrderProcessState.Processing;
        const expectedTimeMs = progress.expectedEndTimeUnix - progress.startTimeUnix;
        return (
            <Container width="100%" padding="20px 20px 0px 20px" >
                <Container marginBottom="5px">
                    <TimeCounter estimatedTimeMs={expectedTimeMs} hasEnded={hasEnded} key={progress.startTimeUnix} />
                </Container>
                <TimedProgressBar expectedTimeMs={expectedTimeMs} hasEnded={hasEnded} key={progress.startTimeUnix} />
            </Container>
        );
    }
    return null;
};
