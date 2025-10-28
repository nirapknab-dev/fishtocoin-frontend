document.getElementById('alby-login')?.addEventListener('click', async () => {
  if (!window.webln) {
    alert('Please install Alby Extension from https://getalby.com');
    return;
  }

  try {
    const info = await window.webln.getInfo();
    const message = `Login to fishtocoin at ${Date.now()}`;
    const signed = await window.webln.signMessage(message);

    const res = await fetch('https://api.satoshiminer.me/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pubkey: info.publicKey,
        message,
        signature: signed.signature
      })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('fishtocoin_token', data.token);
      loadGameScreen();
    } else {
      alert('Login failed: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    console.error(err);
    alert('Alby error: ' + (err.message || 'Allow site in Alby'));
  }
});

function loadGameScreen() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  setTimeout(() => {
    if (typeof window.initializeGame === 'function') {
      window.initializeGame();
    }
  }, 300);
}

document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('fishtocoin_token');
  location.reload();
});