export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl p-6 text-white shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">📜 Proof of Tap – Rules & Rewards</h2>
      <ol className="list-decimal list-inside space-y-3 text-lg leading-relaxed">
        <li> You can tap the gem up to <strong>20 times per day</strong>.</li>
        <li> Each tap gives you <strong>points</strong> and a portion of your <strong>daily STT cap</strong>.</li>
        <li> Your <strong>daily STT cap</strong> grows with your streak the longer you tap daily, the more STT you earn.</li>
        <li> Taps beyond the cap still increase your <strong>streak and points</strong>, helping you earn better badges and rank.</li>
        <li> STT rewards accumulate daily and can be claimed anytime until you hit your <strong>15 STT/month cap</strong>.</li>
        <li> Miss a day and your <strong>streak resets to zero</strong>  consistency is key!</li>
        <li> Badges are earned automatically based on your <strong>total points</strong>.</li>
        <li> Leaderboard ranks users by <strong>points and streaks</strong>.</li>
        <li> You always keep your earned STT and points even if you miss a day.</li>
        <li> Build your reputation. Claim your rewards. <strong>Proof of Tap is on-chain proof of consistency.</strong></li>
      </ol>
    </div>
  );
}
