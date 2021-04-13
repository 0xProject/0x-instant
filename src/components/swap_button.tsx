import {
    SwapQuoteConsumerError,
} from '@0x/asset-swapper';
import { ERC20TokenContract } from '@0x/contract-wrappers';

import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import * as React from 'react';


import {  UNLIMITED_ALLOWANCE_IN_BASE_UNITS, WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX } from '../constants';
import { ColorOption } from '../style/theme';
import { AffiliateInfo, SwapQuoteResponse, SwapStep, TokenBalance, TokenInfo, ZeroExInstantError } from '../types';
import { analytics } from '../util/analytics';
import { errorReporter } from '../util/error_reporter';
import { gasPriceEstimator } from '../util/gas_price_estimator';
import { util } from '../util/util';

import { Button } from './ui/button';

export interface SwapButtonProps {
    step: SwapStep;
    accountAddress?: string;
    accountEthBalanceInWei?: BigNumber;
    swapQuote?: SwapQuoteResponse;
    web3Wrapper: Web3Wrapper;
    affiliateInfo?: AffiliateInfo;
    tokenBalanceIn?: TokenBalance;
    tokenBalanceOut?: TokenBalance;
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
    onApproveValidationPending: (token: TokenInfo) => void;
    onApproveValidationFail: (
        token: TokenInfo,
        errorMessage: ZeroExInstantError,
    ) => void;

    onApproveTokenProcessing: (
        token: TokenInfo,
        txHash: string,
        startTimeUnix: number,
        expectedEndTimeUnix: number,
    ) => void;
    onApproveTokenSuccess: (  token: TokenInfo, txHash: string) => void;
    onApproveTokenFailure: (  token: TokenInfo, txHash: string) => void;
    onShowPanelStep: (step: SwapStep) => void;
    onClosePanelStep: (step: SwapStep) => void;
    onChangeStep: (step: SwapStep) => void;
}

export class SwapButton extends React.PureComponent<SwapButtonProps> {
    public static defaultProps = {
        onClick: util.boundNoop,
        onBuySuccess: util.boundNoop,
        onBuyFailure: util.boundNoop,
    };
    public render(): React.ReactNode {
        const { swapQuote, accountAddress, step } = this.props;
        const shouldDisableButton = swapQuote === undefined || accountAddress === undefined;

        return (
            <Button
                width="100%"
                onClick={this._handleClick}
                isDisabled={shouldDisableButton}
                fontColor={ColorOption.white}
            >
                {this._renderButtonText()}
            </Button>
        );
    }
    private readonly _renderButtonText = () => {
        const { step } = this.props;
        switch (step) {
            case SwapStep.Swap:
             return 'Review Order';
            case SwapStep.Approve:
             return 'Approve';
             case SwapStep.ReviewOrder:
             return 'Swap';
            default:
             return 'Review Order';  
        }     
    }



    private readonly _handleClick = async () => {
        const { step, tokenBalanceIn } = this.props;
        if(step === SwapStep.Swap && tokenBalanceIn){
            if(tokenBalanceIn.isUnlocked){
                this.props.onChangeStep(SwapStep.ReviewOrder);
            }else{
                this.props.onChangeStep(SwapStep.Approve);
            }
            this.props.onShowPanelStep(step)
        }

        if(step === SwapStep.Approve){
            this._handleApprove();
        }
        
        if(step === SwapStep.ReviewOrder){
            this._handleSwap();
        }
      
    };

    private _handleSwap = async () => {
          // The button is disabled when there is no buy quote anyway.
          const {
            swapQuote,
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
        this.props.onClosePanelStep(this.props.step)
    }
    
    private _handleApprove = async () => {
        const {
            swapQuote,
            tokenBalanceIn,
            accountAddress,
            web3Wrapper,
        } = this.props;

        if (swapQuote === undefined || accountAddress === undefined || tokenBalanceIn === undefined) {
            return;
        }
        const tokenToApprove = tokenBalanceIn.token;

        this.props.onApproveValidationPending(tokenToApprove);
        const tokenToApproveAddress = tokenBalanceIn.token.address;
        const erc20Token = new ERC20TokenContract(tokenToApproveAddress, web3Wrapper.getProvider());
        
        const gasInfo = await gasPriceEstimator.getGasInfoAsync();
        let txHash: string | undefined;
        try {
            txHash =  await erc20Token.approve(tokenToApproveAddress, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
                .sendTransactionAsync({
                    from: accountAddress,
                    gasPrice: gasInfo.gasPriceInWei
                });
        }catch{
            this.props.onApproveValidationFail(tokenToApprove, ZeroExInstantError.CouldNotSubmitTransaction);
        }

        const startTimeUnix = new Date().getTime();
        const expectedEndTimeUnix = startTimeUnix + gasInfo.estimatedTimeMs;
        this.props.onApproveTokenProcessing(tokenToApprove, txHash, startTimeUnix, expectedEndTimeUnix);
        try {
            await web3Wrapper.awaitTransactionSuccessAsync(txHash);
        } catch (e) {
            if (e instanceof Error && e.message.startsWith(WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX)) {
                this.props.onApproveTokenFailure(tokenToApprove, txHash);
                return;
            }
            throw e;
        }
      
        this.props.onApproveTokenSuccess(tokenToApprove, txHash);
        this.props.onClosePanelStep(this.props.step);
    }


}
