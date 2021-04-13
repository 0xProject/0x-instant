import * as React from 'react';

import { TimedProgressBar } from './timed_progress_bar';

import { TimeCounter } from './time_counter';
import { Container } from './ui/container';
import { ApproveProcessState, ApproveState } from '../types';


export interface ApproveTokenProgressProps {
    approveState: ApproveState;
}

export const ApproveTokenProgress: React.StatelessComponent<ApproveTokenProgressProps> = props => {
    const { approveState } = props;
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

ApproveTokenProgress.displayName = 'ApproveTokenProgress';
