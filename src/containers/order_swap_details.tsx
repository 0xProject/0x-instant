
import * as _ from 'lodash';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Container } from '../components/ui/container';
import { Flex } from '../components/ui/flex';
import { Text } from '../components/ui/text';
import { BIG_NUMBER_ZERO } from '../constants';
import { actions } from '../redux/actions';
import { getAccount, getBaseCurrency, getEthUsdPrice, getLatestApiSwapQuote, getSelectedTokenIn, getSelectedTokenOut } from '../redux/selectors';
import { ColorOption } from '../style/theme';
import { AccountState, BaseCurrency } from '../types';

export const OrderSwapDetailsContainer = () => {
    const dispatch = useDispatch();
    const swapQuote = useSelector(getLatestApiSwapQuote);
    const tokenIn = useSelector(getSelectedTokenIn);
    const tokenOut = useSelector(getSelectedTokenOut);
    const baseCurrency = useSelector(getBaseCurrency);
    const ethUsdPrice = useSelector(getEthUsdPrice);
    const account = useSelector(getAccount);

    const renderErrorFetchingUsdPrice = () => {
        const onClickText = () => {
           dispatch(actions.updateBaseCurrency(BaseCurrency.ETH));
        };
        return (
            <Text>
                There was an error fetching the USD price.
                <Text
                    onClick={onClickText}
                    fontWeight={700}
                    fontColor={ColorOption.primaryColor}
                >
                    Click here
                </Text>
                {' to view ETH prices'}
            </Text>
        );
    };
    const displayPrice = () => {
        if (swapQuote && tokenIn && tokenOut) {
            return `1 ${tokenIn.symbol.toUpperCase()} = ${swapQuote.price.toFixed(8)} ${tokenOut.symbol.toUpperCase()}`;
        } else {
            return '-';
        }
    };

    const hadErrorFetchingUsdPrice = (): boolean => {
        return ethUsdPrice ? ethUsdPrice.isEqualTo(BIG_NUMBER_ZERO) : false;
    };

    const renderRows = () =>
        <React.Fragment>
            <OrderDetailsRow
                labelText="Price"
                primaryValue={displayPrice()}
            />
        </React.Fragment>;

    const shouldShowUsdError = baseCurrency === BaseCurrency.USD && hadErrorFetchingUsdPrice();
    const { state } = account;
    if (state !== AccountState.Ready) {
        return null;
    } else {
        return (
            <Container width="100%" flexGrow={1} padding="20px 20px 0px 20px">
                {shouldShowUsdError ? renderErrorFetchingUsdPrice() : renderRows()}
            </Container>
        );
    }
};

export interface OrderDetailsRowProps {
    labelText: React.ReactNode;
    isLabelBold?: boolean;
    isPrimaryValueBold?: boolean;
    primaryValue: React.ReactNode;
    secondaryValue?: React.ReactNode;
}
export const OrderDetailsRow = (props: OrderDetailsRowProps) => {
    const renderValues = () =>  {
        const secondaryValueNode: React.ReactNode = props.secondaryValue && (
            <Container marginRight="3px" display="inline-block">
                <Text fontColor={ColorOption.lightGrey}>({props.secondaryValue})</Text>
            </Container>
        );
        return (
            <React.Fragment>
                {secondaryValueNode}
                <Text fontWeight={props.isPrimaryValueBold ? 700 : 400}>{props.primaryValue}</Text>
            </React.Fragment>
        );
    };

    return (
        <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
            <Flex justify="space-between">
                <Text fontWeight={props.isLabelBold ? 700 : 400} fontColor={ColorOption.grey}>
                    {props.labelText}
                </Text>
                <Container>{renderValues()}</Container>
            </Flex>
        </Container>
    );

};
