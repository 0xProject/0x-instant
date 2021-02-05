import { MarketBuySwapQuote, SwapQuoteConsumer, SwapQuoteConsumerError, SwapQuoter } from '@0x/asset-swapper';
import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as React from 'react';

import { ColorOption } from '../style/theme';
import { AffiliateInfo, Asset, OrderProcessState, SwapQuoteResponse, TokenInfo, ZeroExInstantError } from '../types';

import { SwapButton } from './swap_button';
import { PlacingOrderButton } from './placing_order_button';
import { SecondaryButton } from './secondary_button';

import { Button } from './ui/button';
import { Flex } from './ui/flex';

export interface SwapOrderStateButtonProps {
    accountAddress?: string;
    accountEthBalanceInWei?: BigNumber;
    swapQuote?: SwapQuoteResponse;
    swapOrderProcessingState: OrderProcessState;
    web3Wrapper: Web3Wrapper;
    affiliateInfo?: AffiliateInfo;
    selectedToken?: TokenInfo;
    selectedAsset?: Asset;
    onViewTransaction: () => void;
    onValidationPending: (swapQuote: SwapQuoteResponse) => void;
    onValidationFail: (
        swapQuote: SwapQuoteResponse,
        errorMessage: SwapQuoteConsumerError | ZeroExInstantError,
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
    onRetry: () => void;
}

export const SwapOrderStateButtons: React.StatelessComponent<SwapOrderStateButtonProps> = props => {
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

    return (
        <SwapButton
            accountAddress={props.accountAddress}
            accountEthBalanceInWei={props.accountEthBalanceInWei}
            swapQuote={props.swapQuote}
            web3Wrapper={props.web3Wrapper}
            affiliateInfo={props.affiliateInfo}
            selectedAsset={props.selectedAsset}
            onValidationPending={props.onValidationPending}
            onValidationFail={props.onValidationFail}
            onSignatureDenied={props.onSignatureDenied}
            onSwapProcessing={props.onSwapProcessing}
            onSwapSuccess={props.onSwapSuccess}
            onSwapFailure={props.onSwapFailure}
        />
    );
};

SwapOrderStateButtons.displayName = 'SwapOrderStateButtons';
