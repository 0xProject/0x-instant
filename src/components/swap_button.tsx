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
        errorMessage:  ZeroExInstantError,
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

/*public static defaultProps = {
    onClick: util.boundNoop,
    onBuySuccess: util.boundNoop,
    onBuyFailure: util.boundNoop,
};*/

export const SwapButton = (props:SwapButtonProps) => {
    const { swapQuote, accountAddress, step } = props;
    const shouldDisableButton = swapQuote === undefined || accountAddress === undefined;

    const _handleApprove = async () => {
        const {
            swapQuote,
            tokenBalanceIn,
            accountAddress,
            web3Wrapper,
        } = props;

        if (swapQuote === undefined || accountAddress === undefined || tokenBalanceIn === undefined) {
            return;
        }
        const tokenToApprove = tokenBalanceIn.token;

        props.onApproveValidationPending(tokenToApprove);
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
            props.onApproveValidationFail(tokenToApprove, ZeroExInstantError.CouldNotSubmitTransaction);
        }

        const startTimeUnix = new Date().getTime();
        const expectedEndTimeUnix = startTimeUnix + gasInfo.estimatedTimeMs;
        props.onApproveTokenProcessing(tokenToApprove, txHash, startTimeUnix, expectedEndTimeUnix);
        try {
            await web3Wrapper.awaitTransactionSuccessAsync(txHash);
        } catch (e) {
            if (e instanceof Error && e.message.startsWith(WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX)) {
                props.onApproveTokenFailure(tokenToApprove, txHash);
                return;
            }
            throw e;
        }
      
        props.onApproveTokenSuccess(tokenToApprove, txHash);
        props.onClosePanelStep(props.step);
    }


    const _renderButtonText = () => {
        const { step, tokenBalanceIn   } = props;
        const tokenToApprove = tokenBalanceIn.token;
        switch (step) {
            case SwapStep.Swap:
             return 'Preview Trade';
            case SwapStep.Approve:
             return `Approve ${tokenToApprove.symbol.toUpperCase()} usage`;
             case SwapStep.ReviewOrder:
             return 'Confirm Trade';
            default:
             return 'Preview Trade';  
        }     
    }

    const _handleSwap = async () => {
        // The button is disabled when there is no buy quote anyway.
        const {
          swapQuote,
          accountAddress,
          accountEthBalanceInWei,
          web3Wrapper,
      } = props;
      if (swapQuote === undefined || accountAddress === undefined) {
          return;
      }

      props.onValidationPending(swapQuote);

      const ethNeededForBuy = swapQuote.value;
      // if we don't have a balance for the user, let the transaction through, it will be handled by the wallet
      const hasSufficientEth = accountEthBalanceInWei === undefined || accountEthBalanceInWei.gte(ethNeededForBuy);
      if (!hasSufficientEth) {
          analytics.trackSwapNotEnoughEth(swapQuote);
          props.onValidationFail(swapQuote, ZeroExInstantError.InsufficientETH);
          return;
      }
      let txHash: string | undefined;
      const gasInfo = await gasPriceEstimator.getGasInfoAsync();
      try {
          analytics.trackSwapStarted(swapQuote);
          txHash = await web3Wrapper.sendTransactionAsync(swapQuote as Required<SwapQuoteResponse>)
      } catch (e) {
          if (e instanceof Error) {
                errorReporter.report(e);
                analytics.trackSwapUnknownError(swapQuote, e.message);
                props.onValidationFail(swapQuote, ZeroExInstantError.CouldNotSubmitTransaction);
                return;
              
          }
          // HACK(dekz): Wrappers no longer include decorators which map errors
          // like transaction deny
          if (e.message && e.message.includes('User denied transaction signature')) {
              analytics.trackSwapSignatureDenied(swapQuote);
              props.onSignatureDenied(swapQuote);
              return;
          }
          // Fortmatic specific error handling
          if (e.message && e.message.includes('Fortmatic:')) {
              if (e.message.includes('User denied transaction.')) {
                  analytics.trackSwapSignatureDenied(swapQuote);
                  props.onSignatureDenied(swapQuote);
                  return;
              }
          }
          throw e;
      }

      const startTimeUnix = new Date().getTime();
      const expectedEndTimeUnix = startTimeUnix + gasInfo.estimatedTimeMs;
      props.onSwapProcessing(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
      try {
          analytics.trackSwapTxSubmitted(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
          await web3Wrapper.awaitTransactionSuccessAsync(txHash);
      } catch (e) {
          if (e instanceof Error && e.message.startsWith(WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX)) {
              analytics.trackSwapTxFailed(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
              props.onSwapFailure(swapQuote, txHash);
              return;
          }
          throw e;
      }
      analytics.trackSwapTxSucceeded(swapQuote, txHash, startTimeUnix, expectedEndTimeUnix);
      props.onSwapSuccess(swapQuote, txHash);
      props.onClosePanelStep(props.step)
  }
    
      

    const _handleClick = async () => {
            const { step, tokenBalanceIn } = props;
            if(step === SwapStep.Swap && tokenBalanceIn){
                if(tokenBalanceIn.isUnlocked){
                    props.onChangeStep(SwapStep.ReviewOrder);
                }else{
                    props.onChangeStep(SwapStep.Approve);
                }
                props.onShowPanelStep(step)
            }
    
            if(step === SwapStep.Approve){
                _handleApprove();
            }
            
            if(step === SwapStep.ReviewOrder){
                _handleSwap();
            }
          
        };



    return (
        <Button
            width="100%"
            onClick={_handleClick}
            isDisabled={shouldDisableButton}
            fontColor={ColorOption.white}
        >
            {_renderButtonText()}
        </Button>
    );
}
    



  

   
    
   



