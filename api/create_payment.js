export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  const apiKey = "sk_live_d19aa0476d7bbb7bbca4d4f4699e85ce9561f867c7e44cf5";
  const input = req.body;

  if (!input) {
    return res.status(400).json({ status: 'error', message: 'Data tidak valid' });
  }

  const amount = parseInt(input.amount || 10000, 10);
  const referenceId = 'RII-' + Math.floor(Date.now() / 1000) + '-' + Math.floor(100 + Math.random() * 900);
  const buyerName = input.buyer || 'Buyer CarX';
  const buyerEmail = input.email || 'buyer@gmail.com';
  const pkgName = input.pkgName || 'Akun CarX Street';
  const host = req.headers.host || 'localhost';

  const payload = {
    channel_code: 'qris',
    amount: amount,
    reference_id: referenceId,
    customer_name: buyerName,
    customer_email: buyerEmail,
    return_url: `https://${host}`,
    order_items: [
      {
        name: pkgName,
        price: amount,
        quantity: 1
      }
    ]
  };

  try {
    const apiRes = await fetch('https://paymenku.com/api/v1/transaction/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();

    if (apiRes.ok && data && data.data) {
      const qrData =
        data.data?.payment_info?.qr_string ||
        data.data?.qr_string ||
        data.data?.payment_info?.qr_content ||
        data.data?.payment_url ||
        '';

      return res.status(200).json({
        status: 'success',
        reference_id: referenceId,
        order_id: data.data?.order_id || data.data?.id || referenceId,
        amount: data.data?.amount || amount,
        qr_string: qrData
      });
    } else {
      return res.status(200).json({
        status: 'error',
        message: data.message || 'Gagal membuat QRIS di Paymentku'
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}
