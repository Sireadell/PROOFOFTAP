import React, { useContext, useState } from 'react';
import { ethers } from 'ethers';
import TapGemABI from '@/contracts/TapGem.json';
import { WalletContext } from '@/contexts/WalletContext';


const TAPGEM_ADDRESS = import.meta.env.VITE_SOMNIA_TAPGEM_ADDRESS;

export default function SearchStats() {
  const { provider } = useContext(WalletContext);
  const [address, setAddress] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!ethers.utils.isAddress(address)) {
      setError('Invalid Ethereum address');
      return;
    }
    setLoading(true);
    setError('');
    setStats(null);
    try {
      const contract = new ethers.Contract(TAPGEM_ADDRESS, TapGemABI.abi, provider);
      const res = await contract.getUserStats(address);
      setStats({
        tapsToday: res.tapsToday.toNumber(),
        currentStreak: res.currentStreak.toNumber(),
        points: res.points.toNumber(),
        totalSTTClaimed: ethers.utils.formatEther(res.totalSTTClaimed),
      });
    } catch (e) {
      console.error(e);
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-xl text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Search User Stats</h2>
      <input
        type="text"
        placeholder="Enter wallet address"
        value={address}
        onChange={e => setAddress(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-gray-800 text-white mb-2"
      />
      <button
        onClick={fetchStats}
        disabled={loading}
        className="w-full py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <p className="mt-3 text-red-400">{error}</p>}
      {stats && (
        <div className="mt-4 space-y-2">
          <p>
            <strong>Taps Today:</strong> {stats.tapsToday}
          </p>
          <p>
            <strong>Current Streak:</strong> {stats.currentStreak}
          </p>
          <p>
            <strong>Points:</strong> {stats.points}
          </p>
          <p>
            <strong>STT Claimed:</strong> {stats.totalSTTClaimed}
          </p>
        </div>
      )}
    </div>
  );
}
