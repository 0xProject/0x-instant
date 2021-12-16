import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { PositionAnimationSettings } from '../../components/animations/position_animation';
import { SlideAnimation } from '../../components/animations/slide_animation';
import { SectionHeader } from '../../components/section_header';
import { Container } from '../../components/ui/container';
import { Flex } from '../../components/ui/flex';
import { Text } from '../../components/ui/text';
import { actions } from '../../redux/actions';
import { getApproveState, getIsStepWithApprove, getSelectedTokenIn, getSwapOrderState } from '../../redux/selectors';
import { ColorOption } from '../../style/theme';
import { zIndex } from '../../style/z_index';
import { ApproveProcessState, OrderProcessState, SlideAnimationState } from '../../types';

interface PanelProps {
    onClose?: () => void;
    children: React.ReactNode;
}

const Panel = ({ children, onClose }: PanelProps) => {
    const isStepWithApprove = useSelector(getIsStepWithApprove);
    const swapOrderState = useSelector(getSwapOrderState);
    const approveState = useSelector(getApproveState);
    const tokenIn = useSelector(getSelectedTokenIn);
    const dispatch = useDispatch();
    const onClosePanel = () => {
        // reset all state
        dispatch(actions.setSwapOrderStateNone());
        dispatch(actions.setApproveTokenStateNone());
        onClose();
    };

    const titleText = () => {
        if (isStepWithApprove) {
            if (
                approveState.processState === ApproveProcessState.Processing
            ) {
                return `Approving ${tokenIn.symbol.toUpperCase()}`;
            }
            if (
                approveState.processState === ApproveProcessState.Success
            ) {
                return 'Approved';
            }

            if (approveState.processState === ApproveProcessState.Failure) {
                return `Approving ${tokenIn.symbol.toUpperCase()} failed`;
            }

        } else {
            if (
                swapOrderState.processState === OrderProcessState.Processing
            ) {
                return 'Processing';
            }
            if (swapOrderState.processState === OrderProcessState.Failure) {
                return 'Trade Failed';
            }

            if (  swapOrderState.processState === OrderProcessState.Success) {
                return 'Trade Completed';
            }
        }
        return 'Order Summary';

    };

    return (
    <Container backgroundColor={ColorOption.white} width="100%" height="100%" zIndex={zIndex.panel} padding="20px">

                <Flex justify="space-between">
                <SectionHeader>
                    <Text fontWeight={700} fontColor={ColorOption.black}>
                      {titleText()}
                    </Text>
                    <Text fontWeight={300} fontColor={ColorOption.grey} fontSize={'12px'}>
                       {/* Quote expires in 24 seconds*/}
                    </Text>

                </SectionHeader>
                    <SectionHeader>
                    <Flex justify="flex-end">
                         <Text fontWeight={300} fontColor={ColorOption.grey} fontSize={'12px'} onClick={onClosePanel}>
                             ← Back
                       </Text>
                    </Flex>

                    </SectionHeader>
                </Flex>

        <Container position="relative" top="-10px"  height="100%" width="100%">
            {children}
        </Container>
    </Container>
);
};

Panel.displayName = 'Panel';

export interface SlidingPanelProps extends PanelProps {
    animationState: SlideAnimationState;
    onAnimationEnd?: () => void;
}

export class SlidingPanelSwapContainer extends React.PureComponent<SlidingPanelProps> {
    public render(): React.ReactNode {
        if (this.props.animationState === 'none') {
            return null;
        }
        const { animationState, onAnimationEnd, ...rest } = this.props;
        const slideAmount = '100%';
        const slideUpSettings: PositionAnimationSettings = {
            duration: '0.3s',
            timingFunction: 'ease-in-out',
            top: {
                from: slideAmount,
                to: '0px',
            },
            position: 'absolute',
        };
        const slideDownSettings: PositionAnimationSettings = {
            duration: '0.3s',
            timingFunction: 'ease-out',
            top: {
                from: '0px',
                to: slideAmount,
            },
            position: 'absolute',
        };
        return (
            <SlideAnimation
                slideInSettings={slideUpSettings}
                slideOutSettings={slideDownSettings}
                animationState={animationState}
                height="100%"
                onAnimationEnd={onAnimationEnd}
            >
                <Panel {...rest} />
            </SlideAnimation>
        );
    }
}
