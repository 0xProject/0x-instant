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
        takerAddress: String,
        token: TokenInfo,
        tokenUnitAmount: BigNumber,
        fetchOrigin: QuoteFetchOrigin,
        options: {
            setPending: boolean;
            dispatchErrors: boolean;
        },
    ): Promise<void> => {
        // get a new swap quote.
        const baseUnitValue = Web3Wrapper.toBaseUnitAmount(tokenUnitAmount, token.decimals)
         
        const tokenAddress = token.address;

        if (options.setPending) {
            // mark quote as pending
            dispatch(actions.setQuoteRequestStatePending());
        }

        let newSwapQuote: SwapQuoteResponse | undefined;
        try {
          
            newSwapQuote = await fetch(`${ZRX_API_URL}/quote?sellToken=${tokenAddress}&buyToken=ETH&sellAmount=${baseUnitValue}&takerAddress=${takerAddress}`).then(r => {
                return r.json() as unknown as SwapQuoteResponse
            });
            
            
        } catch (error) {
            const errorMessage = tokenUtils.swapQuoterErrorMessage(token, error);

            errorReporter.report(error);
            analytics.trackQuoteError(error.message ? error.message : 'other', baseUnitValue, fetchOrigin);

            if (options.dispatchErrors) {
                dispatch(actions.setQuoteRequestStateFailure());
                errorFlasher.flashNewErrorMessage(dispatch, errorMessage || 'Error fetching price, please try again');
            }
            return;
        }
        // We have a successful new swap quote
        errorFlasher.clearError(dispatch);
        // invalidate the last swap quote.
        dispatch(actions.updateLatestApiSwapQuote(newSwapQuote));
        analytics.trackApiQuoteFetched(newSwapQuote, fetchOrigin);
    },
};
