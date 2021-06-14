import { AssetProxyId } from '@0x/types';
import { BigNumber } from '@0x/utils';
import * as _ from 'lodash';
import * as React from 'react';
import { SelectedERC20AmountInput } from '../containers/selected_erc20_amount_input';

import { ColorOption } from '../style/theme';
import {  AsyncProcessState,  OrderProcessState, OrderState, TokenBalance, TokenInfo } from '../types';
import { format } from '../util/format';

import { AmountPlaceholder } from './amount_placeholder';
import { Container } from './ui/container';
import { Flex } from './ui/flex';
import { Icon } from './ui/icon';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';

export interface InstantTokenHeadingProps {
    selectedTokenIn?: TokenInfo;
    selectedTokenOut?: TokenInfo;
    selectedTokenInBalance?: TokenBalance;
    selectedTokenOutBalance?: TokenBalance;
    selectedTokenUnitAmountIn?: BigNumber;
    selectedTokenUnitAmountOut?: BigNumber;
    totalEthBaseUnitAmount?: BigNumber;
    ethUsdPrice?: BigNumber;
    quoteRequestState: AsyncProcessState;
    swapOrderState: OrderState;
    isIn: boolean;
    onSelectTokenClick?: (token?: TokenInfo) => void;
}

const PLACEHOLDER_COLOR = ColorOption.white;
const ICON_WIDTH = 34;
const ICON_HEIGHT = 34;
const ICON_COLOR = ColorOption.white;

export class InstantTokenHeading extends React.PureComponent<InstantTokenHeadingProps, {}> {
    public render(): React.ReactNode {
        return this._renderTokenHeadingContent();
    }

    private _renderTokenHeadingContent(): React.ReactNode {
        const { selectedTokenIn, selectedTokenOut, isIn } = this.props;
        const selectedToken = isIn ? selectedTokenIn : selectedTokenOut;

        if (selectedToken === undefined) {
            // TODO: Only the ERC20 flow supports selecting assets.
            return this._renderERC20AssetHeading();
        }
        if (selectedToken) {
            return this._renderERC20AssetHeading();
        } 
        return null;
    }
  

    private _renderERC20AssetHeading(): React.ReactNode {
        const iconOrAmounts = this._renderIcon() || this._renderAmountsSection();
        return (
            <Container backgroundColor={ColorOption.primaryColor} width="100%" padding="20px">
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
                            {this._renderTopText()}
                        </Text>
                        <Text
                            letterSpacing="1px"
                            fontColor={ColorOption.white}
                            opacity={0.7}
                            fontWeight={500}
                            textTransform="uppercase"
                            fontSize="12px"
                        >
                            {this._renderTokenBalance()}
                        </Text>
                    </Flex>
                </Container>
                <Flex direction="row" justify="space-between">
                    <Flex height="60px">
                        <SelectedERC20AmountInput
                            startingFontSizePx={38}
                            onSelectTokenClick={this.props.onSelectTokenClick}
                            isInInput={this.props.isIn}
                        />
                    </Flex>
                    <Flex direction="column" justify="space-between">
                        {iconOrAmounts}
                    </Flex>
                </Flex>
            </Container>
        );
    }

    private _renderAmountsSection(): React.ReactNode {
        const { selectedTokenUnitAmountIn, selectedTokenUnitAmountOut, isIn } = this.props;
        const amount = isIn ? selectedTokenUnitAmountIn : selectedTokenUnitAmountOut;


        if (
            amount === undefined &&
            this.props.quoteRequestState !== AsyncProcessState.Pending
        ) {
            return null;
        } else {
            return (
                <Container>
                    <Container marginBottom="5px">{this._renderPlaceholderOrAmount(this._renderAmount)}</Container>
                    <Container opacity={0.7}>{this._renderPlaceholderOrAmount(this._renderDollarAmount)}</Container>
                </Container>
            );
        }
    }

