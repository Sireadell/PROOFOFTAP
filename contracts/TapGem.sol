// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TapGem is Ownable {
    // Events
    event Tapped(address indexed user, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);

    uint256 public constant MAX_TAPS_PER_DAY = 20;
    uint256 public constant SECONDS_IN_DAY = 86400;
    uint256 public constant MONTHLY_REWARD_CAP = 15 ether; // 15 native tokens with 18 decimals

    struct UserData {
        uint256 lastTapDay;
        uint256 tapsToday;
        uint256 currentStreak;
        uint256 lastTapTimestamp;
        uint256 points;
        uint256 rewardClaimedThisMonth;
        uint256 lastRewardMonth;
        uint256 totalRewardClaimed;
    }

    mapping(address => UserData) private users;

    // Receive native tokens to fund rewards
    receive() external payable {}

    /// @dev Get current day index (UTC)
    function _currentDay() internal view returns (uint256) {
        return block.timestamp / SECONDS_IN_DAY;
    }

    /// @dev Get current month index (approximate)
    function _currentMonth() internal view returns (uint256) {
        return block.timestamp / (SECONDS_IN_DAY * 30);
    }

    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Only EOA allowed");
        _;
    }

    function tap() external onlyEOA {
        UserData storage user = users[msg.sender];
        uint256 today = _currentDay();

        if (user.lastTapDay < today) {
            user.tapsToday = 0;

            if (user.lastTapDay == today - 1 || user.lastTapDay == today - 2) {
                // keep streak
            } else {
                user.currentStreak = 0;
            }

            user.lastTapDay = today;
        }

        require(user.tapsToday < MAX_TAPS_PER_DAY, "Max taps reached today");

        user.tapsToday += 1;
        user.lastTapTimestamp = block.timestamp;

        user.points += 1;
        if (user.tapsToday == MAX_TAPS_PER_DAY) {
            user.points += 10;
        }

        if (user.tapsToday == 1) {
            user.currentStreak += 1;
        }

        emit Tapped(msg.sender, block.timestamp);
    }

    function getUserStats(address userAddr) external view returns (
        uint256 tapsToday,
        uint256 currentStreak,
        uint256 points,
        uint256 totalRewardClaimed
    ) {
        UserData storage user = users[userAddr];
        uint256 today = _currentDay();
        tapsToday = user.lastTapDay == today ? user.tapsToday : 0;
        currentStreak = user.currentStreak;
        points = user.points;
        totalRewardClaimed = user.totalRewardClaimed;
    }

    function _calculateReward(uint256 streak) internal pure returns (uint256) {
        if (streak >= 50) {
            uint256 extra = (streak - 20) / 10;
            return 6 ether + (extra * 2 ether);
        } else if (streak >= 30) {
            return 8 ether; // 6 + 2
        } else if (streak >= 20) {
            return 6 ether;
        } else if (streak >= 10) {
            return 3 ether;
        } else if (streak >= 5) {
            return 1.5 ether;
        } else if (streak >= 1) {
            return 0.3 ether;
        }
        return 0;
    }

    function claimRewards() external onlyEOA {
        UserData storage user = users[msg.sender];
        uint256 currentMonth = _currentMonth();
        uint256 reward = _calculateReward(user.currentStreak);

        require(reward > 0, "No rewards available");
        require(user.lastRewardMonth < currentMonth, "Reward already claimed this month");
        require(user.rewardClaimedThisMonth + reward <= MONTHLY_REWARD_CAP, "Monthly reward cap exceeded");
        require(address(this).balance >= reward, "Insufficient contract balance");

        user.rewardClaimedThisMonth += reward;
        user.lastRewardMonth = currentMonth;
        user.totalRewardClaimed += reward;

        payable(msg.sender).transfer(reward);
        emit RewardClaimed(msg.sender, reward, block.timestamp);
    }

    // Owner can withdraw leftover funds
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }
}
