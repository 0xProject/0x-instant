import { AssetProxyId } from '@0x/types';
import { BigNumber, providerUtils } from '@0x/utils';
import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
    DEFAULT_ZERO_EX_CONTAINER_SELECTOR,
    GIT_SHA as GIT_SHA_FROM_CONSTANT,
    INJECTED_DIV_CLASS,
    INJECTED_DIV_ID,
    NPM_PACKAGE_VERSION,
} from './constants';
import { assetMetaDataMap } from './data/asset_meta_data_map';
import { ZeroExInstantOverlay, ZeroExInstantOverlayProps } from './index';
import { analytics } from './util/analytics';
import { assert } from './util/assert';
import { assetDataEncoder } from './util/asset_data_encoder';
import { util } from './util/util';
import "regenerator-runtime/runtime.js";

const isInstantRendered = (): boolean =>
    !!document.getElementById(INJECTED_DIV_ID);

const validateInstantRenderConfig = (
    config: ZeroExInstantConfig,
    selector: string,
) => {
   
    if (config.defaultSelectedTokenIn !== undefined) {
        assert.isTokenInfo(
            'defaultSelectedTokenIn',
            config.defaultSelectedTokenIn,
        );
    }

    if (config.defaultSelectedTokenOut !== undefined) {
        assert.isTokenInfo(
            'defaultSelectedTokenOut',
            config.defaultSelectedTokenOut,
        );
    }

    if (config.defaultAmountTokenIn !== undefined) {
        assert.isNumber('defaultAmountTokenIn', config.defaultAmountTokenIn);
    }

    if (config.defaultAmountTokenOut !== undefined) {
        assert.isNumber('defaultAmountTokenOut', config.defaultAmountTokenOut);
    }


    if (config.chainId !== undefined) {
        assert.isNumber('chainId', config.chainId);
    }

    if (config.onClose !== undefined) {
        assert.isFunction('onClose', config.onClose);
    }
    if (config.zIndex !== undefined) {
        assert.isNumber('zIndex', config.zIndex);
    }
    if (config.affiliateInfo !== undefined) {
        assert.isValidAffiliateInfo('affiliateInfo', config.affiliateInfo);
    }
    if (config.provider !== undefined) {
        providerUtils.standardizeOrThrow(config.provider);
    }
    if (config.walletDisplayName !== undefined) {
        assert.isString('walletDisplayName', config.walletDisplayName);
    }

    if (config.tokenList !== undefined) {
        assert.isWebUri('tokenList', config.tokenList);
    }


    if (config.shouldDisablePushToHistory !== undefined) {
        assert.isBoolean(
            'shouldDisablePushToHistory',
            config.shouldDisablePushToHistory,
        );
    }
    if (config.shouldDisableAnalyticsTracking !== undefined) {
        assert.isBoolean(
            'shouldDisableAnalyticsTracking',
            config.shouldDisableAnalyticsTracking,
        );
    }
    assert.isString('selector', selector);
};

let injectedDiv: HTMLDivElement | undefined;
let parentElement: Element | undefined;
export const unrender = () => {
    if (!injectedDiv) {
        return;
    }

    ReactDOM.unmountComponentAtNode(injectedDiv);
    if (parentElement && parentElement.contains(injectedDiv)) {
        parentElement.removeChild(injectedDiv);
    }
};

// Render instant and return a callback that allows you to remove it from the DOM.
const renderInstant = (config: ZeroExInstantConfig, selector: string) => {
    const appendToIfExists = document.querySelector(selector);
    assert.assert(
        appendToIfExists !== null,
        `Could not find div with selector: ${selector}`,
    );
    parentElement = appendToIfExists as Element;
    injectedDiv = document.createElement('div');
    injectedDiv.setAttribute('id', INJECTED_DIV_ID);
    injectedDiv.setAttribute('class', INJECTED_DIV_CLASS);
    parentElement.appendChild(injectedDiv);
    const closeInstant = () => {
        analytics.trackInstantClosed();
        if (config.onClose !== undefined) {
            config.onClose();
        }
        unrender();
    };
    const instantOverlayProps = {
        ...config,
        // If we are using the history API, just go back to close
        onClose: () =>
            config.shouldDisablePushToHistory
                ? closeInstant()
                : window.history.back(),
    };
    ReactDOM.render(
        React.createElement(ZeroExInstantOverlay, instantOverlayProps),
        injectedDiv,
    );
    return closeInstant;
};