    private _renderIcon(): React.ReactNode {
        const processState = this.props.swapOrderState.processState;

        if (processState === OrderProcessState.Failure) {
            return <Icon icon="failed" width={ICON_WIDTH} height={ICON_HEIGHT} color={ICON_COLOR} />;
        } else if (processState === OrderProcessState.Processing) {
            return <Spinner widthPx={ICON_HEIGHT} heightPx={ICON_HEIGHT} />;
        } else if (processState === OrderProcessState.Success) {
            return <Icon icon="success" width={ICON_WIDTH} height={ICON_HEIGHT} color={ICON_COLOR} />;
        }
        return undefined;
    }

    private _renderTopText(): React.ReactNode {
        const processState = this.props.swapOrderState.processState;
        if (processState === OrderProcessState.Failure) {
            return 'Order failed';
        } else if (processState === OrderProcessState.Processing) {
            return 'Processing Order...';
        } else if (processState === OrderProcessState.Success) {
            return 'Tokens received!';
        }
        if(this.props.isIn){
            return 'You send';
        }else{
            return 'You receive';
        }
    }

    private _renderTokenBalance(): React.ReactNode {
        const {isIn, selectedTokenInBalance, selectedTokenOutBalance} = this.props;
        if(isIn){

            if(selectedTokenInBalance){
                const token = selectedTokenInBalance.token;
                const balance = selectedTokenInBalance.balance;
                const formattedBalance = format.tokenBaseUnitAmount(token.symbol,token.decimals, balance, 4);
                return `Balance: ${formattedBalance}`
            }else{
                return null;
            }
        }else{
            if(selectedTokenOutBalance){
                const token = selectedTokenOutBalance.token;
                const balance = selectedTokenOutBalance.balance;
                const formattedBalance = format.tokenBaseUnitAmount(token.symbol,token.decimals, balance, 4);
                return `Balance: ${formattedBalance}`;
            }else{
                return null;
            }
        }
    }

    private _renderPlaceholderOrAmount(amountFunction: () => React.ReactNode): React.ReactNode {
        const { selectedTokenUnitAmountIn, selectedTokenUnitAmountOut, isIn } = this.props;
        const amount = isIn ? selectedTokenUnitAmountIn : selectedTokenUnitAmountOut;

        if (this.props.quoteRequestState === AsyncProcessState.Pending) {
            return <AmountPlaceholder isPulsating={true} color={PLACEHOLDER_COLOR} />;
        }
        if (amount === undefined) {
            return <AmountPlaceholder isPulsating={false} color={PLACEHOLDER_COLOR} />;
        }
        return amountFunction();
    }

    private readonly _renderAmount = (): React.ReactNode => {
        const { selectedTokenUnitAmountIn, selectedTokenUnitAmountOut, isIn, selectedTokenIn, selectedTokenOut } = this.props;
        const amount = isIn ? selectedTokenUnitAmountIn : selectedTokenUnitAmountOut;
        const selectedToken = isIn ? selectedTokenIn : selectedTokenOut;
        if(!selectedToken){
            return null;
        }

        const tokenAmount = format.tokenBaseUnitAmount(
            selectedToken.symbol,
            selectedToken.decimals,
            amount,
            4,
            <AmountPlaceholder isPulsating={false} color={PLACEHOLDER_COLOR} />,
        );

        const fontSize = _.isString(tokenAmount) && tokenAmount.length >= 13 ? '14px' : '16px';
        return (
            <Text
                fontSize={fontSize}
                textAlign="right"
                width="100%"
                fontColor={ColorOption.white}
                fontWeight={500}
                noWrap={true}
            >
                {tokenAmount}
            </Text>
        );
    };

    private readonly _renderDollarAmount = (): React.ReactNode => {
        return (
            <Text fontSize="16px" textAlign="right" width="100%" fontColor={ColorOption.white} noWrap={true}>
                {format.ethBaseUnitAmountInUsd(
                    this.props.totalEthBaseUnitAmount,
                    this.props.ethUsdPrice,
                    2,
                    <AmountPlaceholder isPulsating={false} color={ColorOption.white} />,
                )}
            </Text>
        );
    };
}
