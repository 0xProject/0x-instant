
import { AssetProxyId } from '@0x/types';
import * as _ from 'lodash';

import {  DEFAULT_UNKOWN_ASSET_NAME } from '../constants';
import { Asset, ERC20Asset } from '../types';

export const assetUtils = {

    bestNameForAsset: (asset?: Asset, defaultName: string = DEFAULT_UNKOWN_ASSET_NAME): string => {
        if (asset === undefined) {
            return defaultName;
        }
        const metaData = asset.metaData;
        switch (metaData.assetProxyId) {
            case AssetProxyId.ERC20:
                return metaData.symbol.toUpperCase();
            case AssetProxyId.ERC721:
                return metaData.name;
        }
    },
    formattedSymbolForAsset: (asset?: ERC20Asset, defaultName: string = '???'): string => {
        if (asset === undefined) {
            return defaultName;
        }
        const symbol = asset.metaData.symbol;
        if (symbol.length <= 5) {
            return symbol;
        }
        return `${symbol.slice(0, 3)}…`;
    },
    getERC20AssetsFromAssets: (assets: Asset[]): ERC20Asset[] => {
        const erc20sOrUndefined = _.map(assets, asset =>
            asset.metaData.assetProxyId === AssetProxyId.ERC20 ? (asset as ERC20Asset) : undefined,
        );
        return _.compact(erc20sOrUndefined);
    },
};
