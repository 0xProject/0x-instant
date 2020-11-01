import {
    SwapQuoteConsumer,
    SwapQuoter,
    SwapQuoterOpts,
} from '@0x/asset-swapper';
import { ChainId } from '@0x/contract-addresses';
import { SupportedProvider } from 'ethereum-types';
import * as _ from 'lodash';

import { OrderSource } from '../types';

export const assetSwapperFactory = {
    getSwapQuoter: (
        supportedProvider: SupportedProvider,
        orderSource: OrderSource,
        network: ChainId,
    ): SwapQuoter => {
        const swapQuoterOpts: Partial<SwapQuoterOpts> = {
            chainId: network,
        };
        const swapQuoter = _.isString(orderSource)
            ? SwapQuoter.getSwapQuoterForStandardRelayerAPIUrl(
                  supportedProvider,
                  orderSource,
                  swapQuoterOpts,
              )
            : SwapQuoter.getSwapQuoterForProvidedOrders(
                  supportedProvider,
                  orderSource,
                  swapQuoterOpts,
              );
        return swapQuoter;
    },
    getSwapQuoteConsumer: (
        supportedProvider: SupportedProvider,
        network: ChainId,
    ): SwapQuoteConsumer => {
        const swapQuoteConsumerOptions: Partial<SwapQuoterOpts> = {
            chainId: network,
        };
        return new SwapQuoteConsumer(
            supportedProvider,
            swapQuoteConsumerOptions,
        );
    },
};
