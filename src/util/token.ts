
import createKeccakHash from 'keccak';
import * as _ from 'lodash';

import { DEFAULT_UNKOWN_ASSET_NAME, ETH_ADDRESS } from '../constants';
import {  TokenInfo } from '../types';

export const tokenUtils = {
    bestNameForToken: (token?: TokenInfo, defaultName: string = DEFAULT_UNKOWN_ASSET_NAME): string => {
        if (token === undefined) {
            return defaultName;
        }
        return token.symbol.toUpperCase();
    },
    formattedSymbolForToken: (token?: TokenInfo, defaultName: string = '???'): string => {
        if (token === undefined) {
            return defaultName;
        }
        const symbol = token.symbol;
        if (symbol.length <= 5) {
            return symbol;
        }
        return `${symbol.slice(0, 3)}…`;
    },
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
    toChecksum: (address: string) => {
        address = address.toLowerCase().replace('0x', '');
        const hash = createKeccakHash('keccak256').update(address).digest('hex');
        let ret = '0x';

        for (let i = 0; i < address.length; i++) {
            if (parseInt(hash[i], 16) >= 8) {
            ret += address[i].toUpperCase();
            } else {
            ret += address[i];
            }
        }

        return ret;

    },

    isETH: (token: TokenInfo) => {
        return token.address.toLowerCase() === ETH_ADDRESS ? true : false;

    },

    getIcon: (symbol: string) => {
        try {
            return require(`../assets/icons/${symbol}.svg`).default;
        } catch (e) {
            // Can't find icon
            return undefined;
        }
    },

    getIconUrl: (address: string): string | undefined => {
        try {
            return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
        } catch (e) {
            // Can't find icon
            return undefined;
        }
    },
};
