import { ERC20TokenContract } from '@0x/contract-wrappers';
import { BigNumber } from '@0x/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from '../constants';
import { getAccount, getWeb3Wrapper } from '../redux/selectors';
import { AccountState, TokenInfo } from '../types';
import { gasPriceEstimator } from '../util/gas_price_estimator';

export const useEstimateGasApproval = (token: TokenInfo, allowanceTarget?: string) => {
    const [gas, setGas] = useState<BigNumber | undefined>();
    const web3Wrapper = useSelector(getWeb3Wrapper);
    const account = useSelector(getAccount);

    useEffect(() => {
         if (token.address && web3Wrapper && allowanceTarget && account.state === AccountState.Ready) {

            const asyncEstimateGas = async () => {
                const erc20Token = new ERC20TokenContract(token.address, web3Wrapper.getProvider());
                const gasInfo =  await gasPriceEstimator.getGasInfoAsync();
                const estimatedGas =  await erc20Token.approve(allowanceTarget, UNLIMITED_ALLOWANCE_IN_BASE_UNITS).estimateGasAsync({gasPrice: gasInfo.gasPriceInWei, from: account.address});
                return new BigNumber(estimatedGas).multipliedBy(gasInfo.gasPriceInWei);
             };

            asyncEstimateGas()
            .then(g => setGas(g))
            .catch(console.log);
         }
     }, [token, web3Wrapper, allowanceTarget, account ]);

    return gas;
};
