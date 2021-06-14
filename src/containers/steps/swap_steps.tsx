
import * as _ from 'lodash';
import * as React from 'react';

import { ColorOption } from '../../style/theme';
import { AccountState } from '../../types';
import { format } from '../../util/format';


import { Container } from '../../components/ui/container';
import { Flex } from '../../components/ui/flex';
import { Text } from '../../components/ui/text';
import { getAccount, getLatestApiSwapQuote, getSelectedTokenIn, getSelectedTokenOut } from '../../redux/selectors';
import { useSelector } from 'react-redux';
import { SectionHeader } from '../../components/section_header';
import { useState } from 'react';

export const SwapStepsContainer = () => {
    const swapQuote = useSelector(getLatestApiSwapQuote);
    const tokenIn = useSelector(getSelectedTokenIn);
    const tokenOut = useSelector(getSelectedTokenOut);
    const account = useSelector(getAccount);

    const [quoteTimestamp, setQuoteTimestamp] = useState();


    const renderPrice = () => {
        if(swapQuote && tokenIn && tokenOut){
            return `1 ${tokenIn.symbol.toUpperCase()} = ${swapQuote.price.toFixed(8)} ${tokenOut.symbol.toUpperCase()}`;
        }else{
            return '-'
        }
    }
    const renderGasPrice = () => {
        return '0';
    }

    const renderTokenAmount = (isIn: boolean) => {
        const selectedToken = isIn ? tokenIn : tokenOut;
        if(swapQuote && selectedToken){
            const amount = isIn ? swapQuote.sellAmount : swapQuote.buyAmount;
    
            return format.tokenBaseUnitAmount(
                selectedToken.symbol,
                selectedToken.decimals,
                amount,
                4,
            '',
            );
        }
        return '-';
    }

        const { state } = account;
        if (state !== AccountState.Ready) {
            return null;
        } else {
            return (
                <>
                  <SectionHeader>
                    Quote expires in 24 seconds
                </SectionHeader>


                <Container padding="10px 0px" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={700} fontColor={ColorOption.grey}>
                            You Pay
                        </Text>
                        <Container>{renderTokenAmount(true)}</Container>
                    </Flex>
                </Container>  
                <Container padding="10px 0px"  borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={700} fontColor={ColorOption.grey}>
                            You Receive
                        </Text>
                        <Container>{renderTokenAmount(false)}</Container>
                    </Flex>
                </Container> 
                <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={400} fontColor={ColorOption.grey}>
                          Rate
                        </Text>
                        <Container>{renderPrice()}</Container>
                    </Flex>
                </Container> 
                <Container padding="10px 0px"  borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={400} fontColor={ColorOption.grey}>
                         Gas Price
                        </Text>
                        <Container>{renderGasPrice()}</Container>
                    </Flex>
                </Container> 
                <Container padding="10px 0px"  borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={400} fontColor={ColorOption.grey}>
                        Approval
                        </Text>
                        <Container>{renderGasPrice()}</Container>
                    </Flex>
                </Container> 
                </>  
                
            );
        }
}

    