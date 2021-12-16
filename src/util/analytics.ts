import { ChainId } from '@0x/contract-addresses';
import { BigNumber } from '@0x/utils';

import { GIT_SHA, HEAP_ENABLED, INSTANT_DISCHARGE_TARGET, NODE_ENV, NPM_PACKAGE_VERSION } from '../constants';
import {
    AffiliateInfo,
    ApproveProcessState,
    BaseCurrency,
    OrderProcessState,
    ProviderState,
    QuoteFetchOrigin,
    SwapQuoteResponse,
    WalletSuggestion,
} from '../types';

import { EventProperties, heapUtil } from './heap';

let isDisabledViaConfig = false;
export const disableAnalytics = (shouldDisableAnalytics: boolean) => {
    isDisabledViaConfig = shouldDisableAnalytics;
};
export const evaluateIfEnabled = (fnCall: () => void) => {
    if (isDisabledViaConfig) {
        return;
    }
    if (HEAP_ENABLED) {
        fnCall();
    }
};

enum EventNames {
    InstantOpened = 'Instant - Opened',
    InstantClosed = 'Instant - Closed',
    AccountLocked = 'Account - Locked',
    AccountReady = 'Account - Ready',
    AccountUnlockRequested = 'Account - Unlock Requested',
    AccountUnlockDenied = 'Account - Unlock Denied',
    AccountAddressChanged = 'Account - Address Changed',
    BaseCurrencyChanged = 'Base Currency - Changed',
    PaymentMethodDropdownOpened = 'Payment Method - Dropdown Opened',
    PaymentMethodOpenedEtherscan = 'Payment Method - Opened Etherscan',
    PaymentMethodCopiedAddress = 'Payment Method - Copied Address',
    BuyNotEnoughEth = 'Buy - Not Enough Eth',
    SwapNotEnoughEth = 'Swap - Not Enough Eth',
    SwapStarted = 'Swap - Started',
    SwapSignatureDenied = 'Swap - Signature Denied',
    SwapSimulationFailed = 'Swap - Simulation Failed',
    SwapUnknownError = 'Swap - Unknown Error',
    SwapTxSubmitted = 'Swap - Tx Submitted',
    SwapTxSucceeded = 'Swap - Tx Succeeded',
    SwapTxFailed = 'Swap - Tx Failed',
    UsdPriceFetchFailed = 'USD Price - Fetch Failed',
    InstallWalletClicked = 'Install Wallet - Clicked',
    InstallWalletModalOpened = 'Install Wallet - Modal - Opened',
    InstallWalletModalClickedExplanation = 'Install Wallet - Modal - Clicked Explanation',
    InstallWalletModalClickedGet = 'Install Wallet - Modal - Clicked Get',
    InstallWalletModalClosed = 'Install Wallet - Modal - Closed',
    TokenSelectorOpened = 'Token Selector - Opened',
    TokenSelectorClosed = 'Token Selector - Closed',
    TokenSelectorChose = 'Token Selector - Chose',
    TokenSelectorSearched = 'Token Selector - Searched',
    TransactionViewed = 'Transaction - Viewed',
    ApproveTransactionViewed = 'Approve Transaction - Viewed',
    QuoteFetched = 'Quote - Fetched',
    QuoteError = 'Quote - Error',
}

const track = (eventName: EventNames, eventProperties: EventProperties = {}): void => {
    evaluateIfEnabled(() => {
        heapUtil.evaluateHeapCall(heap => heap.track(eventName, eventProperties));
    });
};
function trackingEventFnWithoutPayload(eventName: EventNames): () => void {
    return () => {
        track(eventName);
    };
}
// tslint:disable-next-line:no-unused-variable
function trackingEventFnWithPayload(eventName: EventNames): (eventProperties: EventProperties) => void {
    return (eventProperties: EventProperties) => {
        track(eventName, eventProperties);
    };
}

const swapApiQuoteEventProperties = (swapQuote: SwapQuoteResponse) => {
    const makerAssetFillAmount = swapQuote.sellAmount.toString();
    const assetEthAmount = swapQuote.buyAmount.toString();
    const feeEthAmount = swapQuote.estimatedGas.toString();

    const totalEthAmount = new BigNumber(swapQuote.sellAmount)
        .plus(swapQuote.protocolFee)
        .toString();
    return {
        makerAssetFillAmount,
        assetEthAmount,
        feeEthAmount,
        totalEthAmount,
        gasPrice: swapQuote.gasPrice.toString(),
    };
};

