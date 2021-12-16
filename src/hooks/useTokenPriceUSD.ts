import { ChainId } from '@0x/contract-addresses';
import { Token } from '@0x/types';
import {  fromTokenUnitAmount } from '@0x/utils';
import { useEffect, useState } from 'react';

import { SwapQuoteResponse } from '../types';
import { apiQuoteUpdater } from '../util/api_quote_updater';

export const useTokenPriceUSD = (token?: Token,  chainId?: ChainId, refresh?: boolean) => {
    const [priceQuote, setPriceQuote] = useState<SwapQuoteResponse>();
    const [loading, setLoading] = useState<boolean>();

    useEffect(() => {
        if (token &&  chainId) {
            const amountAPI = fromTokenUnitAmount('1', token.decimals);

            const referenceToken = {
                address: 'USDC',
            };
            setLoading(true);
            apiQuoteUpdater.fetchQuote('', true, token, referenceToken, amountAPI)
            .then(p => setPriceQuote(p))
            .catch(console.log)
            .finally(() => setLoading(false));
        }

    }, [token, chainId,  refresh]);

    return {priceQuote, loading};
};
