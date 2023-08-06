import React, { useState } from 'react';
import { BigNumber, ethers } from 'ethers';

// UI Components
import Image from 'next/image';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MuiLink from '@mui/material/Link';

// Icons
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Images
import walletProfile from '../assets/images/wallet-profile-picture.png';
import ethereumImg from '../assets/images/networks/ethereum.svg';

// Functions
import { formatBalance, formatWalletAddress } from '../utils/format';

// Data and Types
import { Funder } from '../types/contractData';

// ------------

type FunderCardProps = {
  funder: Funder;
};
function FunderCard({ funder }: FunderCardProps) {
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  /**
   * Copy wallet address to clipboard
   */
  const handleCopyAddress = () => {
    setCopiedAddress(true);
    navigator.clipboard.writeText(funder.address);
    setTimeout(() => {
      setCopiedAddress(false);
    }, 3000);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Image
            src={walletProfile}
            width={30}
            height={30}
            alt="wallet"
            style={{ borderRadius: '50%' }}
          />
          <MuiLink
            pl={1}
            color="secondary"
            href={`https://sepolia.etherscan.io/address/${funder.address}`}
            target="_blank"
            underline="none">
            {formatWalletAddress(funder.address)}
          </MuiLink>

          {!copiedAddress ? (
            <Tooltip title="Copy Address" placement="top-end" arrow>
              <IconButton
                aria-label="copy"
                size="small"
                onClick={handleCopyAddress}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          ) : (
            <CheckCircleIcon fontSize="small" color="inherit" />
          )}
        </Stack>
        <Stack direction="row" spacing={3} alignItems="center">
          <Image src={ethereumImg} width={30} height={30} alt="ethers" />
          <Stack direction="row">
            <Typography variant="body1" pr={1}>
              {formatBalance(ethers.utils.formatEther(funder.amount))}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ETH
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

export default FunderCard;
