import * as React from 'react';

import ChevronRightSvg from '../assets/icons/chevronRight.svg';
import { ColorOption } from '../style/theme';

import { Container } from './ui/container';
import { Flex } from './ui/flex';
import { Text } from './ui/text';

export interface WalletPromptProps {
    image?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: () => void;
    primaryColor: ColorOption;
    secondaryColor: ColorOption;
    marginTop?: string;
    display?: string;
    alignText?: string;
    marginLeft?: string;
    fontWeight?: string;
    padding?: string;
}

export const WalletPrompt = ({
    onClick,
    image,
    children,
    secondaryColor = ColorOption.lightOrange,
    primaryColor = ColorOption.darkOrange,
    marginTop,
    display,
    alignText,
    marginLeft = '10px',
    fontWeight = '500',
    padding = '10px',
}: WalletPromptProps) => (
    <Container
        padding={padding}
        border={`1px solid`}
        borderColor={ColorOption.feintGrey}
        backgroundColor={secondaryColor}
        width="100%"
        borderRadius="4px"
        onClick={onClick}
        cursor={onClick ? 'pointer' : undefined}
        boxShadowOnHover={!!onClick}
        marginTop={marginTop}
        display={display}
    >
        <Flex width="100%">
            {image}
            <Container marginLeft={marginLeft} display={display} width="100%" alignSelf={alignText}>
                <Text fontSize="16px" fontColor={primaryColor} fontWeight={fontWeight}>
                    {children}
                </Text>
            </Container>
            <Container position="relative" top="2px" display={display}>
                <ChevronRightSvg />
            </Container>
        </Flex>
    </Container>
);

WalletPrompt.displayName = 'WalletPrompt';
