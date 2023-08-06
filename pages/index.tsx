import React, { useState, useEffect } from "react";

// UI Componnts
import Image from "next/image";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { CircularProgress } from "@mui/material";

import SelectNetwork from "@/src/components/SelectNetwork";
import ConnectButton from "@/src/components/ConnectButton";
import { BigNumber, ContractTransaction, ethers } from "ethers";

// Images
import logo from "../public/logo.png";
import ethereumCoin from "../src/assets/images/ethereum-coin.svg";
import FunderCard from "@/src/components/FunderCard";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Hooks and Functions
import {
  useMoralis,
  useWeb3Contract,
  useWeb3ExecuteFunction,
} from "react-moralis";
import { convertChainIdToInt, formatBalance } from "@/src/utils/format";

// Data and Types
import { ABIs, contractAddresses } from "../constants";
import { SUPPORTED_CHAIN_IDS, SupportedNetworks } from "@/src/types/networks";
import { Funder } from "@/src/types/contractData";

// ---------

type contractAddressesType = {
  [k in string]: {
    [K2 in string]: string;
  };
};

export default function Home() {
  const addresses: contractAddressesType = contractAddresses;
  const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
  let chainId: SupportedNetworks;
  let networkName: string;
  let fundMeAddress: string | null = null;
  if (chainIdHex) {
    chainId = convertChainIdToInt(chainIdHex!);
    networkName = SUPPORTED_CHAIN_IDS[chainId]?.unique_name || "";
    fundMeAddress =
      networkName in addresses ? addresses[networkName]["FundMe"] : null;
  }
  const [funders, setFunders] = useState<Funder[]>([]);
  const [fundedAmount, setFundedAmount] = useState<number>(0);
  const [fundedAmountInWei, setFundedAmountInWei] = useState<string>("0");
  const [owner, setOwner] = useState<string>("");
  const [contractBalance, setContractBalance] = useState<string>("0");

  // const { data: contractNativeBalance } = useNativeBalance();

  const { fetch } = useWeb3ExecuteFunction();

  // Get balance of the contract
  const { fetch: fetchContractBalance } = useWeb3ExecuteFunction({
    contractAddress: fundMeAddress!, // specify the networkId
    abi: ABIs.FundMe,
    functionName: "getBalance",
    params: {},
  });

  // Get the Owner (deployer) of the contract
  const { runContractFunction: getOwner } = useWeb3Contract({
    abi: ABIs.FundMe,
    contractAddress: fundMeAddress!, // specify the networkId
    functionName: "getOwner",
    params: {},
  });

  // Get the current funders addresses stored in the contract
  const { runContractFunction: getFunders } = useWeb3Contract({
    abi: ABIs.FundMe,
    contractAddress: fundMeAddress!, // specify the networkId
    functionName: "getFunders",
    params: {},
  });

  // Withdraw funds from the contract
  const {
    runContractFunction: withdraw,
    isLoading: isWithdrawLoading,
    isFetching: isWithdrawFetching,
  } = useWeb3Contract({
    abi: ABIs.FundMe,
    contractAddress: fundMeAddress!, // specify the networkId
    functionName: "withdraw",
    params: {},
  });

  // Fund ETH to the contract
  const {
    runContractFunction: fund,
    isLoading: isFundLoading,
    isFetching: isFundFetching,
  } = useWeb3Contract({
    abi: ABIs.FundMe,
    contractAddress: fundMeAddress!, // specify the networkId
    functionName: "fund",
    params: {},
    msgValue: fundedAmountInWei,
  });

  /**
   * Update the values read from our contract.
   * Reading the value again and update the UI
   */
  const updateContractValues = async (): Promise<void> => {
    if (chainIdHex) {
      const _owner = (((await getOwner()) as string) || "").toString();
      const _funders: Set<string> = new Set((await getFunders()) as string[]);
      for (const address of _funders.values()) {
        if (!fundMeAddress) break;

        const options = {
          contractAddress: fundMeAddress,
          functionName: "getAddressToAmountFunded",
          abi: ABIs.FundMe,
          params: {
            fundingAddress: address,
          },
        };
        try {
          await fetch({
            params: options,
            onSuccess: (returnedData) => {
              let amount: BigNumber = returnedData as BigNumber;
              let newFunder: Funder = { address, amount };
              let newFunders: Funder[] = funders.slice(0);
              // Update the amount funded by funder if he was an old funder
              for (let i = 0; i < funders.length; i++) {
                const _funder: Funder = funders[i];
                if (
                  _funder.address.toLowerCase() ===
                  newFunder.address.toLowerCase()
                ) {
                  newFunders[i].amount = amount; // update the funded amount
                  setFunders(newFunders); // update funders
                  return; // go out of the function
                }
              }
              setFunders((prevFunders) => {
                const _funders = prevFunders.slice(0);
                _funders.push(newFunder);
                return _funders;
              });
            },
            onError: (e) => {
              console.log(e);
            },
          });
        } catch (error) {
          console.log(error);
        }
      }

      setOwner(_owner);
      await fetchContractBalance({
        onSuccess: (returnedData) => {
          let _contractBalance: BigNumber = returnedData as BigNumber;
          setContractBalance(
            formatBalance(ethers.utils.formatEther(_contractBalance))
          ); // BigNumber -> 1.321564684 -> 1.36489
        },
      });
    }
    // (_owner);
  };

  /**
   * Change the value of the funded amount from the user by changing the text field value.
   *
   * NOTE: we have two variables [fundedAmount, fundedAmountInWei].
   * fundedAmount => the value in the text (number) field, and this is the value that is seen to user
   * fundedAmountInWei => the value funded with wei unit, and this is the value that is send to the contract
   *                      when the user add funds
   *
   * @param e Input field value changed event
   */
  const handleChangeFundedETH = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (isNaN(parseInt(e.target.value))) {
      toast.error("Invalid Input");
      return;
    }
    setFundedAmount(+e.target.value);
    setFundedAmountInWei(ethers.utils.parseEther(e.target.value).toString());
  };

  /**
   * - Checking that the value intered by the user is correct.
   * i.e: no negative values, no zero value, no invalid number value
   *
   * - Firing fund function from our contract
   * - If the Tx success it will fire the successful fund request function {@link handleSuccessfulFund}
   * - It will log error in case of failed Tx
   */
  const handleFundETH = async (): Promise<void> => {
    // const owner = ((await getOwner()) as string).toString();
    if (+fundedAmount < 0) {
      toast.error("Funded ETH value is not valid");
    } else if (+fundedAmount === 0) {
      toast.warn("You are funding 0 ETH !");
    } else {
      try {
        await fund({
          onSuccess: handleSuccessfulFund,
          onError: (error) => {
            toast.error<JSX.Element>(
              <span>
                Transaction Failed <br /> {error.message}
              </span>
            );
          },
        });
        // updateContractValues();
      } catch (error) {}
    }
  };
  /**
   * 1- Waiting for the Tx conrifmation
   * 2- update contract values see {@link updateContractValues}
   * 3- Show successful notification to user that the transaction completed successfully
   *
   * @param tx Successfuly Transaction Data
   */
  const handleSuccessfulFund = async (
    tx: ContractTransaction | any
  ): Promise<void> => {
    await toast.promise(tx.wait(1), {
      pending: "Waiting Transaction Confirmation",
      success: "Transaction Confirmation",
      error: "Transaction failed",
    });

    await updateContractValues();
    toast.success<JSX.Element>(
      <span>
        Funded Successfully <br />
        Thanks for you Support
      </span>
    );
  };

  /**
   * - Check that the owner of the contract is the one who want to withdraw
   * - Check that the contract balance is greater than 0
   * - Fire withdraw function from our contract
   * - If the Tx success it will fire the successful withdraw request function {@link handleSuccessfulWithdraw}
   * - It will log error in case of failed Tx
   */
  const handleWithdraw = async (): Promise<void> => {
    if (account?.toLowerCase() !== owner.toLowerCase()) {
      toast.error("You are not the owner of the contract");
    } else {
      try {
        if (+contractBalance === 0) {
          toast.warn("You are withdrawing 0 ETH!");
          return;
        }
        await withdraw({
          onSuccess: handleSuccessfulWithdraw,
          onError: (error) => {
            toast.error<JSX.Element>(
              <span>
                Transaction Failed <br />{" "}
                {error.message.slice(0, error.message.indexOf("("))}
              </span>
            );
          },
        });
      } catch (error) {
        console.log(error);
      }
    }
  };
  /**
   * 1- Waiting for the Tx conrifmation
   * 2- update contract values see {@link updateContractValues}
   * 3- Show successful notification to user that the withdraw transaction completed successfully
   *
   * @param tx Withdraw Tx data
   */
  const handleSuccessfulWithdraw = async (
    tx: ContractTransaction | any
  ): Promise<void> => {
    console.log(tx);
    await toast.promise(tx.wait(1), {
      pending: "Waiting Transaction Confirmation",
      success: "Transaction Confirmed",
      error: "Tx failed",
    });
    // We will loop trough funders from our contract, and since they will be zero length array,
    // modifications will no be seen in our UI, so we updated our funders manually
    // ----
    // You can make it sync with contract values by changing the Algorism, its up to you
    setFunders([]);
    toast.success<string>("Withdrawed Successfully");
    await updateContractValues();
  };

  // Update User Interface if the chainId changed
  useEffect(() => {
    console.log("Chain Changed");
    if (chainIdHex) {
      updateContractValues().catch((error) => {
        console.log(error);
      });
    }
  }, [chainIdHex]);

  return (
    <>
      <Container maxWidth="lg" sx={{ pb: 5 }}>
        {/* Header */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 2 }}
          >
            <Stack direction="row" alignItems="center">
              <Image src={logo} alt={"crypto support"} height={60} />
              <Typography variant="h4" component="h1" pl={1}>
                Crypto Support
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <SelectNetwork />
              <ConnectButton />
            </Stack>
          </Stack>
        </Box>
        {/* Home Section */}
        {fundMeAddress ? (
          <>
            <Box component="section" sx={{ display: "flex", pt: 4 }}>
              <Box pr={{ md: 6 }}>
                <Typography variant="h1" mb={4}>
                  The Easy Way to Fund Your Crypto Dreams
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={6}>
                  Simply share your Ethereum wallet address with your
                  supporters, and they can send you ETH directly through our
                  platform. No more complicated payment systems or long wait
                  times for funds to clear.
                </Typography>
                <Paper sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h3" mb={3}>
                    Support My Project 🙂
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      type="number"
                      variant="outlined"
                      label="ETH amount"
                      size="small"
                      value={fundedAmount}
                      onChange={handleChangeFundedETH}
                      fullWidth
                      inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.1,
                      }}
                    />
                    <Button
                      variant="contained"
                      disabled={isFundLoading || isFundFetching}
                      onClick={handleFundETH}
                    >
                      {isFundLoading || isFundFetching ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Send ETH"
                      )}
                    </Button>
                  </Stack>
                </Paper>
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Image
                  src={ethereumCoin}
                  alt={"ethereum coin"}
                  width={300}
                  priority
                />
              </Box>
            </Box>
            {/* Supporters(Funders) Section */}
            <Box component="section" pt={6}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                mb={2}
              >
                <Typography variant="h2">Funders</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h5">{contractBalance} ETH</Typography>
                  <Button
                    variant="contained"
                    onClick={handleWithdraw}
                    disabled={isWithdrawLoading || isWithdrawFetching}
                  >
                    {isWithdrawLoading || isWithdrawFetching ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Withdraw"
                    )}
                  </Button>
                </Stack>
              </Stack>
              <Grid container spacing={2}>
                {funders.map((funder, i) => (
                  <Grid key={"funder-" + i} item xs={12} sm={6} md={4}>
                    <FunderCard funder={funder} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        ) : (
          <Box>
            The contract is not deployed on this network yet <br />
            Please switch to '<b>Sepolia Network</b>'', its chainId is: '
            <b>11155111</b>'
          </Box>
        )}
      </Container>
      <Box sx={{}}>
        <Box
          component="footer"
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            p: 2,
            bgcolor: "#333",
            textAlign: "center",
            zIndex: 999,
          }}
        >
          <Typography variant="body1">
            @{new Date(Date.now()).getFullYear()} CryptoSupport, All Right
            Reserved
          </Typography>
        </Box>
      </Box>
      {/* Toastify */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        transition={Slide}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#222",
        }}
      />
    </>
  );
}
