import {
    SwapQuoteConsumerError,
} from '@0x/asset-swapper';

import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import * as React from 'react';
import { oc } from 'ts-optchain';

import { DEFAULT_AFFILIATE_INFO, WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX } from '../constants';
import { ColorOption } from '../style/theme';
import { AffiliateInfo, Asset, SwapQuoteResponse, TokenInfo, ZeroExInstantError } from '../types';
import { analytics } from '../util/analytics';
import { errorReporter } from '../util/error_reporter';
import { gasPriceEstimator } from '../util/gas_price_estimator';
import { util } from '../util/util';

import { Button } from './ui/button';

export interface SwapButtonProps {
    accountAddress?: string;
    accountEthBalanceInWei?: BigNumber;
    swapQuote?: SwapQuoteResponse;
    web3Wrapper: Web3Wrapper;
    affiliateInfo?: AffiliateInfo;
    selectedAsset?: Asset;
    selectedToken?: TokenInfo;
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
}

export class SwapButton extends React.PureComponent<SwapButtonProps> {
    public static defaultProps = {
        onClick: util.boundNoop,
        onBuySuccess: util.boundNoop,
        onBuyFailure: util.boundNoop,
    };
    public render(): React.ReactNode {
        const { swapQuote, accountAddress, selectedToken } = this.props;
        const shouldDisableButton = swapQuote === undefined || accountAddress === undefined;
        const buttonText =
            selectedToken !== undefined
                ? `Buy ${selectedToken.symbol.toUpperCase()}`
                : 'Buy Now';
        return (
            <Button
                width="100%"
                onClick={this._handleClick}
                isDisabled={shouldDisableButton}
                fontColor={ColorOption.white}
            >
                {buttonText}
            </Button>
        );
    }
    private readonly _handleClick = async () => {
        // The button is disabled when there is no buy quote anyway.
        const {
            swapQuote,
            affiliateInfo = DEFAULT_AFFILIATE_INFO,
            accountAddress,
            accountEthBalanceInWei,
            web3Wrapper,
        } = this.props;
        if (swapQuote === undefined || accountAddress === undefined) {
            return;
        }
        this.props.onValidationPending(swapQuote);

        const ethNeededForBuy = swapQuote.value;
        // if we don't have a balance for the user, let the transaction through, it will be handled by the wallet
        const hasSufficientEth = accountEthBalanceInWei === undefined || accountEthBalanceInWei.gte(ethNeededForBuy);
        if (!hasSufficientEth) {
            analytics.trackSwapNotEnoughEth(swapQuote);
            this.props.onValidationFail(swapQuote, ZeroExInstantError.InsufficientETH);
            return;
        }
        let txHash: string | undefined;
        const gasInfo = await gasPriceEstimator.getGasInfoAsync();
        const feeRecipient = oc(affiliateInfo).feeRecipient();
        const feePercentage = oc(affiliateInfo).feePercentage();
        try {
            analytics.trackSwapStarted(swapQuote);
            txHash = await web3Wrapper.sendTransactionAsync(swapQuote as Required<SwapQuoteResponse>)
        } catch (e) {
            if (e instanceof Error) {
                if (e.message === SwapQuoteConsumerError.TransactionValueTooLow) {
                    analytics.trackSwapSimulationFailed(swapQuote);
                    this.props.onValidationFail(swapQuote, SwapQuoteConsumerError.TransactionValueTooLow);
                    return;
                } else if (e.message === SwapQuoteConsumerError.SignatureRequestDenied) {
                    analytics.trackSwapSignatureDenied(swapQuote);
                    this.props.onSignatureDenied(swapQuote);
                    return;
                } else {
                    errorReporter.report(e);
                    analytics.trackSwapUnknownError(swapQuote, e.message);
                    this.props.onValidationFail(swapQuote, ZeroExInstantError.CouldNotSubmitTransaction);
                    return;
                }
            }
            // HACK(dekz): Wrappers no longer include decorators which map errors
            // like transaction deny
            if (e.message && e.message.includes('User denied transaction signature')) {
                analytics.trackSwapSignatureDenied(swapQuote);
                this.props.onSignatureDenied(swapQuote);
                return;
            }
            // Fortmatic specific error handling
            if (e.message && e.message.includes('Fortmatic:')) {
                if (e.message.includes('User denied transaction.')) {
                    analytics.trackSwapSignatureDenied(swapQuote);
                    this.props.onSignatureDenied(swapQuote);
                    return;
                }
            }
            throw e;
        }
        const startTimeUnix = new Date().getTime();
        const expectedEndTimeUnix = startTimeUnix + gasInfo.estimatedTimeMs;
        this.props.onSwapProcessing(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
        try {
            analytics.trackSwapTxSubmitted(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
            await web3Wrapper.awaitTransactionSuccessAsync(txHash);
        } catch (e) {
            if (e instanceof Error && e.message.startsWith(WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX)) {
                analytics.trackSwapTxFailed(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
                this.props.onSwapFailure(swapQuote, txHash);
                return;
            }
            throw e;
        }
        analytics.trackSwapTxSucceeded(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
        this.props.onSwapSuccess(swapQuote, txHash);
    };
}
