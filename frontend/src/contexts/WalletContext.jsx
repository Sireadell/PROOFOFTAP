import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

export const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  // Load network info from environment variables
  const SOMNIA_CHAIN_ID = Number(import.meta.env.VITE_SOMNIA_CHAIN_ID_DEC);
  const SOMNIA_CHAIN_ID_HEX = import.meta.env.VITE_SOMNIA_CHAIN_ID;
  const SOMNIA_CHAIN_NAME = import.meta.env.VITE_SOMNIA_CHAIN_NAME;
  const SOMNIA_NATIVE_CURRENCY_NAME = import.meta.env.VITE_SOMNIA_NATIVE_CURRENCY_NAME;
  const SOMNIA_NATIVE_CURRENCY_SYMBOL = import.meta.env.VITE_SOMNIA_NATIVE_CURRENCY_SYMBOL;
  const SOMNIA_NATIVE_CURRENCY_DECIMALS = Number(import.meta.env.VITE_SOMNIA_NATIVE_CURRENCY_DECIMALS);
  const SOMNIA_RPC_URL = import.meta.env.VITE_SOMNIA_RPC_URL;
  const SOMNIA_EXPLORER_URL = import.meta.env.VITE_SOMNIA_BLOCK_EXPLORER_URL;

  const SOMNIA_PARAMS = {
    chainId: SOMNIA_CHAIN_ID_HEX,
    chainName: SOMNIA_CHAIN_NAME,
    nativeCurrency: {
      name: SOMNIA_NATIVE_CURRENCY_NAME,
      symbol: SOMNIA_NATIVE_CURRENCY_SYMBOL,
      decimals: SOMNIA_NATIVE_CURRENCY_DECIMALS,
    },
    rpcUrls: [SOMNIA_RPC_URL],
    blockExplorerUrls: [SOMNIA_EXPLORER_URL],
  };

  useEffect(() => {
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      console.error("MetaMask is not installed");
      return;
    }

    const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(ethProvider);

    ethProvider.getNetwork().then((network) => {
      setChainId(network.chainId);
      if (network.chainId !== SOMNIA_CHAIN_ID) {
        promptSwitchNetwork();
      }
    });

    ethProvider.listAccounts().then((accounts) => {
      if (accounts.length) {
        setAccount(accounts[0]);
        setSigner(ethProvider.getSigner());
        console.log('Initial account set:', accounts[0]);
      }
    });

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length) {
        setAccount(accounts[0]);
        setSigner(ethProvider.getSigner());
        setError(null);
        console.log('Account changed:', accounts[0]);
      } else {
        setAccount(null);
        setSigner(null);
        console.log('Account disconnected');
      }
    });

    window.ethereum.on("chainChanged", (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      if (newChainId !== SOMNIA_CHAIN_ID) {
        promptSwitchNetwork();
      } else {
        setError(null);
      }
      console.log('Chain changed:', newChainId);
    });

    return () => {
      window.ethereum.removeListener("accountsChanged", () => {});
      window.ethereum.removeListener("chainChanged", () => {});
    };
  }, []);

  async function promptSwitchNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SOMNIA_CHAIN_ID_HEX }],
      });
      setError(null);
      console.log("Network switched to Somnia");
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SOMNIA_PARAMS],
          });
          setError(null);
          console.log("Somnia network added to MetaMask");
        } catch (addError) {
          setError("Failed to add Somnia network to MetaMask.");
          console.error("Failed to add Somnia network", addError);
        }
      } else if (switchError.code === 4001) {
        setError("Please switch to the Somnia network to use this dApp.");
        console.warn("User rejected network switch");
      } else {
        setError("Failed to switch network.");
        console.error("Failed to switch network", switchError);
      }
    }
  }

  async function connectWallet() {
    try {
      console.log('Connecting wallet...');
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log('Wallet connected:', accounts[0]);

      setAccount(accounts[0]);

      if (!provider) {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethProvider);
        setSigner(ethProvider.getSigner());
      } else {
        setSigner(provider.getSigner());
      }
      setError(null);

      const network = await (provider ?? new ethers.providers.Web3Provider(window.ethereum)).getNetwork();
      setChainId(network.chainId);
      if (network.chainId !== SOMNIA_CHAIN_ID) {
        await promptSwitchNetwork();
      }
    } catch (err) {
      console.error('connectWallet error:', err);
      setError(err.message);
    }
  }

  function disconnectWallet() {
    console.log('Wallet disconnected');
    setAccount(null);
    setSigner(null);
    setError(null);
  }

  useEffect(() => {
    if (account) {
      console.log('Current account:', account);
    } else {
      console.log('No wallet connected');
    }
  }, [account]);

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
