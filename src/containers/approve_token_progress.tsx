import * as React from 'react';

import { TimedProgressBar } from '../components/timed_progress_bar';

import { TimeCounter } from '../components/time_counter';
import { Container } from '../components/ui/container';
import { ApproveProcessState } from '../types';
import { useSelector } from 'react-redux';
import { getApproveState } from '../redux/selectors';


export const ApproveTokenProgressContainer = () => {
    const approveState = useSelector(getApproveState);

    if (
        approveState.processState === ApproveProcessState.Processing ||
        approveState.processState === ApproveProcessState.Success ||
        approveState.processState === ApproveProcessState.Failure
    ) {
        const progress = approveState.progress;
        const hasEnded = approveState.processState !== ApproveProcessState.Processing;
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

ApproveTokenProgressContainer.displayName = 'ApproveTokenProgress';
