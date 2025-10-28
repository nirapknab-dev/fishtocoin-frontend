function initializeGame() {
  setupTabs();
  updateBalance();
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('fish-btn').addEventListener('click', () => {
    const result = window.GameAPI.goFishing();
    let msg = '';
    if (result.type === 'rare_egg') {
      msg = '🎉 You found a <b>Rare Egg</b>! (7,500 COIN)<br><button onclick="hatchEgg(true)">Hatch Rare Egg</button>';
    } else if (result.type === 'simple_egg') {
      msg = '🥚 You found a <b>Simple Egg</b>! (3,500 COIN)<br><button onclick="hatchEgg(false)">Hatch Simple Egg</button>';
    } else if (result.type === 'coral') {
      msg = `🌿 You got ${result.amount} corals! (+${result.amount} COIN)`;
    } else if (result.type === 'food') {
      msg = `🍎 You got a ${result.item}!`;
    } else {
      msg = '💦 Nothing... Try again!';
    }
    document.getElementById('fishing-result').innerHTML = msg;
    updateBalance();
  });

  document.getElementById('feed-all').addEventListener('click', () => {
    const total = window.GameAPI.feedAllFish();
    alert(`Fed all fish! Earned ${total.toFixed(1)} COIN`);
    updateBalance();
    renderFish();
  });

  document.getElementById('withdraw-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    if (!amount || amount < 100) {
      alert("Enter at least 100 COIN");
      return;
    }
    try {
      const res = window.GameAPI.withdraw(amount);
      const info = `
        <b>Withdrawal Simulated!</b><br>
        Amount: ${amount} COIN<br>
        Fee: ${res.feePercent}%<br>
        You would receive: <b>${res.satReceived.toFixed(0)} SAT</b><br>
        <small>In real mode, SAT would be sent to your wallet.</small>
      `;
      document.getElementById('withdraw-info').innerHTML = info;
      document.getElementById('withdraw-info').classList.remove('hidden');
      updateBalance();
    } catch (err) {
      alert("Withdraw failed: " + err.message);
    }
  });
}

function hatchEgg(isRare) {
  window.GameAPI.hatchEgg(isRare);
  alert('Hatched a new fish!');
  updateBalance();
  renderFish();
  document.getElementById('fishing-result').innerHTML = '';
}

function updateBalance() {
  const data = window.GameAPI.getBalance();
  document.getElementById('coin-balance').textContent = Math.floor(data.coin);
  renderFish();
}

function renderFish() {
  const list = document.getElementById('fish-list');
  const noFish = document.getElementById('no-fish');
  const data = window.GameAPI.getBalance();
  if (data.fish.length === 0) {
    noFish.style.display = 'block';
    list.innerHTML = '';
  } else {
    noFish.style.display = 'none';
    list.innerHTML = data.fish.map(f => `
      <div class="fish-card">
        <strong>${f.name}</strong> • ${f.rarity} • Level ${f.level}
        <br><small>EXP: ${f.exp}/${[0,200,600,1400,2500,6000][Math.min(f.level,5)]}</small>
        <br><button onclick="feedSingle(${f.id})">Feed</button>
      </div>
    `).join('');
  }
}

function feedSingle(fishId) {
  const result = window.GameAPI.feedFish(fishId);
  if (result && result.error) {
    alert(result.error);
  } else {
    alert(`Fed! Earned ${result.earned.toFixed(1)} COIN`);
    updateBalance();
  }
}

window.hatchEgg = hatchEgg;
window.feedSingle = feedSingle;
window.initializeGame = initializeGame;
