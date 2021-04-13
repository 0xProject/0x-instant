
import { Token } from '@0x/types';

import * as _ from 'lodash';
import * as React from 'react';



import { ColorOption } from '../../style/theme';
import { Account, AccountState,  SwapQuoteResponse } from '../../types';
import { format } from '../../util/format';


import { Container } from '../ui/container';
import { Flex } from '../ui/flex';
import { Text } from '../ui/text';

export interface ReviewSwapStep {
    swapQuote?: SwapQuoteResponse;
    tokenIn?: Token;
    tokenOut?: Token;
    account: Account;
}

export class ReviewSwapStep extends React.PureComponent<ReviewSwapStep> {
    public render(): React.ReactNode {
        const { state } = this.props.account;
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
                        <Container>{this._renderTokenAmount(true)}</Container>
                    </Flex>
                </Container>  
                <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={700} fontColor={ColorOption.grey}>
                            You Receive
                        </Text>
                        <Container>{this._renderTokenAmount(false)}</Container>
                    </Flex>
                </Container> 
                <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
                    <Flex justify="space-between">
                        <Text fontWeight={400} fontColor={ColorOption.grey}>
                           Price
                        </Text>
                        <Container>{this._renderPrice()}</Container>
                    </Flex>
                </Container> 
                </>  
            );
        }
    }

    private _renderPrice(): React.ReactNode {
        const { swapQuote, tokenIn, tokenOut } = this.props;
        if(swapQuote && tokenIn && tokenOut){
            return `1 ${tokenIn.symbol.toUpperCase()} = ${swapQuote.price.toFixed(8)} ${tokenOut.symbol.toUpperCase()}`;
        }else{
            return '-'
        }
    }

    private _renderTokenAmount(isIn: boolean): React.ReactNode {
        const {tokenIn, tokenOut, swapQuote} = this.props;
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

  

}

