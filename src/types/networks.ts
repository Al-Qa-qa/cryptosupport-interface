export enum SupportedNetworks {
  // MAINNET = 1,
  SEPOLIA = 11155111,
  GEORLI = 5,
  POLYGON_MUMBAI = 80001,
  BSC_TESTNET = 97,
  AVALANCHE_FUGI = 43113,
  // ARBITRUM_ONE = 42161,
  // OPTIMISM = 10,
  // OPTIMISTIC_KOVAN = 69,
  // POLYGON = 137,
}

type ChainInfo = {
  unique_name: string;
  view_name: string;
  chainId: string;
  scanner?: string;
  coin: string;
  image: string;
};

type SupportedChainIDS = {
  [chainId in SupportedNetworks]: ChainInfo;
};

// interface SupportedChainIdsAndLocalhost extends SupportedChainIDS {
//   31337?: ChainInfo;
// }

export const SUPPORTED_CHAIN_IDS: SupportedChainIDS = {
  [SupportedNetworks.SEPOLIA]: {
    unique_name: 'sepolia',
    view_name: 'Sepolia Ethereum',
    chainId: '0xaa36a7',
    scanner: 'https://sepolia.etherscan.io/',
    coin: 'ETH',
    image: 'ethereum.svg',
  },
  [SupportedNetworks.GEORLI]: {
    unique_name: 'georli',
    view_name: 'Georli Ethereum',
    chainId: '0x5',
    scanner: 'https://goerli.etherscan.io/',
    coin: 'ETH',
    image: 'ethereum.svg',
  },
  [SupportedNetworks.POLYGON_MUMBAI]: {
    unique_name: 'polygon_mumbai',
    view_name: 'Polygon Mumbai',
    chainId: '0x13881',
    scanner: 'https://mumbai.polygonscan.com/',
    coin: 'MATIC',
    image: 'polygon.svg',
  },
  [SupportedNetworks.BSC_TESTNET]: {
    unique_name: 'bsc_testnet',
    view_name: 'BSC Testnet',
    chainId: '0x61',
    scanner: 'https://testnet.bscscan.com/',
    coin: 'BNB',
    image: 'bsc.svg',
  },
  [SupportedNetworks.AVALANCHE_FUGI]: {
    unique_name: 'avalanche_fugi',
    view_name: 'Avalanche Fugi',
    chainId: '0xa869',
    scanner: 'https://testnet.snowtrace.io/',
    coin: 'AVAX',
    image: 'avalanche.svg',
  },
};
