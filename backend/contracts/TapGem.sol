// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TapGem is Ownable {
    event Tapped(address indexed user, uint256 timestamp, uint256 reward);
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event AdminConfigUpdated(string config, uint256 newValue, uint256 timestamp);

    uint256 public SECONDS_IN_DAY = 86400;
    uint256 public MONTHLY_REWARD_CAP = 15 ether;

    uint256 public maxTapsPerDay = 20;

    struct UserData {
        uint256 lastTapDay;
        uint256 tapsToday;
        uint256 currentStreak;
        uint256 lastTapTimestamp;
        uint256 points;
        uint256 unclaimedRewards;
        uint256 rewardClaimedThisMonth;
        uint256 lastRewardMonth;
        uint256 totalRewardClaimed;
        uint256 rewardEarnedToday;
    }

    mapping(address => UserData) private users;
    mapping(uint256 => uint256) public dailyCapPerStreakTier; // streak => daily max STT

    receive() external payable {}

    constructor() {
        dailyCapPerStreakTier[0] = 0.2 ether;
        dailyCapPerStreakTier[1] = 0.5 ether;
        dailyCapPerStreakTier[5] = 0.6 ether;
        dailyCapPerStreakTier[10] = 0.75 ether;
        dailyCapPerStreakTier[20] = 0.9 ether;
        dailyCapPerStreakTier[30] = 1.0 ether;
        dailyCapPerStreakTier[50] = 1.5 ether;
        dailyCapPerStreakTier[70] = 1.5 ether;
    }

    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Only EOA allowed");
        _;
    }

    modifier onlyOwnerEOA() {
        require(msg.sender == owner() && tx.origin == msg.sender, "Only owner EOA");
        _;
    }

    function _currentDay() internal view returns (uint256) {
        return block.timestamp / SECONDS_IN_DAY;
    }

    function _currentMonth() internal view returns (uint256) {
        return block.timestamp / (SECONDS_IN_DAY * 30);
    }

    function _dailyCapForStreak(uint256 streak) public view returns (uint256) {
        uint256 applicable = 0;
        for (uint256 tier = 0; tier <= streak; tier++) {
            if (dailyCapPerStreakTier[tier] > 0) {
                applicable = dailyCapPerStreakTier[tier];
            }
        }
        return applicable;
    }

    function tap() external onlyEOA {
        UserData storage user = users[msg.sender];
        uint256 today = _currentDay();

        if (user.lastTapDay < today) {
            if (user.lastTapDay < today - 1) {
                user.currentStreak = 0;
            }
            user.tapsToday = 0;
            user.rewardEarnedToday = 0;
            user.lastTapDay = today;
        }

        require(user.tapsToday < maxTapsPerDay, "Max taps reached today");

        user.tapsToday += 1;
        user.lastTapTimestamp = block.timestamp;
        user.points += 1;

        if (user.tapsToday == 1) {
            user.currentStreak += 1;
        }

        uint256 dailyCap = _dailyCapForStreak(user.currentStreak);
        uint256 remainingToday = dailyCap > user.rewardEarnedToday
            ? dailyCap - user.rewardEarnedToday
            : 0;

        require(remainingToday > 0, "Daily STT cap reached");

        // Split reward evenly among taps
        uint256 rewardPerTap = dailyCap / maxTapsPerDay;
        uint256 reward = rewardPerTap <= remainingToday ? rewardPerTap : remainingToday;

        user.rewardEarnedToday += reward;
        user.unclaimedRewards += reward;

        emit Tapped(msg.sender, block.timestamp, reward);
    }

    function getUserStats(address userAddr) external view returns (
        uint256 tapsToday,
        uint256 currentStreak,
        uint256 points,
        uint256 unclaimedRewards,
        uint256 totalRewardClaimed
    ) {
        UserData storage user = users[userAddr];
        uint256 today = _currentDay();

        tapsToday = user.lastTapDay == today ? user.tapsToday : 0;
        currentStreak = user.currentStreak;
        points = user.points;
        unclaimedRewards = user.unclaimedRewards;
        totalRewardClaimed = user.totalRewardClaimed;
    }

    function claimRewards(uint256 amount) external onlyEOA {
        require(amount > 0, "Claim amount must be > 0");

        UserData storage user = users[msg.sender];
        uint256 currentMonth = _currentMonth();

        if (user.lastRewardMonth < currentMonth) {
            user.rewardClaimedThisMonth = 0;
            user.lastRewardMonth = currentMonth;
        }

        require(user.unclaimedRewards >= amount, "Not enough unclaimed rewards");
        require(user.rewardClaimedThisMonth + amount <= MONTHLY_REWARD_CAP, "Monthly cap exceeded");
        require(address(this).balance >= amount, "Insufficient contract balance");

        user.unclaimedRewards -= amount;
        user.rewardClaimedThisMonth += amount;
        user.totalRewardClaimed += amount;

        payable(msg.sender).transfer(amount);

        emit RewardClaimed(msg.sender, amount, block.timestamp);
    }

    // === Admin Functions ===

    function setMaxTapsPerDay(uint256 newLimit) external onlyOwnerEOA {
        require(newLimit > 0 && newLimit <= 100, "Invalid tap limit");
        maxTapsPerDay = newLimit;
        emit AdminConfigUpdated("maxTapsPerDay", newLimit, block.timestamp);
    }

    function setDailyCapPerStreak(uint256 streak, uint256 dailyCapWei) external onlyOwnerEOA {
        require(streak >= 0, "Invalid streak tier");
        dailyCapPerStreakTier[streak] = dailyCapWei;
        emit AdminConfigUpdated("dailyCapPerStreakTier", dailyCapWei, block.timestamp);
    }

    function setMonthlyRewardCap(uint256 capInWei) external onlyOwnerEOA {
        MONTHLY_REWARD_CAP = capInWei;
        emit AdminConfigUpdated("monthlyRewardCap", capInWei, block.timestamp);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }
}
