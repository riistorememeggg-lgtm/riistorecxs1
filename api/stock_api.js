// API Sinkronisasi Stok Akun RIISTORE (Cloud Database Real-time)
const CLOUD_STORAGE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1878d224d4ca5';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Mengambil seluruh stok akun dari Cloud Storage
  if (req.method === 'GET') {
    try {
      const response = await fetch(CLOUD_STORAGE_URL, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.data && Array.isArray(json.data.stocks)) {
          return res.status(200).json(json.data.stocks);
        }
      }
      return res.status(200).json([]);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      return res.status(200).json([]);
    }
  }

  // 2. POST: Mengupdate & Menyimpan stok ke Cloud Storage
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const stocks = Array.isArray(body) ? body : (body.stocks || []);

      const updateRes = await fetch(CLOUD_STORAGE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'riistore_stock',
          data: { stocks: stocks }
        })
      });

      if (updateRes.ok) {
        return res.status(200).json({ success: true, count: stocks.length });
      } else {
        const errText = await updateRes.text();
        return res.status(500).json({ success: false, error: errText });
      }
    } catch (err) {
      console.error('Error updating stocks:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
