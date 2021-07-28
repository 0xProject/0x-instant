import React from "react";
import { useSelector } from "react-redux";
import { Container } from "../../components/ui/container";
import { Flex } from "../../components/ui/flex";
import { getEthUsdPrice, getIsStepWithApprove, getSelectedTokenIn, getSwapStep, getLatestApiSwapQuote } from "../../redux/selectors";
import { ColorOption } from "../../style/theme";
import { Text } from '../../components/ui/text';
import { format } from '../../util/format';
import { useEstimateGasApproval } from "../../hooks/useEstimateGasApproval";
import { SwapStep } from "../../types";


export const ApproveRow = () => {
    const tokenIn = useSelector(getSelectedTokenIn);
    const ethUSDPrice = useSelector(getEthUsdPrice);
    const swapQuote = useSelector(getLatestApiSwapQuote);
    const estimatedGas = useEstimateGasApproval(tokenIn, swapQuote?.allowanceTarget);
    const isStepWithApprove = useSelector(getIsStepWithApprove);
    const swapStep = useSelector(getSwapStep)
    const approvalTitleText = () => {
        if (tokenIn) {
            return `${tokenIn.symbol.toUpperCase()} Approval`
        }

    }
    const renderGasPrice = () => {
        if (estimatedGas) {
            return format.ethBaseUnitAmount(estimatedGas);
        }
        return '-'
    }

    const renderGasPriceUSD = () => {

        if (estimatedGas) {
            return format.ethBaseUnitAmountInUsd(estimatedGas, ethUSDPrice);
        }
        return '-'

    }

    const wasApproved = !(swapStep === SwapStep.Approve) && isStepWithApprove;


    return (
        <Container padding="10px 0px" borderColor={ColorOption.feintGrey}>
            <Flex justify="space-between">
                <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'}>
                    {approvalTitleText()}
                </Text>
                <Container>
                    <Text fontWeight={500} fontColor={ColorOption.black} fontSize={'16px'} lineHeight={'19px'} textDecorationLine={wasApproved ? 'line-through' : ''}>
                        {renderGasPrice()} {' '}
                    </Text>
                    <Text fontWeight={400} fontColor={ColorOption.grey} textDecorationLine={wasApproved ? 'line-through' : ''}>
                        {renderGasPriceUSD()}
                    </Text>
                </Container>
            </Flex>
        </Container>


    )
}

