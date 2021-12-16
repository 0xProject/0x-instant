import { BigNumber } from '@0x/utils';
import * as _ from 'lodash';
import * as React from 'react';

import { ColorOption, transparentWhite } from '../style/theme';
import { SimpleHandler, TokenInfo } from '../types';
import { tokenUtils } from '../util/token';
import { util } from '../util/util';

import { ScalingAmountInput } from './scaling_amount_input';
import { Container } from './ui/container';
import { Flex } from './ui/flex';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

// Asset amounts only apply to ERC20 assets
export interface ERC20AmountInputProps {
    token?: TokenInfo;
    tokenIn?: TokenInfo;
    tokenOut?: TokenInfo;
    valueIn?: BigNumber;
    valueOut?: BigNumber;
    isInInput?: boolean;
    onChange: (value?: BigNumber, tokenIn?: TokenInfo, tokenOut?: TokenInfo, isIn?: boolean) => void;
    onSelectTokenClick?: () => void;
    startingFontSizePx: number;
    fontColor?: ColorOption;
    isInputDisabled: boolean;
    canSelectOtherToken: boolean;
    numberOfTokensAvailable?: number;
}

export interface ERC20AmountInputState {
    currentFontSizePx: number;
}

export class ERC20AmountInput extends React.PureComponent<ERC20AmountInputProps, ERC20AmountInputState> {
    public static defaultProps = {
        onChange: util.boundNoop,
        isDisabled: false,
    };
    constructor(props: ERC20AmountInputProps) {
        super(props);
        this.state = {
            currentFontSizePx: props.startingFontSizePx,
        };
    }
    public render(): React.ReactNode {
        const { tokenOut, tokenIn, isInInput } = this.props;
        const token = isInInput ? tokenIn : tokenOut;
        return (
            <Container whiteSpace="nowrap">
                {token === undefined ? this._renderTokenSelectionContent() : this._renderContentForToken(token)}
            </Container>
        );
    }
    private readonly _renderContentForToken = (token: TokenInfo): React.ReactNode => {
        const { onChange, isInputDisabled, ...rest } = this.props;
        const amountBorderBottom = isInputDisabled ? '' : `1px solid ${transparentWhite}`;
        const onSymbolClick = this._generateSelectTokenClickHandler();
        return (
            <React.Fragment>
                <Container borderBottom={amountBorderBottom} display="inline-block">
                    <ScalingAmountInput
                        {...rest}
                        value={this.props.isInInput ? this.props.valueIn : this.props.valueOut}
                        isDisabled={isInputDisabled}
                        textLengthThreshold={this._textLengthThresholdForToken(token)}
                        maxFontSizePx={this.props.startingFontSizePx}
                        onAmountChange={this._handleChange}
                        onFontSizeChange={this._handleFontSizeChange}
                        hasAutofocus={true}
                        /* We send in a key of asset data to force a rerender of this component when the user selects a new asset.  We do this so the autofocus attribute will bring focus onto this input */
                        key={token.address}
                    />
                </Container>
                <Container
                    display="inline-block"
                    marginLeft="8px"
                    title={tokenUtils.bestNameForToken(token)}
                >
                    <Flex inline={true}>
                        <Text
                            fontSize={`${this.state.currentFontSizePx}px`}
                            fontColor={ColorOption.white}
                            textTransform="uppercase"
                            onClick={this.props.canSelectOtherToken ? onSymbolClick : undefined}
                        >
                            {tokenUtils.formattedSymbolForToken(token)}
                        </Text>
                        {this.props.canSelectOtherToken && this._renderChevronIcon()}
                    </Flex>
                </Container>
            </React.Fragment>
        );
    };
    private readonly _renderTokenSelectionContent = (): React.ReactNode => {
        const { numberOfTokensAvailable } = this.props;
        let text = 'Select Token';
        if (numberOfTokensAvailable === undefined) {
            text = 'Loading...';
        } else if (numberOfTokensAvailable === 0) {
            text = 'Tokens Unavailable';
        }
        return (
            <Flex>
                <Text
                    fontSize="30px"
                    fontColor={ColorOption.white}
                    opacity={0.7}
                    fontWeight="500"
                    onClick={this._generateSelectTokenClickHandler()}
                >
                    {text}
                </Text>
                {this._renderChevronIcon()}
            </Flex>
        );
    };
    private readonly _renderChevronIcon = (): React.ReactNode => {
        if (!this._areAnyTokensAvailable()) {
            return null;
        }
        return (
            <Container marginLeft="5px">
                <Icon icon="chevron" width={12} stroke={ColorOption.white} onClick={this._handleSelectTokenClick} />
            </Container>
        );
    };

    private readonly _handleChange = (value?: BigNumber): void => {
        this.props.onChange(value,
            this.props.tokenIn,
            this.props.tokenOut,
            this.props.isInInput);
    };
    private readonly _handleFontSizeChange = (fontSizePx: number): void => {
        this.setState({
            currentFontSizePx: fontSizePx,
        });
    };
    private readonly _generateSelectTokenClickHandler = (): SimpleHandler | undefined => {
        // We don't want to allow opening the token selection panel if there are no assets.
        // Since styles are inferred from the presence of a click handler, we want to return undefined
        // instead of providing a noop.
        if (!this._areAnyTokensAvailable() || this.props.onSelectTokenClick === undefined) {
            return undefined;
        }
        return this._handleSelectTokenClick;
    };
    private readonly _areAnyTokensAvailable = (): boolean => {
        const { numberOfTokensAvailable } = this.props;
        return numberOfTokensAvailable !== undefined && numberOfTokensAvailable > 0;
    };
    private readonly _handleSelectTokenClick = (): void => {
        if (this.props.onSelectTokenClick) {
            this.props.onSelectTokenClick();
        }
       // console.log(this.props.token, this.props.isInInput )
      //  this.props.onUpdateSelectedToken(this.props.token, this.props.isInInput);
    };
    // For tokens with symbols of different length,
    // start scaling the input at different character lengths
    private readonly _textLengthThresholdForToken = (token?: TokenInfo): number => {
        if (token === undefined) {
            return 3;
        }
        const symbol = token.symbol;
        if (symbol.length <= 3) {
            return 5;
        }
        if (symbol.length === 5) {
            return 3;
        }
        return 4;
    };
}