export interface ZeroExInstantConfig extends ZeroExInstantOverlayProps {
    shouldDisablePushToHistory?: boolean;
}

export const render = (
    config: ZeroExInstantConfig,
    selector: string = DEFAULT_ZERO_EX_CONTAINER_SELECTOR,
) => {
    // Coerces BigNumber provided in config to version utilized by 0x packages
    const coercedConfig = config;

    validateInstantRenderConfig(coercedConfig, selector);

    if (coercedConfig.shouldDisablePushToHistory) {
        if (!isInstantRendered()) {
            renderInstant(coercedConfig, selector);
        }
        return;
    }
    // Before we render, push to history saying that instant is showing for this part of the history.
    window.history.pushState({ zeroExInstantShowing: true }, '0x Instant');
    let removeInstant = renderInstant(coercedConfig, selector);
    // If the integrator defined a popstate handler, save it to __zeroExInstantIntegratorsPopStateHandler
    // unless we have already done so on a previous render.
    const anyWindow = window as any;
    const popStateExistsAndNotSetPreviously =
        window.onpopstate &&
        !anyWindow.__zeroExInstantIntegratorsPopStateHandler;
    anyWindow.__zeroExInstantIntegratorsPopStateHandler = popStateExistsAndNotSetPreviously
        ? anyWindow.onpopstate.bind(window)
        : util.boundNoop;
    const onPopStateHandler = (e: PopStateEvent) => {
        anyWindow.__zeroExInstantIntegratorsPopStateHandler(e);
        const newState = e.state;
        if (newState && newState.zeroExInstantShowing) {
            // We have returned to a history state that expects instant to be rendered.
            if (!isInstantRendered()) {
                removeInstant = renderInstant(coercedConfig, selector);
            }
        } else {
            // History has changed to a different state.
            if (isInstantRendered()) {
                removeInstant();
            }
        }
    };
    window.onpopstate = onPopStateHandler;
};

export const ERC721_PROXY_ID = AssetProxyId.ERC721;

export const ERC20_PROXY_ID = AssetProxyId.ERC20;

export const assetDataForERC20TokenAddress = (tokenAddress: string): string => {
    assert.isETHAddressHex('tokenAddress', tokenAddress);
    return assetDataEncoder
        .ERC20Token(tokenAddress)
        .getABIEncodedTransactionData();
};

export const assetDataForERC721TokenAddress = (
    tokenAddress: string,
    tokenId: string | number,
): string => {
    assert.isETHAddressHex('tokenAddress', tokenAddress);
    return assetDataEncoder
        .ERC721Token(tokenAddress, new BigNumber(tokenId))
        .getABIEncodedTransactionData();
};

export const hasMetaDataForAssetData = (assetData: string): boolean => {
    assert.isHexString('assetData', assetData);
    return assetMetaDataMap[assetData] !== undefined;
};

/*export const hasLiquidityForAssetDataAsync = async (
    takerAssetData: string,
    orderSource: OrderSource,
    chainId: ChainId = ChainId.Mainnet,
    supportedProvider?: SupportedProvider,
): Promise<boolean> => {
    assert.isHexString('takerAssetData', takerAssetData);
    assert.isValidOrderSource('orderSource', orderSource);
    assert.isNumber('chainId', chainId);

    let provider = supportedProvider;
    if (provider !== undefined) {
        provider = providerUtils.standardizeOrThrow(provider);
    }

    const bestProvider: SupportedProvider =
        provider ||
        providerUtils.standardizeOrThrow(
            providerFactory.getFallbackNoSigningProvider(
                chainId,
            ) as SupportedProvider,
        );

    const swapQuoterOptions = { chainId };

    const swapQuoter = _.isString(orderSource)
        ? SwapQuoter.getSwapQuoterForStandardRelayerAPIUrl(
              bestProvider,
              orderSource,
              swapQuoterOptions,
          )
        : SwapQuoter.getSwapQuoterForProvidedOrders(
              bestProvider,
              orderSource,
              swapQuoterOptions,
          );

    const wethAssetData = await swapQuoter.getEtherTokenAssetDataOrThrowAsync();
    const liquidity = await swapQuoter.getLiquidityForMakerTakerAssetDataPairAsync(
        wethAssetData,
        takerAssetData,
    );
    return liquidity.makerAssetAvailableInBaseUnits.gt(new BigNumber(0));
};*/

// Write version info to the exported object for debugging
export const GIT_SHA = GIT_SHA_FROM_CONSTANT;
export const NPM_VERSION = NPM_PACKAGE_VERSION;
