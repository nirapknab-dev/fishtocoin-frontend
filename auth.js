// ========== MOCK LOGIN ==========
document.getElementById('mock-login')?.addEventListener('click', () => {
  const mockPubkey = "02" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  localStorage.setItem('fishtocoin_session', JSON.stringify({
    pubkey: mockPubkey,
    loginTime: Date.now()
  }));
  loadGameScreen();
});

function loadGameScreen() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  
  // รอให้ DOM และ script โหลดเสร็จ
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGameWhenReady);
  } else {
    initGameWhenReady();
  }
}

function initGameWhenReady() {
  // รอเพิ่มอีกเล็กน้อยเพื่อให้ game.js โหลด
  const checkInterval = setInterval(() => {
    if (typeof window.initializeGame === 'function') {
      clearInterval(checkInterval);
      window.initializeGame();
    }
  }, 100);
}

// ========== LOGOUT ==========
document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('fishtocoin_session');
  localStorage.removeItem('fishtocoin_game');
  location.reload();
});
