import { ChainId } from '@0x/contract-addresses';
import {
    EmptyWalletSubprovider,
    RPCSubprovider,
    Web3ProviderEngine,
} from '@0x/subproviders';
import { providerUtils } from '@0x/utils';
import { ZeroExProvider } from 'ethereum-types';

import { ETHEREUM_NODE_URL_BY_NETWORK } from '../constants';
import { Maybe } from '../types';

export const providerFactory = {
    getInjectedProviderIfExists: (): Maybe<ZeroExProvider> => {
        const injectedProviderIfExists = (window as any).ethereum;
        if (injectedProviderIfExists !== undefined) {
            const provider = providerUtils.standardizeOrThrow(
                injectedProviderIfExists,
            );
            return provider;
        }
        return undefined;
    },
    getFallbackNoSigningProvider: (chainId: ChainId): Web3ProviderEngine => {
        const providerEngine = new Web3ProviderEngine();
        // Intercept calls to `eth_accounts` and always return empty
        providerEngine.addProvider(new EmptyWalletSubprovider());
        // Construct an RPC subprovider, all data based requests will be sent via the RPCSubprovider
        // TODO(bmillman): make this more resilient to infura failures
        const rpcUrl = ETHEREUM_NODE_URL_BY_NETWORK[chainId];
        if (!rpcUrl) {
            throw new Error('Invalid Network');
        }
        providerEngine.addProvider(new RPCSubprovider(rpcUrl));
        // Start the Provider Engine
        providerUtils.startProviderEngine(providerEngine);
        return providerEngine;
    },
};
