import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import TapGemABI from '@/contracts/TapGem.json';
import { WalletContext } from '@/contexts/WalletContext';

const TAPGEM_ADDRESS = import.meta.env.VITE_SOMNIA_TAPGEM_ADDRESS;

export default function UserSearch() {
  const { provider } = useContext(WalletContext);
  const [address, setAddress] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setStats(null);

    if (!ethers.utils.isAddress(address)) {
      setError('⚠️ Invalid Ethereum address.');
      return;
    }

    try {
      setLoading(true);
      const contract = new ethers.Contract(TAPGEM_ADDRESS, TapGemABI.abi, provider);
      const result = await contract.getUserStats(address);

      setStats({
        tapsToday: result[0].toNumber(),
        currentStreak: result[1].toNumber(),
        points: result[2].toNumber(),
        totalSTTClaimed: parseFloat(ethers.utils.formatEther(result[3])).toFixed(4)
      });
    } catch (e) {
      console.error(e);
      setError('❌ Failed to fetch stats on-chain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-xl max-w-md mx-auto text-white mt-8">
      <h2 className="text-2xl font-semibold mb-4">🔍 Search TapGem Stats</h2>
      
      <input
        type="text"
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
        placeholder="0x... wallet address"
        value={address}
        onChange={e => setAddress(e.target.value.trim())}
      />
      
      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Fetch Stats'}
      </button>

      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

      {stats && (
        <div className="mt-4 text-sm bg-gray-800 p-4 rounded-lg space-y-2">
          <p><strong>Taps Today:</strong> {stats.tapsToday}</p>
          <p><strong>Current Streak:</strong> {stats.currentStreak}</p>
          <p><strong>Points:</strong> {stats.points}</p>
          <p><strong>Total STT Claimed:</strong> {stats.totalSTTClaimed} STT</p>
        </div>
      )}
    </div>
  );
}
