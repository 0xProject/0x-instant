import _ from 'lodash';
import React from 'react';

import { Circle } from '../components/ui/circle';
import { Container } from '../components/ui/container';
import { Flex } from '../components/ui/flex';
import { Text } from '../components/ui/text';
import { ColorOption } from '../style/theme';
import { TokenInfo } from '../types';
import { tokenUtils } from '../util/token';

interface TokenRowFilterProps {
    tokens: TokenInfo[];
    onClick: (token: TokenInfo) => void;
    searchQuery: string;
}

export class TokenRowFilter extends React.Component<TokenRowFilterProps> {
    public render(): React.ReactNode {
        return _.map(this.props.tokens, token => {
            if (!this._isTokenQueryMatch(token)) {
                return null;
            }
            return <TokenSelectorRow key={token.address} token={token} onClick={this.props.onClick} />;
        });
    }
    public shouldComponentUpdate(nextProps: TokenRowFilterProps): boolean {
        const arePropsDeeplyEqual = _.isEqual(nextProps, this.props);
        return !arePropsDeeplyEqual;
    }
    private readonly _isTokenQueryMatch = (token: TokenInfo): boolean => {
        const { searchQuery } = this.props;
        const searchQueryLowerCase = searchQuery.toLowerCase().trim();
        if (searchQueryLowerCase === '') {
            return true;
        }
        const tokenName = token.name.toLowerCase();
        const tokenSymbol = token.symbol.toLowerCase();
        return _.startsWith(tokenSymbol, searchQueryLowerCase) || _.startsWith(tokenName, searchQueryLowerCase);
    };
}

interface TokenSelectorRowProps {
    token: TokenInfo;
    onClick: (token: TokenInfo) => void;
}

class TokenSelectorRow extends React.PureComponent<TokenSelectorRowProps> {
    public render(): React.ReactNode {
        const { token } = this.props;
        const circleColor = 'black';
        const displaySymbol = tokenUtils.bestNameForToken(token);
        return (
            <Container
                padding="12px 0px"
                borderBottom="1px solid"
                borderColor={ColorOption.feintGrey}
                backgroundColor={ColorOption.white}
                width="100%"
                onClick={this._handleClick}
                darkenOnHover={true}
                cursor="pointer"
            >
                <Container marginLeft="5px">
                    <Flex justify="flex-start">
                        <Container marginRight="10px">
                            <Circle diameter={26} rawColor={circleColor}>
                                <Flex height="100%" width="100%">
                                    <TokenSelectorRowIcon token={token} />
                                </Flex>
                            </Circle>
                        </Container>
                        <Text fontSize="14px" fontWeight={700} fontColor={ColorOption.black}>
                            {displaySymbol}
                        </Text>
                        <Container margin="0px 5px">
                            <Text fontSize="14px"> - </Text>
                        </Container>
                        <Text fontSize="14px">{token.name}</Text>
                    </Flex>
                </Container>
            </Container>
        );
    }
    private readonly _handleClick = (): void => {
        this.props.onClick(this.props.token);
    };
}

interface TokenSelectorRowIconProps {
    token: TokenInfo;
}

class TokenSelectorRowIcon extends React.PureComponent<TokenSelectorRowIconProps> {
    public render(): React.ReactNode {
        const { token } = this.props;
        if (token.logoURI) {
            return <img src={token.logoURI} />;
        }
        if (tokenUtils.isETH(token)) {
            const displaySymbol = tokenUtils.bestNameForToken(token);
            return <Text fontColor={ColorOption.white} fontSize="8px">
                {displaySymbol}
            </Text>;
        }

        const iconUrlIfExists = tokenUtils.getIconUrl(tokenUtils.toChecksum(token.address));

        const TokenIcon = tokenUtils.getIcon(token.symbol.toLowerCase());
        const displaySymbol = tokenUtils.bestNameForToken(token);
        if (iconUrlIfExists !== undefined) {
            return <img src={iconUrlIfExists} />;
        } else if (TokenIcon !== undefined) {
            return <TokenIcon />;
        } else {
            return (
                <Text fontColor={ColorOption.white} fontSize="8px">
                    {displaySymbol}
                </Text>
            );
        }
    }
}
