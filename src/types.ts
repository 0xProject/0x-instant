import { ChainId } from '@0x/contract-addresses';
import { ObjectMap } from '@0x/types';
import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { SupportedProvider, ZeroExProvider } from 'ethereum-types';

// Reusable
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Maybe<T> = T | undefined;
export enum AsyncProcessState {
    None = 'NONE',
    Pending = 'PENDING',
    Success = 'SUCCESS',
    Failure = 'FAILURE',
}

export enum OrderProcessState {
    None = 'NONE',
    Validating = 'VALIDATING',
    Processing = 'PROCESSING',
    Success = 'SUCCESS',
    Failure = 'FAILURE',
}

export enum ApproveProcessState {
    None = 'NONE',
    Validating = 'VALIDATING',
    Processing = 'PROCESSING',
    Success = 'SUCCESS',
    Failure = 'FAILURE',
}

export enum QuoteFetchOrigin {
    Manual = 'Manual',
    Heartbeat = 'Heartbeat',
}

export enum BaseCurrency {
    USD = 'USD', // tslint:disable-line:enum-naming
    ETH = 'ETH', // tslint:disable-line:enum-naming
}

export enum SwapStep {
    ReviewOrder = 'ReviewOrder',
    Approve = 'Approve',
    Swap = 'Swap',
}

export interface SimulatedProgress {
    startTimeUnix: number;
    expectedEndTimeUnix: number;
}

interface OrderStatePreTx {
    processState: OrderProcessState.None | OrderProcessState.Validating;
}
interface OrderStatePostTx {
    processState:
        | OrderProcessState.Processing
        | OrderProcessState.Success
        | OrderProcessState.Failure;
    txHash: string;
    progress: SimulatedProgress;
}

interface ApproveStatePreTx {
    processState: ApproveProcessState.None | ApproveProcessState.Validating;
}
interface ApproveStatePostTx {
    processState:
        | ApproveProcessState.Processing
        | ApproveProcessState.Success
        | ApproveProcessState.Failure;
    txHash: string;
    progress: SimulatedProgress;
}
export type OrderState = OrderStatePreTx | OrderStatePostTx;

export type ApproveState = ApproveStatePreTx | ApproveStatePostTx;

export enum DisplayStatus {
    Present,
    Hidden,
}

export type FunctionType = (...args: any[]) => any;
export type ActionCreatorsMapObject = ObjectMap<FunctionType>;
export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<
    A[keyof A]
>;

export enum Network {
    Kovan = 42,
    Mainnet = 1,
}

export enum ZeroExInstantError {
    AssetMetaDataNotAvailable = 'ASSET_META_DATA_NOT_AVAILABLE',
    InsufficientETH = 'INSUFFICIENT_ETH', // tslint:disable-line:enum-naming
    CouldNotSubmitTransaction = 'COULD_NOT_SUBMIT_TRANSACTION',
}

export type SimpleHandler = () => void;

export interface AffiliateInfo {
    feeRecipient: string;
    feePercentage: number;
}

export interface ProviderState {
    name: string;
    displayName: string;
    provider: ZeroExProvider;
    web3Wrapper: Web3Wrapper;
    account: Account;
    isProviderInjected: boolean;
}

export enum AccountState {
    None = 'NONE',
    Loading = 'LOADING',
    Ready = 'READY',
    Locked = 'LOCKED',
}

export interface AccountReady {
    state: AccountState.Ready;
    address: string;
    ethBalanceInWei?: BigNumber;
}
export interface AccountNotReady {
    state: AccountState.None | AccountState.Loading | AccountState.Locked;
}

export type Account = AccountReady | AccountNotReady;

export interface AddressAndEthBalanceInWei {
    address: string;
    ethBalanceInWei: BigNumber;
}

export type SlideAnimationState = 'slidIn' | 'slidOut' | 'none';

