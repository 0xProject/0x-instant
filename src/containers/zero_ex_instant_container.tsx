import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PoweredByLogo from '../assets/powered_by_0x.svg';
import { CSSReset } from '../components/css_reset';
import { SlidingPanel } from '../components/sliding_panel';
import { Container } from '../components/ui/container';
import { Flex } from '../components/ui/flex';
import { ZERO_EX_SITE_URL } from '../constants';
import {  actions } from '../redux/actions';
import { getSwapStep } from '../redux/selectors';
import { ColorOption } from '../style/theme';
import { zIndex } from '../style/z_index';
import { SlideAnimationState, SwapStep } from '../types';
import { analytics, TokenSelectorClosedVia } from '../util/analytics';

import { CurrentStandardSlidingPanel } from './current_standard_sliding_panel';
import { ERC20TokenSelectorContainer } from './erc20_token_selector';
import { InstantTokenHeadingContainer } from './instant_token_heading';
import { LatestError } from './latest_error';
import { OrderSwapDetailsContainer } from './order_swap_details';
import { PaymentMethodContainer } from './payment_method';
import { SelectedTokenSwapOrderStateButtons } from './selected_token_swap_order_state_buttons';
import { SlidingPanelSwapContainer } from './steps/sliding_panel_swap_step';
import { SwapStepsContainer } from './steps/swap_steps';
import { SwapProgressContainer } from './swap_order_progress';

export interface ZeroExInstantContainerProps {
    swapStep: SwapStep;
    onClosePanelStep: () => void;
}
export interface ZeroExInstantContainerState {
    tokenSelectionPanelAnimationState: SlideAnimationState;
    stepPanelAnimationState: SlideAnimationState;
    isIn: boolean;
}

export const ZeroExInstantContainer = () => {
    const dispatch = useDispatch();
    const swapStep = useSelector(getSwapStep);
    const [isIn, setIsIn] = useState(false);
    const [tokenSelectionPanelAnimationState, setTokenSelectionPanelAnimationState] = useState<SlideAnimationState>('none');
    const [stepPanelAnimationState, setStepPanelAnimationState] = useState<SlideAnimationState>('none');
    const _handleSymbolClickIn = (): void => {
        analytics.trackTokenSelectorOpened();
        setIsIn(true);
        setTokenSelectionPanelAnimationState('slidIn');

    };
    const _handleSymbolClickOut = (): void => {
        analytics.trackTokenSelectorOpened();
        setIsIn(false);
        setTokenSelectionPanelAnimationState('slidIn');
    };

    const _handlePanelCloseClickedX = (): void => {
        _handlePanelClose(TokenSelectorClosedVia.ClickedX);
    };
    const _handlePanelCloseAfterChose = (): void => {
        _handlePanelClose(TokenSelectorClosedVia.TokenChose);
    };
    const _handlePanelClose = (closedVia: TokenSelectorClosedVia): void => {
        analytics.trackTokenSelectorClosed(closedVia);
        setTokenSelectionPanelAnimationState('slidOut');
    };
    const _handleStepPanelCloseX = (): void => {
        dispatch(actions.setUISwapStep(SwapStep.Swap));
        setStepPanelAnimationState('slidOut');
    };
    const _handleStepPanelClose = (): void => {
        setStepPanelAnimationState('slidOut');
    };
    const _handleStepPanelOpen = (): void => {
        setStepPanelAnimationState('slidIn');
    };

    const _handleSlidingPanelAnimationEnd = (): void => {
        if (tokenSelectionPanelAnimationState === 'slidOut') {
            // When the slidOut animation completes, don't keep the panel mounted.
            // Performance optimization
            setTokenSelectionPanelAnimationState('none');
        }
    };

    const _handleStepSlidingPanelAnimationEnd = (): void => {
        if (stepPanelAnimationState === 'slidOut') {
            // When the slidOut animation completes, don't keep the panel mounted.
            // Performance optimization
            setStepPanelAnimationState('none');
        }
    };

    const _getContentFromStep = (swapSteps: SwapStep): React.ReactNode => {
        switch (swapSteps) {
            case SwapStep.Approve:
            case SwapStep.ReviewOrder:
                return (<>
                    <SwapStepsContainer/>
                    <SwapProgressContainer />
                </>);
            default:
                return null;
        }
    };

    return (
            <React.Fragment>
                <CSSReset />
                <Container
                    width={{ default: '350px', sm: '100%' }}
                    height={{ default: 'auto', sm: '100%' }}
                    position="relative"
                >
                    <Container position="relative">
                        <LatestError />
                    </Container>
                    <Container
                        zIndex={zIndex.mainContainer}
                        position="relative"
                        backgroundColor={ColorOption.white}
                        borderRadius={{ default: '3px', sm: '0px' }}
                        hasBoxShadow={true}
                        overflow="hidden"
                        height="100%"
                    >
                        <Flex direction="column" justify="flex-start" height="100%">
                            <InstantTokenHeadingContainer onSelectTokenClick={_handleSymbolClickIn} isIn={true} />
                            <InstantTokenHeadingContainer onSelectTokenClick={_handleSymbolClickOut} isIn={false} />
                            <PaymentMethodContainer />
                            <OrderSwapDetailsContainer />
                            <Container padding="20px" width="100%">
                                <SelectedTokenSwapOrderStateButtons onClosePanelStep={_handleStepPanelClose} onShowPanelStep={_handleStepPanelOpen} />
                            </Container>
                        </Flex>
                        <SlidingPanel
                            animationState={tokenSelectionPanelAnimationState}
                            onClose={_handlePanelCloseClickedX}
                            onAnimationEnd={_handleSlidingPanelAnimationEnd}
                        >
                            <ERC20TokenSelectorContainer onTokenSelect={_handlePanelCloseAfterChose} isIn={isIn} />
                        </SlidingPanel>

                        <SlidingPanelSwapContainer
                            animationState={stepPanelAnimationState}
                            onClose={_handleStepPanelCloseX}
                            onAnimationEnd={_handleStepSlidingPanelAnimationEnd}
                        >

                            <Flex direction="column" justify="flex-start" height="100%" width="100%">
                                <Container height="100%" width="100%">
                                    {_getContentFromStep(swapStep)}
                                </Container>
                                <Container padding="20px" width="100%" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
                                    <SelectedTokenSwapOrderStateButtons onClosePanelStep={_handleStepPanelClose} onShowPanelStep={_handleStepPanelOpen} />
                                </Container>
                            </Flex>

                        </SlidingPanelSwapContainer>

                        <CurrentStandardSlidingPanel />
                    </Container>
                    <Container
                        display={{ sm: 'none', default: 'block' }}
                        marginTop="10px"
                        marginLeft="auto"
                        marginRight="auto"
                        width="108px"
                    >
                        <a href={ZERO_EX_SITE_URL} target="_blank">
                            <PoweredByLogo />
                        </a>
                    </Container>
                </Container>
            </React.Fragment>
        );
};
