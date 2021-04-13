import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import { Dispatch } from 'redux';

import { BIG_NUMBER_ZERO } from '../constants';
import { defaultTokenList } from '../data/token_lists';
import { AccountState, BaseCurrency, OrderProcessState, ProviderState, QuoteFetchOrigin, TokenInfo, TokenList } from '../types';
import { analytics } from '../util/analytics';
import { apiQuoteUpdater } from '../util/api_quote_updater';
import { coinbaseApi } from '../util/coinbase_api';
import { errorFlasher } from '../util/error_flasher';
import { errorReporter } from '../util/error_reporter';
import { MulticallUtils } from '../util/multicall';
import { providerStateFactory } from '../util/provider_state_factory';

import { actions } from './actions';
import { State } from './reducer';

export const asyncData = {
    fetchEthPriceAndDispatchToStore: async (dispatch: Dispatch) => {
        try {
            const ethUsdPrice = await coinbaseApi.getEthUsdPrice();
            dispatch(actions.updateEthUsdPrice(ethUsdPrice));
        } catch (e) {
            const errorMessage = 'Error fetching ETH/USD price';
            errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
            dispatch(actions.updateEthUsdPrice(BIG_NUMBER_ZERO));
            dispatch(actions.updateBaseCurrency(BaseCurrency.ETH));
            errorReporter.report(e);
            analytics.trackUsdPriceFailed();
        }
    },
    fetchTokenListAndDispatchToStore: async (state: State, dispatch: Dispatch) => {
  
        try {      
            const response = await fetch(defaultTokenList);
            if(response.ok && response.status  === 200){
                const tokenList = await response.json() as TokenList;
                dispatch(actions.setAvailableTokens(tokenList.tokens));

                dispatch(actions.updateSelectedTokenIn(tokenList.tokens[0]));
                dispatch(actions.updateSelectedTokenOut(tokenList.tokens[1]));
            }else{
                throw new Error('Error fetching token list')
            }
            
        } catch (e) {
            const errorMessage = 'Could not find any tokens';
            errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
            // On error, just specify that none are available
            dispatch(actions.setAvailableTokens([]));
            errorReporter.report(e);
        }
    },


    /*fetchAvailableAssetDatasAndDispatchToStore: async (state: State, dispatch: Dispatch) => {
        const { providerState, assetMetaDataMap, network } = state;
        const swapQuoter = providerState.swapQuoter;
        try {
            const wethAssetData = await swapQuoter.getEtherTokenAssetDataOrThrowAsync();
            const assetDatas = await swapQuoter.getAvailableMakerAssetDatasAsync(wethAssetData);
            const deduplicatedAssetDatas = _.uniq(assetDatas);
            const assetsWithNativeOrders = assetUtils.createAssetsFromAssetDatas(
                deduplicatedAssetDatas,
                assetMetaDataMap,
                network,
            );
            const assetsWithBridgeOrders = assetUtils.createAssetsFromAssetDatas(
                SUPPORTED_TOKEN_ASSET_DATA_WITH_BRIDGE_ORDERS,
                assetMetaDataMap,
                network,
            );
            const assets = _.uniqBy(_.concat(assetsWithNativeOrders, assetsWithBridgeOrders), asset => asset.assetData);
            dispatch(actions.setAvailableAssets(assets));
        } catch (e) {
            const errorMessage = 'Could not find any assets';
            errorFlasher.flashNewErrorMessage(dispatch, errorMessage);
            // On error, just specify that none are available
            dispatch(actions.setAvailableAssets([]));
            errorReporter.report(e);
        }
    },*/
    fetchAccountInfoAndDispatchToStore: async (
        providerState: ProviderState,
        dispatch: Dispatch,
        shouldAttemptUnlock: boolean = false,
        tokenIn?: TokenInfo,
        tokenOut?: TokenInfo,
    ) => {
        const web3Wrapper = providerState.web3Wrapper;
        const provider = providerState.provider;
        let availableAddresses: string[] = [];
        if (shouldAttemptUnlock && providerState.account.state !== AccountState.Loading) {
            dispatch(actions.setAccountStateLoading());
        }
        try {
            // HACK: Fortmatic's getAvailableAddressesAsync behaves in ways that default wallet behavior can't handle
            if ((provider as any).isFortmatic) {
                availableAddresses =
                    (provider as any).isLoggedIn || shouldAttemptUnlock
                        ? await web3Wrapper.getAvailableAddressesAsync()
                        : [];
            } else {
                // TODO(bmillman): Add support at the web3Wrapper level for calling `eth_requestAccounts` instead of calling enable here
                const isPrivacyModeEnabled = (provider as any).enable !== undefined;
                availableAddresses =
                    isPrivacyModeEnabled && shouldAttemptUnlock
                        ? await (provider as any).enable()
                        : await web3Wrapper.getAvailableAddressesAsync();
            }
        } catch (e) {
            analytics.trackAccountUnlockDenied();
            if (e.message.includes('Fortmatic: User denied account access.')) {
                const chainId = await providerState.web3Wrapper.getChainIdAsync();

                // If Fortmatic is not used, revert to injected provider
                const initialProviderState = providerStateFactory.getInitialProviderStateWithCurrentProviderState(  
                    providerState,
                    chainId,
                );
                dispatch(actions.setProviderState(initialProviderState));
            } else {
                dispatch(actions.setAccountStateLocked());
            }
            return;
        }
        if (!_.isEmpty(availableAddresses)) {
            const activeAddress = availableAddresses[0];
            dispatch(actions.setAccountStateReady(activeAddress));
            // tslint:disable-next-line:no-floating-promises
            asyncData.fetchAccountBalanceAndDispatchToStore(activeAddress, providerState.web3Wrapper, dispatch, tokenIn, tokenOut);
        } else if (providerState.account.state !== AccountState.Loading) {
            dispatch(actions.setAccountStateLocked());
        }
    },
    fetchAccountBalanceAndDispatchToStore: async (address: string, web3Wrapper: Web3Wrapper, dispatch: Dispatch, tokenIn?: TokenInfo, tokenOut?: TokenInfo) => {
        try {
            const ethBalanceInWei = await web3Wrapper.getBalanceInWeiAsync(address);
            dispatch(actions.updateAccountEthBalance({ address, ethBalanceInWei }));
            const tokenArray: TokenInfo[] = [];
            if(tokenIn){
                tokenArray.push(tokenIn);
            }
            if(tokenOut){
                tokenArray.push(tokenOut);
            }
            if(tokenArray.length){
                const chainId = await web3Wrapper.getChainIdAsync();
                const tokenBalances = await MulticallUtils.getTokensBalancesAndAllowances(web3Wrapper.getProvider() as any, tokenArray, chainId, address);
                if(tokenIn && tokenOut){
                    dispatch(actions.updateSelectedTokenInBalance(tokenBalances[0]));
                    dispatch(actions.updateSelectedTokenOutBalance(tokenBalances[1]));
                }else if (tokenIn && !tokenOut) {
                    dispatch(actions.updateSelectedTokenInBalance(tokenBalances[0]));
                }else if(!tokenIn && tokenOut){
                    dispatch(actions.updateSelectedTokenOutBalance(tokenBalances[0]));
                }   
               // @TODO: Check if it is necessary to fetch all token balances, this will slow down the whole application
               // dispatch(actions.updateTokenBalances(tokenBalances));

            }


        } catch (e) {
            errorReporter.report(e);
            // leave balance as is
            return;
        }
    },
    fetchCurrentApiSwapQuoteAndDispatchToStore: async (
        state: State,
        dispatch: Dispatch,
        fetchOrigin: QuoteFetchOrigin,
        options: { updateSilently: boolean },
    ) => {
        const { swapOrderState, providerState, selectedTokenIn, selectedTokenOut, selectedTokenAmountOut, selectedTokenAmountIn, isIn } = state;
        const takerAddress = providerState.account.state === AccountState.Ready ? providerState.account.address : '';
        const selectedTokenUnitAmount = isIn ? selectedTokenAmountIn : selectedTokenAmountOut;
       
        if (
            selectedTokenUnitAmount !== undefined &&
            selectedTokenIn !== undefined &&
            selectedTokenOut !== undefined &&
            selectedTokenUnitAmount.isGreaterThan(BIG_NUMBER_ZERO) &&
            swapOrderState.processState === OrderProcessState.None
        ) {
            await apiQuoteUpdater.updateSwapQuoteAsync(
                dispatch,
                isIn,
                takerAddress,
                selectedTokenIn,
                selectedTokenOut,
                selectedTokenUnitAmount,
                fetchOrigin,
                {
                    setPending: !options.updateSilently,
                    dispatchErrors: !options.updateSilently,
                },
            );
        }
    }
  /*  fetchCurrentSwapQuoteAndDispatchToStore: async (
        state: State,
        dispatch: Dispatch,
        fetchOrigin: QuoteFetchOrigin,
        options: { updateSilently: boolean },
    ) => {
        const { swapOrderState, providerState, selectedAsset, selectedAssetUnitAmount } = state;
        const swapQuoter = providerState.swapQuoter;
        if (
            selectedAssetUnitAmount !== undefined &&
            selectedAsset !== undefined &&
            selectedAssetUnitAmount.isGreaterThan(BIG_NUMBER_ZERO) &&
            swapOrderState.processState === OrderProcessState.None
        ) {
            await swapQuoteUpdater.updateSwapQuoteAsync(
                swapQuoter,
                dispatch,
                selectedAsset,
                selectedAssetUnitAmount,
                fetchOrigin,
                {
                    setPending: !options.updateSilently,
                    dispatchErrors: !options.updateSilently,
                },
            );
        }
    },*/
};
