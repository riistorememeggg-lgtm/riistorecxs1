global.paidOrders = global.paidOrders || {};

export default async function handler(req, res) {
  const { order_id } = req.query;

  if (order_id && global.paidOrders[order_id]) {
    delete global.paidOrders[order_id];
    return res.status(200).json({ status: 'paid' });
  }

  return res.status(200).json({ status: 'unpaid' });
}