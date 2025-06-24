import UserSearch from '@/components/UserSearch';

export default function LeaderboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6 select-none">🏆 Leaderboard</h1>
      <UserSearch />
      {/* Your leaderboard list can follow here */}
    </div>
  );
}
