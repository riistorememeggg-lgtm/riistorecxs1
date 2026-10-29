export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { order_id } = req.query;

  if (!order_id) {
    return res.status(200).json({ status: 'unpaid', message: 'Order ID kosong' });
  }

  const apiKey = "sk_live_d19aa0476d7bbb7bbca4d4f4699e85ce9561f867c7e44cf5";
  const domains = ['https://paymenku.com', 'https://paymentku.com'];

  for (const domain of domains) {
    try {
      const url = `${domain}/api/v1/transaction/status?order_id=${encodeURIComponent(order_id)}`;
      const apiRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (!apiRes.ok) continue;

      const result = await apiRes.json();
      const status = String(
        result?.data?.status || 
        result?.status || 
        result?.data?.payment_status || 
        ''
      ).toLowerCase();

      if (['paid', 'success', 'settlement', 'berhasil', 'complete'].includes(status)) {
        return res.status(200).json({ status: 'paid', data: result });
      }
    } catch (e) {
      // Coba domain berikutnya jika gagal
    }
  }

  return res.status(200).json({ status: 'unpaid', message: 'Transaksi belum terkonfirmasi paid' });
}
