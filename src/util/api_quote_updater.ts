import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { Dispatch } from 'redux';
import { ZRX_API_URL } from '../constants';

import { Action, actions } from '../redux/actions';
import {  QuoteFetchOrigin, SwapQuoteResponse, TokenInfo } from '../types';

import { analytics } from './analytics';


import { errorFlasher } from './error_flasher';
import { errorReporter } from './error_reporter';
import { tokenUtils } from './token';


export const apiQuoteUpdater = {
    updateSwapQuoteAsync: async (
        dispatch: Dispatch<Action>,
        isIn: boolean,
        takerAddress: String,
        tokenIn: TokenInfo,
        tokenOut: TokenInfo,
        tokenUnitAmount: BigNumber,
        fetchOrigin: QuoteFetchOrigin,
        options: {
            setPending: boolean;
            dispatchErrors: boolean;
        },
        skipValidation: boolean = true,
    ): Promise<void> => {
        const tokenSell = isIn ? tokenIn : tokenOut; 
        const tokenBuy = isIn ? tokenOut : tokenIn; 

       
        const tokenAddressSell = tokenSell.address;
        const tokenAddressBuy = tokenBuy.address;

        if (options.setPending) {
            // mark quote as pending
            dispatch(actions.setQuoteRequestStatePending());
        }

        let newSwapQuote: SwapQuoteResponse | undefined;
        try {
            let takerAddressString = '';
            let skipValidationString = '';
            if(takerAddress){
                takerAddressString = `&takerAddress=${takerAddress}`
            }
            if(skipValidation){
                skipValidationString = `&skipValidation=true`
            }
          
           const response = await fetch(`${ZRX_API_URL}/quote?sellToken=${tokenAddressSell}&buyToken=${tokenAddressBuy}&sellAmount=${tokenUnitAmount}${takerAddressString}${skipValidationString}`);
            if(response.ok && response.status === 200){
                newSwapQuote = await response.json() as unknown as SwapQuoteResponse;
                // format quote
                newSwapQuote = {
                    ... newSwapQuote,
                    value: new BigNumber(newSwapQuote.value),
                    gasPrice: new BigNumber(newSwapQuote.gasPrice),
                    protocolFee: new BigNumber(newSwapQuote.protocolFee),
                    minimumProtocolFee: new BigNumber(newSwapQuote.minimumProtocolFee),
                    buyAmount: new BigNumber(newSwapQuote.buyAmount),
                    sellAmount: new BigNumber(newSwapQuote.sellAmount),
                    gas: new BigNumber(newSwapQuote.gas),
                    estimatedGas: new BigNumber(newSwapQuote.estimatedGas),
                    estimatedGasTokenRefund: new BigNumber(newSwapQuote.estimatedGasTokenRefund),
                    price: new BigNumber(newSwapQuote.price),
                    guaranteedPrice: new BigNumber(newSwapQuote.guaranteedPrice),
                }


            }else{
                const error = await response.json();
                throw new Error(error.reason);
            }
              
        } catch (error) {
            const errorMessage = tokenUtils.swapQuoterErrorMessage(tokenSell, error);

            errorReporter.report(error);
            analytics.trackQuoteError(error.message ? error.message : 'other', tokenUnitAmount, fetchOrigin);

            if (options.dispatchErrors) {
                dispatch(actions.setQuoteRequestStateFailure());
                errorFlasher.flashNewErrorMessage(dispatch, errorMessage || 'Error fetching price, please try again');
            }
            return;
        }
        // We have a successful new swap quote
        errorFlasher.clearError(dispatch);
        // invalidate the last swap quote.
        dispatch(actions.updateLatestApiSwapQuote(undefined));
        if(isIn){
            dispatch(actions.updateSelectedTokenAmountOut(newSwapQuote.buyAmount));
        }else{
            dispatch(actions.updateSelectedTokenAmountIn(newSwapQuote.sellAmount));
        }
        dispatch(actions.updateLatestApiSwapQuote(newSwapQuote));
        analytics.trackApiQuoteFetched(newSwapQuote, fetchOrigin);
    },
};
