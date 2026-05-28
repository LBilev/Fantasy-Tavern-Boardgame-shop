const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/', async (req, res) => {
  const { customer, items, total } = req.body;

  if (!customer?.name || !customer?.email || !customer?.address || !customer?.phone) {
    return res.status(400).json({ error: 'Customer details are required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' });
  }

  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'Valid total is required' });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_address: customer.address,
      customer_phone: customer.phone,
      total,
    })
    .select()
    .single();

  if (orderError) {
    return res.status(500).json({ error: orderError.message });
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    return res.status(500).json({ error: itemsError.message });
  }

  res.status(201).json({ message: 'Order placed successfully', orderId: order.id });
});

module.exports = router;
