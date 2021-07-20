import * as _ from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { SelectedERC20AmountInput } from './selected_erc20_amount_input';
import { useListColor } from '../hooks/useColor';
import { getEthUsdPrice, 
    getLatestApiSwapQuote, 
    getQuoteRequestState, 
    getSelectedTokenAmountIn, 
    getSelectedTokenAmountOut, 
    getSelectedTokenIn, 
    getSelectedTokenInBalance, 
    getSelectedTokenOut, 
    getSelectedTokenOutBalance, 
    getSwapOrderState } from '../redux/selectors';

import { ColorOption } from '../style/theme';
import {  AsyncProcessState,  OrderProcessState, TokenInfo } from '../types';
import { format } from '../util/format';

import { AmountPlaceholder } from '../components/amount_placeholder';
import { Container } from '../components/ui/container';
import { Flex } from '../components/ui/flex';
import { Icon } from '../components/ui/icon';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';

export interface InstantTokenHeadingProps { 
    isIn: boolean;
    onSelectTokenClick?: (token?: TokenInfo) => void;
}

const PLACEHOLDER_COLOR = ColorOption.white;
const ICON_WIDTH = 34;
const ICON_HEIGHT = 34;
const ICON_COLOR = ColorOption.white;

export const InstantTokenHeadingContainer  = (props:InstantTokenHeadingProps) => {
  const selectedTokenIn = useSelector(getSelectedTokenIn);
  const selectedTokenOut = useSelector(getSelectedTokenOut);
  const selectedTokenInBalance = useSelector(getSelectedTokenInBalance);
  const selectedTokenOutBalance = useSelector(getSelectedTokenOutBalance);
  const selectedTokenAmountIn = useSelector(getSelectedTokenAmountIn);
  const selectedTokenAmountOut = useSelector(getSelectedTokenAmountOut);
  const swapOrderState = useSelector(getSwapOrderState);
  const quoteRequestState = useSelector(getQuoteRequestState);
  const ethUsdPrice = useSelector(getEthUsdPrice);

  //const color =  useListColor(props.isIn ? selectedTokenIn?.logoURI :  selectedTokenOut?.logoURI )

   const _renderERC20AssetHeading = () => {
        const iconOrAmounts = _renderIcon() || _renderAmountsSection();
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
                    {/*<Flex direction="column" justify="space-between">
                        {iconOrAmounts}
                    </Flex>*/}
                </Flex>
            </Container>
        );
    }


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
    }


 

    const _renderAmountsSection = (): React.ReactNode => {
        const {  isIn } = props;
        const amount = isIn ? selectedTokenAmountIn : selectedTokenAmountOut;


        if (
            amount === undefined &&
            quoteRequestState !== AsyncProcessState.Pending
        ) {
            return null;
        } else {
            return (
                <Container>
                    <Container marginBottom="5px">{_renderPlaceholderOrAmount(_renderAmount)}</Container>
                 {/*   <Container opacity={0.7}>{_renderPlaceholderOrAmount(_renderDollarAmount)}</Container>*/}
                </Container>
            );
        }
    }

    const _renderIcon = () => {
        const processState = swapOrderState.processState;

        if (processState === OrderProcessState.Failure) {
            return <Icon icon="failed" width={ICON_WIDTH} height={ICON_HEIGHT} color={ICON_COLOR} />;
        } else if (processState === OrderProcessState.Processing) {
            return <Spinner widthPx={ICON_HEIGHT} heightPx={ICON_HEIGHT} />;
        } else if (processState === OrderProcessState.Success) {
            return <Icon icon="success" width={ICON_WIDTH} height={ICON_HEIGHT} color={ICON_COLOR} />;
        }
        return undefined;
    }

    const _renderTopText = () => {
        if(props.isIn){
            return 'You send';
        }else{
            return 'You receive';
        }
    }

    const _renderTokenBalance = () => {
        const {isIn} = props;
        const selectedToken = isIn ? selectedTokenIn : selectedTokenOut;
        const tokenBalance = isIn ? selectedTokenInBalance: selectedTokenOutBalance

        if(selectedToken ){
            if(tokenBalance){
                const token = tokenBalance.token;
                const balance = tokenBalance.balance;
                const formattedBalance = format.tokenBaseUnitAmount(token.symbol, token.decimals, balance, 4);
                return `Balance: ${formattedBalance}`
            }else{
                return <AmountPlaceholder isPulsating={true} color={PLACEHOLDER_COLOR} />
            }
            
        }else{
            return null;
        }
        
    }

    const _renderPlaceholderOrAmount = (amountFunction: () => React.ReactNode) => {
        const {  isIn } = props;
        const amount = isIn ? selectedTokenAmountIn : selectedTokenAmountOut;

        if (quoteRequestState === AsyncProcessState.Pending) {
            return <AmountPlaceholder isPulsating={true} color={PLACEHOLDER_COLOR} />;
        }
        if (amount === undefined) {
            return <AmountPlaceholder isPulsating={false} color={PLACEHOLDER_COLOR} />;
        }
        return amountFunction();
    }

    const _renderAmount = () => {
        const {  isIn } = props;
        const amount = isIn ? selectedTokenAmountIn : selectedTokenAmountOut;
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

    /*const _renderDollarAmount = () => {
        return (
            <Text fontSize="16px" textAlign="right" width="100%" fontColor={ColorOption.white} noWrap={true}>
                {format.ethBaseUnitAmountInUsd(
                    props.totalEthBaseUnitAmount,
                    props.ethUsdPrice,
                    2,
                    <AmountPlaceholder isPulsating={false} color={ColorOption.white} />,
                )}
            </Text>
        );
    };*/



    return _renderTokenHeadingContent();
}

