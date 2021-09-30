
import { ChainId } from '@0x/contract-addresses';
import * as _ from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { AmountPlaceholder } from '../../components/amount_placeholder';
import { Container } from '../../components/ui/container';
import { Flex } from '../../components/ui/flex';
import { Text } from '../../components/ui/text';
import { useTokenPriceUSD } from '../../hooks/useTokenPriceUSD';
import {
     getAccount,
    getEthUsdPrice,
    getIsStepWithApprove,
    getLatestApiSwapQuote,
    getSelectedTokenAmountIn,
    getSelectedTokenAmountOut,
    getSelectedTokenIn,
    getSelectedTokenOut } from '../../redux/selectors';
import { ColorOption } from '../../style/theme';
import { AccountState } from '../../types';
import { format } from '../../util/format';

import { ApproveRow } from './approveRow';

export const SwapStepsContainer = () => {
    const swapQuote = useSelector(getLatestApiSwapQuote);
    const tokenIn = useSelector(getSelectedTokenIn);
    const tokenOut = useSelector(getSelectedTokenOut);
    const selectedTokenAmountIn = useSelector(getSelectedTokenAmountIn);
    const selectedTokenAmountOut  = useSelector(getSelectedTokenAmountOut);
    const account = useSelector(getAccount);
    const ethUSDPrice = useSelector(getEthUsdPrice);
    const isStepWithApprove = useSelector(getIsStepWithApprove);

    const usdQuoteTokenIn = useTokenPriceUSD(tokenIn, ChainId.Mainnet, false);
    const usdQuoteTokenOut = useTokenPriceUSD(tokenOut, ChainId.Mainnet, false);

    const renderPrice = () => {
        if (swapQuote && tokenIn && tokenOut) {
            return `1 ${tokenIn.symbol.toUpperCase()} = ${swapQuote.price.toFixed(8)} ${tokenOut.symbol.toUpperCase()}`;
        } else {
            return '-';
        }
    };
    const renderGasPrice = () => {
        if (swapQuote && swapQuote.gasPrice && swapQuote.gas) {
            return format.ethBaseUnitAmount(swapQuote.gas.multipliedBy(swapQuote.gasPrice));
        } else {
            return '-';
        }

    };

    const renderGasPriceUSD = () => {
        if (swapQuote && swapQuote.gas && ethUSDPrice && swapQuote.gasPrice) {
            return format.ethBaseUnitAmountInUsd(swapQuote.gas.multipliedBy(swapQuote.gasPrice), ethUSDPrice);
        } else {
            return '-';
        }
    };

    const renderTokenAmount = (isIn: boolean) => {
        const selectedToken = isIn ? tokenIn : tokenOut;
        if (swapQuote && selectedToken) {
            const amount = isIn ? selectedTokenAmountIn : selectedTokenAmountOut;

            return format.tokenBaseUnitAmount(
                selectedToken.symbol,
                selectedToken.decimals,
                amount,
                4,
                '',
            );
        }
        return '-';
    };

    const renderTokenAmountUSD = (isIn: boolean) => {
        const selectedToken = isIn ? tokenIn : tokenOut;
        const priceQuoteUSD = isIn ? usdQuoteTokenIn.priceQuote : usdQuoteTokenOut.priceQuote;
        if (swapQuote && selectedToken && priceQuoteUSD) {
            const amount = isIn ? selectedTokenAmountIn : selectedTokenAmountOut;

            return format.tokenBaseUnitAmountInUsd(
                amount,
                selectedToken.decimals,
                priceQuoteUSD.price,
            );
        }
        return '-';
    };

    const { state } = account;
    if (state !== AccountState.Ready) {
        return null;
    } else {
        return (
            <>
                <Container padding="10px 0px" borderColor={ColorOption.feintGrey} marginTop={'20px'}>
                    <Flex justify="space-between">
                        <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                            You Pay
                        </Text>
                        <Container>
                            <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                                {renderTokenAmount(true)} &nbsp;

                            </Text>

                                <Text fontWeight={400} fontColor={ColorOption.grey} >
                                    {usdQuoteTokenIn.loading ?
                                        <AmountPlaceholder color={ColorOption.grey} isPulsating={true}/> :
                                        renderTokenAmountUSD(true)
                                    }
                                    {}
                                </Text>

                        </Container>
                    </Flex>
                </Container>
                <Container padding="10px 0px" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                            You Receive
                        </Text>
                        <Container>
                            <Text fontWeight={'bold'} fontColor={ColorOption.black}>
                                {renderTokenAmount(false)}  &nbsp;

                            </Text>

                                <Text fontWeight={400} fontColor={ColorOption.grey}>
                                    {usdQuoteTokenOut.loading ?
                                        <AmountPlaceholder color={ColorOption.grey} isPulsating={true}/> :
                                            renderTokenAmountUSD(false)
                                        }
                                </Text>

                        </Container>
                    </Flex>
                </Container>
                <Container padding="10px 0px" borderTop="1px solid" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                            Rate
                        </Text>

                            <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                                {renderPrice()}

                            </Text>

                    </Flex>
                </Container>
                <Container padding="10px 0px" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                            Gas Price
                        </Text>
                        <Container>
                            <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                                {renderGasPrice()}  &nbsp;
                            </Text>

                             <Text fontWeight={400} fontColor={ColorOption.grey}>
                                    {renderGasPriceUSD()}
                            </Text>

                        </Container>
                    </Flex>
                </Container>
                {isStepWithApprove && <ApproveRow />}
            </>

        );
    }
};
