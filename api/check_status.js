export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const orderId = req.query.order_id || req.query.reference_id || req.query.invoice || '';

  if (!orderId) {
    return res.status(200).json({ status: 'unpaid', message: 'Order ID kosong' });
  }

  const apiKey = "sk_live_d19aa0476d7bbb7bbca4d4f4699e85ce9561f867c7e44cf5";

  try {
    // 1. Cek langsung ke Endpoint Resmi Paymenku via reference_id
    const apiUrl = `https://paymenku.com/api/v1/transactions?reference_id=${encodeURIComponent(orderId)}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const result = await response.json();
      if (result && Array.isArray(result.data) && result.data.length > 0) {
        const tx = result.data.find(t => (t.reference_id || '').toUpperCase() === orderId.toUpperCase()) || result.data[0];
        const status = (tx.status || '').toLowerCase();
        if (['paid', 'success', 'settlement', 'complete', 'berhasil'].includes(status)) {
          return res.status(200).json({
            status: 'paid',
            message: 'Pembayaran terverifikasi lunas',
            data: tx
          });
        }
      }
    }

    // 2. Fallback: Ambil transaksi terbaru di akun Paymenku
    const listRes = await fetch('https://paymenku.com/api/v1/transactions?per_page=15', {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData && Array.isArray(listData.data)) {
        const matched = listData.data.find(t => (t.reference_id || '').toUpperCase() === orderId.toUpperCase());
        if (matched) {
          const status = (matched.status || '').toLowerCase();
          if (['paid', 'success', 'settlement', 'complete', 'berhasil'].includes(status)) {
            return res.status(200).json({ status: 'paid', data: matched });
          }
        }
      }
    }

    return res.status(200).json({ status: 'unpaid', message: 'Pembayaran belum terdeteksi' });
  } catch (err) {
    return res.status(200).json({ status: 'unpaid', message: 'Error checking status: ' + err.message });
  }
}
