import { ChainId } from '@0x/contract-addresses';

type AssetDataByChainId = { [key in ChainId]?: string };

export const assetDataNetworkMapping: AssetDataByChainId[] = [
    // ZRX
    {
        [ChainId.Mainnet]: '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498',
        [ChainId.Kovan]: '0xf47261b00000000000000000000000002002d3812f58e35f0ea1ffbf80a75a38c32175fa',
    },
    // SPANK
    {
        [ChainId.Mainnet]: '0xf47261b000000000000000000000000042d6622dece394b54999fbd73d108123806f6a18',
        [ChainId.Kovan]: '0xf47261b00000000000000000000000007c9eee8448f3a7d1193389652d863b27e543272d',
    },
    // OMG
    {
        [ChainId.Mainnet]: '0xf47261b0000000000000000000000000d26114cd6ee289accf82350c8d8487fedb8a0c07',
        [ChainId.Kovan]: '0xf47261b000000000000000000000000046096d8ec059dbaae2950b30e01634ff0dc652ec',
    },
    // MKR
    {
        [ChainId.Mainnet]: '0xf47261b00000000000000000000000009f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        // 0x Kovan MKR
        [ChainId.Kovan]: '0xf47261b00000000000000000000000007b6b10caa9e8e9552ba72638ea5b47c25afea1f3',
    },
    // BAT
    {
        [ChainId.Mainnet]: '0xf47261b00000000000000000000000000d8775f648430679a709e98d2b0cb6250d2887ef',
        [ChainId.Kovan]: '0xf47261b0000000000000000000000000c87faa7a58f0adf306bad9e7d892fb045a20e5af',
    },
    // SNT
    {
        [ChainId.Mainnet]: '0xf47261b0000000000000000000000000744d70fdbe2ba4cf95131626614a1763df805b9e',
        [ChainId.Kovan]: '0xf47261b00000000000000000000000009cfe76a718ea75e3e8ce4fc7ad0fef84be70919b',
    },
    // MANA
    {
        [ChainId.Mainnet]: '0xf47261b00000000000000000000000000f5d2fb29fb7d3cfee444a200298f468908cc942',
        [ChainId.Kovan]: '0xf47261b0000000000000000000000000c64edfc78321673435fbeebdaaa7f9d755963542',
    },
    // GNT
    {
        [ChainId.Mainnet]: '0xf47261b0000000000000000000000000a74476443119a942de498590fe1f2454d7d4ac0d',
        // 0x Kovan GNT
        [ChainId.Kovan]: '0xf47261b000000000000000000000000031fb614e223706f15d0d3c5f4b08bdf0d5c78623',
    },
    // SUB
    {
        [ChainId.Mainnet]: '0xf47261b000000000000000000000000012480e24eb5bec1a9d4369cab6a80cad3c0a377a',
    },
    // Dentacoin
    {
        [ChainId.Mainnet]: '0xf47261b000000000000000000000000008d32b0da63e2C3bcF8019c9c5d849d7a9d791e6',
    },
    // REP
    {
        [ChainId.Kovan]: '0xf47261b00000000000000000000000008cb3971b8eb709c14616bd556ff6683019e90d9c',
        [ChainId.Mainnet]: '0xf47261b00000000000000000000000001985365e9f78359a9b6ad760e32412f4a445e862',
    },
    // USDC
    {
        [ChainId.Kovan]: '',
        [ChainId.Mainnet]: '0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
];
