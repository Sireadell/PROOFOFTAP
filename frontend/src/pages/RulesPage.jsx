// src/pages/RulesPage.jsx
export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-6 text-white shadow-md">
      <h2 className="text-3xl font-bold mb-4">Proof of Tap - Game Rules</h2>
      <ol className="list-decimal list-inside space-y-2 text-lg leading-relaxed">
        <li>Each user can tap the gem up to 20 times per day.</li>
        <li>Points are earned per tap and accumulate to build your reputation.</li>
        <li>Reach daily tap limits to unlock rewards.</li>
        <li>Maintain a streak by tapping every day; missing resets the streak.</li>
        <li>Claim rewards after reaching daily tap limits.</li>
        <li>Leaderboard ranks players based on total points and streaks.</li>
        <li>Badges are earned automatically as you accumulate points.</li>
        <li>Have fun building your on-chain reputation!</li>
      </ol>
    </div>
  );
}
