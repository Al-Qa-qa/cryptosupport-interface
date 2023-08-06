import { MoralisNextApi } from '@moralisweb3/next';
import { EvmChain } from '@moralisweb3/common-evm-utils';

export default MoralisNextApi({
  apiKey: process.env.MORALIS_API_KEY!,
  defaultEvmApiChain: 11155111,
});
// mm.block.getBlock({
//   blockNumberOrHash: '33000000',
// });
