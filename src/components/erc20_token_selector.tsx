import * as _ from 'lodash';
import * as React from 'react';

import { ColorOption } from '../style/theme';
import {  TokenInfo } from '../types';
import { analytics } from '../util/analytics';
import { tokenUtils } from '../util/token';

import { SearchInput } from './search_input';
import { Circle } from './ui/circle';
import { Container } from './ui/container';
import { Flex } from './ui/flex';
import { Text } from './ui/text';

export interface ERC20TokenSelectorProps {
    tokens: TokenInfo[];
    isIn: boolean;
    onTokenSelect: (token: TokenInfo, isIn: boolean) => void;
}

export interface ERC20TokenSelectorState {
    searchQuery: string;
    page: number;
    perPage: number;
}

export class ERC20TokenSelector extends React.PureComponent<ERC20TokenSelectorProps> {
    public state: ERC20TokenSelectorState = {
        searchQuery: '',
        page: 0,
        perPage: 20,
    };
    public render(): React.ReactNode {
        const { tokens } = this.props;
        const { page, perPage} = this.state;
        return (
            <Container height="100%">
                <Container marginBottom="10px">
                    <Text fontColor={ColorOption.darkGrey} fontSize="18px" fontWeight="600" lineHeight="22px">
                        Select Token
                    </Text>
                </Container>
                <SearchInput
                    placeholder="Search tokens..."
                    width="100%"
                    value={this.state.searchQuery}
                    onChange={this._handleSearchInputChange}
                    tabIndex={-1}
                />
                <Container overflow="scroll" height="calc(100% - 90px)" marginTop="10px">
                    <TokenRowFilter
                        tokens={tokens.filter(t=> t.name.toLowerCase().indexOf(this.state.searchQuery.toLowerCase()) !== -1 || t.symbol.toLowerCase().indexOf(this.state.searchQuery.toLowerCase()) !== -1 ).slice(0, perPage*(page+1))}
                        onClick={this._handleTokenClick}
                        searchQuery={this.state.searchQuery}
                    />
                </Container>
            </Container>
        );
    }
    private readonly _handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const searchQuery = event.target.value;
        this.setState({
            searchQuery,
        });
        analytics.trackTokenSelectorSearched(searchQuery);
    };
    private readonly _handleTokenClick = (token: TokenInfo): void => {
        this.props.onTokenSelect(token, this.props.isIn);
    };
}

interface TokenRowFilterProps {
    tokens: TokenInfo[];
    onClick: (token: TokenInfo) => void;
    searchQuery: string;
}

class TokenRowFilter extends React.Component<TokenRowFilterProps> {
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

const getTokenIcon = (symbol: string): React.StatelessComponent | undefined => {
    try {
        return require(`../assets/icons/${symbol}.svg`).default as React.StatelessComponent;
    } catch (e) {
        // Can't find icon
        return undefined;
    }
};

const getTokenUrl = (address: string): string | undefined => {
    try {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
    } catch (e) {
        // Can't find icon
        return undefined;
    }
};

class TokenSelectorRowIcon extends React.PureComponent<TokenSelectorRowIconProps> {
    public render(): React.ReactNode {
        const { token } = this.props;

        const iconUrlIfExists = getTokenUrl(tokenUtils.toChecksum(token.address));

        const TokenIcon = getTokenIcon(token.symbol);
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