export interface AnalyticsUserOptions {
    lastKnownEthAddress?: string;
    lastEthBalanceInUnitAmount?: string;
}
export interface AnalyticsEventOptions {
    embeddedHost?: string;
    embeddedUrl?: string;
    ethBalanceInUnitAmount?: string;
    ethAddress?: string;
    networkId?: number;
    providerName?: string;
    providerDisplayName?: string;
    gitSha?: string;
    npmVersion?: string;
    instantEnvironment?: string;
    orderSource?: string;
    affiliateAddress?: string;
    affiliateFeePercent?: number;
    numberAvailableAssets?: number;
    selectedAssetName?: string;
    selectedAssetSymbol?: string;
    selectedAssetData?: string;
    selectedAssetDecimals?: number;
    baseCurrency?: string;
}
export enum TokenSelectorClosedVia {
    ClickedX = 'Clicked X', // tslint:disable-line:enum-naming
    TokenChose = 'Token Chose',
}

export enum StepSelectorClosedVia {
    ClickedX = 'Clicked X', // tslint:disable-line:enum-naming
    ApproveChoose = 'Approve Choose',
    ReviewChoose = 'Review Choose',
}

export const analytics = {
    addUserProperties: (properties: AnalyticsUserOptions): void => {
        evaluateIfEnabled(() => {
            heapUtil.evaluateHeapCall(heap => heap.addUserProperties(properties));
        });
    },
    addEventProperties: (properties: AnalyticsEventOptions): void => {
        evaluateIfEnabled(() => {
            heapUtil.evaluateHeapCall(heap => heap.addEventProperties(properties));
        });
    },
    generateEventProperties: (
        network: ChainId,
        providerState: ProviderState,
        window: Window,
        affiliateInfo?: AffiliateInfo,
        baseCurrency?: BaseCurrency,
    ): AnalyticsEventOptions => {
        const affiliateAddress = affiliateInfo ? affiliateInfo.feeRecipient : 'none';
        const affiliateFeePercent = affiliateInfo ? parseFloat(affiliateInfo.feePercentage.toFixed(4)) : 0;
        const eventOptions: AnalyticsEventOptions = {
            embeddedHost: window.location.host,
            embeddedUrl: window.location.href,
            networkId: network,
            providerName: providerState.name,
            providerDisplayName: providerState.displayName,
            gitSha: GIT_SHA,
            npmVersion: NPM_PACKAGE_VERSION,
            affiliateAddress,
            affiliateFeePercent,
            instantEnvironment: INSTANT_DISCHARGE_TARGET || `Local ${NODE_ENV}`,
            baseCurrency,
        };
        return eventOptions;
    },
    trackInstantOpened: trackingEventFnWithoutPayload(EventNames.InstantOpened),
    trackInstantClosed: trackingEventFnWithoutPayload(EventNames.InstantClosed),
    trackAccountLocked: trackingEventFnWithoutPayload(EventNames.AccountLocked),
    trackAccountReady: (address: string) => trackingEventFnWithPayload(EventNames.AccountReady)({ address }),
    trackAccountUnlockRequested: trackingEventFnWithoutPayload(EventNames.AccountUnlockRequested),
    trackAccountUnlockDenied: trackingEventFnWithoutPayload(EventNames.AccountUnlockDenied),
    trackAccountAddressChanged: (address: string) =>
        trackingEventFnWithPayload(EventNames.AccountAddressChanged)({ address }),
    trackBaseCurrencyChanged: (currencyChangedTo: BaseCurrency) =>
        trackingEventFnWithPayload(EventNames.BaseCurrencyChanged)({ currencyChangedTo }),
    trackPaymentMethodDropdownOpened: trackingEventFnWithoutPayload(EventNames.PaymentMethodDropdownOpened),
    trackPaymentMethodOpenedEtherscan: trackingEventFnWithoutPayload(EventNames.PaymentMethodOpenedEtherscan),
    trackPaymentMethodCopiedAddress: trackingEventFnWithoutPayload(EventNames.PaymentMethodCopiedAddress),
    trackSwapNotEnoughEth: (swapQuote: SwapQuoteResponse) =>
        trackingEventFnWithPayload(EventNames.SwapNotEnoughEth)(swapApiQuoteEventProperties(swapQuote)),
    trackSwapStarted: (swapQuote: SwapQuoteResponse) =>
        trackingEventFnWithPayload(EventNames.SwapStarted)(swapApiQuoteEventProperties(swapQuote)),
    trackSwapSignatureDenied: (swapQuote: SwapQuoteResponse) =>
        trackingEventFnWithPayload(EventNames.SwapSignatureDenied)(swapApiQuoteEventProperties(swapQuote)),

    trackSwapSimulationFailed: (swapQuote: SwapQuoteResponse) =>
        trackingEventFnWithPayload(EventNames.SwapSimulationFailed)(swapApiQuoteEventProperties(swapQuote)),

    trackSwapUnknownError: (swapQuote: SwapQuoteResponse, errorMessage: string) =>
        trackingEventFnWithPayload(EventNames.SwapUnknownError)({
            ...swapApiQuoteEventProperties(swapQuote),
            errorMessage,
        }),
    trackSwapTxSubmitted: (
            swapQuote: SwapQuoteResponse,
            txHash: string,
            startTimeUnix: number,
            expectedEndTimeUnix: number,
        ) =>
            trackingEventFnWithPayload(EventNames.SwapTxSubmitted)({
                ...swapApiQuoteEventProperties(swapQuote),
                txHash,
                expectedTxTimeMs: expectedEndTimeUnix - startTimeUnix,
            }),

    trackSwapTxSucceeded: (
            swapQuote: SwapQuoteResponse,
            txHash: string,
            startTimeUnix: number,
            expectedEndTimeUnix: number,
        ) =>
            trackingEventFnWithPayload(EventNames.SwapTxSucceeded)({
                ...swapApiQuoteEventProperties(swapQuote),
                txHash,
                expectedTxTimeMs: expectedEndTimeUnix - startTimeUnix,
                actualTxTimeMs: new Date().getTime() - startTimeUnix,
            }),
    trackSwapTxFailed: (
            swapQuote: SwapQuoteResponse,
            txHash: string,
            startTimeUnix: number,
            expectedEndTimeUnix: number,
        ) =>
            trackingEventFnWithPayload(EventNames.SwapTxFailed)({
                ...swapApiQuoteEventProperties(swapQuote),
                txHash,
                expectedTxTimeMs: expectedEndTimeUnix - startTimeUnix,
                actualTxTimeMs: new Date().getTime() - startTimeUnix,
            }),
    trackInstallWalletClicked: (walletSuggestion: WalletSuggestion) =>
        trackingEventFnWithPayload(EventNames.InstallWalletClicked)({ walletSuggestion }),
    trackInstallWalletModalClickedExplanation: trackingEventFnWithoutPayload(
        EventNames.InstallWalletModalClickedExplanation,
    ),
    trackInstallWalletModalClickedGet: trackingEventFnWithoutPayload(EventNames.InstallWalletModalClickedGet),
    trackInstallWalletModalOpened: trackingEventFnWithoutPayload(EventNames.InstallWalletModalOpened),
    trackInstallWalletModalClosed: trackingEventFnWithoutPayload(EventNames.InstallWalletModalClosed),
    trackTokenSelectorOpened: trackingEventFnWithoutPayload(EventNames.TokenSelectorOpened),
    trackTokenSelectorClosed: (closedVia: TokenSelectorClosedVia) =>
        trackingEventFnWithPayload(EventNames.TokenSelectorClosed)({ closedVia }),
    trackTokenSelectorChose: (payload: { assetName: string; assetData: string }) =>
        trackingEventFnWithPayload(EventNames.TokenSelectorChose)(payload),
    trackTokenSelectorSearched: (searchText: string) =>
        trackingEventFnWithPayload(EventNames.TokenSelectorSearched)({ searchText }),
    trackTransactionViewed: (orderProcesState: OrderProcessState) =>
        trackingEventFnWithPayload(EventNames.TransactionViewed)({ orderState: orderProcesState }),
    trackApproveTransactionViewed: (approveProcessState: ApproveProcessState) =>
        trackingEventFnWithPayload(EventNames.ApproveTransactionViewed)({approveState: approveProcessState }),
    trackApiQuoteFetched: (swapQuote: SwapQuoteResponse, fetchOrigin: QuoteFetchOrigin) =>
        trackingEventFnWithPayload(EventNames.QuoteFetched)({
            ...swapApiQuoteEventProperties(swapQuote),
            fetchOrigin,
        }),
    trackQuoteError: (errorMessage: string, makerAssetFillAmount: BigNumber, fetchOrigin: QuoteFetchOrigin) => {
        trackingEventFnWithPayload(EventNames.QuoteError)({
            errorMessage,
            makerAssetFillAmount: makerAssetFillAmount.toString(),
            fetchOrigin,
        });
    },
    trackUsdPriceFailed: trackingEventFnWithoutPayload(EventNames.UsdPriceFetchFailed),
};
