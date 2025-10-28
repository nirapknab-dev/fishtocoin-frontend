// ========== ALBY LOGIN (Production Ready) ==========
document.getElementById('alby-login')?.addEventListener('click', async () => {
  // ตรวจสอบว่า Alby Extension ติดตั้งหรือไม่
  if (!window.webln) {
    alert('Please install Alby Extension from https://getalby.com');
    return;
  }

  try {
    // 🔑 ขั้นตอนสำคัญ: ขออนุญาตผู้ใช้ก่อน (ตามมาตรฐาน WebLN)
    await window.webln.enable();

    // ดึงข้อมูล public key
    const info = await window.webln.getInfo();
    
    // สร้างข้อความสำหรับ sign (ป้องกัน replay attack)
    const message = `Login to fishtocoin.com at ${Date.now()}`;
    
    // ลงนามด้วย private key ของผู้ใช้
    const signed = await window.webln.signMessage(message);

    // ส่งข้อมูลไปยัง backend เพื่อ verify
    const res = await fetch('https://api.fishtocoin.com/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pubkey: info.publicKey,
        message: message,
        signature: signed.signature
      })
    });

    const data = await res.json();

    if (data.token) {
      // บันทึก token สำหรับการเรียก API ต่อไป
      localStorage.setItem('fishtocoin_token', data.token);
      loadGameScreen();
    } else {
      alert('Login failed: ' + (data.error || 'Unknown error'));
    }

  } catch (err) {
    console.error('Alby login error:', err);
    
    // แสดงข้อความ error ที่เข้าใจง่าย
    if (err.message && err.message.includes('enable')) {
      alert('Please allow fishtocoin.com in Alby Extension.');
    } else if (err.message === 'User rejected') {
      alert('You canceled the Alby permission request.');
    } else {
      alert('Alby error: ' + (err.message || 'Failed to login. Please try again.'));
    }
  }
});

// ========== LOAD GAME SCREEN ==========
function loadGameScreen() {
  // ซ่อนหน้า login
  document.getElementById('login-screen').classList.remove('active');
  // แสดงหน้าเกม
  document.getElementById('game-screen').classList.add('active');
  
  // เรียกเกมหลัง delay เล็กน้อย (ให้ DOM พร้อม)
  setTimeout(() => {
    if (typeof window.initializeGame === 'function') {
      window.initializeGame();
    } else {
      console.error('initializeGame is not defined. Check if game.js is loaded.');
    }
  }, 300);
}

// ========== LOGOUT ==========
document.getElementById('logout')?.addEventListener('click', () => {
  // ลบ token ออกจาก localStorage
  localStorage.removeItem('fishtocoin_token');
  // รีโหลดหน้าเว็บเพื่อกลับสู่หน้า login
  location.reload();
});
