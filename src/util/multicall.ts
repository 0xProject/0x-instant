import { ChainId } from '@0x/contract-addresses';
import { ContractWrappers, ZeroExProvider } from '@0x/contract-wrappers';
import { BigNumber } from '@0x/utils';
import { MultiCall } from '@indexed-finance/multicall';
import { providers } from 'ethers';

import { ETH_ADDRESS } from '../constants';
import { TokenBalance, TokenInfo } from '../types';

export const MulticallUtils  = {

    getMulticallContract: (zeroxProvider: ZeroExProvider) => {
        const provider = new providers.Web3Provider(zeroxProvider);
        return new MultiCall(provider);
    },
    getTokensBalancesAndAllowances: async (zeroxProvider: ZeroExProvider, tokens: TokenInfo[], chainId: ChainId, ethAccount: string, ethBalance: BigNumber): Promise<TokenBalance[]> => {
       const contractWrappers = new ContractWrappers(zeroxProvider, {chainId});
       const allowanceTarget = contractWrappers.contractAddresses.exchangeProxy;
       const tokenAddress = tokens.filter(t => t.address !== ETH_ADDRESS ).map(t => t.address);
       const multicall = MulticallUtils.getMulticallContract(zeroxProvider);
       const [, tokenBalancesAllowances] = await multicall.getBalancesAndAllowances(tokenAddress, ethAccount, allowanceTarget);
       const tokenBalances = tokens.map((tk: TokenInfo, i: any) => {
        return {
            token: tk,
            balance: tk.address === ETH_ADDRESS ? new BigNumber(ethBalance) : new BigNumber(tokenBalancesAllowances[tk.address].balance.toString()),
            isUnlocked: tk.address === ETH_ADDRESS ? true : new BigNumber(tokenBalancesAllowances[tk.address].allowance.toString()).gt('0'),
        };
       });
       return tokenBalances;

    },

};
