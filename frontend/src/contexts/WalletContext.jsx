import React, { createContext, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

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

  // Track if welcome or wrongNetwork toast was shown this session
  const hasToastedRef = useRef({
    welcome: false,
    wrongNetwork: false,
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
        showToastOnce(toast.success, `Connected: ${accounts[0].slice(0, 6)}...`);
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

      showToastOnce(toast.info, "Disconnected", { icon: "👋" });
    }
  }

  function handleChainChanged(chainIdHex) {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);

    if (newChainId !== SOMNIA_CHAIN_ID) {
      setError("Wrong network");

      if (!hasToastedRef.current.wrongNetwork) {
        showToastOnce(toast.error, `Wrong network: switch to ${SOMNIA_CHAIN_NAME}`);
        hasToastedRef.current.wrongNetwork = true;
      }
      // Also reset welcome toast flag here to allow re-toast after fix
      hasToastedRef.current.welcome = false;
    } else {
      setError(null);

      // Clear wrongNetwork toast flag on correct network
      hasToastedRef.current.wrongNetwork = false;
      showToastOnce(toast.success, `Switched to ${SOMNIA_CHAIN_NAME}`);
    }
  }

  useEffect(() => {
    if (!window.ethereum) {
      const msg = "MetaMask not detected";
      showToastOnce(toast.error, msg);
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
          showToastOnce(toast.error, `Please switch to ${SOMNIA_CHAIN_NAME}`);
          hasToastedRef.current.wrongNetwork = true;
        }
      } else {
        // On correct network, clear wrongNetwork toast flag
        hasToastedRef.current.wrongNetwork = false;
      }
    });

    ethProvider.listAccounts().then((accounts) => {
      if (accounts.length) {
        setAccount(accounts[0]);
        setSigner(ethProvider.getSigner());
        if (!hasToastedRef.current.welcome) {
          showToastOnce(toast.success, `Welcome back: ${accounts[0].slice(0, 6)}...`);
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
        showToastOnce(toast.error, `Wrong network: please switch to ${SOMNIA_CHAIN_NAME}`);
        await promptSwitchNetwork();
        return;
      }

      setProvider(ethProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);
      setError(null);

      showToastOnce(toast.success, `Connected: ${accounts[0].slice(0, 6)}...`);
      hasToastedRef.current.welcome = true;
      hasToastedRef.current.wrongNetwork = false;
    } catch (err) {
      showToastOnce(toast.error, err.message || "Wallet connect failed");
      setError(err.message);
    }
  }

  async function promptSwitchNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SOMNIA_CHAIN_ID_HEX }],
      });
      showToastOnce(toast.success, `Switched to ${SOMNIA_CHAIN_NAME}`);
      setError(null);
      hasToastedRef.current.wrongNetwork = false;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SOMNIA_PARAMS],
          });
          showToastOnce(toast.success, `Somnia network added`);
          hasToastedRef.current.wrongNetwork = false;
        } catch {
          showToastOnce(toast.error, "Failed to add Somnia network.");
        }
      } else if (switchError.code === 4001) {
        showToastOnce(toast.info, "User rejected network switch", { icon: "❌" });
      } else {
        showToastOnce(toast.error, "Network switch failed.");
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

    showToastOnce(toast.info, "Wallet disconnected", { icon: "👋" });
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
