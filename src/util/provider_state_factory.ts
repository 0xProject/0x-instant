import { ChainId } from '@0x/contract-addresses';
import { providerUtils } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { SupportedProvider, ZeroExProvider } from 'ethereum-types';
import * as Fortmatic from 'fortmatic';

import { FORTMATIC_API_KEY, LOCKED_ACCOUNT, NO_ACCOUNT } from '../constants';
import { Maybe, ProviderState, ProviderType } from '../types';
import { envUtil } from '../util/env';

import { providerFactory } from './provider_factory';

export const providerStateFactory = {
    getInitialProviderState: (
        network: ChainId,
        supportedProvider?: SupportedProvider,
        walletDisplayName?: string,
    ): ProviderState => {
        if (supportedProvider !== undefined) {
            const provider = providerUtils.standardizeOrThrow(
                supportedProvider,
            );
            return providerStateFactory.getInitialProviderStateFromProvider(
                provider,
                walletDisplayName,
            );
        }
        const providerStateFromWindowIfExits = providerStateFactory.getInitialProviderStateFromWindowIfExists(
            walletDisplayName,
        );
        if (providerStateFromWindowIfExits) {
            return providerStateFromWindowIfExits;
        } else {
            return providerStateFactory.getInitialProviderStateFallback(
                network,
                walletDisplayName,
            );
        }
    },
    getInitialProviderStateFromProvider: (
        provider: ZeroExProvider,
        walletDisplayName?: string,
    ): ProviderState => {
        const providerState: ProviderState = {
            name: envUtil.getProviderName(provider),
            displayName:
                walletDisplayName || envUtil.getProviderDisplayName(provider),
            provider,
            web3Wrapper: new Web3Wrapper(provider),
            account: LOCKED_ACCOUNT,
            isProviderInjected: false,
        };
        return providerState;
    },
    getInitialProviderStateFromWindowIfExists: (
        walletDisplayName?: string,
    ): Maybe<ProviderState> => {
        const injectedProviderIfExists = providerFactory.getInjectedProviderIfExists();
        if (injectedProviderIfExists !== undefined) {
            const providerState: ProviderState = {
                name: envUtil.getProviderName(injectedProviderIfExists),
                displayName:
                    walletDisplayName ||
                    envUtil.getProviderDisplayName(injectedProviderIfExists),
                provider: injectedProviderIfExists,
                web3Wrapper: new Web3Wrapper(injectedProviderIfExists),
                account: LOCKED_ACCOUNT,
                isProviderInjected: true,
            };
            return providerState;
        } else {
            return undefined;
        }
    },
    getInitialProviderStateFallback: (
        network: ChainId,
        walletDisplayName?: string,
    ): ProviderState => {
        const provider = providerFactory.getFallbackNoSigningProvider(network);
        const providerState: ProviderState = {
            name: 'Fallback',
            displayName:
                walletDisplayName || envUtil.getProviderDisplayName(provider),
            provider,
            web3Wrapper: new Web3Wrapper(provider),
            account: NO_ACCOUNT,
            isProviderInjected: true,
        };
        return providerState;
    },
    // function to call getInitialProviderState with parameters retreived from a provided ProviderState
    getInitialProviderStateWithCurrentProviderState: (
        currentProviderState: ProviderState,
        chainId: ChainId,
    ): ProviderState => {
        // If provider is provided to instant, use that and the displayName
        if (!currentProviderState.isProviderInjected) {
            return providerStateFactory.getInitialProviderState(
                chainId,
                currentProviderState.provider,
                currentProviderState.displayName,
            );
        }
        const newProviderState = providerStateFactory.getInitialProviderState(
            chainId,
        );
        newProviderState.account = LOCKED_ACCOUNT;
        return newProviderState;
    },
    getProviderStateBasedOnProviderType: (
        providerType: ProviderType,
        chainId: ChainId,
    ): ProviderState => {

        // Returns current provider if the provider type selected is not found
        if (providerType === ProviderType.MetaMask) {
            const provider = providerFactory.getInjectedProviderIfExists();
            if (provider) {
                return {
                    displayName: envUtil.getProviderDisplayName(provider),
                    name: envUtil.getProviderName(provider),
                    provider,
                    web3Wrapper: new Web3Wrapper(provider),
                    account: LOCKED_ACCOUNT,
                    isProviderInjected: true,
                };
            }
        }
        if (providerType === ProviderType.Fortmatic) {
            const fm = new Fortmatic(FORTMATIC_API_KEY);
            const fmProvider = fm.getProvider();
            return {
                displayName: envUtil.getProviderDisplayName(fmProvider),
                name: envUtil.getProviderName(fmProvider),
                provider: fmProvider,
                web3Wrapper: new Web3Wrapper(fmProvider),
                account: LOCKED_ACCOUNT,
                isProviderInjected: true,
            };
        }
        return providerStateFactory.getInitialProviderState(
            chainId,
        );
    },
};
