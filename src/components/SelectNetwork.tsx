import { useEffect, useState } from 'react';

// UI Components
import Image from 'next/image';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {
  SelectChangeEvent,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { toast } from 'react-toastify';

// Images
import ethereumImg from '../assets/images/networks/ethereum.svg';
import polygonImg from '../assets/images/networks/polygon.svg';
import bscImg from '../assets/images/networks/bsc.svg';
import avalancheImg from '../assets/images/networks/avalanche.svg';
import localNetworkImg from '../assets/images/networks/unknown.png';

// Hooks and Functions
import { useChain, useMoralis } from 'react-moralis';
import { convertChainIdToHex, convertChainIdToInt } from '../utils/format';

// Data and Types
import { SUPPORTED_CHAIN_IDS, SupportedNetworks } from '../types/networks';

// ---------

function SelectNetwork() {
  // Network images
  const networksImages = {
    [SUPPORTED_CHAIN_IDS[SupportedNetworks.SEPOLIA].image]: ethereumImg,
    [SUPPORTED_CHAIN_IDS[SupportedNetworks.GEORLI].image]: ethereumImg,
    [SUPPORTED_CHAIN_IDS[SupportedNetworks.POLYGON_MUMBAI].image]: polygonImg,
    [SUPPORTED_CHAIN_IDS[SupportedNetworks.BSC_TESTNET].image]: bscImg,
    [SUPPORTED_CHAIN_IDS[SupportedNetworks.AVALANCHE_FUGI].image]: avalancheImg,
  };

  const { switchNetwork, chainId } = useChain();
  const [network, setNetwork] = useState<string | null>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Tracking changing networks
   *
   * @param event Selecting different network event
   */
  const handleChange = async (event: SelectChangeEvent) => {
    try {
      await switchNetwork(event.target.value);

      setNetwork(event.target.value);
    } catch (error) {
      console.log(error);
    }
  };

  // Checking if the user connected
  useEffect(() => {
    if (chainId && SupportedNetworks[convertChainIdToInt(chainId)]) {
      setNetwork(chainId);
      toast.info(
        `Connected to ${
          SUPPORTED_CHAIN_IDS[convertChainIdToInt(chainId)].unique_name
        } network `,
        {
          style: { background: '#222' },
        }
      );
    } else if (!chainId) {
      setNetwork(null);
    }
  }, [chainId]);

  return (
    <>
      {network ? (
        <FormControl fullWidth margin="none">
          <Select
            autoWidth={true}
            labelId="select-network"
            id="select-network"
            size="small"
            sx={{ p: 0 }}
            value={network!}
            onChange={handleChange}
            defaultValue={network!}
            renderValue={
              isSmallScreen
                ? () => {
                    if (isSmallScreen) {
                      return (
                        <Stack direction="row" alignItems="center">
                          <Image
                            src={
                              networksImages[
                                SUPPORTED_CHAIN_IDS[
                                  convertChainIdToInt(network)
                                ].image
                              ]
                            }
                            width={23}
                            height={23}
                            alt={
                              SUPPORTED_CHAIN_IDS[convertChainIdToInt(network)]
                                .unique_name
                            }
                          />
                        </Stack>
                      );
                    }
                  }
                : undefined
            }>
            {Object.keys(SUPPORTED_CHAIN_IDS)
              .map((e) => +e)
              .map((chainId: SupportedNetworks) => (
                <MenuItem key={chainId} value={convertChainIdToHex(chainId)}>
                  <Stack direction="row" alignItems="center">
                    <Image
                      src={networksImages[SUPPORTED_CHAIN_IDS[chainId].image]}
                      width={23}
                      height={23}
                      alt={SUPPORTED_CHAIN_IDS[chainId].unique_name}
                    />

                    <Typography variant="subtitle2" px={1}>
                      {SUPPORTED_CHAIN_IDS[chainId].view_name}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      ) : (
        <></>
      )}
    </>
  );
}

export default SelectNetwork;
