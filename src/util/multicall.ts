import { ContractWrappers, ZeroExProvider } from '@0x/contract-wrappers';
import { MultiCall } from "@indexed-finance/multicall";
import { providers } from 'ethers';
import { TokenBalance, TokenInfo } from "../types";
import { ChainId } from "@0x/contract-addresses";
import { BigNumber } from "@0x/utils";
import { ETH_ADDRESS } from "../constants";


export const MulticallUtils  = {

    getMulticallContract: (zeroxProvider: ZeroExProvider) => {
        const provider = new providers.Web3Provider(zeroxProvider);
        return new MultiCall(provider);
    },
    getTokensBalancesAndAllowances: async (zeroxProvider: ZeroExProvider, tokens: TokenInfo[], chainId: ChainId, ethAccount: string): Promise<TokenBalance[]> => {
       const contractWrappers = new ContractWrappers(zeroxProvider, {chainId: chainId});
       const allowanceTarget = contractWrappers.contractAddresses.exchangeProxy;
       const tokenAddress = tokens.filter(t => t.address !== ETH_ADDRESS ).map(t => t.address);
       const multicall = MulticallUtils.getMulticallContract(zeroxProvider);
       const [, tokenBalancesAllowances] = await multicall.getBalancesAndAllowances(tokenAddress, ethAccount, allowanceTarget);
       const tokenBalances = tokens.map((tk: TokenInfo, i: any) => {
        return {
            token: tk,
            balance: tk.address === ETH_ADDRESS ? new BigNumber(0) : new BigNumber(tokenBalancesAllowances[tk.address].balance.toString()),
            isUnlocked: tk.address === ETH_ADDRESS ? true : new BigNumber(tokenBalancesAllowances[tk.address].allowance.toString()).gt('0'),
        };
       });
       return tokenBalances;

    }




}