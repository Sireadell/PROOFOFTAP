import { useState, useEffect, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import TapGemABI from '@/contracts/TapGem.json';
import { WalletContext } from '@/contexts/WalletContext';
import { toast } from 'react-toastify';

const TAPGEM_ADDRESS = import.meta.env.VITE_SOMNIA_TAPGEM_ADDRESS;
console.log("🚨 TAPGEM_ADDRESS:", `"${TAPGEM_ADDRESS}"`);

export function useTapGem() {
  const { account, provider } = useContext(WalletContext);

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

  // ✅ Setup contract instance when account & provider are valid
  useEffect(() => {
    if (!provider || !account || !ethers.utils.isAddress(account)) {
      setContract(null);
      console.warn('Invalid provider or account for contract setup:', { provider, account });
      return;
    }

    try {
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(TAPGEM_ADDRESS, TapGemABI.abi, signer);
      setContract(contractInstance);
      console.log('✅ Contract connected for account:', account);
    } catch (error) {
      console.error('❌ Failed to connect contract:', error);
      setContract(null);
    }
  }, [provider, account]);

  // ✅ Fetch stats when account and contract are ready
  const fetchUserStats = useCallback(async () => {
    if (!contract || !account || !ethers.utils.isAddress(account)) {
      console.warn('❌ Skipping stats fetch due to invalid setup:', { contract, account });
      return;
    }

    try {
      console.log('📊 Fetching stats for:', account);
      const [tapsToday, currentStreak, points, totalSTTClaimed] = await contract.getUserStats(account);

      setUserStats({
        tapsToday: tapsToday.toNumber(),
        currentStreak: currentStreak.toNumber(),
        points: points.toNumber(),
        totalSTTClaimed: ethers.utils.formatEther(totalSTTClaimed),
        address: account,
      });

      console.log('✅ Stats fetched:', { tapsToday, currentStreak, points });
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      toast.error('Error fetching your stats');
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && account && ethers.utils.isAddress(account)) {
      fetchUserStats();
    }
  }, [fetchUserStats, contract, account]);

  // ✅ Tap action
  const tap = useCallback(async () => {
    if (!contract || !account || !ethers.utils.isAddress(account)) {
      toast.error('Wallet not connected or contract unavailable');
      return;
    }

    setLoading(true);
    try {
      console.log('🟢 Sending tap tx...');
      const tx = await contract.tap();
      await tx.wait();
      toast.success('Tap successful!');
      await fetchUserStats();
    } catch (error) {
      console.error('❌ Tap failed:', error);
      toast.error(error?.data?.message || error.message || 'Tap failed');
    } finally {
      setLoading(false);
    }
  }, [contract, account, fetchUserStats]);

  // ✅ Claim action
  const claimReward = useCallback(async () => {
    if (!contract || !account || !ethers.utils.isAddress(account)) {
      toast.error('Wallet not connected or contract unavailable');
      return;
    }

    setClaiming(true);
    try {
      console.log('🟢 Sending claim tx...');
      const tx = await contract.claimRewards();
      await tx.wait();
      toast.success('Reward claimed!');
      await fetchUserStats();
    } catch (error) {
      console.error('❌ Claim failed:', error);
      toast.error(error?.data?.message || error.message || 'Claim failed');
    } finally {
      setClaiming(false);
    }
  }, [contract, account, fetchUserStats]);

  return {
    userStats,
    loading,
    claiming,
    tap,
    claimReward,
  };
}
