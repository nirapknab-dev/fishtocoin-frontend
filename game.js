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

  document.getElementById('fish-btn').addEventListener('click', async () => {
    try {
      const result = await window.GameAPI.goFishing();
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
    } catch (err) {
      alert('Fishing failed: ' + err.message);
    }
  });

  document.getElementById('feed-all').addEventListener('click', async () => {
    try {
      const res = await window.GameAPI.feedAllFish();
      alert(`Fed all fish! Earned ${res.total_earned.toFixed(1)} COIN`);
      updateBalance();
      renderFish();
    } catch (err) {
      alert('Feed failed: ' + err.message);
    }
  });

  document.getElementById('withdraw-btn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    if (!amount || amount < 100) {
      alert("Enter at least 100 COIN");
      return;
    }
    try {
      const res = await window.GameAPI.withdraw(amount);
      const info = `
        <b>Withdrawal Requested!</b><br>
        Amount: ${amount} COIN<br>
        Fee: ${res.fee_percent}%<br>
        You will receive: <b>${res.sat_received.toFixed(0)} SAT</b><br>
        <small>Check your Alby wallet for payment request.</small>
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
  window.GameAPI.hatchEgg(isRare).then(() => {
    alert('Hatched a new fish!');
    updateBalance();
    renderFish();
    document.getElementById('fishing-result').innerHTML = '';
  }).catch(err => alert('Hatch failed: ' + err.message));
}

function updateBalance() {
  window.GameAPI.getBalance().then(data => {
    document.getElementById('coin-balance').textContent = Math.floor(data.coin);
    renderFish();
  }).catch(err => console.error('Balance error:', err));
}

function renderFish() {
  window.GameAPI.getBalance().then(data => {
    const list = document.getElementById('fish-list');
    const noFish = document.getElementById('no-fish');
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
  });
}

function feedSingle(fishId) {
  window.GameAPI.feedFish(fishId).then(res => {
    alert(`Fed! Earned ${res.earned.toFixed(1)} COIN`);
    updateBalance();
  }).catch(err => alert('Feed failed: ' + err.message));
}

window.hatchEgg = hatchEgg;
window.feedSingle = feedSingle;
window.initializeGame = initializeGame;