export enum StandardSlidingPanelContent {
    None = 'NONE',
    InstallWallet = 'INSTALL_WALLET',
}

export interface StandardSlidingPanelSettings {
    animationState: SlideAnimationState;
    content: StandardSlidingPanelContent;
}

export enum Browser {
    Chrome = 'CHROME',
    Firefox = 'FIREFOX',
    Opera = 'OPERA',
    Safari = 'SAFARI',
    Edge = 'EDGE',
    Other = 'OTHER',
}

export enum WalletSuggestion {
    CoinbaseWallet = 'Coinbase Wallet',
    MetaMask = 'MetaMask',
}

export enum OperatingSystem {
    Android = 'ANDROID',
    iOS = 'IOS', // tslint:disable-line:enum-naming
    Mac = 'MAC',
    Windows = 'WINDOWS',
    WindowsPhone = 'WINDOWS_PHONE',
    Linux = 'LINUX',
    Other = 'OTHER',
}

export enum ProviderType {
    Parity = 'PARITY',
    MetaMask = 'META_MASK',
    Mist = 'MIST',
    CoinbaseWallet = 'COINBASE_WALLET',
    Cipher = 'CIPHER',
    TrustWallet = 'TRUST_WALLET',
    Opera = 'OPERA',
    Fortmatic = 'Fortmatic',
    Fallback = 'FALLBACK',
}

export interface AffiliateInfo {
    feeRecipient: string;
    feePercentage: number;
}

export interface ZeroExInstantOptionalBaseConfig {
    provider: SupportedProvider;
    walletDisplayName: string;
    defaultSelectedTokenIn: TokenInfo;
    defaultSelectedTokenOut: TokenInfo;
    defaultAmountTokenIn: number;
    defaultAmountTokenOut: number;
    chainId: ChainId;
    affiliateInfo: AffiliateInfo;
    tokenList: string | TokenList;
    shouldDisableAnalyticsTracking: boolean;
    onSuccess?: (txHash: string) => void;
}

export type ZeroExInstantBaseConfig = Partial<ZeroExInstantOptionalBaseConfig>;

export interface SwapQuoteResponse extends SwapQuoteResponsePartialTransaction, SwapQuoteResponsePrice {
        gasPrice: BigNumber;
        protocolFee: BigNumber;
        minimumProtocolFee: BigNumber;
        buyAmount: BigNumber;
        sellAmount: BigNumber;
        buyTokenAddress: string;
        sellTokenAddress: string;
        sources: GetSwapQuoteResponseLiquiditySource[];
        from?: string;
        gas: BigNumber;
        estimatedGas: BigNumber;
        estimatedGasTokenRefund: BigNumber;
        allowanceTarget?: string;
       // quoteReport?: QuoteReport;
    }

export interface SwapQuoteResponsePartialTransaction {
        to: string;
        data: string;
        value: BigNumber;
        decodedUniqueId: string;
}

export interface SwapQuoteResponsePrice {
        price: BigNumber;
        guaranteedPrice: BigNumber;
}

export interface GetSwapQuoteResponseLiquiditySource {
        name: string;
        proportion: BigNumber;
        intermediateToken?: string;
        hops?: string[];
}

export interface TokenInfo {
    readonly chainId: number;
    readonly address: string;
    readonly name: string;
    readonly decimals: number;
    readonly symbol: string;
    readonly logoURI?: string;
    readonly tags?: string[];
  }
export interface TokenBalance {
    token: TokenInfo;
    balance: BigNumber;
    isUnlocked: boolean;
}

export interface Version {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
  }

export interface Tags {
    readonly [tagId: string]: {
      readonly name: string;
      readonly description: string;
    };
  }

export interface TokenList {
    readonly name: string;
    readonly timestamp: string;
    readonly version: Version;
    readonly tokens: TokenInfo[];
    readonly keywords?: string[];
    readonly tags?: Tags;
    readonly logoURI?: string;
  }
