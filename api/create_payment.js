export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { pkgName, amount, buyer, phone } = req.body;
  const order_id = 'RII-' + Date.now();
  const API_KEY = "sk_live_d19aa0476d7bbb7bbca4d4f4699e85ce9561f867c7e44cf5";

  try {
    const response = await fetch('https://paymentku.com/api/v1/transaction/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        order_id: order_id,
        amount: Number(amount),
        customer_name: buyer || 'Customer',
        customer_phone: phone || '08123456789',
        callback_url: `https://${req.headers.host}/api/callback`
      })
    });

    const data = await response.json();
    return res.status(200).json({
      status: 'success',
      order_id: order_id,
      amount: amount,
      qr_string: data.qr_string || data.data?.qr_string || ''
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
