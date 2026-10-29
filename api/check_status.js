export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
  
  // Cek endpoint paymentku.com dan paymenku.com langsung
  const targets = [
    `https://paymentku.com/api/v1/transaction/status?order_id=${encodeURIComponent(orderId)}`,
    `https://paymenku.com/api/v1/transaction/status?order_id=${encodeURIComponent(orderId)}`
  ];

  let rawLog = [];

  for (const url of targets) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        result = { raw_html: text.substring(0, 200) };
      }

      rawLog.push({ url, status_code: response.status, body: result });

      const status = String(
        result?.data?.status || 
        result?.status || 
        result?.data?.payment_status || 
        ''
      ).toLowerCase();

      if (['paid', 'success', 'settlement', 'berhasil', 'complete'].includes(status)) {
        return res.status(200).json({ status: 'paid', gateway_response: result });
      }
    } catch (err) {
      rawLog.push({ url, error: err.message });
    }
  }

  return res.status(200).json({
    status: 'unpaid',
    message: 'Belum terbaca paid',
    debug: rawLog
  });
}
