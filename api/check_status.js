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
  const url = `https://paymenku.com/api/v1/transaction/status?order_id=${encodeURIComponent(order_id)}`;

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
    const status = String(result?.data?.status || result?.status || '').toLowerCase();

    if (['paid', 'success', 'settlement', 'berhasil'].includes(status)) {
      return res.status(200).json({ status: 'paid' });
    } else {
      return res.status(200).json({ status: 'unpaid', gateway_response: result });
    }
  } catch (error) {
    return res.status(200).json({ status: 'unpaid', error: error.message });
  }
}
