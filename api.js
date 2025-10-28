const API_BASE = 'https://api.fishtocoin.com';

async function callAPI(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('fishtocoin_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(API_BASE + endpoint, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Network error');
  }
  return res.json();
}

window.GameAPI = {
  goFishing: () => callAPI('/fish', 'POST'),
  hatchEgg: (isRare) => callAPI('/hatch', 'POST', { rare: isRare }),
  feedFish: (fishId) => callAPI('/feed', 'POST', { fish_id: fishId }),
  feedAllFish: () => callAPI('/feed-all', 'POST'),
  withdraw: (amount) => callAPI('/withdraw', 'POST', { amount_coin: amount }),
  getBalance: () => callAPI('/balance')
};