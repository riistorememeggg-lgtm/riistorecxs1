global.paidOrders = global.paidOrders || {};

export default async function handler(req, res) {
  const data = req.body || {};
  const order_id = data.order_id || data.merchant_ref || data.trx_id;
  const status = (data.status || '').toLowerCase();

  if (order_id && ['paid', 'success', 'settlement', 'berhasil'].includes(status)) {
    global.paidOrders[order_id] = true;
    return res.status(200).json({ status: true, message: 'Payment recorded' });
  }

  return res.status(200).json({ status: false, message: 'Pending or invalid' });
}