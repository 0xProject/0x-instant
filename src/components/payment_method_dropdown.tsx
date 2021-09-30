import { ChainId } from '@0x/contract-addresses';
import { BigNumber } from '@0x/utils';
import * as copy from 'copy-to-clipboard';
import * as React from 'react';

import { analytics } from '../util/analytics';
import { envUtil } from '../util/env';
import { etherscanUtil } from '../util/etherscan';
import { format } from '../util/format';

import { Dropdown, DropdownItemConfig } from './ui/dropdown';

export interface PaymentMethodDropdownProps {
  accountAddress: string;
  accountEthBalanceInWei?: BigNumber;
  network: ChainId;
}

export const PaymentMethodDropdown = (props: PaymentMethodDropdownProps) => {
  const { accountAddress, network, accountEthBalanceInWei } = props;
  const handleEtherscanClick = (): void => {
    analytics.trackPaymentMethodOpenedEtherscan();

    const etherscanUrl = etherscanUtil.getEtherScanEthAddressIfExists(
      accountAddress,
      network,
    );
    window.open(etherscanUrl, '_blank');
  };
  const handleCopyToClipboardClick = (): void => {
    analytics.trackPaymentMethodCopiedAddress();

    const { accountAddress } = props;
    copy(accountAddress);
  };

  const getDropdownItemConfigs = (): DropdownItemConfig[] => {
    if (envUtil.isMobileOperatingSystem()) {
      return [];
    }
    const viewOnEtherscan = {
      text: 'View on Etherscan',
      onClick: handleEtherscanClick,
    };
    const copyAddressToClipboard = {
      text: 'Copy address to clipboard',
      onClick: handleCopyToClipboardClick,
    };
    return [viewOnEtherscan, copyAddressToClipboard];
  };

  const value = format.ethAddress(accountAddress);
  const label = format.ethBaseUnitAmount(
    accountEthBalanceInWei,
    4,
    '',
  ) as string;
  return (
    <Dropdown
      value={value}
      label={label}
      items={getDropdownItemConfigs()}
      onOpen={analytics.trackPaymentMethodDropdownOpened}
    />
  );
};
