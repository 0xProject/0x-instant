import { BigNumber } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { ContractTransaction, ethers, providers } from 'ethers';
import * as _ from 'lodash';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Text } from '../components/ui/text';
import {
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX,
} from '../constants';
import erc20abi from '../constants/ABI/erc20.json';
import { actions } from '../redux/actions';
import {
  getApproveState,
  getIsStepWithApprove,
  getSwapOrderState,
} from '../redux/selectors';
import { ColorOption } from '../style/theme';
import {
  AffiliateInfo,
  ApproveProcessState,
  OrderProcessState,
  SwapQuoteResponse,
  SwapStep,
  TokenBalance,
  TokenInfo,
  ZeroExInstantError,
} from '../types';
import { analytics } from '../util/analytics';
import { errorReporter } from '../util/error_reporter';
import { gasPriceEstimator } from '../util/gas_price_estimator';

import { Button } from './ui/button';
import { Container } from './ui/container';
import { Flex } from './ui/flex';
import { Icon } from './ui/icon';

export interface SwapButtonProps {
  step: SwapStep;
  accountAddress?: string;
  accountEthBalanceInWei?: BigNumber;
  swapQuote?: SwapQuoteResponse;
  web3Wrapper: Web3Wrapper;
  affiliateInfo?: AffiliateInfo;
  tokenBalanceIn?: TokenBalance;
  tokenBalanceOut?: TokenBalance;
  onValidationPending: (swapQuote: SwapQuoteResponse) => void;
  onValidationFail: (
    swapQuote: SwapQuoteResponse,
    errorMessage: ZeroExInstantError,
  ) => void;
  onSignatureDenied: (swapQuote: SwapQuoteResponse) => void;
  onSwapProcessing: (
    swapQuote: SwapQuoteResponse,
    txHash: string,
    startTimeUnix: number,
    expectedEndTimeUnix: number,
  ) => void;
  onSwapSuccess: (swapQuote: SwapQuoteResponse, txHash: string) => void;
  onSwapFailure: (swapQuote: SwapQuoteResponse, txHash: string) => void;
  onApproveValidationPending: (token: TokenInfo) => void;
  onApproveValidationFail: (
    token: TokenInfo,
    errorMessage: ZeroExInstantError,
  ) => void;

  onApproveTokenProcessing: (
    token: TokenInfo,
    txHash: string,
    startTimeUnix: number,
    expectedEndTimeUnix: number,
  ) => void;
  onApproveTokenSuccess: (token: TokenInfo, txHash: string) => void;
  onApproveTokenFailure: (token: TokenInfo, txHash: string) => void;
  onShowPanelStep: (step: SwapStep) => void;
  onClosePanelStep: (step: SwapStep) => void;
  onChangeStep: (step: SwapStep) => void;
}

