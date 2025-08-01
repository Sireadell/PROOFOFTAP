import React, { createContext, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// Define showToastOnce with a persistent tracker
const showToastOnce = (toastFunc, message, options = {}, hasToastedRef) => {
  const toastKey = `${message}-${Object.entries(options)
    .map(([k, v]) => `${k}=${v}`)
    .join("|")}`; // Unique key based on message and options
  if (!hasToastedRef.current.toasts[toastKey]) {
    hasToastedRef.current.toasts[toastKey] = true;
    toastFunc(message, {
      ...options,
      onClose: () => (hasToastedRef.current.toasts[toastKey] = false), // Reset on close
    });
  }
};

export const WalletContext = createContext({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  error: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  // Track session state including a toast set
  const hasToastedRef = useRef({
    welcome: false,
    wrongNetwork: false,
    toasts: {}, // Object to track displayed toasts
  });

  const SOMNIA_CHAIN_ID = Number(import.meta.env.VITE_SOMNIA_CHAIN_ID_DEC);
  const SOMNIA_CHAIN_ID_HEX = import.meta.env.VITE_SOMNIA_CHAIN_ID;
  const SOMNIA_CHAIN_NAME = import.meta.env.VITE_SOMNIA_CHAIN_NAME;
  const SOMNIA_PARAMS = {
    chainId: SOMNIA_CHAIN_ID_HEX,
    chainName: SOMNIA_CHAIN_NAME,
    nativeCurrency: {
      name: import.meta.env.VITE_SOMNIA_NATIVE_CURRENCY_NAME,
      symbol: import.meta.env.VITE_SOMNIA_NATIVE_CURRENCY_SYMBOL,
      decimals: Number(import.meta.env.VITE_SOMNIA_NATIVE_CURRENCY_DECIMALS),
    },
    rpcUrls: [import.meta.env.VITE_SOMNIA_RPC_URL],
    blockExplorerUrls: [import.meta.env.VITE_SOMNIA_BLOCK_EXPLORER_URL],
  };

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      const ethProvider = provider || new ethers.providers.Web3Provider(window.ethereum);
      setSigner(ethProvider.getSigner());
      setError(null);

      // Show welcome toast only once per session or per account change
      if (!hasToastedRef.current.welcome || accounts[0] !== account) {
        showToastOnce(toast.success, `Connected: ${accounts[0].slice(0, 6)}...`, {}, hasToastedRef);
        hasToastedRef.current.welcome = true;
      }
    } else {
      // Clear state on disconnect
      setAccount(null);
      setSigner(null);
      setError(null);

      // Reset toast flags on disconnect
      hasToastedRef.current.welcome = false;
      hasToastedRef.current.wrongNetwork = false;
      hasToastedRef.current.toasts = {};

      showToastOnce(toast.info, "Disconnected", { icon: "👋" }, hasToastedRef);
    }
  }

  function handleChainChanged(chainIdHex) {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);

    if (newChainId !== SOMNIA_CHAIN_ID) {
      setError("Wrong network");

      if (!hasToastedRef.current.wrongNetwork) {
        showToastOnce(toast.error, `Wrong network: switch to ${SOMNIA_CHAIN_NAME}`, {}, hasToastedRef);
        hasToastedRef.current.wrongNetwork = true;
      }
      // Reset welcome toast flag to allow re-toast after fix
      hasToastedRef.current.welcome = false;
    } else {
      setError(null);

      // Clear wrongNetwork toast flag on correct network
      hasToastedRef.current.wrongNetwork = false;
      showToastOnce(toast.success, `Switched to ${SOMNIA_CHAIN_NAME}`, {}, hasToastedRef);
    }
  }

  useEffect(() => {
    if (!window.ethereum) {
      const msg = "MetaMask not detected";
      showToastOnce(toast.error, msg, {}, hasToastedRef);
      setError(msg);
      return;
    }

    const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(ethProvider);

    ethProvider.getNetwork().then((network) => {
      setChainId(network.chainId);
      if (network.chainId !== SOMNIA_CHAIN_ID) {
        setError("Wrong network");
        if (!hasToastedRef.current.wrongNetwork) {
          showToastOnce(toast.error, `Please switch to ${SOMNIA_CHAIN_NAME}`, {}, hasToastedRef);
          hasToastedRef.current.wrongNetwork = true;
        }
      } else {
        hasToastedRef.current.wrongNetwork = false;
      }
    });

    ethProvider.listAccounts().then((accounts) => {
      if (accounts.length) {
        setAccount(accounts[0]);
        setSigner(ethProvider.getSigner());
        if (!hasToastedRef.current.welcome) {
          showToastOnce(toast.success, `Welcome back: ${accounts[0].slice(0, 6)}...`, {}, hasToastedRef);
          hasToastedRef.current.welcome = true;
        }
      }
    });

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("MetaMask not available");

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = ethProvider.getSigner();
      const network = await ethProvider.getNetwork();

      if (network.chainId !== SOMNIA_CHAIN_ID) {
        showToastOnce(toast.error, `Wrong network: please switch to ${SOMNIA_CHAIN_NAME}`, {}, hasToastedRef);
        await promptSwitchNetwork();
        return;
      }

      setProvider(ethProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);
      setError(null);

      showToastOnce(toast.success, `Connected: ${accounts[0].slice(0, 6)}...`, {}, hasToastedRef);
      hasToastedRef.current.welcome = true;
      hasToastedRef.current.wrongNetwork = false;
    } catch (err) {
      showToastOnce(toast.error, err.message || "Wallet connect failed", {}, hasToastedRef);
      setError(err.message);
    }
  }

  async function promptSwitchNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SOMNIA_CHAIN_ID_HEX }],
      });
      showToastOnce(toast.success, `Switched to ${SOMNIA_CHAIN_NAME}`, {}, hasToastedRef);
      setError(null);
      hasToastedRef.current.wrongNetwork = false;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SOMNIA_PARAMS],
          });
          showToastOnce(toast.success, `Somnia network added`, {}, hasToastedRef);
          hasToastedRef.current.wrongNetwork = false;
        } catch {
          showToastOnce(toast.error, "Failed to add Somnia network.", {}, hasToastedRef);
        }
      } else if (switchError.code === 4001) {
        showToastOnce(toast.info, "User rejected network switch", { icon: "❌" }, hasToastedRef);
      } else {
        showToastOnce(toast.error, "Network switch failed.", {}, hasToastedRef);
      }
    }
  }

  function disconnectWallet() {
    setAccount(null);
    setSigner(null);
    setError(null);

    // Reset toast flags on disconnect
    hasToastedRef.current.welcome = false;
    hasToastedRef.current.wrongNetwork = false;
    hasToastedRef.current.toasts = {};

    showToastOnce(toast.info, "Wallet disconnected", { icon: "👋" }, hasToastedRef);
  }

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer: chainId === SOMNIA_CHAIN_ID ? signer : null,
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