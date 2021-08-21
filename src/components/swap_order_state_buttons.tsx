import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as React from 'react';

import { ColorOption } from '../style/theme';
import { AffiliateInfo, ApproveProcessState, OrderProcessState, SwapQuoteResponse, SwapStep, TokenBalance, TokenInfo, ZeroExInstantError } from '../types';

import { ApproveTokenButton } from './approve_token_button';
import { PlacingOrderButton } from './placing_order_button';
import { SecondaryButton } from './secondary_button';
import { SwapButton } from './swap_button';
import { Button } from './ui/button';
import { Flex } from './ui/flex';

export interface SwapOrderStateButtonProps {
    accountAddress?: string;
    accountEthBalanceInWei?: BigNumber;
    swapQuote?: SwapQuoteResponse;
    swapOrderProcessingState: OrderProcessState;
    approveProcessingState: ApproveProcessState;
    web3Wrapper: Web3Wrapper;
    step: SwapStep;
    affiliateInfo?: AffiliateInfo;
    tokenBalanceIn?: TokenBalance;
    tokenBalanceOut?: TokenBalance;
    onViewTransaction: () => void;
    onValidationPending: (swapQuote: SwapQuoteResponse) => void;
    onValidationFail: (
        swapQuote: SwapQuoteResponse,
        errorMessage: ZeroExInstantError,
    ) => void;
    onApproveValidationPending: (token: TokenInfo) => void;
    onApproveValidationFail: (
        token: TokenInfo,
        errorMessage: ZeroExInstantError,
    ) => void;
    onSignatureDenied: (swapQuote: SwapQuoteResponse) => void;
    onSwapProcessing: (
        swapQuote: SwapQuoteResponse,
        txHash: string,
        startTimeUnix: number,
        expectedEndTimeUnix: number,
    ) => void;
    onSwapSuccess: (swapQuote: SwapQuoteResponse, txHash: string) => void;
    onSwapFailure: (swapQuote: SwapQuoteResponse, txHash: string) => void;
    onApproveTokenProcessing: (
        token: TokenInfo,
        txHash: string,
        startTimeUnix: number,
        expectedEndTimeUnix: number,
    ) => void;
    onApproveTokenSuccess: (token: TokenInfo, txHash: string) => void;
    onApproveTokenFailure: (token: TokenInfo, txHash: string) => void;
    onChangeStep: (step: SwapStep) => void;
    onRetry: () => void;
    onShowPanelStep: (step: SwapStep) => void;
    onClosePanelStep: (step: SwapStep) => void;
}

export const SwapOrderStateButtons = (props: SwapOrderStateButtonProps) => {
     // Swap button sections
    if (props.swapOrderProcessingState === OrderProcessState.Failure) {
        return (
            <Flex justify="space-between">
                <Button width="48%" onClick={props.onRetry} fontColor={ColorOption.white}>
                    Back
                </Button>
                <SecondaryButton width="48%" onClick={props.onViewTransaction}>
                    Details
                </SecondaryButton>
            </Flex>
        );
    } else if (
        props.swapOrderProcessingState === OrderProcessState.Success ||
        props.swapOrderProcessingState === OrderProcessState.Processing
    ) {
        return <SecondaryButton onClick={props.onViewTransaction}>View Transaction</SecondaryButton>;
    } else if (props.swapOrderProcessingState === OrderProcessState.Validating) {
        return <PlacingOrderButton />;
    }
    // Approve button sections
    if (props.approveProcessingState === ApproveProcessState.Failure) {
        return (
            <Flex justify="space-between">
                <Button width="48%" onClick={props.onRetry} fontColor={ColorOption.white}>
                    Back
                </Button>
                <SecondaryButton width="48%" onClick={props.onViewTransaction}>
                    Details
                </SecondaryButton>
            </Flex>
        );
    } else if (
        props.approveProcessingState === ApproveProcessState.Success ||
        props.approveProcessingState === ApproveProcessState.Processing
    ) {
        return <SecondaryButton onClick={props.onViewTransaction}>View Transaction</SecondaryButton>;
    } else if (props.approveProcessingState === ApproveProcessState.Validating) {
        return <ApproveTokenButton />;
    }

    return (
        <SwapButton
            accountAddress={props.accountAddress}
            accountEthBalanceInWei={props.accountEthBalanceInWei}
            swapQuote={props.swapQuote}
            web3Wrapper={props.web3Wrapper}
            affiliateInfo={props.affiliateInfo}
            step={props.step}
            tokenBalanceIn={props.tokenBalanceIn}
            tokenBalanceOut={props.tokenBalanceOut}
            onValidationPending={props.onValidationPending}
            onValidationFail={props.onValidationFail}
            onApproveValidationPending={props.onApproveValidationPending}
            onApproveValidationFail={props.onApproveValidationFail}
            onSignatureDenied={props.onSignatureDenied}
            onSwapProcessing={props.onSwapProcessing}
            onSwapSuccess={props.onSwapSuccess}
            onSwapFailure={props.onSwapFailure}
            onApproveTokenProcessing={props.onApproveTokenProcessing}
            onApproveTokenSuccess={props.onApproveTokenSuccess}
            onApproveTokenFailure={props.onApproveTokenFailure}
            onChangeStep={props.onChangeStep}
            onShowPanelStep={props.onShowPanelStep}
            onClosePanelStep={props.onClosePanelStep}
        />
    );
};

SwapOrderStateButtons.displayName = 'SwapOrderStateButtons';
