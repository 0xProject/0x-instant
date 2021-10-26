import { assert as sharedAssert } from '@0x/assert';
import * as _ from 'lodash';

import { AffiliateInfo,  TokenInfo } from '../types';

export const assert = {
    ...sharedAssert,
    areValidAssetDatas(variableName: string, assetDatas: string[]): void {
        _.forEach(assetDatas, (assetData, index) => assert.isHexString(`${variableName}[${index}]`, assetData));
    },
    isValidAffiliateInfo(variableName: string, affiliateInfo: AffiliateInfo): void {
        assert.isETHAddressHex(`${variableName}.recipientAddress`, affiliateInfo.feeRecipient);
        assert.isNumber(`${variableName}.percentage`, affiliateInfo.feePercentage);
        assert.assert(
            affiliateInfo.feePercentage >= 0 && affiliateInfo.feePercentage <= 0.05,
            `Expected ${variableName}.percentage to be between 0 and 0.05, but is ${affiliateInfo.feePercentage}`,
        );
    },

    isTokenInfo(variableName: string, token: TokenInfo): void {
        assert.isETHAddressHex(`${variableName}.address`, token.address);
        assert.isNumber(`${variableName}.decimals`, token.decimals);
        assert.isNumber(`${variableName}.chainId`, token.chainId);
        assert.isString(`${variableName}.name`, token.name);
        assert.isString(`${variableName}.symbol`, token.symbol);
        assert.isWebUri(`${variableName}.logoUri`, token.logoURI);

    },
};