export const SwapButton = (props: SwapButtonProps) => {
  const dispatch = useDispatch();
  const isStepWithApprove = useSelector(getIsStepWithApprove);
  const swapOrderState = useSelector(getSwapOrderState);
  const approveState = useSelector(getApproveState);
  const { swapQuote, accountAddress } = props;
  const shouldDisableButton =
    swapQuote === undefined || accountAddress === undefined;

  const _handleApprove = async () => {
    const { tokenBalanceIn, web3Wrapper } = props;

    if (
      swapQuote === undefined ||
      accountAddress === undefined ||
      tokenBalanceIn === undefined
    ) {
      return;
    }
    const tokenToApprove = tokenBalanceIn.token;

    props.onApproveValidationPending(tokenToApprove);
    const tokenToApproveAddress = tokenBalanceIn.token.address;
    const pr = new providers.Web3Provider(web3Wrapper.getProvider() as any).getSigner();
    const erc20Token =  new ethers.Contract(tokenToApproveAddress, erc20abi, pr);

    const gasInfo = await gasPriceEstimator.getGasInfoAsync();
    let tx: ContractTransaction | undefined;
    try {

      tx =  (await erc20Token.approve(swapQuote.allowanceTarget, UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toString(), { from: accountAddress, gasPrice: gasInfo.gasPriceInWei.toString() })) as ContractTransaction;

    } catch (e) {
      props.onApproveValidationFail(
        tokenToApprove,
        ZeroExInstantError.CouldNotSubmitTransaction,
      );
      throw e;
    }

    const startTimeUnix = new Date().getTime();
    const expectedEndTimeUnix = startTimeUnix + gasInfo.estimatedTimeMs;
    props.onApproveTokenProcessing(
      tokenToApprove,
      tx.hash,
      startTimeUnix,
      expectedEndTimeUnix,
    );
    try {
      await web3Wrapper.awaitTransactionSuccessAsync(tx.hash);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.startsWith(WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX)
      ) {
        props.onApproveTokenFailure(tokenToApprove, tx.hash);
        return;
      }
      throw e;
    }

    props.onApproveTokenSuccess(tokenToApprove, tx.hash);
    props.onClosePanelStep(props.step);
  };
  const swapCompleted =
    swapOrderState.processState === OrderProcessState.Success;

  const _renderNextStepText = () => {
    const { step } = props;
    switch (step) {
      case SwapStep.Approve:
        return `Next: Confirm Trade`;
      case SwapStep.ReviewOrder:
        return `${props.tokenBalanceIn.token.symbol.toUpperCase()} Approved`;
      default:
        return null;
    }
  };
  const wasApproved = props.step === SwapStep.ReviewOrder;

  const _renderButtonText = () => {
    const { step, tokenBalanceIn } = props;
    if (swapOrderState.processState === OrderProcessState.Processing) {
      return 'Confirming Trade';
    }
    if (approveState.processState === ApproveProcessState.Processing) {
      const tokenToApprove = tokenBalanceIn.token;
      return `Approving ${tokenToApprove.symbol.toUpperCase()}`;
    }

    switch (step) {
      case SwapStep.Swap:
        return 'Preview Trade';
      case SwapStep.Approve:
        const tokenToApprove = tokenBalanceIn.token;
        return `Approve ${tokenToApprove.symbol.toUpperCase()} usage`;
      case SwapStep.ReviewOrder:
        return 'Confirm Trade';
      default:
        return 'Preview Trade';
    }
  };

  const _handleSwap = async () => {
    // The button is disabled when there is no buy quote anyway.
    const { accountEthBalanceInWei, web3Wrapper } = props;
    if (swapQuote === undefined || accountAddress === undefined) {
      return;
    }

    props.onValidationPending(swapQuote);

    const ethNeededForBuy = swapQuote.value;
    // if we don't have a balance for the user, let the transaction through, it will be handled by the wallet
    const hasSufficientEth =
      accountEthBalanceInWei === undefined ||
      accountEthBalanceInWei.gte(ethNeededForBuy);
    if (!hasSufficientEth) {
      analytics.trackSwapNotEnoughEth(swapQuote);
      props.onValidationFail(swapQuote, ZeroExInstantError.InsufficientETH);
      return;
    }
    let txHash: string | undefined;
    const gasInfo = await gasPriceEstimator.getGasInfoAsync();
    try {
      analytics.trackSwapStarted(swapQuote);
      txHash = await web3Wrapper.sendTransactionAsync(
        swapQuote as Required<SwapQuoteResponse>,
      );
    } catch (e) {
      if (e instanceof Error) {
        errorReporter.report(e);
        analytics.trackSwapUnknownError(swapQuote, e.message);
        props.onValidationFail(
          swapQuote,
          ZeroExInstantError.CouldNotSubmitTransaction,
        );
        return;
      }
      // HACK(dekz): Wrappers no longer include decorators which map errors
      // like transaction deny
      if (
        e.message &&
        e.message.includes('User denied transaction signature')
      ) {
        analytics.trackSwapSignatureDenied(swapQuote);
        props.onSignatureDenied(swapQuote);
        return;
      }
      // Fortmatic specific error handling
      if (e.message && e.message.includes('Fortmatic:')) {
        if (e.message.includes('User denied transaction.')) {
          analytics.trackSwapSignatureDenied(swapQuote);
          props.onSignatureDenied(swapQuote);
          return;
        }
      }
      throw e;
    }

    const startTimeUnix = new Date().getTime();
    const expectedEndTimeUnix = startTimeUnix + gasInfo.estimatedTimeMs;
    props.onSwapProcessing(
      swapQuote,
      txHash,
      startTimeUnix,
      expectedEndTimeUnix,
    );
    try {
      analytics.trackSwapTxSubmitted(
        swapQuote,
        txHash,
        startTimeUnix,
        expectedEndTimeUnix,
      );
      await web3Wrapper.awaitTransactionSuccessAsync(txHash);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.startsWith(WEB_3_WRAPPER_TRANSACTION_FAILED_ERROR_MSG_PREFIX)
      ) {
        analytics.trackSwapTxFailed(
          swapQuote,
          txHash,
          startTimeUnix,
          expectedEndTimeUnix,
        );
        props.onSwapFailure(swapQuote, txHash);
        return;
      }
      throw e;
    }
    analytics.trackSwapTxSucceeded(
      swapQuote,
      txHash,
      startTimeUnix,
      expectedEndTimeUnix,
    );
    props.onSwapSuccess(swapQuote, txHash);
    props.onClosePanelStep(props.step);
  };

  const _handleClick = async () => {
    const { step, tokenBalanceIn } = props;
    if (step === SwapStep.Swap && tokenBalanceIn) {
      if (tokenBalanceIn.isUnlocked) {
        props.onChangeStep(SwapStep.ReviewOrder);
        dispatch(actions.setIsStepWithApprove(false));
      } else {
        props.onChangeStep(SwapStep.Approve);
        dispatch(actions.setIsStepWithApprove(true));
      }
      props.onShowPanelStep(step);
    }

    if (step === SwapStep.Approve) {
      _handleApprove();
    }

    if (step === SwapStep.ReviewOrder) {
      _handleSwap();
    }
  };

  return (
    <>
      {swapCompleted && (
        <>
          <Button
            width="100%"
            onClick={_handleClick}
            borderColor={ColorOption.black}
            backgroundColor={ColorOption.whiteBackground}
            isDisabled={shouldDisableButton}
            fontColor={ColorOption.black}
          >
            View Transaction
          </Button>
          <Container>
            <Icon
              icon="success"
              width={34}
              height={34}
              color={ColorOption.green}
            />
            <Text fontWeight={400} fontColor={ColorOption.grey}>
              Trade Completed
            </Text>
          </Container>
        </>
      )}
      {!swapCompleted && (
        <Button
          width="100%"
          onClick={_handleClick}
          isDisabled={shouldDisableButton}
          fontColor={ColorOption.white}
        >
          {_renderButtonText()}
        </Button>
      )}
      {isStepWithApprove && !swapCompleted && _renderNextStepText() && (
        <Container>
          <Flex justify="center">
            {wasApproved && (
              <Icon
                icon="success"
                width={34}
                height={34}
                color={ColorOption.green}
              />
            )}
            <Text fontWeight={400} fontColor={ColorOption.grey}>
              {_renderNextStepText()}
            </Text>
          </Flex>
        </Container>
      )}
    </>
  );
};
