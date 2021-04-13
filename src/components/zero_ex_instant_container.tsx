import * as React from 'react';
import { connect } from 'react-redux';

import PoweredByLogo from '../assets/powered_by_0x.svg';
import { ZERO_EX_SITE_URL } from '../constants';
import { AvailableERC20TokenSelector } from '../containers/available_erc20_token_selector';
import { ConnectedSwapOrderProgressOrPaymentMethod } from '../containers/connected_swap_order_progress_or_payment_method';
import { CurrentStandardSlidingPanel } from '../containers/current_standard_sliding_panel';
import { LatestSwapQuoteOrderDetails } from '../containers/latest_swap_quote_order_details';
import { LatestError } from '../containers/latest_error';
import { SelectedTokenInstantHeading } from '../containers/selected_token_instant_heading';
import { SelectedTokenSwapOrderStateButtons } from '../containers/selected_token_swap_order_state_buttons';
import { ColorOption } from '../style/theme';
import { zIndex } from '../style/z_index';
import { SlideAnimationState, SwapStep } from '../types';
import { analytics, TokenSelectorClosedVia } from '../util/analytics';

import { CSSReset } from './css_reset';
import { SlidingPanel } from './sliding_panel';
import { Container } from './ui/container';
import { Flex } from './ui/flex';

import { State } from '../redux/reducer';
import { ReviewSwapStepContainer } from '../containers/review_swap_step';
import { ApproveSwapStepContainer } from '../containers/approve_swap_step';
import { ApproveTokenProgressContainer } from '../containers/approve_token_progress';
import { Dispatch } from 'redux';
import { Action, actions } from '../redux/actions';
import { SwapProgressContainer } from '../containers/swap_progress';

export interface ZeroExInstantContainerProps {
    swapStep: SwapStep;
    onClosePanelStep: () => void;
}
export interface ZeroExInstantContainerState {
    tokenSelectionPanelAnimationState: SlideAnimationState;
    stepPanelAnimationState: SlideAnimationState;
    isIn: boolean;
}

class ZeroExInstantComponent extends React.PureComponent<
    ZeroExInstantContainerProps,
    ZeroExInstantContainerState
> {
    public state = {
        tokenSelectionPanelAnimationState: 'none' as SlideAnimationState,
        stepPanelAnimationState: 'none' as SlideAnimationState,
        isIn: false,
    };
    public render(): React.ReactNode {
        const { swapStep } = this.props;


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
                            {/*<ConnectedSwapOrderProgressOrPaymentMethod />*/}

                            <SelectedTokenInstantHeading onSelectTokenClick={this._handleSymbolClickIn} isIn={true} />
                            <SelectedTokenInstantHeading onSelectTokenClick={this._handleSymbolClickOut} isIn={false} />
                            <ConnectedSwapOrderProgressOrPaymentMethod />
                            <LatestSwapQuoteOrderDetails />
                            <Container padding="20px" width="100%">
                                <SelectedTokenSwapOrderStateButtons onClosePanelStep={this._handleStepPanelClose} onShowPanelStep={this._handleStepPanelOpen} />
                            </Container>
                        </Flex>
                        <SlidingPanel
                            animationState={this.state.tokenSelectionPanelAnimationState}
                            onClose={this._handlePanelCloseClickedX}
                            onAnimationEnd={this._handleSlidingPanelAnimationEnd}
                        >
                            <AvailableERC20TokenSelector onTokenSelect={this._handlePanelCloseAfterChose} isIn={this.state.isIn} />
                        </SlidingPanel>

                        <SlidingPanel
                            animationState={this.state.stepPanelAnimationState}
                            onClose={this._handleStepPanelCloseX}
                            onAnimationEnd={this._handleStepSlidingPanelAnimationEnd}
                        >

                            <Flex direction="column" justify="flex-start" height="100%">
                                <Container height="100%">
                                    {this._getContentFromStep(swapStep)}
                                </Container>
                                <Container padding="20px" width="100%">
                                    <SelectedTokenSwapOrderStateButtons onClosePanelStep={this._handleStepPanelClose} onShowPanelStep={this._handleStepPanelOpen} />
                                </Container>
                            </Flex>

                        </SlidingPanel>

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
    }
    private readonly _handleSymbolClickIn = (): void => {
        analytics.trackTokenSelectorOpened();
        this.setState({ isIn: true });
        this.setState({
            tokenSelectionPanelAnimationState: 'slidIn',
        });
    };
    private readonly _handleSymbolClickOut = (): void => {

        analytics.trackTokenSelectorOpened();
        this.setState({ isIn: false });
        this.setState({
            tokenSelectionPanelAnimationState: 'slidIn',
        });
    };

    private readonly _handlePanelCloseClickedX = (): void => {
        this._handlePanelClose(TokenSelectorClosedVia.ClickedX);
    };
    private readonly _handlePanelCloseAfterChose = (): void => {
        this._handlePanelClose(TokenSelectorClosedVia.TokenChose);
    };
    private readonly _handlePanelClose = (closedVia: TokenSelectorClosedVia): void => {
        analytics.trackTokenSelectorClosed(closedVia);
        this.setState({
            tokenSelectionPanelAnimationState: 'slidOut',
        });
    };
    private readonly _handleStepPanelCloseX = (): void => {
        this.props.onClosePanelStep();
        this.setState({
            stepPanelAnimationState: 'slidOut',
        });
    };
    private readonly _handleStepPanelClose = (step: SwapStep): void => {
        this.setState({
            stepPanelAnimationState: 'slidOut',
        });
    };
    private readonly _handleStepPanelOpen = (step: SwapStep): void => {
        this.setState({
            stepPanelAnimationState: 'slidIn',
        });
    };


    private readonly _handleSlidingPanelAnimationEnd = (): void => {
        if (this.state.tokenSelectionPanelAnimationState === 'slidOut') {
            // When the slidOut animation completes, don't keep the panel mounted.
            // Performance optimization
            this.setState({ tokenSelectionPanelAnimationState: 'none' });
        }
    };

    private readonly _handleStepSlidingPanelAnimationEnd = (): void => {
        if (this.state.stepPanelAnimationState === 'slidOut') {
            // When the slidOut animation completes, don't keep the panel mounted.
            // Performance optimization
            this.setState({ stepPanelAnimationState: 'none' });
        }
    };

    private readonly _getContentFromStep = (swapSteps: SwapStep): React.ReactNode => {
        switch (swapSteps) {
            case SwapStep.Approve:

                return (
                    <>
                        <ApproveSwapStepContainer />
                        <ApproveTokenProgressContainer />
                    </>)
            case SwapStep.ReviewOrder:
                return (<>
                    <ReviewSwapStepContainer />
                    <SwapProgressContainer />
                </>)
            default:
                return null;
        }
    }

}

interface ConnectedDispatch {
    onClosePanelStep: () => void;
}

interface ConnectedState {
    swapStep: SwapStep;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action>,
): ConnectedDispatch => ({
    onClosePanelStep: () => {
        dispatch(actions.setUISwapStep(SwapStep.Swap));
    },
});

const mapStateToProps = (state: State): ConnectedState => ({
    swapStep: state.swapStep || SwapStep.Swap,
});

export const ZeroExInstantContainer: React.ComponentClass = connect(mapStateToProps, mapDispatchToProps)(ZeroExInstantComponent);
