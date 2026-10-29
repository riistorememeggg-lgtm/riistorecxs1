export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const orderId = req.query.order_id || req.query.reference_id || '';

  if (!orderId) {
    return res.status(200).json({ status: 'unpaid', message: 'Order ID kosong' });
  }

  const apiKey = "sk_live_d19aa0476d7bbb7bbca4d4f4699e85ce9561f867c7e44cf5";
  
  // Cek lewat 2 parameter: order_id dan reference_id
  const endpoints = [
    `https://paymenku.com/api/v1/transaction/status?order_id=${encodeURIComponent(orderId)}`,
    `https://paymenku.com/api/v1/transaction/status?reference_id=${encodeURIComponent(orderId)}`
  ];

  let lastResponse = null;

  for (const url of endpoints) {
    try {
      const apiRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const result = await apiRes.json();
      lastResponse = result;

      const status = String(
        result?.data?.status || 
        result?.status || 
        result?.data?.payment_status || 
        ''
      ).toLowerCase();

      if (['paid', 'success', 'settlement', 'berhasil', 'complete'].includes(status)) {
        return res.status(200).json({ status: 'paid', gateway_response: result });
      }
    } catch (e) {
      // Lewati ke percobaan berikutnya jika fetch bermasalah
    }
  }

  return res.status(200).json({ 
    status: 'unpaid', 
    message: 'Belum terbayar atau parameter tidak cocok',
    raw: lastResponse 
  });
}
