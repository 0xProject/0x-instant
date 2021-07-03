
import { ChainId } from '@0x/contract-addresses';
import { AssetProxyId, ObjectMap } from '@0x/types';

import * as _ from 'lodash';

import {  DEFAULT_UNKOWN_ASSET_NAME } from '../constants';
import { assetDataNetworkMapping } from '../data/asset_data_network_mapping';
import { Asset, AssetMetaData, ERC20Asset, Network, ZeroExInstantError } from '../types';

export const assetUtils = {
    createAssetsFromAssetDatas: (
        assetDatas: string[],
        assetMetaDataMap: ObjectMap<AssetMetaData>,
        network: ChainId,
    ): Asset[] => {
        const arrayOfAssetOrUndefined = _.map(assetDatas, assetData =>
            assetUtils.createAssetFromAssetDataIfExists(assetData, assetMetaDataMap, network),
        );
        return _.compact(arrayOfAssetOrUndefined);
    },
    createAssetFromAssetDataIfExists: (
        assetData: string,
        assetMetaDataMap: ObjectMap<AssetMetaData>,
        network: ChainId,
    ): Asset | undefined => {
        const metaData = assetUtils.getMetaDataIfExists(assetData, assetMetaDataMap, network);
        if (metaData === undefined) {
            return;
        }
        return {
            assetData: assetData.toLowerCase(),
            metaData,
        };
    },
    createAssetFromAssetDataOrThrow: (
        assetData: string,
        assetMetaDataMap: ObjectMap<AssetMetaData>,
        network: ChainId,
    ): Asset => {
        return {
            assetData: assetData.toLowerCase(),
            metaData: assetUtils.getMetaDataOrThrow(assetData, assetMetaDataMap, network),
        };
    },
    getMetaDataOrThrow: (assetData: string, metaDataMap: ObjectMap<AssetMetaData>, network: ChainId): AssetMetaData => {
        const metaDataIfExists = assetUtils.getMetaDataIfExists(assetData, metaDataMap, network);
        if (metaDataIfExists === undefined) {
            throw new Error(ZeroExInstantError.AssetMetaDataNotAvailable);
        }
        return metaDataIfExists;
    },
    getMetaDataIfExists: (
        assetData: string,
        metaDataMap: ObjectMap<AssetMetaData>,
        network: ChainId,
    ): AssetMetaData | undefined => {
        let mainnetAssetData: string | undefined = assetData;
        if (network !== ChainId.Mainnet) {
            const mainnetAssetDataIfExists = assetUtils.getAssociatedAssetDataIfExists(
                assetData.toLowerCase(),
                network,
            );
            // Just so we don't fail in the case where we are on a non-mainnet network,
            // but pass in a valid mainnet assetData.
            mainnetAssetData = mainnetAssetDataIfExists || assetData;
        }
        if (mainnetAssetData === undefined) {
            return;
        }
        const metaData = metaDataMap[mainnetAssetData.toLowerCase()];
        if (metaData === undefined) {
            return;
        }
        return metaData;
    },
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
    getAssociatedAssetDataIfExists: (assetData: string, network: ChainId): string | undefined => {
        const assetDataGroupIfExists = _.find(assetDataNetworkMapping, value => value[network] === assetData);
        if (assetDataGroupIfExists === undefined) {
            return;
        }
        return assetDataGroupIfExists[Network.Mainnet];
    },
    getERC20AssetsFromAssets: (assets: Asset[]): ERC20Asset[] => {
        const erc20sOrUndefined = _.map(assets, asset =>
            asset.metaData.assetProxyId === AssetProxyId.ERC20 ? (asset as ERC20Asset) : undefined,
        );
        return _.compact(erc20sOrUndefined);
    }
};
