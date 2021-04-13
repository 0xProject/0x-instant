
import { Token } from '@0x/types';
import * as _ from 'lodash';
import * as React from 'react';



import { ColorOption } from '../../style/theme';
import { Account, AccountState,  } from '../../types';


import { SectionHeader } from '../section_header';

import { Container } from '../ui/container';
import { Flex } from '../ui/flex';
import { Text } from '../ui/text';

export interface ApproveSwapStepProps {
    tokenApprove?: Token;
    account: Account;
}
export class ApproveSwapStep extends React.PureComponent<ApproveSwapStepProps> {
    public render(): React.ReactNode {
        const { state } = this.props.account;
        if (state !== AccountState.Ready && !this.props.tokenApprove) {
            return null;
        } else {
            return (
              <Container padding="10px 0px" borderTop="1px dashed" borderColor={ColorOption.feintGrey}>
                   <SectionHeader>{this._renderHeaderText()}</SectionHeader>
                   <Container  padding="100px 0px">
                        <Text fontWeight={700} fontColor={ColorOption.grey}>
                            {this._renderApproveText()}
                        </Text>
                    </Container>
              </Container>
            );
        }
    }

    private _renderApproveText(): React.ReactNode {
        const { tokenApprove } = this.props;
        return `We need permission to use your ${tokenApprove.symbol.toUpperCase()}`
    }

    private _renderHeaderText(): React.ReactNode {
        const { tokenApprove } = this.props;
        return `Approve ${tokenApprove.symbol.toUpperCase()} to sell`
    }

   
}
