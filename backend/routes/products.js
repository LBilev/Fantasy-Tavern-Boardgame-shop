const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get('/:id/reviews', async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.post('/:id/reviews', async (req, res) => {
  const productId = Number(req.params.id);
  const { reviewer_name, comment, rating } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (!reviewer_name || !reviewer_name.trim()) {
    return res.status(400).json({ error: 'Reviewer name is required' });
  }

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Review comment is required' });
  }

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      reviewer_name: reviewer_name.trim(),
      comment: comment.trim(),
      rating: parsedRating,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

module.exports = router;
