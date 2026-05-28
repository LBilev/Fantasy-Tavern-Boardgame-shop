function renderCart() {
  const cart = getCart();
  const emptyEl = document.getElementById('empty-cart');
  const contentEl = document.getElementById('cart-content');
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    emptyEl.classList.remove('d-none');
    contentEl.classList.add('d-none');
    return;
  }

  emptyEl.classList.add('d-none');
  contentEl.classList.remove('d-none');

  itemsEl.innerHTML = cart
    .map(
      (item) => `
    <tr>
      <td>
        <img src="${item.image_url || 'https://placehold.co/80x80'}" class="cart-item-img rounded" alt="${item.name}">
        ${item.name}
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary qty-btn" data-id="${item.id}" data-delta="-1">-</button>
          <span class="btn btn-outline-secondary disabled">${item.quantity}</span>
          <button class="btn btn-outline-secondary qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
      </td>
      <td>${formatPrice(item.price * item.quantity)}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger remove-btn" data-id="${item.id}">Remove</button>
      </td>
    </tr>
  `
    )
    .join('');

  totalEl.textContent = formatPrice(getCartTotal());

  itemsEl.querySelectorAll('.qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateQuantity(Number(btn.dataset.id), Number(btn.dataset.delta));
      renderCart();
    });
  });

  itemsEl.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCart(Number(btn.dataset.id));
      renderCart();
    });
  });
}

document.addEventListener('DOMContentLoaded', renderCart);
