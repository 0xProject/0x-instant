
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

export const ReviewSwapStepContainer = () => {
    const swapQuote = useSelector(getLatestApiSwapQuote);
    const tokenIn = useSelector(getSelectedTokenIn);
    const tokenOut = useSelector(getSelectedTokenOut);
    const account = useSelector(getAccount);


    const renderPrice = () => {
        if(swapQuote && tokenIn && tokenOut){
            return `1 ${tokenIn.symbol.toUpperCase()} = ${swapQuote.price.toFixed(8)} ${tokenOut.symbol.toUpperCase()}`;
        }else{
            return '-'
        }
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
                <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={700} fontColor={ColorOption.grey}>
                            You send
                        </Text>
                        <Container>{renderTokenAmount(true)}</Container>
                    </Flex>
                </Container>  
                <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
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
                           Price
                        </Text>
                        <Container>{renderPrice()}</Container>
                    </Flex>
                </Container> 
                </>  
            );
        }
}

    

  



