(async () => {
   let web3;
   let contract;
   let userAddress;

   const contractAddress = "0x8e115C2c7eddde8A43Df5Be654daeE18dd4f3f4f";
   const contractABI = [
      {
         "inputs": [],
         "stateMutability": "nonpayable",
         "type": "constructor"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": true,
               "internalType": "address",
               "name": "player",
               "type": "address"
            },
            {
               "indexed": false,
               "internalType": "uint256",
               "name": "horseNumber",
               "type": "uint256"
            },
            {
               "indexed": false,
               "internalType": "uint256",
               "name": "amount",
               "type": "uint256"
            }
         ],
         "name": "BetPlaced",
         "type": "event"
      },
      {
         "inputs": [
            {
               "internalType": "uint256",
               "name": "horseNumber",
               "type": "uint256"
            }
         ],
         "name": "placeBet",
         "outputs": [],
         "stateMutability": "payable",
         "type": "function"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": true,
               "internalType": "address",
               "name": "player",
               "type": "address"
            },
            {
               "indexed": false,
               "internalType": "uint256",
               "name": "amount",
               "type": "uint256"
            }
         ],
         "name": "PrizeDistributed",
         "type": "event"
      },
      {
         "anonymous": false,
         "inputs": [
            {
               "indexed": false,
               "internalType": "uint256",
               "name": "winningHorse",
               "type": "uint256"
            },
            {
               "indexed": false,
               "internalType": "uint256",
               "name": "prizePool",
               "type": "uint256"
            }
         ],
         "name": "RaceResult",
         "type": "event"
      },
      {
         "anonymous": false,
         "inputs": [],
         "name": "RaceStarted",
         "type": "event"
      },
      {
         "inputs": [],
         "name": "releaseResult",
         "outputs": [],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "startRace",
         "outputs": [],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "withdrawBet",
         "outputs": [],
         "stateMutability": "nonpayable",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "",
               "type": "address"
            }
         ],
         "name": "bettorInfo",
         "outputs": [
            {
               "internalType": "uint256",
               "name": "totalbets",
               "type": "uint256"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint256",
               "name": "",
               "type": "uint256"
            }
         ],
         "name": "bettors",
         "outputs": [
            {
               "internalType": "address",
               "name": "",
               "type": "address"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "address",
               "name": "bettorAddr",
               "type": "address"
            }
         ],
         "name": "getBettorBets",
         "outputs": [
            {
               "internalType": "uint256[10]",
               "name": "",
               "type": "uint256[10]"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "getBettors",
         "outputs": [
            {
               "internalType": "address[]",
               "name": "",
               "type": "address[]"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint8",
               "name": "horseNumber",
               "type": "uint8"
            }
         ],
         "name": "getHorse",
         "outputs": [
            {
               "internalType": "string",
               "name": "name",
               "type": "string"
            },
            {
               "internalType": "uint256",
               "name": "winRate",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "totalBets",
               "type": "uint256"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [
            {
               "internalType": "uint256",
               "name": "",
               "type": "uint256"
            }
         ],
         "name": "horses",
         "outputs": [
            {
               "internalType": "string",
               "name": "name",
               "type": "string"
            },
            {
               "internalType": "uint256",
               "name": "winRate",
               "type": "uint256"
            },
            {
               "internalType": "uint256",
               "name": "totalBets",
               "type": "uint256"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "owner",
         "outputs": [
            {
               "internalType": "address",
               "name": "",
               "type": "address"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "raceActive",
         "outputs": [
            {
               "internalType": "bool",
               "name": "",
               "type": "bool"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "resultReleased",
         "outputs": [
            {
               "internalType": "bool",
               "name": "",
               "type": "bool"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "totalBetAmount",
         "outputs": [
            {
               "internalType": "uint256",
               "name": "",
               "type": "uint256"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      },
      {
         "inputs": [],
         "name": "winningHorse",
         "outputs": [
            {
               "internalType": "uint8",
               "name": "",
               "type": "uint8"
            }
         ],
         "stateMutability": "view",
         "type": "function"
      }
   ];

   // Function to show the wallet pop-up
   function showWalletPopup() {
       document.getElementById('walletPopup').classList.remove('hidden');
   }

   // Function to hide the wallet pop-up
   function hideWalletPopup() {
       document.getElementById('walletPopup').classList.add('hidden');
   }

   // Connect to the user's wallet
   async function connectWallet() {
       if (window.ethereum) {
         document.getElementById('walletAddress').textContent = `Not Connected`;
           web3 = new Web3(window.ethereum);
           await window.ethereum.request({ method: 'eth_requestAccounts' });
           userAddress = (await web3.eth.getAccounts())[0];
           document.getElementById('walletAddress').textContent = `Connected: ${userAddress}`;
           contract = new web3.eth.Contract(contractABI, contractAddress);
           await checkOwner();
           await updateRaceStatus();
           await displayHorses();
           await populateHorseSelect();
           await displayBettingInfo();
           setupEventListeners();
           hideWalletPopup(); 
       } else {
         document.getElementById('walletAddress').textContent = `Not Connected`;
           alert('Please install MetaMask');
       }
   }

   // Initial check for wallet connection
   async function initialCheck() {
       if (window.ethereum) {
           const accounts = await window.ethereum.request({ method: 'eth_accounts' });
           if (accounts.length > 0) {
               userAddress = accounts[0];
               document.getElementById('walletAddress').textContent = `Connected: ${userAddress}`;
               contract = new web3.eth.Contract(contractABI, contractAddress);
               await checkOwner();
               await updateRaceStatus();
               await displayHorses();
               await displayBettingInfo();
               await populateHorseSelect();
               setupEventListeners();
               hideWalletPopup();
           } else {
               document.getElementById('walletAddress').textContent = `Not Connected`;
               showWalletPopup();
           }
       } else {
           alert('Please install MetaMask');
       }
   }

   // Check if the connected user is the owner
   async function checkOwner() {
       const owner = await contract.methods.owner().call();
       if (userAddress.toLowerCase() === owner.toLowerCase()) {
           document.getElementById('ownerControls').classList.remove('hidden');
       } else {
           document.getElementById('ownerControls').classList.add('hidden');
       }
   }

   // Function to display horses with real-time odds
   async function displayHorses() {
      document.getElementById('racinginfo').classList.remove('hidden');
       const horsesSection = document.getElementById('horsesSection');
       horsesSection.innerHTML = '';
       const totalBetAmount = await contract.methods.totalBetAmount().call();
       const prizePool = (BigInt(totalBetAmount) * BigInt(85)) / BigInt(100);
       for (let i = 0; i < 10; i++) {
           const horse = await contract.methods.getHorse(i).call();
           let odds;
           if (horse.totalBets == 0) {
               odds = 'N/A';
           } else {
               odds = (Number(prizePool) / Number(horse.totalBets)).toFixed(4);
           }
           const card = document.createElement('div');
           card.className = 'bg-white p-4 rounded shadow';
           card.innerHTML = `
               <div class="flex flex-row justify-between mb-2">
               <h3 class="text-lg font-semibold flex items-baseline">${horse.name}</h3>
               <img src="src/${i}.png" class="w-10 h-10 flex">
               </div>
               <p>Win Rate: ${(horse.winRate / 100).toFixed(2)}%</p>
               <p>Odds: ${odds}</p>
               <p>Total Bets: ${horse.totalBets} Wei</p>
           `;
           horsesSection.appendChild(card);
       }
   }

   // Populate the horse selection dropdown
   async function populateHorseSelect() {
       const horseSelect = document.getElementById('horseSelect');
       horseSelect.innerHTML = '<option value="">Select a Horse</option>';
       for (let i = 0; i < 10; i++) {
           const horse = await contract.methods.getHorse(i).call();
           const option = document.createElement('option');
           option.value = i;
           option.textContent = horse.name;
           horseSelect.appendChild(option);
       }
   }

   // Place a bet
   async function placeBet() {
       if (!userAddress) {
           alert('Please connect your wallet first');
           return;
       }
       const horseNumber = document.getElementById('horseSelect').value;
       const amount = document.getElementById('betAmount').value;
       if (!horseNumber || !amount || amount <= 0) {
           alert('Please select a horse and enter a valid bet amount');
           return;
       }
       try {
           await contract.methods.placeBet(horseNumber).send({
               from: userAddress,
               value: amount
           });
           alert('Bet placed successfully');
           await displayBettingInfo();
       } catch (error) {
           console.error(error);
           alert('Failed to place bet');
       }
   }

   // Withdraw bet
   async function withdrawBet() {
       if (!userAddress) {
           alert('Please connect your wallet first');
           return;
       }
       try {
           await contract.methods.withdrawBet().send({
               from: userAddress
           });
           alert('Bet withdrawn successfully');
           await updateRaceStatus();
           await displayBettingInfo();
       } catch (error) {
           console.error(error);
           alert('Failed to withdraw bet');
       }
   }

   // Start the race (owner only)
   async function startRace() {
       if (!userAddress) {
           alert('Please connect your wallet first');
           return;
       }
       try {
           await contract.methods.startRace().send({ from: userAddress });
           alert('Race started');
           await updateRaceStatus();
           await displayHorses();
           await populateHorseSelect();
           await displayBettingInfo();
       } catch (error) {
           console.error(error);
           alert('Failed to start race');
       }
   }

   // Release the race result (owner only)
   async function releaseResult() {
       if (!userAddress) {
           alert('Please connect your wallet first');
           return;
       }
       try {
           await contract.methods.releaseResult().send({ from: userAddress });
           alert('Result released');
           await updateRaceStatus();
           await displayHorses();
           await displayBettingInfo();
       } catch (error) {
           console.error(error);
           alert('Failed to release result');
       }
   }

   // Update the race status display
   async function updateRaceStatus() {
       const raceActive = await contract.methods.raceActive().call();
       const resultReleased = await contract.methods.resultReleased().call();
       const statusText = document.getElementById('statusText');
       if (resultReleased) {
           const winningHorseIndex = await contract.methods.winningHorse().call();
           const winningHorseName = (await contract.methods.getHorse(winningHorseIndex).call()).name;
           statusText.textContent = `Race finished. Winning horse: ${winningHorseName}`;
           statusText.innerHTML = `<div class="flex flex-col justify-center mb-2">

           <h3 class="text-lg font-semibold flex items-baseline">${statusText.textContent}</h3>
           <img src="src/${winningHorseIndex}.png" class="w-20 h-20 flex mx-auto">
           </div>`;
           document.getElementById('bettingSection').classList.add('hidden');
       } else if (raceActive) {
           statusText.textContent = 'Race is active. You can place bets.';
           document.getElementById('bettingSection').classList.remove('hidden');
       } else {
           statusText.textContent = 'Race is not active.';
           document.getElementById('bettingSection').classList.add('hidden');
       }
   }
   // Function to display bettor's betting record and total betting amount
   async function displayBettingInfo() {
      const bettingInfoSection = document.getElementById('bettingInfoSection');
      const bettingRecord = document.getElementById('bettingRecord');
      const totalBetAmountEl = document.getElementById('totalBetAmount');
      
      if (!userAddress) {
          bettingInfoSection.classList.add('hidden');
          return;
      }
  
      bettingInfoSection.classList.remove('hidden');
      const bets = await contract.methods.getBettorBets(userAddress).call();
      const totalBetAmount = await contract.methods.totalBetAmount().call();
      
      let hasBets = false;
      let recordHTML = '<ul>';
      for (let i = 0; i < 10; i++) {
          const betAmount = bets[i];
          if (betAmount > 0) {
              hasBets = true;
              const horse = await contract.methods.getHorse(i).call();
              odds = (Number(totalBetAmount*0.85) / Number(horse.totalBets)).toFixed(2);
              recordHTML += `<li class="my-2 font-bold py-2 rounded mx-auto px-10 shawdow-lg justify-between flex flex-row w-full "> 
              <div class="flex justify-start">${i+1}. &nbsp; ${horse.name}: ${betAmount} Wei</div>
              <div class="flex justify-between flex-row w-4/12">
              <div class="flex w-1/4">${horse.winRate/100} </div>
              <div class="font-light">|</div> 
              <div class="flex w-1/4">${odds}</div> 
              <div class="font-light">| </div>
              <div class="flex w-1/4">${horse.totalBets}</div>
              </div>
              </li> 
              <hr class="border-gray-400 mx-5">`
              ;
          }
      }
      recordHTML += '</ul>';
  
      bettingRecord.innerHTML = hasBets ? recordHTML : '<p class="bg-gray-100 py-1">No bets placed.</p>';
      totalBetAmountEl.textContent = `Total Betting Amount in Race: ${totalBetAmount} Wei`;
  }


   // Set up event listeners for real-time updates
   function setupEventListeners() {
       contract.events.BetPlaced()
           .on('data', async (event) => {
               console.log('BetPlaced event detected:', event);
               await displayHorses();
           })
           .on('error', (error) => {
               console.error('Error in BetPlaced event listener:', error);
           });
   }

   // Event listeners for buttons
   document.getElementById('connectWallet').addEventListener('click', connectWallet);
   document.getElementById('placeBet').addEventListener('click', placeBet);
   document.getElementById('withdrawBet').addEventListener('click', withdrawBet);
   document.getElementById('startRace').addEventListener('click', startRace);
   document.getElementById('releaseResult').addEventListener('click', releaseResult);

   // Handle account changes in MetaMask
   window.ethereum.on('accountsChanged', async (accounts) => {
       if (accounts.length > 0) {
           userAddress = accounts[0];
           document.getElementById('walletAddress').textContent = `Connected: ${userAddress}`;
           await checkOwner();
           await updateRaceStatus();
           await displayHorses();
           hideWalletPopup();
       } else {
           userAddress = null;
           document.getElementById('walletAddress').textContent = '';
           showWalletPopup();
       }
   });

   // Initial check on page load
   await initialCheck();
})();