import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { ethers } from 'ethers';
import TapGemABI from '@/contracts/TapGem.json';
import { WalletContext } from '@/contexts/WalletContext';
import { toast } from 'react-toastify';

const TAPGEM_ADDRESS = import.meta.env.VITE_SOMNIA_TAPGEM_ADDRESS;
const SOMNIA_CHAIN_ID = Number(import.meta.env.VITE_SOMNIA_CHAIN_ID_DEC);

export function useTapGem() {
  const { account, provider, signer, chainId } = useContext(WalletContext);

  const [contract, setContract] = useState(null);
  const [userStats, setUserStats] = useState({
    tapsToday: 0,
    currentStreak: 0,
    points: 0,
    totalSTTClaimed: '0',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const hasConnectedOnce = useRef(false);

  // Setup contract silently
  useEffect(() => {
    if (!provider || !signer || !account || !ethers.utils.isAddress(account) || chainId !== SOMNIA_CHAIN_ID) {
      setContract(null);
      return;
    }

    try {
  const contractInstance = new ethers.Contract(TAPGEM_ADDRESS, TapGemABI.abi, signer);
  setContract(contractInstance);
  console.log('✅ Contract connected for account:', account);
} catch (error) {
  console.error('❌ Failed to connect contract:', error);
  setContract(null);
}

  }, [provider, signer, account, chainId]);

  // Fetch stats
  const fetchUserStats = useCallback(async () => {
    if (!contract || !account || !ethers.utils.isAddress(account)) return;

    try {
      const [tapsToday, currentStreak, points, totalSTTClaimed] = await contract.getUserStats(account);

      setUserStats({
        tapsToday: tapsToday.toNumber(),
        currentStreak: currentStreak.toNumber(),
        points: points.toNumber(),
        totalSTTClaimed: ethers.utils.formatEther(totalSTTClaimed),
        address: account,
      });
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && account && ethers.utils.isAddress(account)) {
      fetchUserStats();
    }
  }, [fetchUserStats, contract, account]);

  const tap = useCallback(async () => {
    if (!signer || !account) {
      toast.error('Wallet not connected.');
      return;
    }
    if (chainId !== SOMNIA_CHAIN_ID) {
      toast.error(`Wrong network. Please switch to ${import.meta.env.VITE_SOMNIA_CHAIN_NAME}.`);
      return;
    }
    if (!contract) {
      toast.error('Contract unavailable.');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.tap();
      await tx.wait();
      toast.success('Tap successful!');
      await fetchUserStats();
    } catch (error) {
      console.error('❌ Tap failed:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.info('Transaction rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient funds for gas.');
      } else {
        toast.error(error?.data?.message || error.message || 'Tap failed');
      }
    } finally {
      setLoading(false);
    }
  }, [contract, signer, account, chainId, fetchUserStats]);

  const claimReward = useCallback(async () => {
    if (!signer || !account) {
      toast.error('Wallet not connected.');
      return;
    }
    if (chainId !== SOMNIA_CHAIN_ID) {
      toast.error(`Wrong network. Please switch to ${import.meta.env.VITE_SOMNIA_CHAIN_NAME}.`);
      return;
    }
    if (!contract) {
      toast.error('Contract unavailable.');
      return;
    }

    setClaiming(true);
    try {
      const tx = await contract.claimRewards();
      await tx.wait();
      toast.success('Reward claimed!');
      await fetchUserStats();
    } catch (error) {
      console.error('❌ Claim failed:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.info('Transaction rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient funds for gas.');
      } else {
        toast.error(error?.data?.message || error.message || 'Claim failed');
      }
    } finally {
      setClaiming(false);
    }
  }, [contract, signer, account, chainId, fetchUserStats]);

  return {
    userStats,
    loading,
    claiming,
    tap,
    claimReward,
  };
}
