document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('product-grid');
  const loading = document.getElementById('loading');
  const errorEl = document.getElementById('error');

  try {
    const products = await fetchProducts();
    loading.classList.add('d-none');

    if (products.length === 0) {
      grid.innerHTML =
        '<div class="col-12"><p class="text-muted">No products available.</p></div>';
      return;
    }

    grid.innerHTML = products
      .map(
        (p) => `
      <div class="col-sm-6 col-lg-4 mb-4">
        <div class="card h-100 product-card rounded-4 shadow-lg">
          <img src="${p.image_url || 'https://placehold.co/300x200'}" class="card-img-top" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text fw-bold text-primary">${formatPrice(p.price)}</p>
            <a href="product.html?id=${p.id}" class="btn btn-primary mt-auto">View Details</a>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    loading.classList.add('d-none');
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});
