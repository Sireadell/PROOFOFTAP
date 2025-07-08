import { useToastDedup } from '@/utils/useToastDedup';
import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { ethers } from 'ethers';
import TapGemABI from '@/contracts/TapGem.json';
import { WalletContext } from '@/contexts/WalletContext';
import { toast } from 'react-toastify';

const TAPGEM_ADDRESS = import.meta.env.VITE_SOMNIA_TAPGEM_ADDRESS;
const SOMNIA_CHAIN_ID = Number(import.meta.env.VITE_SOMNIA_CHAIN_ID_DEC);

function extractErrorMessage(error) {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') return error;

  if (error.data && error.data.message) return error.data.message;
  if (error.error && error.error.message) return error.error.message;
  if (error.message) return error.message;

  if (error.error && typeof error.error === 'object') {
    try {
      return JSON.parse(JSON.stringify(error.error));
    } catch {
      return String(error.error);
    }
  }

  return 'Unknown error';
}

export function useTapGem() {
  const { account, provider, signer, chainId } = useContext(WalletContext);
  const showToastOnce = useToastDedup();

  const [contract, setContract] = useState(null);
  const [userStats, setUserStats] = useState({
    tapsToday: 0,
    currentStreak: 0,
    points: 0,
    unclaimedRewards: '0.0',
    totalRewardClaimed: '0.0',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const hasConnectedOnce = useRef(false);

  // Setup contract silently
  useEffect(() => {
    if (
      !provider ||
      !signer ||
      !account ||
      !ethers.utils.isAddress(account) ||
      chainId !== SOMNIA_CHAIN_ID
    ) {
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
      const [
        tapsToday,
        currentStreak,
        points,
        unclaimedRewardsRaw,
        totalRewardClaimedRaw,
      ] = await contract.getUserStats(account);

      setUserStats({
        tapsToday: tapsToday.toNumber(),
        currentStreak: currentStreak.toNumber(),
        points: points.toNumber(),
        unclaimedRewards: ethers.utils.formatEther(unclaimedRewardsRaw),
        totalRewardClaimed: ethers.utils.formatEther(totalRewardClaimedRaw),
        address: account,
      });
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      showToastOnce(toast.error, 'Failed to fetch user stats');
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && account && ethers.utils.isAddress(account)) {
      fetchUserStats();
    }
  }, [fetchUserStats, contract, account]);

  // Tap function with improved checks and messages
  const tap = useCallback(async () => {
    console.log('tap called with:', { account, signer, chainId });

    if (!account) {
      showToastOnce(toast.error, 'Wallet not connected.');
      return null;
    }

    if (chainId !== SOMNIA_CHAIN_ID) {
      showToastOnce(toast.error, `Wrong network. Please switch to ${import.meta.env.VITE_SOMNIA_CHAIN_NAME}.`);
      return null;
    }

    if (!signer) {
      showToastOnce(toast.error, 'Wallet signer unavailable.');
      return null;
    }

    if (!contract) {
      showToastOnce(toast.error, 'Contract unavailable.');
      return null;
    }

    setLoading(true);
    try {
      const tx = await contract.tap();
      const receipt = await tx.wait();

      let earnedSTT = null;
      for (const event of receipt.events || []) {
      if (
  event.event === 'Tapped' &&
  event.args &&
  event.args.user.toLowerCase() === account.toLowerCase()
) {
  earnedSTT = ethers.utils.formatEther(event.args.reward);
  break;
}

      }

      await fetchUserStats();

      if (earnedSTT !== null) {
        showToastOnce(toast.success, `Tap successful! You earned ${earnedSTT} STT`);
        return earnedSTT;
      } else {
        showToastOnce(toast.success, 'Tap successful!');
        return null;
      }
    } catch (error) {
      console.error('❌ Tap failed:', error);
      const message = extractErrorMessage(error);

      if (
        message.toLowerCase().includes('execution reverted') ||
        message.toLowerCase().includes('timeout') ||
        message.toLowerCase().includes('request failed') ||
        message.toLowerCase().includes('request timed out')
      ) {
        showToastOnce(toast.error, 'Network error or timeout, please try again later.');
      } else if (message.toLowerCase().includes('insufficient contract balance')) {
        showToastOnce(toast.error, 'Contract is out of STT. Please try again later.');
      } else if (error.code === 'ACTION_REJECTED') {
        showToastOnce(toast.info, 'Transaction rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        showToastOnce(toast.error, 'Insufficient funds for gas.');
      } else {
        showToastOnce(toast.error, message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, signer, account, chainId, fetchUserStats]);

  // Claim reward function with improved checks and messages
  const claimReward = useCallback(async () => {
    console.log('claimReward called with:', { account, signer, chainId });

    if (!account) {
      showToastOnce(toast.error, 'Wallet not connected.');
      return;
    }

    if (chainId !== SOMNIA_CHAIN_ID) {
      showToastOnce(toast.error, `Wrong network. Please switch to ${import.meta.env.VITE_SOMNIA_CHAIN_NAME}.`);
      return;
    }

    if (!signer) {
      showToastOnce(toast.error, 'Wallet signer unavailable.');
      return;
    }

    if (!contract) {
      showToastOnce(toast.error, 'Contract unavailable.');
      return;
    }

    setClaiming(true);
    try {
      const unclaimedBN = ethers.utils.parseEther(userStats.unclaimedRewards);
      if (unclaimedBN.isZero()) {
        showToastOnce(toast.info, 'No rewards to claim.');
        setClaiming(false);
        return;
      }

      const tx = await contract.claimRewards(unclaimedBN);
      await tx.wait();
      showToastOnce(toast.success, 'Reward claimed!');
      await fetchUserStats();
    } catch (error) {
      console.error('❌ Claim failed:', error);
      const message = extractErrorMessage(error);

      if (
        message.toLowerCase().includes('execution reverted') ||
        message.toLowerCase().includes('timeout') ||
        message.toLowerCase().includes('request failed') ||
        message.toLowerCase().includes('request timed out')
      ) {
        showToastOnce(toast.error, 'Network error or timeout, please try again later.');
      } else if (message.toLowerCase().includes('insufficient contract balance')) {
        showToastOnce(toast.error, 'Contract is out of STT. Please try again later.');
      } else if (error.code === 'ACTION_REJECTED') {
        showToastOnce(toast.info, 'Transaction rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        showToastOnce(toast.error, 'Insufficient funds for gas.');
      } else {
        showToastOnce(toast.error, message);
      }
    } finally {
      setClaiming(false);
    }
  }, [contract, signer, account, chainId, fetchUserStats, userStats.unclaimedRewards]);

  return {
    userStats,
    loading,
    claiming,
    tap,
    claimReward,
  };
}
