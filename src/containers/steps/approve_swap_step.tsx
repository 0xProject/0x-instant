
import { Token } from '@0x/types';
import * as _ from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { getSelectedTokenIn, getAccount } from '../../redux/selectors';



import { ColorOption } from '../../style/theme';
import { Account, AccountState,  } from '../../types';


import { SectionHeader } from '../../components/section_header';

import { Container } from '../../components/ui/container';
import { Text } from '../../components/ui/text';

export interface ApproveSwapStepProps {
    tokenApprove?: Token;
    account: Account;
}
export const ApproveSwapStepContainer = () => {
    const tokenApprove = useSelector(getSelectedTokenIn);
    const account = useSelector(getAccount)

    const renderApproveText = () => {   
        return `We need permission to use your ${tokenApprove.symbol.toUpperCase()}`
    }

    const renderHeaderText= () => {
        return `Approve ${tokenApprove.symbol.toUpperCase()} to sell`
    }

    const { state } = account;
    if (state !== AccountState.Ready && !tokenApprove) {
        return null;
    } else {
        return (
            <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
                <SectionHeader>{renderHeaderText()}</SectionHeader>
                <Container  padding="100px 0px">
                    <Text fontWeight={700} fontColor={ColorOption.grey}>
                        {renderApproveText()}
                    </Text>
                </Container>
            </Container>
        );
    }
}
