// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28 ;

contract JockeyLottery {
    uint8 constant NUM_HORSES = 10;
    uint256 constant OWNER_FEE_PERCENT = 15;
    uint256 constant PRIZE_POOL_PERCENT = 85;
    uint256 constant MIN_BET_AMOUNT = 1;

    string[10] private horseNames = [
        "Thunder", "Lightning", "Storm", "Blaze", "Shadow",
        "Spirit", "Mystic", "Phantom", "Eclipse", "Aurora"
    ];

    // Struct for each horse's data
    struct Horse {
        string name;       // Name of the horse
        uint256 winRate;  // In percentage * 100 for precision (e.g., 10.5% = 1050)
        uint256 totalBets; // Total amount bet on this horse
    }

    // Struct for a bettor's betting information
    struct Bettor {
        uint[10] bets;        // Array of all bets placed by the bettor
        uint totalbets;    // Total amount bet by the bettor
    }

    // State variables
    Horse[NUM_HORSES] public horses;              // Array of horses
    mapping(address => Bettor) public bettorInfo; // Mapping of bettors to their betting info
    address[] public bettors;                     // List of bettor addresses
    uint256 public totalBetAmount;                // Total amount bet in the race
    uint8 public winningHorse;                    // Index of the winning horse
    bool public raceActive;                       // Whether the race is active
    bool public resultReleased;                   // Whether the result has been released
    address public owner;                         // Owner of the contract

    // Events
    event RaceStarted();
    event BetPlaced(address indexed player, uint horseNumber, uint amount);
    event RaceResult(uint winningHorse, uint prizePool);
    event PrizeDistributed(address indexed player, uint amount);

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        raceActive = false;
        resultReleased = false;
    }

    function startRace() external onlyOwner {
    require(!raceActive, "Race already active");

    // Reset race variables
    totalBetAmount = 0;
    winningHorse = 0;
    raceActive = true;
    resultReleased = false;

    // Clear previous bettor data
    for (uint i = 0; i < bettors.length; i++) {
        delete bettorInfo[bettors[i]];
    }
    delete bettors;

    // Initialize horses with random win rates
    uint256 totalWinRate = 0;
    uint256[NUM_HORSES] memory tempWinRates;

    // Generate random win rates (1–1000)
    for (uint8 i = 0; i < NUM_HORSES; i++) {
        tempWinRates[i] = 1 + (uint256(keccak256(abi.encodePacked(block.timestamp, i))) % 1000);
        totalWinRate += tempWinRates[i];
    }

    // Scale win rates to sum to 10000 and assign names
    for (uint8 i = 0; i < NUM_HORSES; i++) {
        horses[i].name = horseNames[i];
        horses[i].winRate = (tempWinRates[i] * 10000) / totalWinRate;
        horses[i].totalBets = 0;
    }

    // Correct rounding errors to ensure sum is exactly 10000
    uint256 sumAfterScaling = 0;
    for (uint8 i = 0; i < NUM_HORSES; i++) {
        sumAfterScaling += horses[i].winRate;
    }
    if (sumAfterScaling != 10000) {
        int256 difference = int256(10000) - int256(sumAfterScaling);
        horses[0].winRate = uint256(int256(horses[0].winRate) + difference);
    }

    emit RaceStarted();
}

    // Place a bet on a horse
    function placeBet(uint horseNumber) external payable {
        require(raceActive && !resultReleased, "Race not active or result released");
        require(horseNumber < NUM_HORSES, "Invalid horse number");
        require(msg.value >= 0, "Bet below minimum amount");

        Bettor storage bettor = bettorInfo[msg.sender];

        // Add bettor to bettors list if this is their first bet
        if (bettor.totalbets == 0) {
            bettors.push(msg.sender);
        }

        // Update the bet directly using the horseNumber as index
        bettor.bets[horseNumber] += msg.value;
        bettor.totalbets += msg.value;

        // Update global and horse-specific totals
        horses[horseNumber].totalBets += msg.value;
        totalBetAmount += msg.value;

        emit BetPlaced(msg.sender, horseNumber, msg.value);
    }
    // Withdraw all bets before the race starts
    function withdrawBet() external {
        require(!resultReleased, "Cannot withdraw after race has finished");
        Bettor storage bettor = bettorInfo[msg.sender];
        require(bettor.totalbets > 0, "No bets to withdraw");

        uint256 amountToWithdraw = bettor.totalbets;

        // Update horses' totalBets and totalBetAmount
        for (uint i = 0; i < bettor.bets.length; i++) {
            uint betAmount = bettor.bets[i];
            if (betAmount>0){
                horses[i].totalBets -= betAmount;
            }
            
        }
        totalBetAmount -= amountToWithdraw;

        // Remove bettor from bettors array
        for (uint i = 0; i < bettors.length; i++) {
            if (bettors[i] == msg.sender) {
                bettors[i] = bettors[bettors.length - 1];
                bettors.pop();
                break;
            }
        }

        // Transfer the amount back to the bettor
        payable(msg.sender).transfer(amountToWithdraw);

        // Delete bettor's information
        delete bettorInfo[msg.sender];
    }


    // Update odds for all horses based on current bets

    // Release the race result and distribute prizes
    function releaseResult() external onlyOwner { 
        require(raceActive && !resultReleased, "Race not active or result already released");
        // Step 1: Generate a ranked array of horses based on win rates with randomization
        uint8[] memory rank = new uint8[](NUM_HORSES);
        bool[] memory selected = new bool[](NUM_HORSES); // Track which horses are already ranked
        uint256 totalWinRate = 0;

        // Calculate total win rate and initialize arrays
        for (uint8 i = 0; i < NUM_HORSES; i++) {
            totalWinRate += horses[i].winRate;
            rank[i] = 255; // Default value indicating unassigned
            selected[i] = false;
        }

        // Randomly rank horses based on win rates
        for (uint8 i = 0; i < NUM_HORSES; i++) {
            uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % totalWinRate;
            uint256 cumulativeWinRate = 0;

            for (uint8 j = 0; j < NUM_HORSES; j++) {
                if (!selected[j]) {
                    cumulativeWinRate += horses[j].winRate;
                    if (random < cumulativeWinRate) {
                        rank[i] = j;
                        selected[j] = true;
                        totalWinRate -= horses[j].winRate;
                        break;
                    }
                }
            }
        }

        // Step 2: Determine the winning horse (first in the rank array)
        winningHorse = rank[0];

        // Step 3: Set race status
        resultReleased = true;
        raceActive = false;

        // Step 4: Calculate prize pool and owner fee
        
        uint256 ownerFee = (totalBetAmount * OWNER_FEE_PERCENT) / 100;
        uint256 prizePool = totalBetAmount - ownerFee;
        uint odds = 0;
        if (horses[winningHorse].totalBets > 0){
            odds = prizePool/ horses[winningHorse].totalBets;
        }
        else {
            ownerFee = totalBetAmount; // If the bettor didn't bet on the winning horse, give the contract owner all
        }
        
        payable(owner).transfer(ownerFee);

        // Step 5: Distribute prizes to bettors who bet on the winning horse
        if (horses[winningHorse].totalBets > 0) {
        for (uint i = 0; i < bettors.length; i++) {
            address bettorAddr = bettors[i];
            Bettor storage bettor = bettorInfo[bettorAddr];
            if (bettor.bets[winningHorse] > 0) {
                uint betAmount = bettor.bets[winningHorse];
                uint prize = (betAmount * prizePool) / horses[winningHorse].totalBets;
                payable(bettorAddr).transfer(prize);
                emit PrizeDistributed(bettorAddr, prize);
                bettorInfo[bettorAddr].totalbets = 0 ; // Update the corresponding amount to 0
            }}
        }
        emit RaceResult(winningHorse, prizePool);

        }


    // View function to get the list of bettors (for front-end use)
    function getBettors() external view returns (address[] memory) {
        return bettors;
    }

    // Helper function to get horse data (optional, for frontend)
    function getHorse(uint8 horseNumber) external view returns (string memory name, uint256 winRate, uint256 totalBets) {
        Horse memory horse = horses[horseNumber];
        return (horse.name, horse.winRate, horse.totalBets);
    }
    // New function to get bettor's bets array
    function getBettorBets(address bettorAddr) external view returns (uint[10] memory) {
        return bettorInfo[bettorAddr].bets;
    }
}