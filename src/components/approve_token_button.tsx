import * as React from 'react';
import { useSelector } from 'react-redux';

import { getSelectedTokenIn } from '../redux/selectors';
import { ColorOption } from '../style/theme';

import { Button } from './ui/button';
import { Container } from './ui/container';
import { Spinner } from './ui/spinner';

export const ApproveTokenButton = () => {
    const tokenIn = useSelector(getSelectedTokenIn);

    return  <Button isDisabled={true} width="100%" fontColor={ColorOption.white}>
        <Container display="inline-block" position="relative" top="3px" marginRight="8px">
            <Spinner widthPx={16} heightPx={16} />
        </Container>
          {`Approving ${tokenIn.symbol.toUpperCase()} for Swap`}
    </Button>;

};
ApproveTokenButton.displayName = 'ApproveTokenButton';
