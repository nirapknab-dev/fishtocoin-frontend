document.getElementById('alby-login')?.addEventListener('click', async () => {
  if (!window.webln) {
    alert('Please install Alby Extension from https://getalby.com');
    return;
  }

  try {
    // 🔑 ขั้นตอนสำคัญ: เรียก enable() ก่อนเสมอ
    await window.webln.enable(); // ← เพิ่มบรรทัดนี้!

    const info = await window.webln.getInfo();
    const message = `Login to fishtocoin at ${Date.now()}`;
    const signed = await window.webln.signMessage(message);

    // ส่งไป backend...
    const res = await fetch('https://api.fishtocoin.com/auth', {
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
    alert('Alby error: ' + (err.message || 'Please allow the site in Alby'));
  }
});
