document.addEventListener('DOMContentLoaded', () => {
  const cart = getCart();
  const emptyMsg = document.getElementById('empty-cart');
  const formSection = document.getElementById('checkout-form-section');
  const summary = document.getElementById('order-summary');
  const form = document.getElementById('checkout-form');
  const successEl = document.getElementById('order-success');
  const successMessageEl = document.getElementById('order-success-message');

  if (cart.length === 0) {
    emptyMsg.classList.remove('d-none');
    formSection.classList.add('d-none');
    return;
  }

  formSection.classList.remove('d-none');
  summary.innerHTML = cart
    .map(
      (item) => `
    <li class="list-group-item d-flex justify-content-between">
      <span>${item.name} x ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </li>
  `
    )
    .join('');
  document.getElementById('order-total').textContent = formatPrice(getCartTotal());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const submitBtn = document.getElementById('submit-order');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order...';

    const order = {
      customer: {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        phone: document.getElementById('phone').value.trim(),
      },
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      total: getCartTotal(),
    };

    try {
      await submitOrder(order);
      if (successMessageEl) {
        successMessageEl.textContent = `Thank you for the order, ${order.customer.name}.`;
      }
      clearCart();
      formSection.classList.add('d-none');
      successEl.classList.remove('d-none');
    } catch (err) {
      document.getElementById('checkout-error').textContent = err.message;
      document.getElementById('checkout-error').classList.remove('d-none');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });
});
