// ========== MOCK GAME SYSTEM ==========
let gameState = JSON.parse(localStorage.getItem('fishtocoin_game') || 'null');

if (!gameState) {
  gameState = {
    coin: 1000,
    fish: [],
    lastWithdraw: null
  };
}

function saveGame() {
  localStorage.setItem('fishtocoin_game', JSON.stringify(gameState));
}

// ========== FISHING ==========
function goFishing() {
  const rand = Math.random() * 100;
  let result = { type: 'nothing' };

  if (rand < 0.01) {
    result = { type: 'rare_egg' };
    gameState.coin += 7500;
  } else if (rand < 0.1) {
    result = { type: 'simple_egg' };
    gameState.coin += 3500;
  } else if (rand < 10.9) {
    const coral = Math.floor(Math.random() * 50) + 10;
    result = { type: 'coral', amount: coral };
    gameState.coin += coral;
  } else {
    const foods = ['seaweed', 'apple', 'bread'];
    result = { type: 'food', item: foods[Math.floor(Math.random() * 3)] };
  }

  saveGame();
  return result;
}

// ========== HATCH EGG ==========
const RARITY_SIMPLE = ['Common', 'Uncommon', 'Rare', 'SuperRare', 'Epic', 'Legendary'];
const SIMPLE_CHANCE = [56, 22, 9, 6, 4, 3];
const RARE_CHANCE = [18, 20, 28, 16, 10, 8];

function getRandomRarity(isRareEgg) {
  const chances = isRareEgg ? RARE_CHANCE : SIMPLE_CHANCE;
  const total = chances.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < chances.length; i++) {
    if (rand < chances[i]) return RARITY_SIMPLE[i];
    rand -= chances[i];
  }
  return 'Common';
}

function hatchEgg(isRareEgg) {
  const rarity = getRandomRarity(isRareEgg);
  const name = `Fish_${Date.now().toString(36)}`;
  const fish = {
    id: Date.now(),
    name,
    rarity,
    level: 1,
    exp: 0,
    lastFed: null,
    feedQueue: 0
  };
  gameState.fish.push(fish);
  saveGame();
  return fish;
}

// ========== FEED FISH ==========
const FOOD_EXP = { seaweed: 5, apple: 10, bread: 15 };
const RARITY_FOOD_NEED = {
  Common: 1, Uncommon: 2, Rare: 3, SuperRare: 4, Epic: 5, Legendary: 6
};
const BASE_GAIN = {
  Common: 15, Uncommon: 30, Rare: 45, SuperRare: 60, Epic: 75, Legendary: 90
};
const LEVEL_BONUS = [0, 0.05, 0.10, 0.15, 0.20, 0.25];

function feedFish(fishId, foodType = 'apple') {
  const fish = gameState.fish.find(f => f.id === fishId);
  if (!fish) return null;

  const now = Date.now();
  const foodNeed = RARITY_FOOD_NEED[fish.rarity] || 1;

  if (fish.feedQueue <= 0) {
    if (!fish.lastFed || now - fish.lastFed > 8 * 3600 * 1000) {
      fish.feedQueue = 2;
    } else {
      return { error: 'Wait 4 hours between feeds' };
    }
  }

  fish.feedQueue -= 1;
  fish.lastFed = now;

  const expGain = FOOD_EXP[foodType] || 10;
  fish.exp += expGain;

  const levelExp = [0, 200, 600, 1400, 2500, 6000];
  while (fish.level < 6 && fish.exp >= levelExp[fish.level]) {
    fish.exp -= levelExp[fish.level];
    fish.level += 1;
  }

  const base = BASE_GAIN[fish.rarity] || 15;
  const bonus = LEVEL_BONUS[Math.min(fish.level - 1, 5)];
  const earned = base * (1 + bonus);

  gameState.coin += earned;
  saveGame();

  return { earned, newLevel: fish.level };
}

function feedAllFish() {
  let totalEarned = 0;
  for (const fish of gameState.fish) {
    const result = feedFish(fish.id);
    if (result && !result.error) {
      totalEarned += result.earned;
    }
  }
  return totalEarned;
}

// ========== WITHDRAW (MOCK) ==========
function withdraw(amount) {
  const now = Date.now();
  const last = gameState.lastWithdraw || 0;
  const hours = (now - last) / (3600 * 1000);

  if (hours < 1) throw new Error("You can only withdraw once per hour");
  if (amount < 100) throw new Error("Minimum 100 COIN");
  if (gameState.coin < amount) throw new Error("Insufficient balance");

  const days = Math.min(Math.floor((now - last) / (86400 * 1000)), 14);
  const feePercent = Math.max(75 - days * 5, 5);
  const satReceived = amount * (1 - feePercent / 100);

  gameState.coin -= amount;
  gameState.lastWithdraw = now;
  saveGame();

  return { satReceived, feePercent, feeAmount: amount * feePercent / 100 };
}

// ========== EXPORT ==========
window.GameAPI = {
  goFishing,
  hatchEgg,
  feedFish,
  feedAllFish,
  withdraw,
  getBalance: () => ({ ...gameState })
};
