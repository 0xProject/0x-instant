import { ChainId } from '@0x/contract-addresses';

import { ETH_ADDRESS } from '../constants';

export const NATIVE_COINS = {
    [ChainId.Mainnet]: {
        chainId: ChainId.Mainnet,
        address: ETH_ADDRESS,
        name: 'Ethereum',
        decimals: 18,
        symbol: 'ETH',
    },
    [ChainId.BSC]: {
        chainId: ChainId.BSC,
        address: ETH_ADDRESS,
        name: 'Binance',
        decimals: 18,
        symbol: 'BNB',
    },
    [ChainId.Polygon]: {
        chainId: ChainId.Polygon,
        address: ETH_ADDRESS,
        name: 'Polygon',
        decimals: 18,
        symbol: 'MATIC',
    },

};
