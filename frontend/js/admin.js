const ADMIN_API_BASE = '/api/admin';

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }
  return payload;
}

function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function renderOrders(orders) {
  const body = document.getElementById('orders-body');
  if (!orders.length) {
    body.innerHTML = '<tr><td colspan="5" class="text-muted">No orders yet.</td></tr>';
    return;
  }

  body.innerHTML = orders
    .map((order) => {
      const itemsText = (order.order_items || [])
        .map((item) => `${item.products?.name || `Product #${item.product_id}`} x ${item.quantity}`)
        .join(', ');

      return `
        <tr>
          <td>#${order.id}</td>
          <td>
            <div><strong>${order.customer_name}</strong></div>
            <div class="small text-muted">${order.customer_email}</div>
          </td>
          <td>${formatPrice(order.total)}</td>
          <td>${itemsText || '-'}</td>
          <td>${formatDate(order.created_at)}</td>
        </tr>
      `;
    })
    .join('');
}

function renderSales(rows) {
  const body = document.getElementById('sales-body');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="2" class="text-muted">No products available.</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.product_name}</td>
          <td>${row.times_bought}</td>
        </tr>
      `
    )
    .join('');
}

async function loadOrders() {
  const errorEl = document.getElementById('orders-error');
  errorEl.classList.add('d-none');
  try {
    const orders = await requestJson(`${ADMIN_API_BASE}/orders`);
    renderOrders(orders);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove('d-none');
  }
}

async function loadSales() {
  const errorEl = document.getElementById('sales-error');
  errorEl.classList.add('d-none');
  try {
    const rows = await requestJson(`${ADMIN_API_BASE}/product-sales`);
    renderSales(rows);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove('d-none');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-product-form');
  const submitBtn = document.getElementById('add-product-submit');
  const errorEl = document.getElementById('add-product-error');
  const successEl = document.getElementById('add-product-success');

  document.getElementById('refresh-orders').addEventListener('click', loadOrders);
  document.getElementById('refresh-sales').addEventListener('click', loadSales);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.classList.add('d-none');
    successEl.classList.add('d-none');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    const payload = {
      name: document.getElementById('product-name').value.trim(),
      description: document.getElementById('product-description').value.trim(),
      price: Number(document.getElementById('product-price').value),
      image_url: document.getElementById('product-image').value.trim(),
    };

    try {
      const created = await requestJson(`${ADMIN_API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      successEl.textContent = `Product added: ${created.name}`;
      successEl.classList.remove('d-none');
      form.reset();
      form.classList.remove('was-validated');
      loadSales();
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('d-none');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Product';
    }
  });

  loadOrders();
  loadSales();
});
