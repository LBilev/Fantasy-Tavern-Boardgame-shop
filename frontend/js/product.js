document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('product-detail');
  const loading = document.getElementById('loading');
  const errorEl = document.getElementById('error');

  if (!id) {
    loading.classList.add('d-none');
    errorEl.textContent = 'No product ID provided.';
    errorEl.classList.remove('d-none');
    return;
  }

  try {
    const product = await fetchProduct(id);
    const reviews = await fetchReviews(id);
    loading.classList.add('d-none');

    container.innerHTML = `
      <div class="col-md-6">
        <img src="${product.image_url || 'https://placehold.co/600x400'}" class="img-fluid rounded product-detail-img" alt="${product.name}">
      </div>
      <div class="col-md-6">
        <h1>${product.name}</h1>
        <p class="text-muted">${product.description || 'No description available.'}</p>
        <p class="fs-3 fw-bold text-primary">${formatPrice(product.price)}</p>
        <button id="add-to-cart" class="btn btn-primary btn-lg">Add to Cart</button>
      </div>
      <div class="col-12 mt-4">
        <h3>Reviews</h3>
        <div id="reviews-list" class="mb-4"></div>
        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="h5">Write a review</h4>
            <form id="review-form" class="needs-validation" novalidate>
              <div class="mb-3">
                <label for="reviewer-name" class="form-label">Your Name</label>
                <input type="text" class="form-control" id="reviewer-name" required>
                <div class="invalid-feedback">Name is required.</div>
              </div>
              <div class="mb-3">
                <label for="review-rating" class="form-label">Rating</label>
                <select class="form-select" id="review-rating" required>
                  <option value="" selected disabled>Select rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very poor</option>
                </select>
                <div class="invalid-feedback">Rating is required.</div>
              </div>
              <div class="mb-3">
                <label for="review-comment" class="form-label">Comment</label>
                <textarea class="form-control" id="review-comment" rows="3" required></textarea>
                <div class="invalid-feedback">Comment is required.</div>
              </div>
              <div id="review-error" class="alert alert-danger d-none" role="alert"></div>
              <button type="submit" id="submit-review" class="btn btn-primary">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('add-to-cart').addEventListener('click', () => {
      addToCart(product);
      const btn = document.getElementById('add-to-cart');
      btn.textContent = 'Added!';
      btn.classList.replace('btn-primary', 'btn-success');
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.classList.replace('btn-success', 'btn-primary');
      }, 1500);
    });

    const reviewsList = document.getElementById('reviews-list');
    const reviewForm = document.getElementById('review-form');
    const reviewError = document.getElementById('review-error');
    const submitReviewBtn = document.getElementById('submit-review');

    const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const renderReviews = (items) => {
      if (!items.length) {
        reviewsList.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review this product.</p>';
        return;
      }

      reviewsList.innerHTML = items
        .map(
          (review) => `
            <div class="border rounded p-3 mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong>${review.reviewer_name}</strong>
                <span class="text-warning">${renderStars(Number(review.rating))}</span>
              </div>
              <p class="mb-0">${review.comment}</p>
            </div>
          `
        )
        .join('');
    };

    const reviewState = [...reviews];
    renderReviews(reviewState);

    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      reviewError.classList.add('d-none');

      if (!reviewForm.checkValidity()) {
        reviewForm.classList.add('was-validated');
        return;
      }

      submitReviewBtn.disabled = true;
      submitReviewBtn.textContent = 'Submitting...';

      const reviewPayload = {
        reviewer_name: document.getElementById('reviewer-name').value.trim(),
        rating: Number(document.getElementById('review-rating').value),
        comment: document.getElementById('review-comment').value.trim(),
      };

      try {
        const createdReview = await submitReview(id, reviewPayload);
        reviewState.unshift(createdReview);
        renderReviews(reviewState);
        reviewForm.reset();
        reviewForm.classList.remove('was-validated');
      } catch (submitErr) {
        reviewError.textContent = submitErr.message;
        reviewError.classList.remove('d-none');
      } finally {
        submitReviewBtn.disabled = false;
        submitReviewBtn.textContent = 'Submit Review';
      }
    });
  } catch (err) {
    loading.classList.add('d-none');
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});
