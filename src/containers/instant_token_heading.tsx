import * as _ from 'lodash';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AmountPlaceholder } from '../components/amount_placeholder';
import { Container } from '../components/ui/container';
import { Flex } from '../components/ui/flex';
import { Text } from '../components/ui/text';
import { useColor } from '../hooks/useColor';
import { actions } from '../redux/actions';
import {
  getAccount,
  getSelectedTokenIn,
  getSelectedTokenInBalance,
  getSelectedTokenOut,
  getSelectedTokenOutBalance,
} from '../redux/selectors';
import { ColorOption } from '../style/theme';
import { AccountState, TokenInfo } from '../types';
import { format } from '../util/format';
import { tokenUtils } from '../util/token';

import { SelectedERC20AmountInput } from './selected_erc20_amount_input';

export interface InstantTokenHeadingProps {
  isIn: boolean;
  onSelectTokenClick?: (token?: TokenInfo) => void;
}

const PLACEHOLDER_COLOR = ColorOption.white;

export const InstantTokenHeadingContainer = (
  props: InstantTokenHeadingProps,
) => {
  const dispatch = useDispatch();
  const selectedTokenIn = useSelector(getSelectedTokenIn);
  const account = useSelector(getAccount);
  const selectedTokenOut = useSelector(getSelectedTokenOut);
  const selectedTokenInBalance = useSelector(getSelectedTokenInBalance);
  const selectedTokenOutBalance = useSelector(getSelectedTokenOutBalance);
  const onSwitchTokens = () => {
    if (selectedTokenOut) {
      dispatch(actions.updateSelectedTokenIn(selectedTokenOut));
    }
    if (selectedTokenIn) {
      dispatch(actions.updateSelectedTokenOut(selectedTokenIn));
    }
  };
  const color = useColor(props.isIn ? selectedTokenIn : selectedTokenOut);

  const _renderERC20AssetHeading = () => {
    return (
      <Container rawBackgroundColor={color} width="100%" padding="20px">
        <Container marginBottom="5px">
          <Flex direction="row" justify="space-between">
            <Text
              letterSpacing="1px"
              fontColor={ColorOption.white}
              opacity={0.7}
              fontWeight={500}
              textTransform="uppercase"
              fontSize="12px"
            >
              {_renderTopText()}
            </Text>
            <Text
              letterSpacing="1px"
              fontColor={ColorOption.white}
              opacity={0.7}
              fontWeight={500}
              textTransform="uppercase"
              fontSize="12px"
            >
              {_renderTokenBalance()}
            </Text>
          </Flex>
        </Container>
        <Flex direction="row" justify="space-between">
          <Flex height="60px">
            <SelectedERC20AmountInput
              startingFontSizePx={38}
              onSelectTokenClick={props.onSelectTokenClick}
              isInInput={props.isIn}
            />
          </Flex>
        </Flex>
        {props.isIn && (
          <Container position="absolute">
            <Flex direction="row" justify="flex-start">
              <Text
                letterSpacing="1px"
                fontColor={ColorOption.white}
                fontWeight={500}
                onClick={onSwitchTokens}
                fontSize="25px"
              >
                ⇅
              </Text>
            </Flex>
          </Container>
        )}
      </Container>
    );
  };

  const _renderTokenHeadingContent = () => {
    const { isIn } = props;
    const selectedToken = isIn ? selectedTokenIn : selectedTokenOut;

    if (selectedToken === undefined) {
      // TODO: Only the ERC20 flow supports selecting assets.
      return _renderERC20AssetHeading();
    }
    if (selectedToken) {
      return _renderERC20AssetHeading();
    }
    return null;
  };

  const _renderTopText = () => {
    if (props.isIn) {
      return 'You send';
    } else {
      return 'You receive';
    }
  };

  const _renderTokenBalance = () => {
    const { isIn } = props;
    const selectedToken = isIn ? selectedTokenIn : selectedTokenOut;
    const tokenBalance = isIn
      ? selectedTokenInBalance
      : selectedTokenOutBalance;

    if (selectedToken) {
      if (tokenUtils.isETH(selectedToken)) {
        if (account.state === AccountState.Ready && account.ethBalanceInWei) {
          const formattedETH = format.ethBaseUnitAmount(
            account.ethBalanceInWei,
          );
          return `Balance: ${formattedETH}`;
        } else {
          return (
            <AmountPlaceholder isPulsating={true} color={PLACEHOLDER_COLOR} />
          );
        }
      }
      if (tokenBalance) {
        const token = tokenBalance.token;
        const balance = tokenBalance.balance;
        const formattedBalance = format.tokenBaseUnitAmount(
          token.symbol,
          token.decimals,
          balance,
          4,
        );
        return `Balance: ${formattedBalance}`;
      } else {
        return (
          <AmountPlaceholder isPulsating={true} color={PLACEHOLDER_COLOR} />
        );
      }
    } else {
      return null;
    }
  };

  return _renderTokenHeadingContent();
};
