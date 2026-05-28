const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/products', async (req, res) => {
  const { name, description, price, image_url } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: 'Valid product price is required' });
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      price: parsedPrice,
      image_url: image_url?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

router.get('/orders', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, customer_email, customer_address, customer_phone, total, created_at, order_items(quantity, product_id, products(name))')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/product-sales', async (req, res) => {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name')
    .order('id', { ascending: true });

  if (productsError) {
    return res.status(500).json({ error: productsError.message });
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, quantity');

  if (itemsError) {
    return res.status(500).json({ error: itemsError.message });
  }

  const countsByProductId = items.reduce((acc, item) => {
    const key = item.product_id;
    acc[key] = (acc[key] || 0) + Number(item.quantity || 0);
    return acc;
  }, {});

  const result = products.map((product) => ({
    product_id: product.id,
    product_name: product.name,
    times_bought: countsByProductId[product.id] || 0,
  }));

  res.json(result);
});

module.exports = router;
