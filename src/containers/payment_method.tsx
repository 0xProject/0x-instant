
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PhoneIconSvg from '../assets/icons/phone.svg';
import { CoinbaseWalletLogo } from '../components/coinbase_wallet_logo';
import { MetaMaskLogo } from '../components/meta_mask_logo';
import { PaymentMethodDropdown } from '../components/payment_method_dropdown';
import { SectionHeader } from '../components/section_header';
import { Container } from '../components/ui/container';
import { Flex } from '../components/ui/flex';
import { WalletPrompt } from '../components/wallet_prompt';
import { COINBASE_WALLET_ANDROID_APP_STORE_URL, COINBASE_WALLET_IOS_APP_STORE_URL, COINBASE_WALLET_SITE_URL } from '../constants';
import { actions, unlockWalletAndDispatchToStore } from '../redux/actions';
import { getAccount, getChainId } from '../redux/selectors';
import { ColorOption } from '../style/theme';
import {  AccountState, OperatingSystem, ProviderType, StandardSlidingPanelContent, WalletSuggestion } from '../types';
import { analytics } from '../util/analytics';
import { envUtil } from '../util/env';

export const PaymentMethodContainer = () =>  {
    const account  = useSelector(getAccount);
    const network  = useSelector(getChainId);
    const dispatch = useDispatch();
    const onInstallWalletClick = () => {
        const isMobile = envUtil.isMobileOperatingSystem();
        const walletSuggestion: WalletSuggestion = isMobile
            ? WalletSuggestion.CoinbaseWallet
            : WalletSuggestion.MetaMask;

        analytics.trackInstallWalletClicked(walletSuggestion);
        if (walletSuggestion === WalletSuggestion.MetaMask) {
            dispatch(actions.openStandardSlidingPanel(StandardSlidingPanelContent.InstallWallet));
        } else {
            const operatingSystem = envUtil.getOperatingSystem();
            let url = COINBASE_WALLET_SITE_URL;
            switch (operatingSystem) {
                case OperatingSystem.Android:
                    url = COINBASE_WALLET_ANDROID_APP_STORE_URL;
                    break;
                case OperatingSystem.iOS:
                    url = COINBASE_WALLET_IOS_APP_STORE_URL;
                    break;
                default:
                    break;
            }
            window.open(url, '_blank');
        }
    };

    const renderTitleText = (): string => {
        switch (account.state) {
            case AccountState.Loading:
                return 'loading...';
            case AccountState.Locked:
            case AccountState.None:
                return 'connect your wallet';
            case AccountState.Ready:
                return '';
        }
    };
    const renderMainContent = () => {
        const isMobile = envUtil.isMobileOperatingSystem();
        const metamaskLogo = <MetaMaskLogo width={23} height={22} />;
        const logo = isMobile ? <CoinbaseWalletLogo width={22} height={22} /> : metamaskLogo;
        const primaryColor = ColorOption.grey;
        const secondaryColor = ColorOption.whiteBackground;
        const colors = { primaryColor, secondaryColor };
        const onUnlockGenericWallet = () => {
           dispatch(unlockWalletAndDispatchToStore(ProviderType.MetaMask));
        };
        const onUnlockFormatic = () => dispatch(unlockWalletAndDispatchToStore(ProviderType.Fortmatic));
        switch (account.state) {
            case AccountState.Loading:
                return null;
            case AccountState.Locked:
                return (
                    <Flex direction="column">
                        <WalletPrompt
                            onClick={onUnlockGenericWallet}
                            display="flex"
                            alignText={'flex-start'}
                            marginLeft="16px"
                            fontWeight="normal"
                            padding="15px 18px"
                            image={
                                <Container position="relative" display="flex">
                                    {logo}
                                </Container>
                            }
                            {...colors}
                        >
                            {isMobile ? 'Coinbase Wallet' : 'MetaMask'}
                        </WalletPrompt>
                        <WalletPrompt
                            onClick={onUnlockFormatic}
                            marginTop="14px"
                            marginLeft="19px"
                            fontWeight="normal"
                            padding="15px 18px"
                            image={
                                <Container position="relative" display="flex">
                                    <PhoneIconSvg />
                                </Container>
                            }
                            display="flex"
                            {...colors}
                        >
                            Use phone number
                        </WalletPrompt>
                    </Flex>
                );
            case AccountState.None:
                return (
                    <Flex direction="column" justify="space-between" height="100%">
                        <WalletPrompt
                            onClick={onInstallWalletClick}
                            image={logo}
                            {...colors}
                            fontWeight="normal"
                            marginLeft="19px"
                            padding="15px 18px"
                        >
                            {isMobile ? 'Install Coinbase Wallet' : 'Install MetaMask'}
                        </WalletPrompt>
                        <WalletPrompt
                            onClick={onUnlockFormatic}
                            marginTop="14px"
                            fontWeight="normal"
                            marginLeft="19px"
                            padding="15px 18px"
                            image={
                                <Container position="relative" display="flex">
                                    <PhoneIconSvg />
                                </Container>
                            }
                            display="flex"
                            {...colors}
                        >
                            Use phone number
                        </WalletPrompt>
                    </Flex>
                );
            case AccountState.Ready:
                return (
                    <PaymentMethodDropdown
                        accountAddress={account.address}
                        accountEthBalanceInWei={account.ethBalanceInWei}
                        network={network}
                    />
                );
        }
    };

    const marginBottom = account.state !== AccountState.Ready ? '77px' : null;
    return (
            <Container width="100%" height="100%" padding="20px 20px 0px 20px" marginBottom={marginBottom}>
                <Container marginBottom="12px">
                    <Flex justify="space-between">
                        <SectionHeader>{renderTitleText()}</SectionHeader>
                    </Flex>
                </Container>
                <Container>{renderMainContent()}</Container>
            </Container>
        );
};
