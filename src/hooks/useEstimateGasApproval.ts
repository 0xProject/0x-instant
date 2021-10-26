import { BigNumber } from '@0x/utils';
import { ethers, providers } from 'ethers';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from '../constants';
import erc20abi from '../constants/ABI/erc20.json';
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
                const pr = new providers.Web3Provider(web3Wrapper.getProvider() as any).getSigner();
                const erc20Token =  new ethers.Contract(token.address, erc20abi, pr);

                const gasInfo =  await gasPriceEstimator.getGasInfoAsync();
                const estimatedGas = await erc20Token.estimateGas.approve(allowanceTarget, UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toString(), {gasPrice: gasInfo.gasPriceInWei.toString(), from: account.address});

                return new BigNumber(estimatedGas.toString()).multipliedBy(gasInfo.gasPriceInWei);
             };

            asyncEstimateGas()
            .then(g => setGas(g))
            .catch(console.log);
         }
     }, [token, web3Wrapper, allowanceTarget, account ]);

    return gas;
};
